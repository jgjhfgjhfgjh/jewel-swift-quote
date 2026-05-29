-- ============================================================
-- KOMUNIKACE swelt × zago — propojení odpovědi s otázkou
-- Zpráva může být odpovědí na konkrétní otázku (reply_to_id).
-- Odeslání takové odpovědi otázku automaticky uzavře.
-- Bezpečné pro opětovné spuštění.
-- ============================================================
ALTER TABLE public.comm_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.comm_messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_comm_messages_reply_to ON public.comm_messages (reply_to_id);

-- Trigger: pokud zpráva odpovídá na otázku, otázku uzavři; přepočítej "na tahu".
CREATE OR REPLACE FUNCTION public.comm_after_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.reply_to_id IS NOT NULL THEN
    UPDATE public.comm_messages
       SET replied = true,
           replied_at = now(),
           replied_by_label = NEW.author_label
     WHERE id = NEW.reply_to_id
       AND requires_reply = true
       AND replied = false;
  END IF;

  UPDATE public.comm_topics
     SET last_activity_at = now(), updated_at = now()
   WHERE id = NEW.topic_id;

  PERFORM public.comm_recompute_awaiting(NEW.topic_id);
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
