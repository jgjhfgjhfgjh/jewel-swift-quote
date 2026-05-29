-- ============================================================
-- KOMUNIKACE swelt × zago — bohatší přílohy
-- Rozšíření comm_attachments o typy: file / image / video / link / contact / note.
-- Pro nesouborové typy (odkaz, video-odkaz, kontakt, poznámka) není storage objekt,
-- proto file_name/file_path mohou být NULL a používají se url/title/note.
-- Bezpečné pro opětovné spuštění.
-- ============================================================
ALTER TABLE public.comm_attachments
  ADD COLUMN IF NOT EXISTS kind  TEXT NOT NULL DEFAULT 'file',
  ADD COLUMN IF NOT EXISTS url   TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS note  TEXT;

-- CHECK na povolené typy (přidáme idempotentně)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comm_attachments_kind_check'
  ) THEN
    ALTER TABLE public.comm_attachments
      ADD CONSTRAINT comm_attachments_kind_check
      CHECK (kind IN ('file','image','video','link','contact','note'));
  END IF;
END $$;

-- U nesouborových příloh není soubor — povolíme NULL.
ALTER TABLE public.comm_attachments ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE public.comm_attachments ALTER COLUMN file_path DROP NOT NULL;

-- Vyšší limit pro nahrávání videí (200 MB).
UPDATE storage.buckets SET file_size_limit = 209715200 WHERE id = 'comm-files';

NOTIFY pgrst, 'reload schema';
