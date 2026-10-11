import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BLOG_SEED_POSTS, renderBlogSeedFile } from "../lib/blog-seed.mjs";
import { getBlogReadingTime, normalizeBlogPost } from "../lib/blog.mjs";

const seedSql = readFileSync(new URL("../supabase/blog-seed.sql", import.meta.url), "utf8");

test("blog seed contains thirty substantial, published articles with distinct slugs", () => {
  assert.equal(BLOG_SEED_POSTS.length, 30);
  assert.equal(new Set(BLOG_SEED_POSTS.map((post) => post.slug)).size, 30);

  for (const post of BLOG_SEED_POSTS) {
    assert.equal(normalizeBlogPost(post).published, true, post.slug);
    assert.ok(getBlogReadingTime(post.content) >= 2, post.slug);
    assert.match(post.content, /\]\(\/(?:produk\/|#produk)/, `${post.slug} should link to the catalog`);
    assert.ok((post.content.match(/https:\/\//g) || []).length >= 2, `${post.slug} should cite official sources`);
  }

  const additions = BLOG_SEED_POSTS.slice(10);
  assert.equal(additions.length, 20);
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
