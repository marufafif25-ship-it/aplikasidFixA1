-- Jalankan di SQL Editor Supabase sebelum memakai fitur Blog di /adminn.
begin;
create table if not exists public.blog_posts (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 1 and 180),
  excerpt text not null check (char_length(trim(excerpt)) between 1 and 320),
  content text not null,
  category text not null default 'Tips Software',
  author text not null default 'Aplikasi.id',
  author_url text,
  cover_image_url text,
  published boolean not null default false,
  views bigint not null default 0 check (views >= 0),
  views_updated_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.blog_posts add column if not exists author_url text;
alter table public.blog_posts add column if not exists views bigint not null default 0 check (views >= 0);
alter table public.blog_posts add column if not exists views_updated_at timestamptz;
create index if not exists blog_posts_published_date_idx on public.blog_posts(published, published_at desc);
alter table public.blog_posts enable row level security;
revoke all on public.blog_posts from anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read on public.blog_posts for select to anon, authenticated using (published = true);
drop policy if exists blog_admin_read on public.blog_posts;
create policy blog_admin_read on public.blog_posts for select to authenticated using (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in ('admin', 'owner')));
drop policy if exists blog_admin_write on public.blog_posts;
create policy blog_admin_write on public.blog_posts for all to authenticated using (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in ('admin', 'owner'))) with check (exists (select 1 from public.admin_users where id = (select auth.uid()) and role in ('admin', 'owner')));
commit;
