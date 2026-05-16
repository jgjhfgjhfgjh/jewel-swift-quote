-- ============================================================
-- DEALS feature — closeout offers (Fossil Group etc.)
-- New, isolated tables; does NOT touch the existing products catalog.
-- Self-contained: admin checks read public.user_roles directly,
-- so the migration runs on any project that has user_roles(user_id, role).
-- Safe to re-run (drops and recreates the deal objects).
-- ============================================================
DROP TABLE IF EXISTS public.deal_products CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;

CREATE OR REPLACE FUNCTION public.deals_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Admin check used by the deal RLS policies (no external function dependency).
CREATE OR REPLACE FUNCTION public.deals_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ── deals: one row per closeout offer ──────────────────────
CREATE TABLE public.deals (
  id                  UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  subtitle            TEXT NOT NULL DEFAULT '',
  category            TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('watches', 'jewelry', 'general')),
  supplier            TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',
  hero_image_url      TEXT,
  brands              TEXT[] NOT NULL DEFAULT '{}',
  currency            TEXT NOT NULL DEFAULT 'USD',
  tiers               JSONB NOT NULL DEFAULT '[{"min_qty":50,"discount_percent":66},{"min_qty":100,"discount_percent":67},{"min_qty":200,"discount_percent":68}]'::jsonb,
  deposit_percent     NUMERIC NOT NULL DEFAULT 30,
  delivery_weeks_min  INTEGER NOT NULL DEFAULT 4,
  delivery_weeks_max  INTEGER NOT NULL DEFAULT 6,
  payment_terms       TEXT NOT NULL DEFAULT '',
  starts_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deadline            TIMESTAMP WITH TIME ZONE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published deals"
  ON public.deals FOR SELECT
  USING (status <> 'draft' OR public.deals_is_admin());

CREATE POLICY "Admins can manage deals"
  ON public.deals FOR ALL
  TO authenticated
  USING (public.deals_is_admin())
  WITH CHECK (public.deals_is_admin());

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.deals_set_updated_at();

CREATE INDEX idx_deals_status ON public.deals (status);
CREATE INDEX idx_deals_slug ON public.deals (slug);

-- ── deal_products: items within a deal ─────────────────────
CREATE TABLE public.deal_products (
  id               UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id          UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  brand            TEXT NOT NULL DEFAULT '',
  sku              TEXT NOT NULL DEFAULT '',
  ean              TEXT NOT NULL DEFAULT '',
  gender           TEXT NOT NULL DEFAULT '',
  collection       TEXT NOT NULL DEFAULT '',
  item_status      TEXT NOT NULL DEFAULT '',
  attr_movement    TEXT NOT NULL DEFAULT '',
  attr_material    TEXT NOT NULL DEFAULT '',
  attr_size        TEXT NOT NULL DEFAULT '',
  retail_price     NUMERIC NOT NULL DEFAULT 0,
  wholesale_tier1  NUMERIC NOT NULL DEFAULT 0,
  wholesale_tier2  NUMERIC NOT NULL DEFAULT 0,
  wholesale_tier3  NUMERIC NOT NULL DEFAULT 0,
  available        INTEGER NOT NULL DEFAULT 0,
  image_url        TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view products of published deals"
  ON public.deal_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_products.deal_id AND d.status <> 'draft'
    )
    OR public.deals_is_admin()
  );

CREATE POLICY "Admins can manage deal_products"
  ON public.deal_products FOR ALL
  TO authenticated
  USING (public.deals_is_admin())
  WITH CHECK (public.deals_is_admin());

CREATE INDEX idx_deal_products_deal_id ON public.deal_products (deal_id);
CREATE INDEX idx_deal_products_brand ON public.deal_products (brand);

-- ── storage bucket for deal product images ─────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('deal-images', 'deal-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read deal images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload deal images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update deal images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete deal images" ON storage.objects;

CREATE POLICY "Public can read deal images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deal-images');

CREATE POLICY "Admins can upload deal images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'deal-images' AND public.deals_is_admin());

CREATE POLICY "Admins can update deal images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'deal-images' AND public.deals_is_admin());

CREATE POLICY "Admins can delete deal images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'deal-images' AND public.deals_is_admin());

NOTIFY pgrst, 'reload schema';
