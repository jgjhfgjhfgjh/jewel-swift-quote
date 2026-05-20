-- Track which storage workbook each deal was imported from. This lets the
-- `import-deal` edge function be idempotent — calling it twice for the same
-- xlsx returns the existing deal instead of creating a duplicate, so a
-- transient hiccup in the agent's labelling step cannot produce duplicates.
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS source_path text;

CREATE INDEX IF NOT EXISTS idx_deals_source_path
  ON public.deals (source_path)
  WHERE source_path IS NOT NULL;
