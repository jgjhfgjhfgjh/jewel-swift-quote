-- ============================================================
-- KOMUNIKACE swelt × zago — správa účastníků (admin)
-- Bezpečné RPC, aby klient nemusel sahat na auth.users napřímo.
-- Vše SECURITY DEFINER + interní kontrola admin role.
-- Bezpečné pro opětovné spuštění.
-- ============================================================

-- Přidá / aktualizuje účastníka podle e-mailu (uživatel už musí být zaregistrovaný).
CREATE OR REPLACE FUNCTION public.comm_add_participant_by_email(
  p_email        TEXT,
  p_label        TEXT,
  p_display_name TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Pouze admin může přidávat účastníky.';
  END IF;

  IF p_label NOT IN ('swelt', 'zago') THEN
    RAISE EXCEPTION 'Neplatný label (povoleno: swelt, zago).';
  END IF;

  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(trim(p_email)) LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Uživatel s e-mailem % zatím není zaregistrovaný. Ať se nejdřív zaregistruje na webu.', p_email;
  END IF;

  INSERT INTO public.comm_participants (user_id, label, display_name)
  VALUES (v_uid, p_label, COALESCE(NULLIF(trim(p_display_name), ''), p_email))
  ON CONFLICT (user_id) DO UPDATE
    SET label = EXCLUDED.label,
        display_name = EXCLUDED.display_name;

  RETURN v_uid;
END;
$$;

-- Odebere účastníka.
CREATE OR REPLACE FUNCTION public.comm_remove_participant(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Pouze admin může odebírat účastníky.';
  END IF;
  DELETE FROM public.comm_participants WHERE user_id = p_user_id;
END;
$$;

-- Seznam účastníků i s e-mailem (jen pro účastníky/adminy).
CREATE OR REPLACE FUNCTION public.comm_list_participants()
RETURNS TABLE (user_id UUID, label TEXT, display_name TEXT, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.comm_is_participant() THEN
    RAISE EXCEPTION 'Bez oprávnění.';
  END IF;
  RETURN QUERY
    SELECT p.user_id, p.label, p.display_name, u.email::text, p.created_at
    FROM public.comm_participants p
    JOIN auth.users u ON u.id = p.user_id
    ORDER BY p.created_at;
END;
$$;

NOTIFY pgrst, 'reload schema';
