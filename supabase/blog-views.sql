-- Jalankan setelah supabase/blog-posts.sql untuk menyimpan angka Views dari Google Analytics.
begin;
alter table public.blog_posts add column if not exists views bigint not null default 0 check (views >= 0);
alter table public.blog_posts add column if not exists views_updated_at timestamptz;
commit;
