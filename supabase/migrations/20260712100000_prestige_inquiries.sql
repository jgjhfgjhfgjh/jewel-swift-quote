-- Prestige (/prestige "Luxury na poptávku") inquiries submitted from the public
-- form. Anyone may submit; only admins can read / manage. Shown in the admin
-- ERP view at /admin/poptavky.

create table if not exists public.prestige_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','in_progress','quoted','closed')),
  purchase_type text not null default 'personal' check (purchase_type in ('personal','company')),
  company text,
  ico text,
  name text not null,
  email text not null,
  phone_code text,
  phone text,
  quantity text,
  budget text,
  note text,
  watches jsonb not null default '[]'::jsonb,
  user_id uuid references auth.users(id) on delete set null,
  admin_note text
);

alter table public.prestige_inquiries enable row level security;

create policy "Anyone can submit a prestige inquiry"
  on public.prestige_inquiries for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read prestige inquiries"
  on public.prestige_inquiries for select
  to authenticated using (public.is_admin());
create policy "Admins can update prestige inquiries"
  on public.prestige_inquiries for update
  to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete prestige inquiries"
  on public.prestige_inquiries for delete
  to authenticated using (public.is_admin());

create index if not exists prestige_inquiries_created_at_idx on public.prestige_inquiries (created_at desc);
create index if not exists prestige_inquiries_status_idx on public.prestige_inquiries (status);
