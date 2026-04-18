-- feed_sync_logs table
CREATE TABLE public.feed_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'running')),
  message TEXT,
  items_processed_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.feed_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feed_sync_logs"
  ON public.feed_sync_logs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_feed_sync_logs_timestamp ON public.feed_sync_logs (timestamp DESC);

-- feed_config table
CREATE TABLE public.feed_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_url TEXT NOT NULL DEFAULT '',
  last_sync TIMESTAMP WITH TIME ZONE,
  mapping_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feed_config"
  ON public.feed_config
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_feed_config_updated_at
  BEFORE UPDATE ON public.feed_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed one config row so admin UI has something to edit
INSERT INTO public.feed_config (feed_url, mapping_rules) VALUES ('', '{}'::jsonb);