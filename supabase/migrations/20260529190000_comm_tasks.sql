-- ============================================================
-- KOMUNIKACE swelt × zago — úkoly / další kroky ke každému tématu
-- Kdo (assignee_label), do kdy (due_date), hotovo (done).
-- Bezpečné pro opětovné spuštění.
-- ============================================================
DROP TABLE IF EXISTS public.comm_tasks CASCADE;

CREATE TABLE public.comm_tasks (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id        UUID NOT NULL REFERENCES public.comm_topics(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  assignee_label  TEXT CHECK (assignee_label IN ('swelt','zago')),   -- NULL = kdokoliv
  due_date        DATE,
  done            BOOLEAN NOT NULL DEFAULT false,
  done_at         TIMESTAMP WITH TIME ZONE,
  done_by_label   TEXT CHECK (done_by_label IN ('swelt','zago')),
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_label   TEXT NOT NULL DEFAULT 'swelt',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view tasks"
  ON public.comm_tasks FOR SELECT TO authenticated USING (public.comm_is_participant());
CREATE POLICY "Participants can insert tasks"
  ON public.comm_tasks FOR INSERT TO authenticated WITH CHECK (public.comm_is_participant());
CREATE POLICY "Participants can update tasks"
  ON public.comm_tasks FOR UPDATE TO authenticated USING (public.comm_is_participant()) WITH CHECK (public.comm_is_participant());
CREATE POLICY "Participants can delete tasks"
  ON public.comm_tasks FOR DELETE TO authenticated USING (public.comm_is_participant());

CREATE TRIGGER comm_tasks_updated_at
  BEFORE UPDATE ON public.comm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.comm_set_updated_at();

CREATE INDEX idx_comm_tasks_topic ON public.comm_tasks (topic_id, done, due_date);

-- Realtime
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comm_tasks'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.comm_tasks;
    END IF;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
