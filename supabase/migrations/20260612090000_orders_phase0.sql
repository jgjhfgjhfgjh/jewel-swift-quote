-- ============================================================
-- ORDERS PHASE 0 — order pipeline foundation (swelt.partner)
--
-- Partner orders (wholesale + dropship) with server-side pricing,
-- VAT mode per order, supplier outbox (EDI) and shipping price list.
-- Supplier = Zago; fulfillment is always done by the supplier
-- (swelt has no warehouse). Currency is EUR everywhere.
--
-- Self-contained admin check (orders_is_admin) following the same
-- pattern as deals_is_admin. Safe to re-run.
-- ============================================================

CREATE OR REPLACE FUNCTION public.orders_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.orders_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── profiles: billing / payment / branding extensions ────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country        TEXT NOT NULL DEFAULT 'CZ',
  ADD COLUMN IF NOT EXISTS vat_id         TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms  TEXT NOT NULL DEFAULT 'prepaid',
  ADD COLUMN IF NOT EXISTS credit_limit   NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_name     TEXT,
  ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_payment_terms_check
    CHECK (payment_terms IN ('prepaid', 'credit'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── shipping_methods: admin-managed carrier price list (EUR) ─
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  carrier       TEXT NOT NULL DEFAULT '',
  price_eur     NUMERIC NOT NULL DEFAULT 0,
  cod_supported BOOLEAN NOT NULL DEFAULT false,
  active        BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view active shipping methods" ON public.shipping_methods;
CREATE POLICY "Authenticated can view active shipping methods"
  ON public.shipping_methods FOR SELECT
  TO authenticated
  USING (active OR public.orders_is_admin());

DROP POLICY IF EXISTS "Admins manage shipping methods" ON public.shipping_methods;
CREATE POLICY "Admins manage shipping methods"
  ON public.shipping_methods FOR ALL
  TO authenticated
  USING (public.orders_is_admin())
  WITH CHECK (public.orders_is_admin());

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON public.shipping_methods
  FOR EACH ROW EXECUTE FUNCTION public.orders_set_updated_at();

INSERT INTO public.shipping_methods (code, name, carrier, price_eur, cod_supported, sort_order)
VALUES
  ('dhl-parcel',  'DHL Parcel Connect', 'DHL', 8.90,  true,  10),
  ('dhl-express', 'DHL Express',        'DHL', 19.90, false, 20),
  ('ups-standard','UPS Standard',       'UPS', 9.90,  true,  30),
  ('ups-express', 'UPS Express Saver',  'UPS', 24.90, false, 40)
ON CONFLICT (code) DO NOTHING;

-- ── order number generator: SW-2026-00001 ────────────────────
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql VOLATILE
SET search_path = public AS $$
  SELECT 'SW-' || to_char(now(), 'YYYY') || '-'
         || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

-- ── orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number       TEXT NOT NULL UNIQUE DEFAULT public.next_order_number(),
  partner_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_type         TEXT NOT NULL CHECK (order_type IN ('wholesale', 'dropship')),
  status             TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (status IN
                       ('awaiting_payment', 'queued', 'forwarded', 'confirmed',
                        'shipped', 'delivered', 'cancelled', 'failed')),
  currency           TEXT NOT NULL DEFAULT 'EUR',

  -- amounts (EUR)
  items_subtotal     NUMERIC NOT NULL DEFAULT 0,
  shipping_price     NUMERIC NOT NULL DEFAULT 0,
  vat_mode           TEXT NOT NULL DEFAULT 'cz_vat' CHECK (vat_mode IN ('cz_vat', 'reverse_charge', 'export')),
  vat_rate           NUMERIC NOT NULL DEFAULT 0,
  vat_amount         NUMERIC NOT NULL DEFAULT 0,
  total              NUMERIC NOT NULL DEFAULT 0,
  purchase_subtotal  NUMERIC NOT NULL DEFAULT 0,
  margin_total       NUMERIC NOT NULL DEFAULT 0,

  -- payment
  payment_mode       TEXT NOT NULL DEFAULT 'prepaid' CHECK (payment_mode IN ('prepaid', 'credit')),
  paid_at            TIMESTAMPTZ,

  -- fulfillment / branding (dropship = white-label under partner brand)
  branding           TEXT NOT NULL DEFAULT 'neutral' CHECK (branding IN ('partner', 'swelt', 'neutral')),
  shipping_method_id UUID REFERENCES public.shipping_methods(id) ON DELETE SET NULL,
  shipping_code      TEXT NOT NULL DEFAULT '',
  shipping_name      TEXT NOT NULL DEFAULT '',
  cod_amount         NUMERIC,                -- EUR; dropship only
  external_ref       TEXT,                   -- partner e-shop order number

  -- ship-to (dropship: end customer; wholesale: partner warehouse)
  ship_to_name       TEXT NOT NULL DEFAULT '',
  ship_to_company    TEXT NOT NULL DEFAULT '',
  ship_to_street     TEXT NOT NULL DEFAULT '',
  ship_to_city       TEXT NOT NULL DEFAULT '',
  ship_to_zip        TEXT NOT NULL DEFAULT '',
  ship_to_country    TEXT NOT NULL DEFAULT '',
  ship_to_phone      TEXT NOT NULL DEFAULT '',
  ship_to_email      TEXT NOT NULL DEFAULT '',

  customer_note      TEXT NOT NULL DEFAULT '',
  admin_note         TEXT NOT NULL DEFAULT '',

  -- supplier side
  supplier_ref       TEXT,
  tracking_number    TEXT,
  tracking_url       TEXT,

  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  forwarded_at       TIMESTAMPTZ,
  shipped_at         TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ,
  cancelled_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners view own orders" ON public.orders;
CREATE POLICY "Partners view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (partner_user_id = auth.uid() OR public.orders_is_admin());

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.orders_is_admin())
  WITH CHECK (public.orders_is_admin());

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_partner ON public.orders (partner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- ── order_items: price snapshot at order time ────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id                  UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  produkt_id          UUID REFERENCES public.produkty(id) ON DELETE SET NULL,
  supplier_product_id TEXT NOT NULL DEFAULT '',   -- produkty.product_id (supplier's own ID)
  sku                 TEXT NOT NULL DEFAULT '',
  ean                 TEXT NOT NULL DEFAULT '',
  name                TEXT NOT NULL DEFAULT '',
  manufacturer        TEXT NOT NULL DEFAULT '',
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  unit_price          NUMERIC NOT NULL DEFAULT 0,  -- selling price to partner (EUR, after discounts)
  unit_purchase_price NUMERIC NOT NULL DEFAULT 0,  -- cost from supplier (EUR)
  discount_percent    NUMERIC NOT NULL DEFAULT 0,
  discount_source     TEXT NOT NULL DEFAULT 'feed',
  line_total          NUMERIC NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners view own order items" ON public.order_items;
CREATE POLICY "Partners view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.partner_user_id = auth.uid() OR public.orders_is_admin())
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);

-- ── supplier_orders: EDI outbox towards the supplier ─────────
CREATE TABLE IF NOT EXISTS public.supplier_orders (
  id                UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  channel           TEXT NOT NULL DEFAULT 'stub',
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'error')),
  attempts          INTEGER NOT NULL DEFAULT 0,
  last_error        TEXT,
  supplier_response JSONB,
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage supplier orders" ON public.supplier_orders;
CREATE POLICY "Admins manage supplier orders"
  ON public.supplier_orders FOR ALL
  TO authenticated
  USING (public.orders_is_admin())
  WITH CHECK (public.orders_is_admin());

DROP TRIGGER IF EXISTS update_supplier_orders_updated_at ON public.supplier_orders;
CREATE TRIGGER update_supplier_orders_updated_at
  BEFORE UPDATE ON public.supplier_orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON public.supplier_orders (status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_supplier_orders_order ON public.supplier_orders (order_id);

-- ── EDI payload builder (purchase prices only — supplier view) ─
CREATE OR REPLACE FUNCTION public.build_supplier_payload(p_order_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT jsonb_build_object(
    'document', 'ORDER',
    'order_number', o.order_number,
    'order_type', o.order_type,
    'external_ref', o.external_ref,
    'created_at', o.created_at,
    'buyer', jsonb_build_object(
      'company', COALESCE(pr.company_name, ''),
      'ico', pr.ico,
      'vat_id', pr.vat_id
    ),
    'branding', jsonb_build_object(
      'mode', o.branding,
      'brand_name', CASE WHEN o.branding = 'partner'
                         THEN COALESCE(pr.brand_name, pr.company_name, '')
                         WHEN o.branding = 'swelt' THEN 'swelt.partner'
                         ELSE NULL END
    ),
    'ship_to', jsonb_build_object(
      'name', o.ship_to_name,
      'company', o.ship_to_company,
      'street', o.ship_to_street,
      'city', o.ship_to_city,
      'zip', o.ship_to_zip,
      'country', o.ship_to_country,
      'phone', o.ship_to_phone,
      'email', o.ship_to_email
    ),
    'shipping', jsonb_build_object(
      'code', o.shipping_code,
      'name', o.shipping_name
    ),
    'cod', CASE WHEN o.cod_amount IS NOT NULL
                THEN jsonb_build_object('amount', o.cod_amount, 'currency', o.currency)
                ELSE NULL END,
    'note', NULLIF(o.customer_note, ''),
    'items', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'line_no', t.line_no,
               'supplier_product_id', t.supplier_product_id,
               'sku', t.sku,
               'ean', t.ean,
               'name', t.name,
               'manufacturer', t.manufacturer,
               'quantity', t.quantity,
               'unit_price', t.unit_purchase_price,
               'currency', o.currency
             ) ORDER BY t.line_no), '[]'::jsonb)
      FROM (
        SELECT i.*, row_number() OVER (ORDER BY i.created_at, i.id) AS line_no
        FROM public.order_items i WHERE i.order_id = o.id
      ) t
    ),
    'totals', jsonb_build_object(
      'purchase_subtotal', o.purchase_subtotal,
      'currency', o.currency
    )
  )
  FROM public.orders o
  LEFT JOIN public.profiles pr ON pr.user_id = o.partner_user_id
  WHERE o.id = p_order_id;
$$;

-- ── place_order: atomic order creation with server-side pricing ─
-- Input example:
-- {
--   "order_type": "dropship",
--   "items": [{"produkt_id": "<uuid>", "quantity": 2}],
--   "shipping_method_id": "<uuid>",
--   "ship_to": {"name": "...", "company": "", "street": "...", "city": "...",
--               "zip": "...", "country": "DE", "phone": "...", "email": "..."},
--   "cod_amount": 49.90,            -- optional, dropship only
--   "external_ref": "ESHOP-1234",   -- optional
--   "branding": "partner",          -- optional (default: dropship=partner, wholesale=neutral)
--   "note": "..."                   -- optional
-- }
CREATE OR REPLACE FUNCTION public.place_order(p jsonb)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_method public.shipping_methods%ROWTYPE;
  v_order_type text := lower(coalesce(p->>'order_type', ''));
  v_branding text;
  v_ship jsonb := coalesce(p->'ship_to', '{}'::jsonb);
  v_country text := upper(trim(coalesce(v_ship->>'country', '')));
  v_cod numeric := NULLIF(p->>'cod_amount', '')::numeric;
  v_vat_mode text;
  v_vat_rate numeric;
  v_item jsonb;
  v_prod public.produkty%ROWTYPE;
  v_qty integer;
  v_disc numeric;
  v_disc_source text;
  v_base_disc numeric;
  v_unit_price numeric;
  v_items_subtotal numeric := 0;
  v_purchase_subtotal numeric := 0;
  v_order_id uuid;
  v_order_number text;
  v_status text;
  v_vat_amount numeric;
  v_total numeric;
  v_eu_countries text[] := ARRAY['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR',
                                 'DE','GR','HU','IE','IT','LV','LT','LU','MT','NL',
                                 'PL','PT','RO','SK','SI','ES','SE'];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF v_order_type NOT IN ('wholesale', 'dropship') THEN
    RAISE EXCEPTION 'INVALID_ORDER_TYPE';
  END IF;

  IF jsonb_array_length(coalesce(p->'items', '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER';
  END IF;

  -- ship-to is always required (supplier ships everything)
  IF coalesce(trim(v_ship->>'name'), '') = '' OR coalesce(trim(v_ship->>'street'), '') = ''
     OR coalesce(trim(v_ship->>'city'), '') = '' OR coalesce(trim(v_ship->>'zip'), '') = ''
     OR v_country = '' THEN
    RAISE EXCEPTION 'SHIP_TO_INCOMPLETE';
  END IF;

  -- dropship needs a reachable end customer for the carrier
  IF v_order_type = 'dropship'
     AND coalesce(trim(v_ship->>'phone'), '') = ''
     AND coalesce(trim(v_ship->>'email'), '') = '' THEN
    RAISE EXCEPTION 'END_CUSTOMER_CONTACT_REQUIRED';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE user_id = v_uid LIMIT 1;
  v_base_disc := coalesce(v_profile.base_discount, 0);

  SELECT * INTO v_method FROM public.shipping_methods
   WHERE id = (p->>'shipping_method_id')::uuid AND active;
  IF v_method.id IS NULL THEN
    RAISE EXCEPTION 'SHIPPING_METHOD_INVALID';
  END IF;

  IF v_cod IS NOT NULL THEN
    IF v_order_type <> 'dropship' THEN
      RAISE EXCEPTION 'COD_ONLY_FOR_DROPSHIP';
    END IF;
    IF NOT v_method.cod_supported THEN
      RAISE EXCEPTION 'COD_NOT_SUPPORTED_BY_METHOD';
    END IF;
    IF v_cod <= 0 THEN
      RAISE EXCEPTION 'COD_AMOUNT_INVALID';
    END IF;
  END IF;

  v_branding := coalesce(NULLIF(p->>'branding', ''),
                         CASE WHEN v_order_type = 'dropship' THEN 'partner' ELSE 'neutral' END);
  IF v_branding NOT IN ('partner', 'swelt', 'neutral') THEN
    RAISE EXCEPTION 'INVALID_BRANDING';
  END IF;

  -- VAT mode: CZ → 21 %, EU VAT payer → reverse charge, EU non-payer → CZ VAT, non-EU → export
  IF v_country = 'CZ' THEN
    v_vat_mode := 'cz_vat'; v_vat_rate := 21;
  ELSIF v_country = ANY (v_eu_countries) THEN
    IF coalesce(trim(v_profile.vat_id), '') <> '' THEN
      v_vat_mode := 'reverse_charge'; v_vat_rate := 0;
    ELSE
      v_vat_mode := 'cz_vat'; v_vat_rate := 21;
    END IF;
  ELSE
    v_vat_mode := 'export'; v_vat_rate := 0;
  END IF;

  v_status := CASE WHEN coalesce(v_profile.payment_terms, 'prepaid') = 'credit'
                   THEN 'queued' ELSE 'awaiting_payment' END;

  INSERT INTO public.orders (
    partner_user_id, order_type, status, payment_mode, branding,
    shipping_method_id, shipping_code, shipping_name, shipping_price,
    cod_amount, external_ref, customer_note,
    vat_mode, vat_rate,
    ship_to_name, ship_to_company, ship_to_street, ship_to_city,
    ship_to_zip, ship_to_country, ship_to_phone, ship_to_email
  ) VALUES (
    v_uid, v_order_type, v_status,
    coalesce(v_profile.payment_terms, 'prepaid'), v_branding,
    v_method.id, v_method.code, v_method.name, v_method.price_eur,
    v_cod, NULLIF(trim(coalesce(p->>'external_ref', '')), ''),
    coalesce(p->>'note', ''),
    v_vat_mode, v_vat_rate,
    coalesce(v_ship->>'name', ''), coalesce(v_ship->>'company', ''),
    coalesce(v_ship->>'street', ''), coalesce(v_ship->>'city', ''),
    coalesce(v_ship->>'zip', ''), v_country,
    coalesce(v_ship->>'phone', ''), coalesce(v_ship->>'email', '')
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p->'items') LOOP
    v_qty := coalesce((v_item->>'quantity')::integer, 0);
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    SELECT * INTO v_prod FROM public.produkty
     WHERE id = (v_item->>'produkt_id')::uuid
     FOR UPDATE;
    IF v_prod.id IS NULL THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', v_item->>'produkt_id';
    END IF;
    IF coalesce(v_prod.stock, 0) < v_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: % (k dispozici %)', v_prod.sku, coalesce(v_prod.stock, 0);
    END IF;

    -- discount hierarchy: customer product > customer brand > base feed
    SELECT cd.percent, 'customer-product' INTO v_disc, v_disc_source
      FROM public.customer_discounts cd
     WHERE cd.customer_user_id = v_uid AND cd.discount_type = 'product'
       AND cd.target_key = v_prod.id::text
     LIMIT 1;
    IF v_disc IS NULL THEN
      SELECT cd.percent, 'customer-brand' INTO v_disc, v_disc_source
        FROM public.customer_discounts cd
       WHERE cd.customer_user_id = v_uid AND cd.discount_type = 'brand'
         AND cd.target_key = coalesce(v_prod.manufacturer, '')
       LIMIT 1;
    END IF;
    IF v_disc IS NULL THEN
      v_disc := CASE WHEN coalesce(v_prod.retail_price, 0) > 0
                     THEN (v_prod.retail_price - coalesce(v_prod.wholesale_price, 0))
                          / v_prod.retail_price * 100
                     ELSE 0 END;
      v_disc_source := 'feed';
    END IF;

    v_unit_price := round(coalesce(v_prod.retail_price, 0)
                          * (1 - v_disc / 100)
                          * (1 - v_base_disc / 100), 2);

    INSERT INTO public.order_items (
      order_id, produkt_id, supplier_product_id, sku, ean, name, manufacturer,
      quantity, unit_price, unit_purchase_price, discount_percent, discount_source, line_total
    ) VALUES (
      v_order_id, v_prod.id, coalesce(v_prod.product_id, ''), coalesce(v_prod.sku, ''),
      coalesce(v_prod.ean, ''), coalesce(v_prod.product_name, v_prod.sku, ''),
      coalesce(v_prod.manufacturer, ''),
      v_qty, v_unit_price, coalesce(v_prod.wholesale_price, 0),
      round(v_disc, 2), v_disc_source, round(v_unit_price * v_qty, 2)
    );

    v_items_subtotal := v_items_subtotal + round(v_unit_price * v_qty, 2);
    v_purchase_subtotal := v_purchase_subtotal + round(coalesce(v_prod.wholesale_price, 0) * v_qty, 2);

    -- local stock decrement; the supplier feed sync re-syncs the truth
    UPDATE public.produkty SET stock = coalesce(stock, 0) - v_qty WHERE id = v_prod.id;
  END LOOP;

  v_vat_amount := round((v_items_subtotal + v_method.price_eur) * v_vat_rate / 100, 2);
  v_total := round(v_items_subtotal + v_method.price_eur + v_vat_amount, 2);

  UPDATE public.orders SET
    items_subtotal = v_items_subtotal,
    purchase_subtotal = v_purchase_subtotal,
    margin_total = round(v_items_subtotal - v_purchase_subtotal, 2),
    vat_amount = v_vat_amount,
    total = v_total
  WHERE id = v_order_id;

  -- credit partners go straight to the supplier outbox
  IF v_status = 'queued' THEN
    INSERT INTO public.supplier_orders (order_id, channel, payload)
    VALUES (v_order_id, 'stub', public.build_supplier_payload(v_order_id));
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'status', v_status,
    'items_subtotal', v_items_subtotal,
    'shipping_price', v_method.price_eur,
    'vat_mode', v_vat_mode,
    'vat_rate', v_vat_rate,
    'vat_amount', v_vat_amount,
    'total', v_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO authenticated;

-- ── mark_order_paid: admin releases a prepaid order to the outbox ─
CREATE OR REPLACE FUNCTION public.mark_order_paid(p_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.orders_is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;
  IF v_order.status <> 'awaiting_payment' THEN
    RAISE EXCEPTION 'INVALID_STATUS: %', v_order.status;
  END IF;

  UPDATE public.orders
     SET status = 'queued', paid_at = now()
   WHERE id = p_order_id;

  INSERT INTO public.supplier_orders (order_id, channel, payload)
  VALUES (p_order_id, 'stub', public.build_supplier_payload(p_order_id))
  ON CONFLICT (order_id) DO NOTHING;

  RETURN jsonb_build_object('order_id', p_order_id, 'status', 'queued');
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_order_paid(uuid) TO authenticated;

-- ── cancel_order: partner while awaiting payment, admin until forwarded ─
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_is_admin boolean := public.orders_is_admin();
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF NOT v_is_admin AND v_order.partner_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  -- partners may cancel only before payment; admins until the order left for the supplier
  IF v_is_admin THEN
    IF v_order.status NOT IN ('awaiting_payment', 'queued', 'failed') THEN
      RAISE EXCEPTION 'INVALID_STATUS: %', v_order.status;
    END IF;
  ELSE
    IF v_order.status <> 'awaiting_payment' THEN
      RAISE EXCEPTION 'INVALID_STATUS: %', v_order.status;
    END IF;
  END IF;

  -- return locally decremented stock
  UPDATE public.produkty p SET stock = coalesce(p.stock, 0) + i.quantity
    FROM public.order_items i
   WHERE i.order_id = p_order_id AND i.produkt_id = p.id;

  UPDATE public.orders
     SET status = 'cancelled', cancelled_at = now()
   WHERE id = p_order_id;

  DELETE FROM public.supplier_orders
   WHERE order_id = p_order_id AND status = 'pending';

  RETURN jsonb_build_object('order_id', p_order_id, 'status', 'cancelled');
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
