-- Final priced offer for a prestige inquiry: admin enters the price, an LLM
-- drafts the luxury-tone offer copy, then it is sent as a rich HTML e-mail
-- (kind='offer' in inquiry_emails).
alter table public.prestige_inquiries add column if not exists offer_price text;
alter table public.prestige_inquiries add column if not exists offer_draft text;
alter table public.prestige_inquiries add column if not exists offer_currency text default 'CZK';
