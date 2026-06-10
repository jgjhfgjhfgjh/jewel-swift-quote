-- Some feed rows ship without <manufacturer> but carry the brand as the last
-- segment of category_text ("HODINKY | HODINKY SKLADEM | BERING").
-- Derive it automatically so brand listings always cover the whole catalog.

CREATE OR REPLACE FUNCTION public.derive_manufacturer_from_category(cat text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN cat IS NULL THEN NULL
    WHEN array_length(string_to_array(cat, '|'), 1) >= 2
      THEN NULLIF(TRIM((string_to_array(cat, '|'))[array_length(string_to_array(cat, '|'), 1)]), '')
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.produkty_fill_manufacturer()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.manufacturer IS NULL OR TRIM(NEW.manufacturer) = '' THEN
    NEW.manufacturer := public.derive_manufacturer_from_category(NEW.category_text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_produkty_fill_manufacturer ON public.produkty;
CREATE TRIGGER trg_produkty_fill_manufacturer
BEFORE INSERT OR UPDATE ON public.produkty
FOR EACH ROW
EXECUTE FUNCTION public.produkty_fill_manufacturer();

-- One-time backfill of existing rows
UPDATE public.produkty
SET manufacturer = public.derive_manufacturer_from_category(category_text)
WHERE (manufacturer IS NULL OR TRIM(manufacturer) = '')
  AND public.derive_manufacturer_from_category(category_text) IS NOT NULL;
