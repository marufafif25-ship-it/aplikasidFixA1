import { writeFileSync } from "node:fs";
import { renderBlogSeedFile, renderBlogSeedSql } from "../lib/blog-seed.mjs";
import { BLOG_SEO_ADDITIONS } from "../lib/blog-seo-additions.mjs";

writeFileSync(new URL("../supabase/blog-seed.sql", import.meta.url), renderBlogSeedFile());
writeFileSync(new URL("../supabase/blog-seo-refresh.sql", import.meta.url), [
  "-- Jalankan setelah supabase/blog-posts.sql di SQL Editor Supabase.",
  "-- Hanya artikel SEO baru; slug yang sudah ada tidak ditimpa.",
  "begin;",
  renderBlogSeedSql(BLOG_SEO_ADDITIONS),
  "commit;",
  ""
].join("\n"));
process.stdout.write("Generated supabase/blog-seed.sql and supabase/blog-seo-refresh.sql\n");
