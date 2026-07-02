-- ============================================================
-- app_settings + switchable EDI channel.
--
-- The supplier (Zago) runs POHODA E1 + GRiT ORiON EDI + Jazzware.
-- Default outbox channel becomes 'pohoda-xml' (order e-mailed with a
-- POHODA dataPack XML attachment). Switching to a future GRiT adapter
-- is a single UPDATE on app_settings — no function changes needed.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key        TEXT NOT NULL PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage app settings" ON public.app_settings;
CREATE POLICY "Admins manage app settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.orders_is_admin())
  WITH CHECK (public.orders_is_admin());

INSERT INTO public.app_settings (key, value)
VALUES ('supplier_edi_channel', 'pohoda-xml')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

CREATE OR REPLACE FUNCTION public.supplier_edi_channel()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT coalesce(
    (SELECT value FROM public.app_settings WHERE key = 'supplier_edi_channel'),
    'stub'
  );
$$;

-- Re-point the outbox inserts at the configurable channel.
-- (Bodies otherwise identical to 20260612090000_orders_phase0.sql.)

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
  VALUES (p_order_id, public.supplier_edi_channel(), public.build_supplier_payload(p_order_id))
  ON CONFLICT (order_id) DO NOTHING;

  RETURN jsonb_build_object('order_id', p_order_id, 'status', 'queued');
END;
$$;

-- place_order: only the outbox INSERT changed (channel from settings).
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

  IF coalesce(trim(v_ship->>'name'), '') = '' OR coalesce(trim(v_ship->>'street'), '') = ''
     OR coalesce(trim(v_ship->>'city'), '') = '' OR coalesce(trim(v_ship->>'zip'), '') = ''
     OR v_country = '' THEN
    RAISE EXCEPTION 'SHIP_TO_INCOMPLETE';
  END IF;

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

  IF v_status = 'queued' THEN
    INSERT INTO public.supplier_orders (order_id, channel, payload)
    VALUES (v_order_id, public.supplier_edi_channel(), public.build_supplier_payload(v_order_id));
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

NOTIFY pgrst, 'reload schema';
