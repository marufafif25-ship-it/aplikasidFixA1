-- Jalankan di SQL Editor Supabase. Aman dijalankan ulang.
begin;
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'owner'))
);
create table if not exists public.products (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  sort_order integer not null default 0
);
create table if not exists public.site_settings (
  id text primary key check (id in ('homepage', 'footer')),
  data jsonb not null check (jsonb_typeof(data) = 'object')
);
create table if not exists public.chat_faq (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  active boolean not null default true,
  sort_order integer not null default 0
);
create index if not exists products_sort_order_idx on public.products(sort_order);
create index if not exists chat_faq_active_order_idx on public.chat_faq(active, sort_order);
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.chat_faq enable row level security;
revoke all on public.admin_users, public.products, public.site_settings, public.chat_faq from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.products, public.site_settings, public.chat_faq to anon, authenticated;
grant insert, update, delete on public.products, public.site_settings, public.chat_faq to authenticated;
drop policy if exists own_role on public.admin_users;
create policy own_role on public.admin_users for select to authenticated using (id = (select auth.uid()));
-- Tidak ada policy penulisan admin_users: role hanya diatur melalui SQL Editor.
do $$
declare t text;
begin
  foreach t in array array['products', 'site_settings', 'chat_faq'] loop
    execute format('drop policy if exists public_read on public.%I', t);
    execute format('create policy public_read on public.%I for select to anon, authenticated using (%s)', t, case when t = 'chat_faq' then 'active = true' else 'true' end);
    execute format('drop policy if exists admin_write on public.%I', t);
    execute format('create policy admin_write on public.%I for all to authenticated using (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in (''admin'', ''owner''))) with check (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in (''admin'', ''owner'')))', t);
  end loop;
end $$;
commit;
