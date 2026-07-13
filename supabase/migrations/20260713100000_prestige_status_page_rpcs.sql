-- Customer-facing status page (/objednavka/:token): token-gated RPCs. The
-- public_token is the only credential — no login. All SECURITY DEFINER with
-- explicit column whitelists.

create or replace function public.get_prestige_order_by_token(p_token uuid)
returns json
language sql security definer set search_path = public
stable
as $$
  select json_build_object(
    'order_number', o.order_number,
    'invoice_number', o.invoice_number,
    'status', o.status,
    'currency', o.currency,
    'amount', o.amount,
    'vat_rate', o.vat_rate,
    'items', o.items,
    'created_at', o.created_at,
    'invoice_issued_at', o.invoice_issued_at,
    'paid_at', o.paid_at,
    'shipped_at', o.shipped_at,
    'delivered_at', o.delivered_at,
    'carrier', o.carrier,
    'tracking_number', o.tracking_number,
    'tracking_url', o.tracking_url,
    'satisfaction_rating', o.satisfaction_rating,
    'bill_name', o.bill_name,
    'bill_company', o.bill_company,
    'bill_ico', o.bill_ico,
    'bill_dic', o.bill_dic,
    'bill_street', o.bill_street,
    'bill_city', o.bill_city,
    'bill_zip', o.bill_zip,
    'bill_country', o.bill_country,
    'customer_name', i.name
  )
  from public.prestige_orders o
  join public.prestige_inquiries i on i.id = o.inquiry_id
  where o.public_token = p_token;
$$;

-- Billing details may be completed/edited by the customer until the shipment leaves.
create or replace function public.update_prestige_billing(
  p_token uuid,
  p_name text default null, p_company text default null,
  p_ico text default null, p_dic text default null,
  p_street text default null, p_city text default null,
  p_zip text default null, p_country text default null
)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.prestige_orders
    where public_token = p_token and shipped_at is null;
  if not found then return false; end if;
  update public.prestige_orders set
    bill_name = coalesce(nullif(trim(p_name), ''), bill_name),
    bill_company = coalesce(nullif(trim(p_company), ''), bill_company),
    bill_ico = coalesce(nullif(trim(p_ico), ''), bill_ico),
    bill_dic = coalesce(nullif(trim(p_dic), ''), bill_dic),
    bill_street = coalesce(nullif(trim(p_street), ''), bill_street),
    bill_city = coalesce(nullif(trim(p_city), ''), bill_city),
    bill_zip = coalesce(nullif(trim(p_zip), ''), bill_zip),
    bill_country = coalesce(nullif(trim(p_country), ''), bill_country),
    updated_at = now()
  where id = v_id;
  return true;
end $$;

-- Satisfaction rating, once delivered (idempotent — later submits overwrite).
create or replace function public.submit_prestige_rating(p_token uuid, p_rating int, p_note text default null)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then return false; end if;
  select id into v_id from public.prestige_orders
    where public_token = p_token and delivered_at is not null;
  if not found then return false; end if;
  update public.prestige_orders set
    satisfaction_rating = p_rating,
    satisfaction_note = nullif(trim(coalesce(p_note, '')), ''),
    updated_at = now()
  where id = v_id;
  return true;
end $$;

grant execute on function public.get_prestige_order_by_token(uuid) to anon, authenticated;
grant execute on function public.update_prestige_billing(uuid, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.submit_prestige_rating(uuid, int, text) to anon, authenticated;
