-- Prestige order + proforma (zálohová) invoice, created when the customer
-- accepts a priced offer. Separate from the partner B2B `orders` (prestige is an
-- end-customer prepaid purchase of a catalog item that is NOT in `produkty`).
-- Mirrors the orders patterns: sequential numbering, status machine, tracking,
-- a public token for the customer status page.

create sequence if not exists public.prestige_order_seq;
create sequence if not exists public.prestige_invoice_seq;

create table if not exists public.prestige_orders (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null unique references public.prestige_inquiries(id) on delete cascade,
  order_number text unique,
  invoice_number text unique,
  invoice_issued_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','awaiting_payment','paid','sourcing','shipped','delivered','cancelled')),
  currency text not null default 'CZK',
  amount numeric not null default 0,
  vat_rate numeric not null default 0,
  vat_base numeric not null default 0,
  vat_amount numeric not null default 0,
  bill_name text, bill_company text, bill_ico text, bill_dic text,
  bill_street text, bill_city text, bill_zip text, bill_country text default 'CZ',
  ship_to_name text, ship_to_street text, ship_to_city text, ship_to_zip text,
  ship_to_country text, ship_to_phone text,
  paid_at timestamptz,
  carrier text, tracking_number text, tracking_url text,
  shipped_at timestamptz, delivered_at timestamptz,
  satisfaction_rating int, satisfaction_note text,
  public_token uuid not null default gen_random_uuid() unique,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prestige_orders enable row level security;
create policy "Admins manage prestige orders" on public.prestige_orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create index if not exists prestige_orders_inquiry_idx on public.prestige_orders (inquiry_id);
create index if not exists prestige_orders_status_idx on public.prestige_orders (status);

-- Issue (or return existing) the proforma invoice for an accepted offer.
create or replace function public.issue_prestige_invoice(p_inquiry_id uuid, p_vat_rate numeric default 21)
returns public.prestige_orders
language plpgsql security definer set search_path = public as $$
declare
  v_inq public.prestige_inquiries;
  v_existing public.prestige_orders;
  v_total numeric;
  v_base numeric;
  v_vat numeric;
  v_row public.prestige_orders;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_inq from public.prestige_inquiries where id = p_inquiry_id;
  if not found then raise exception 'inquiry not found'; end if;
  if v_inq.offer_price is null then raise exception 'offer price not set'; end if;

  v_total := nullif(regexp_replace(replace(replace(v_inq.offer_price, ' ', ''), ',', '.'), '[^0-9.]', '', 'g'), '')::numeric;
  if v_total is null or v_total <= 0 then raise exception 'invalid offer price'; end if;

  v_base := round(v_total / (1 + coalesce(p_vat_rate,0) / 100.0), 2);
  v_vat  := round(v_total - v_base, 2);

  -- Idempotent: if an invoice already exists for this inquiry, return it.
  select * into v_existing from public.prestige_orders where inquiry_id = p_inquiry_id;
  if found and v_existing.invoice_number is not null then
    return v_existing;
  end if;

  insert into public.prestige_orders (
    inquiry_id, order_number, invoice_number, invoice_issued_at, status,
    currency, amount, vat_rate, vat_base, vat_amount,
    bill_name, bill_company, bill_ico
  ) values (
    p_inquiry_id,
    'PO' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.prestige_order_seq')::text, 5, '0'),
    'ZF' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.prestige_invoice_seq')::text, 5, '0'),
    now(), 'awaiting_payment',
    coalesce(v_inq.offer_currency, 'CZK'), v_total, coalesce(p_vat_rate,0), v_base, v_vat,
    v_inq.name, v_inq.company, v_inq.ico
  )
  on conflict (inquiry_id) do update set
    order_number = coalesce(public.prestige_orders.order_number, excluded.order_number),
    invoice_number = coalesce(public.prestige_orders.invoice_number, excluded.invoice_number),
    invoice_issued_at = coalesce(public.prestige_orders.invoice_issued_at, excluded.invoice_issued_at),
    status = 'awaiting_payment',
    amount = excluded.amount, vat_rate = excluded.vat_rate,
    vat_base = excluded.vat_base, vat_amount = excluded.vat_amount,
    updated_at = now()
  returning * into v_row;

  return v_row;
end $$;

-- Mark the invoice paid.
create or replace function public.mark_prestige_paid(p_inquiry_id uuid)
returns public.prestige_orders
language plpgsql security definer set search_path = public as $$
declare v_row public.prestige_orders;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.prestige_orders
    set paid_at = now(), status = 'paid', updated_at = now()
    where inquiry_id = p_inquiry_id
    returning * into v_row;
  if not found then raise exception 'prestige order not found'; end if;
  return v_row;
end $$;
