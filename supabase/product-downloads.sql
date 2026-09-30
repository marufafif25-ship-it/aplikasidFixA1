-- Jalankan setelah schema.sql dan lynk-orders.sql. Aman dijalankan ulang.
-- Link unduhan dipisahkan dari products karena katalog dapat dibaca publik.
begin;
create table if not exists public.product_downloads (
  lynk_item_id text primary key check (length(btrim(lynk_item_id)) between 1 and 256),
  title text not null check (length(btrim(title)) between 1 and 500),
  drive_url text not null check (drive_url ~ '^https://drive\.google\.com/[^[:space:]]+$'),
  active boolean not null default true
);
alter table public.product_downloads add column if not exists description text not null default ''
  check (length(description) <= 3000);
alter table public.product_downloads enable row level security;
revoke all on public.product_downloads from anon, authenticated;
grant select, insert, update, delete on public.product_downloads to authenticated;
grant all on public.product_downloads to service_role;
drop policy if exists admin_manages_downloads on public.product_downloads;
create policy admin_manages_downloads on public.product_downloads
  for all to authenticated
  using (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in ('admin', 'owner')))
  with check (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in ('admin', 'owner')));
commit;
