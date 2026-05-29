-- ============================================================
-- KOMUNIKACE swelt × zago — jméno autora u zprávy
-- Kromě strany (swelt/zago) i konkrétní osoba. Vyplní se automaticky
-- z účastníka (display_name) → profilu (company_name) → e-mailu.
-- Bezpečné pro opětovné spuštění.
-- ============================================================
ALTER TABLE public.comm_messages ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Zobrazované jméno uživatele.
CREATE OR REPLACE FUNCTION public.comm_display_name(p_uid UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    NULLIF((SELECT display_name FROM public.comm_participants WHERE user_id = p_uid), ''),
    NULLIF((SELECT company_name  FROM public.profiles         WHERE user_id = p_uid), ''),
    (SELECT split_part(email, '@', 1) FROM auth.users WHERE id = p_uid),
    'Uživatel'
  );
$$;

-- BEFORE INSERT: doplň author_name, pokud chybí (platí i pro budoucí kanály).
CREATE OR REPLACE FUNCTION public.comm_messages_fill_author_name()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.author_name IS NULL OR NEW.author_name = '' THEN
    NEW.author_name := public.comm_display_name(NEW.author_user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comm_messages_author_name ON public.comm_messages;
CREATE TRIGGER comm_messages_author_name
  BEFORE INSERT ON public.comm_messages
  FOR EACH ROW EXECUTE FUNCTION public.comm_messages_fill_author_name();

-- Doplň jméno u existujících zpráv.
UPDATE public.comm_messages
   SET author_name = public.comm_display_name(author_user_id)
 WHERE author_name IS NULL;

NOTIFY pgrst, 'reload schema';
