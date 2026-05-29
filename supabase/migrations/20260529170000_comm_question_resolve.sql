-- ============================================================
-- KOMUNIKACE swelt × zago — přívětivější logika otázek/odpovědí
-- Místo hrubého auto-označení VŠECH otázek při jakékoliv zprávě
-- se otázka uzavírá explicitně (tlačítkem). "Na tahu" se přepočítá
-- z otevřených otázek.
-- Bezpečné pro opětovné spuštění.
-- ============================================================

-- Přepočet "kdo je na tahu" = opačná strana poslední otevřené otázky (jinak NULL).
CREATE OR REPLACE FUNCTION public.comm_recompute_awaiting(p_topic UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.comm_topics t
     SET awaiting_label = (
       SELECT CASE WHEN m.author_label = 'swelt' THEN 'zago' ELSE 'swelt' END
       FROM public.comm_messages m
       WHERE m.topic_id = p_topic AND m.requires_reply AND NOT m.replied
       ORDER BY m.created_at DESC
       LIMIT 1
     )
   WHERE t.id = p_topic;
$$;

-- Po vložení zprávy: jen posuň aktivitu a přepočítej "na tahu" (žádné hromadné označování).
CREATE OR REPLACE FUNCTION public.comm_after_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.comm_topics
     SET last_activity_at = now(), updated_at = now()
   WHERE id = NEW.topic_id;
  PERFORM public.comm_recompute_awaiting(NEW.topic_id);
  RETURN NEW;
END;
$$;

-- Explicitní označení otázky jako (ne)zodpovězené — kterýkoliv účastník.
CREATE OR REPLACE FUNCTION public.comm_resolve_question(p_message UUID, p_resolved BOOLEAN DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_topic UUID;
BEGIN
  IF NOT public.comm_is_participant() THEN
    RAISE EXCEPTION 'Bez oprávnění.';
  END IF;

  UPDATE public.comm_messages
     SET replied = p_resolved,
         replied_at = CASE WHEN p_resolved THEN now() ELSE NULL END,
         replied_by_label = CASE WHEN p_resolved THEN public.comm_my_label() ELSE NULL END
   WHERE id = p_message AND requires_reply = true
   RETURNING topic_id INTO v_topic;

  IF v_topic IS NOT NULL THEN
    PERFORM public.comm_recompute_awaiting(v_topic);
    UPDATE public.comm_topics SET updated_at = now() WHERE id = v_topic;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
