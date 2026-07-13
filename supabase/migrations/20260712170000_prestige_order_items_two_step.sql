-- Two-step conversion: offer -> binding order (only the items the customer
-- actually confirmed) -> proforma invoice for those items. The order carries its
-- own items jsonb [{brand, model, price}]; amount is their sum.

alter table public.prestige_orders add column if not exists items jsonb not null default '[]'::jsonb;

-- Step 1: create/update the binding order from the confirmed offer items.
-- Items may be edited until the invoice is issued.
create or replace function public.create_prestige_order(p_inquiry_id uuid, p_items jsonb)
returns public.prestige_orders
language plpgsql security definer set search_path = public as $$
declare
  v_inq public.prestige_inquiries;
  v_total numeric;
  v_row public.prestige_orders;
  v_existing public.prestige_orders;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;

  select * into v_inq from public.prestige_inquiries where id = p_inquiry_id;
  if not found then raise exception 'inquiry not found'; end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'no items selected';
  end if;

  select coalesce(sum((item->>'price')::numeric), 0) into v_total
  from jsonb_array_elements(p_items) as item;
  if v_total <= 0 then raise exception 'invalid items total'; end if;

  select * into v_existing from public.prestige_orders where inquiry_id = p_inquiry_id;
  if found and v_existing.invoice_number is not null then
    raise exception 'invoice already issued — order items are locked';
  end if;

  insert into public.prestige_orders (
    inquiry_id, order_number, status, currency, amount, items,
    bill_name, bill_company, bill_ico
  ) values (
    p_inquiry_id,
    'PO' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.prestige_order_seq')::text, 5, '0'),
    'draft',
    coalesce(v_inq.offer_currency, 'CZK'), v_total, p_items,
    v_inq.name, v_inq.company, v_inq.ico
  )
  on conflict (inquiry_id) do update set
    items = excluded.items,
    amount = excluded.amount,
    currency = excluded.currency,
    updated_at = now()
  returning * into v_row;

  return v_row;
end $$;

-- Step 2: issue the proforma invoice on the existing binding order.
create or replace function public.issue_prestige_invoice(p_inquiry_id uuid, p_vat_rate numeric default 21)
returns public.prestige_orders
language plpgsql security definer set search_path = public as $$
declare
  v_row public.prestige_orders;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;

  select * into v_row from public.prestige_orders where inquiry_id = p_inquiry_id;
  if not found then raise exception 'order not found — create the binding order first'; end if;
  if v_row.invoice_number is not null then return v_row; end if;
  if v_row.amount <= 0 then raise exception 'order amount is not set'; end if;

  update public.prestige_orders set
    invoice_number = 'ZF' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.prestige_invoice_seq')::text, 5, '0'),
    invoice_issued_at = now(),
    status = 'awaiting_payment',
    vat_rate = coalesce(p_vat_rate, 0),
    vat_base = round(amount / (1 + coalesce(p_vat_rate,0) / 100.0), 2),
    vat_amount = amount - round(amount / (1 + coalesce(p_vat_rate,0) / 100.0), 2),
    updated_at = now()
  where inquiry_id = p_inquiry_id
  returning * into v_row;

  return v_row;
end $$;
