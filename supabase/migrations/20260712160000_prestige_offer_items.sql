-- Per-item pricing for prestige offers: the customer may ask for several models
-- in one inquiry, so the admin prices each model individually. offer_items is a
-- jsonb array of {brand, model, price}; offer_price stays as the computed total
-- (the invoice RPC keys off it).
alter table public.prestige_inquiries add column if not exists offer_items jsonb;
