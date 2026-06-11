-- 2026-06-12: Oprava — na živém projektu (ijcfcjlfxktvedqrsvqz) chyběl trigger,
-- který po registraci zakládá řádek v profiles + user_roles. Registrovaní B2B
-- partneři proto existovali jen v auth.users a admin je neviděl ve /customers.
--
-- Schvalovací flow: KAŽDÁ nová registrace začíná jako 'lead' (email s IČO
-- i Google/Apple OAuth). B2B partnera s IČO admin ručně schválí ve
-- /customers/:id přepnutím role na 'b2b_approved' — tím získá ceny a slevy.
--
-- POZOR: živé schéma se liší od starších migrací v tomhle repu (user_roles.role
-- je TEXT, žádný enum app_role; profiles má navíc customer_user_id). Tahle
-- migrace odpovídá ŽIVÉMU schématu. Aplikováno přímo přes Supabase MCP
-- (migration names: handle_new_user_trigger, signup_role_lead) + backfill
-- chybějících řádků.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, company_name, ico)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'ico', '')
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'lead')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profilů a rolí pro uživatele založené v době, kdy trigger neexistoval
INSERT INTO public.profiles (id, user_id, company_name, ico)
SELECT gen_random_uuid(), u.id,
       COALESCE(u.raw_user_meta_data->>'company_name', ''),
       COALESCE(u.raw_user_meta_data->>'ico', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id);

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'lead'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);
