-- Outbox for prestige-inquiry automation e-mails (confirmation, mini-course
-- drip, admin notifications, advisory replies). Mirrors the supplier_orders /
-- order_emails outbox pattern. Written exclusively by the service role
-- (api/process-inquiries.ts); admins may read/manage from the ERP.

create table if not exists public.inquiry_emails (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.prestige_inquiries(id) on delete cascade,
  kind text not null,
  recipient text not null default '',
  scheduled_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','sent','error','cancelled')),
  attempts int not null default 0,
  last_error text,
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (inquiry_id, kind)
);

alter table public.inquiry_emails enable row level security;

create policy "Admins can read inquiry emails"
  on public.inquiry_emails for select
  to authenticated using (public.is_admin());
create policy "Admins can manage inquiry emails"
  on public.inquiry_emails for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create index if not exists inquiry_emails_due_idx
  on public.inquiry_emails (status, scheduled_at);
create index if not exists inquiry_emails_inquiry_idx
  on public.inquiry_emails (inquiry_id);

-- AI-drafted advisory reply, waiting for a human to review & send from the ERP.
alter table public.prestige_inquiries add column if not exists ai_draft text;
