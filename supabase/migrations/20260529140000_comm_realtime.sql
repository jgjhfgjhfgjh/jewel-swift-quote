-- ============================================================
-- KOMUNIKACE swelt × zago — realtime
-- Přidá tabulky do publikace supabase_realtime, aby klient mohl
-- živě dostávat nové zprávy / přílohy / změny témat.
-- RLS se uplatní i na realtime (jen účastníci vidí změny).
-- Bezpečné pro opětovné spuštění.
-- ============================================================
DO $$
BEGIN
  -- Publikace supabase_realtime v Supabase projektech existuje by default.
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comm_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.comm_messages;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comm_attachments'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.comm_attachments;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comm_topics'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.comm_topics;
    END IF;

  END IF;
END $$;

-- Aby UPDATE/DELETE události nesly i původní řádek (užitečné pro klienta).
ALTER TABLE public.comm_topics REPLICA IDENTITY FULL;

NOTIFY pgrst, 'reload schema';
