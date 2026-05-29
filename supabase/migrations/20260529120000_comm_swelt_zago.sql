-- ============================================================
-- KOMUNIKACE swelt × zago — interní kolaborační workspace
-- Soukromý prostor pro dva partnery (swelt = my, zago = dodavatel),
-- kde plánují a řídí spolupráci. Témata → zprávy → přílohy → přehled.
--
-- Nové, izolované tabulky; nedotýkají se ničeho stávajícího.
-- Přístup: pouze "účastníci" (comm_participants) + adminové.
-- Self-contained: admin check čte public.user_roles přímo.
-- Bezpečné pro opětovné spuštění (drop & recreate).
-- ============================================================
DROP TABLE IF EXISTS public.comm_attachments CASCADE;
DROP TABLE IF EXISTS public.comm_messages CASCADE;
DROP TABLE IF EXISTS public.comm_topics CASCADE;
DROP TABLE IF EXISTS public.comm_participants CASCADE;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.comm_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── comm_participants: kdo má přístup do workspace ─────────
-- label rozlišuje stranu: 'swelt' (my) nebo 'zago' (dodavatel).
CREATE TABLE public.comm_participants (
  user_id       UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  label         TEXT NOT NULL CHECK (label IN ('swelt', 'zago')),
  display_name  TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Je přihlášený uživatel účastníkem? (admin má přístup vždy)
CREATE OR REPLACE FUNCTION public.comm_is_participant()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.comm_participants WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- Jaký label má přihlášený uživatel (default 'swelt' pro adminy)
CREATE OR REPLACE FUNCTION public.comm_my_label()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT label FROM public.comm_participants WHERE user_id = auth.uid()),
    (SELECT 'swelt' WHERE EXISTS (
       SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')),
    'swelt'
  );
$$;

ALTER TABLE public.comm_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view participants"
  ON public.comm_participants FOR SELECT
  TO authenticated
  USING (public.comm_is_participant());

CREATE POLICY "Admins can manage participants"
  ON public.comm_participants FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── comm_topics: jedno téma / vlákno spolupráce ────────────
CREATE TABLE public.comm_topics (
  id                UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  category          TEXT NOT NULL DEFAULT 'general'
                      CHECK (category IN ('general','pohoda','edi','launch','planning','finance','other')),
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open','in_progress','resolved')),
  priority          TEXT NOT NULL DEFAULT 'normal'
                      CHECK (priority IN ('low','normal','high')),
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_label     TEXT NOT NULL DEFAULT 'swelt',
  -- kdo je "na tahu" (čeká se na reakci této strany); NULL = nikdo konkrétně
  awaiting_label    TEXT CHECK (awaiting_label IN ('swelt','zago')),
  last_activity_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comm_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view topics"
  ON public.comm_topics FOR SELECT
  TO authenticated USING (public.comm_is_participant());

CREATE POLICY "Participants can insert topics"
  ON public.comm_topics FOR INSERT
  TO authenticated WITH CHECK (public.comm_is_participant());

CREATE POLICY "Participants can update topics"
  ON public.comm_topics FOR UPDATE
  TO authenticated USING (public.comm_is_participant()) WITH CHECK (public.comm_is_participant());

CREATE POLICY "Participants can delete topics"
  ON public.comm_topics FOR DELETE
  TO authenticated USING (public.comm_is_participant());

CREATE TRIGGER comm_topics_updated_at
  BEFORE UPDATE ON public.comm_topics
  FOR EACH ROW EXECUTE FUNCTION public.comm_set_updated_at();

CREATE INDEX idx_comm_topics_status ON public.comm_topics (status);
CREATE INDEX idx_comm_topics_activity ON public.comm_topics (last_activity_at DESC);

-- ── comm_messages: zprávy ve vlákně ────────────────────────
CREATE TABLE public.comm_messages (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id        UUID NOT NULL REFERENCES public.comm_topics(id) ON DELETE CASCADE,
  author_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_label    TEXT NOT NULL DEFAULT 'swelt' CHECK (author_label IN ('swelt','zago')),
  body            TEXT NOT NULL DEFAULT '',
  format          TEXT NOT NULL DEFAULT 'text' CHECK (format IN ('text','markdown')),
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON public.comm_messages FOR SELECT
  TO authenticated USING (public.comm_is_participant());

CREATE POLICY "Participants can insert messages"
  ON public.comm_messages FOR INSERT
  TO authenticated WITH CHECK (public.comm_is_participant());

CREATE POLICY "Authors can update own messages"
  ON public.comm_messages FOR UPDATE
  TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());

CREATE POLICY "Authors or admins can delete messages"
  ON public.comm_messages FOR DELETE
  TO authenticated USING (
    author_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_comm_messages_topic ON public.comm_messages (topic_id, created_at);
-- jednoduchý full-text index pro hledání (jazykově neutrální)
CREATE INDEX idx_comm_messages_body_fts ON public.comm_messages
  USING GIN (to_tsvector('simple', body));

-- Po vložení zprávy posuň aktivitu tématu a přepni "na tahu" na druhou stranu.
CREATE OR REPLACE FUNCTION public.comm_after_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.comm_topics
     SET last_activity_at = now(),
         updated_at       = now(),
         awaiting_label   = CASE WHEN NEW.author_label = 'swelt' THEN 'zago' ELSE 'swelt' END
   WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER comm_messages_after_insert
  AFTER INSERT ON public.comm_messages
  FOR EACH ROW EXECUTE FUNCTION public.comm_after_message();

-- ── comm_attachments: přílohy (různé formáty) ──────────────
CREATE TABLE public.comm_attachments (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id     UUID NOT NULL REFERENCES public.comm_topics(id) ON DELETE CASCADE,
  message_id   UUID REFERENCES public.comm_messages(id) ON DELETE SET NULL,
  file_name    TEXT NOT NULL,
  file_path    TEXT NOT NULL,           -- cesta v storage bucketu 'comm-files'
  mime_type    TEXT NOT NULL DEFAULT '',
  size_bytes   BIGINT NOT NULL DEFAULT 0,
  uploaded_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_label TEXT NOT NULL DEFAULT 'swelt' CHECK (uploaded_label IN ('swelt','zago')),
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comm_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view attachments"
  ON public.comm_attachments FOR SELECT
  TO authenticated USING (public.comm_is_participant());

CREATE POLICY "Participants can insert attachments"
  ON public.comm_attachments FOR INSERT
  TO authenticated WITH CHECK (public.comm_is_participant());

CREATE POLICY "Uploaders or admins can delete attachments"
  ON public.comm_attachments FOR DELETE
  TO authenticated USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_comm_attachments_topic ON public.comm_attachments (topic_id, created_at);

-- ── privátní storage bucket pro přílohy ────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('comm-files', 'comm-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Participants can read comm files" ON storage.objects;
DROP POLICY IF EXISTS "Participants can upload comm files" ON storage.objects;
DROP POLICY IF EXISTS "Participants can delete comm files" ON storage.objects;

CREATE POLICY "Participants can read comm files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'comm-files' AND public.comm_is_participant());

CREATE POLICY "Participants can upload comm files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'comm-files' AND public.comm_is_participant());

CREATE POLICY "Participants can delete comm files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'comm-files' AND public.comm_is_participant());

NOTIFY pgrst, 'reload schema';
