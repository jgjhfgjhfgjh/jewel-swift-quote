-- ============================================================
-- KOMUNIKACE swelt × zago — hlasové zprávy (audio příloha)
-- Rozšíření povolených typů přílohy o 'audio'.
-- Bezpečné pro opětovné spuštění.
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comm_attachments_kind_check') THEN
    ALTER TABLE public.comm_attachments DROP CONSTRAINT comm_attachments_kind_check;
  END IF;
  ALTER TABLE public.comm_attachments
    ADD CONSTRAINT comm_attachments_kind_check
    CHECK (kind IN ('file','image','video','audio','link','contact','note'));
END $$;

NOTIFY pgrst, 'reload schema';
