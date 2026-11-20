import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BLOG_SEED_POSTS, renderBlogSeedFile, renderBlogSeedSql } from "../lib/blog-seed.mjs";
import { BLOG_SEO_ADDITIONS } from "../lib/blog-seo-additions.mjs";
import { getBlogReadingTime, normalizeBlogPost } from "../lib/blog.mjs";

const seedSql = readFileSync(new URL("../supabase/blog-seed.sql", import.meta.url), "utf8");

test("blog seed contains substantial, published articles with distinct slugs", () => {
  assert.equal(BLOG_SEED_POSTS.length, 31);
  assert.equal(new Set(BLOG_SEED_POSTS.map((post) => post.slug)).size, 31);

  for (const post of BLOG_SEED_POSTS) {
    assert.equal(normalizeBlogPost(post).published, true, post.slug);
    assert.ok(getBlogReadingTime(post.content) >= 2, post.slug);
    assert.match(post.content, /\]\(\/(?:produk\/|#produk)/, `${post.slug} should link to the catalog`);
    assert.ok((post.content.match(/https:\/\//g) || []).length >= 2, `${post.slug} should cite official sources`);
  }

  const additions = BLOG_SEED_POSTS.slice(10);
  assert.equal(additions.length, 21);
  for (const post of additions) {
    assert.ok(post.content.split(/\s+/).length >= 300, `${post.slug} should give readers a substantial guide`);
    assert.ok((post.content.match(/https:\/\//g) || []).length >= 2, `${post.slug} should cite official sources`);
  }
});

test("blog seed SQL is generated from the article source and is safe to rerun", () => {
  assert.equal(seedSql, renderBlogSeedFile());
  assert.match(seedSql, /on conflict \(slug\) do nothing/i);
  assert.match(seedSql, /seed\.published, now\(\), now\(\)/);
});

test("the scoped SEO import adds only new articles and cannot restore deleted legacy posts", () => {
  const sql = readFileSync(new URL("../supabase/blog-seo-refresh.sql", import.meta.url), "utf8");
  assert.ok(sql.includes(renderBlogSeedSql(BLOG_SEO_ADDITIONS)));
  for (const post of BLOG_SEO_ADDITIONS) assert.ok(sql.includes(`"slug": "${post.slug}"`));
  for (const post of BLOG_SEED_POSTS.slice(0, 30)) assert.equal(sql.includes(`"slug": "${post.slug}"`), false, post.slug);
  assert.match(sql, /on conflict \(slug\) do nothing/i);
});
