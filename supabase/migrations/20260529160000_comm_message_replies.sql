-- ============================================================
-- KOMUNIKACE swelt × zago — "vyžaduje odpověď" + sledování zodpovězení
-- Zpráva může vyžadovat odpověď. Když druhá strana napíše do tématu,
-- otevřené otázky té druhé strany se označí jako zodpovězené.
-- awaiting_label tématu = strana, která je "na tahu" (má otevřenou otázku).
-- Bezpečné pro opětovné spuštění.
-- ============================================================
ALTER TABLE public.comm_messages
  ADD COLUMN IF NOT EXISTS requires_reply   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS replied          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS replied_at       TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS replied_by_label TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comm_messages_replied_by_label_check') THEN
    ALTER TABLE public.comm_messages
      ADD CONSTRAINT comm_messages_replied_by_label_check
      CHECK (replied_by_label IS NULL OR replied_by_label IN ('swelt','zago'));
  END IF;
END $$;

-- Po vložení zprávy: označ zodpovězené otázky druhé strany + přepočítej "na tahu".
CREATE OR REPLACE FUNCTION public.comm_after_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_await TEXT;
BEGIN
  -- 1) Otevřené otázky DRUHÉ strany považuj za zodpovězené touto zprávou.
  UPDATE public.comm_messages
     SET replied = true,
         replied_at = now(),
         replied_by_label = NEW.author_label
   WHERE topic_id = NEW.topic_id
     AND requires_reply = true
     AND replied = false
     AND author_label <> NEW.author_label
     AND id <> NEW.id;

  -- 2) Kdo je na tahu = opačná strana poslední stále otevřené otázky (jinak NULL).
  SELECT CASE WHEN author_label = 'swelt' THEN 'zago' ELSE 'swelt' END
    INTO v_await
    FROM public.comm_messages
   WHERE topic_id = NEW.topic_id AND requires_reply = true AND replied = false
   ORDER BY created_at DESC
   LIMIT 1;

  UPDATE public.comm_topics
     SET last_activity_at = now(),
         updated_at = now(),
         awaiting_label = v_await
   WHERE id = NEW.topic_id;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
