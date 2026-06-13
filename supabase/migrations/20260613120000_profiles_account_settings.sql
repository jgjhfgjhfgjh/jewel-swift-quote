-- 2026-06-13: Pole pro stránku nastavení účtu (/ucet).
-- Aplikováno přímo na živý projekt (ijcfcjlfxktvedqrsvqz) přes Supabase MCP
-- (migration name: profiles_account_settings_fields) po explicitním schválení.
--
-- Kontaktní osoba, telefon, doručovací adresa, čas podání B2B žádosti
-- (pro přesný 24h odpočet od odeslání, ne od založení účtu) a předvolby
-- e-mailových notifikací. Additivní — nic se nemaže.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contact_name     text,
  ADD COLUMN IF NOT EXISTS phone            text,
  ADD COLUMN IF NOT EXISTS address_street   text,
  ADD COLUMN IF NOT EXISTS address_city     text,
  ADD COLUMN IF NOT EXISTS address_zip      text,
  ADD COLUMN IF NOT EXISTS b2b_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS notify_offers    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_orders    boolean NOT NULL DEFAULT true;
