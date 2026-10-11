import { readFileSync } from "node:fs";

const rawSeedPosts = JSON.parse(readFileSync(new URL("./blog-seed.json", import.meta.url), "utf8"));

export const BLOG_SEED_POSTS = rawSeedPosts.map((post) => ({
  ...post,
  content: post.content.join("\n")
}));

function toDatabaseSeed(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    author: post.author,
    author_url: post.authorUrl || null,
    cover_image_url: post.coverImageUrl || null,
    published: post.published
  };
}

export function renderBlogSeedSql() {
  const rows = JSON.stringify(BLOG_SEED_POSTS.map(toDatabaseSeed), null, 2);
  if (rows.includes("$blog_seed$")) throw new Error("Seed artikel memuat delimiter SQL yang dicadangkan.");

  return `insert into public.blog_posts (
  slug, title, excerpt, content, category, author, author_url, cover_image_url,
  published, published_at, updated_at
)
select
  seed.slug, seed.title, seed.excerpt, seed.content, seed.category, seed.author,
  seed.author_url, seed.cover_image_url, seed.published, now(), now()
from jsonb_to_recordset(
$blog_seed$
${rows}
$blog_seed$::jsonb
) as seed(
  slug text,
  title text,
  excerpt text,
  content text,
  category text,
  author text,
  author_url text,
  cover_image_url text,
  published boolean
)
on conflict (slug) do nothing;`;
}

export function renderBlogSeedFile() {
  return [
    "-- Jalankan setelah supabase/blog-posts.sql di SQL Editor Supabase.",
    "-- Artikel diterbitkan sekali; ON CONFLICT menjaga artikel yang sudah ada tetap utuh.",
    "begin;",
    renderBlogSeedSql(),
    "commit;",
    ""
  ].join("\n");
}
