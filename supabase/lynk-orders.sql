-- Jalankan setelah schema.sql. Aman dijalankan ulang.
begin;
create table if not exists public.lynk_orders (
  ref_id text primary key,
  message_id text not null,
  customer_email text not null check (customer_email = lower(btrim(customer_email))),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  totals jsonb not null check (jsonb_typeof(totals) = 'object'),
  payment_status text not null default 'paid' check (payment_status = 'paid'),
  lynk_created_at text,
  received_at timestamptz not null default now()
);
create index if not exists lynk_orders_customer_date_idx on public.lynk_orders(customer_email, received_at desc, ref_id);
alter table public.lynk_orders enable row level security;
revoke all on public.lynk_orders from anon, authenticated;
grant select on public.lynk_orders to authenticated;
grant all on public.lynk_orders to service_role;

-- Read verified email from auth.users, never user-editable metadata or browser input.
create or replace function public.verified_customer_email()
returns text
language sql stable security definer set search_path = ''
as $$
  select lower(btrim(email)) from auth.users
  where id = (select auth.uid()) and email_confirmed_at is not null
    and coalesce(is_anonymous, false) = false;
$$;
revoke all on function public.verified_customer_email() from public, anon;
grant execute on function public.verified_customer_email() to authenticated;
drop policy if exists customer_reads_own_lynk_orders on public.lynk_orders;
create policy customer_reads_own_lynk_orders on public.lynk_orders
  for select to authenticated
  using (customer_email = (select public.verified_customer_email()));
-- Only the server's secret/service-role key can write orders.
commit;
