-- Swelt Web Cockpit — stav auditu copywritingu + struktury pro každý uzel
-- ze `src/lib/audit/siteMap.ts` (node_id = `<page>::<sekce>`).
-- Nástroj: admin stránka /admin/audit.
--
-- POZOR: na živé DB `role` v user_roles je TEXT a funkce has_role NEEXISTUJE
-- (viz CLAUDE.md), proto admin check děláme přímým EXISTS, ne přes has_role().

create table if not exists public.content_audit (
  node_id          text primary key,
  copy_status      text not null default 'todo',
  structure_status text not null default 'todo',
  -- { responsive|states|design|a11ySeo : todo|ok|fail|na }
  structure_checks jsonb not null default '{}'::jsonb,
  is_live          boolean not null default true,
  notes            text,
  reviewer         text,
  updated_at       timestamptz not null default now(),
  updated_by       uuid default auth.uid(),
  constraint content_audit_copy_status_chk
    check (copy_status in ('todo','in_review','approved','needs_fix')),
  constraint content_audit_structure_status_chk
    check (structure_status in ('todo','in_review','approved','needs_fix'))
);

alter table public.content_audit enable row level security;

-- Plný přístup jen pro admina.
drop policy if exists content_audit_admin_all on public.content_audit;
create policy content_audit_admin_all on public.content_audit
  for all to authenticated
  using (exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'))
  with check (exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'));

-- updated_at / updated_by se obnoví při každém UPDATE.
create or replace function public.content_audit_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists content_audit_touch_trg on public.content_audit;
create trigger content_audit_touch_trg
  before update on public.content_audit
  for each row execute function public.content_audit_touch();
