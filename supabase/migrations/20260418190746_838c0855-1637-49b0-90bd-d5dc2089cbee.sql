-- Products catalog (synced from supplier feed)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,

  -- Feed-managed fields (overwritten on every sync)
  original_name_cz TEXT,
  original_description_cz TEXT,
  product_name_is TEXT,
  description_is TEXT,
  supplier_price NUMERIC(12,4),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  manufacturer TEXT,
  ean TEXT,
  category_text TEXT,

  -- ADMIN-PROTECTED fields (never overwritten by sync)
  custom_margin NUMERIC(6,4),
  manual_price_isk NUMERIC(12,2),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  admin_manual_override BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT TO authenticated
  USING (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Translation cache (CZ -> IS)
CREATE TABLE public.translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_hash TEXT NOT NULL UNIQUE,   -- sha256 of source_lang|target_lang|source_text
  source_lang TEXT NOT NULL DEFAULT 'cs',
  target_lang TEXT NOT NULL DEFAULT 'is',
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_translation_cache_hash ON public.translation_cache(source_hash);

ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage translation_cache"
  ON public.translation_cache FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));