import test from "node:test";
import assert from "node:assert/strict";
import { loadPublishedBlogPosts } from "../lib/blog-data.mjs";

function createRow(title) {
  return {
    slug: "panduan-software",
    title,
    excerpt: "Panduan software untuk pembaca.",
    content: "Isi artikel.",
    category: "Tips Software",
    author: "Aplikasi.id",
    author_url: null,
    cover_image_url: null,
    published: true,
    published_at: "2026-10-11T12:00:00.000Z",
    updated_at: "2026-10-11T12:00:00.000Z"
  };
}

test("published blog reads query Supabase again so direct imports appear immediately", async () => {
  let reads = 0;
  const createClient = () => {
    reads += 1;
    const query = {
      select(columns) {
        assert.match(columns, /published_at/);
        return this;
      },
      eq(column, value) {
        assert.equal(column, "published");
        assert.equal(value, true);
        return this;
      },
      order() { return this; },
      then(resolve, reject) {
        return Promise.resolve({ data: [createRow(`Artikel ${reads}`)], error: null }).then(resolve, reject);
      }
    };
    return { from(table) { assert.equal(table, "blog_posts"); return query; } };
  };

  assert.equal((await loadPublishedBlogPosts(createClient))[0].title, "Artikel 1");
  assert.equal((await loadPublishedBlogPosts(createClient))[0].title, "Artikel 2");
  assert.equal(reads, 2);
});

test("published blog reads still show an empty list before the table migration", async () => {
  const createClient = () => {
    const query = {
      select() { return this; },
      eq() { return this; },
      order() { return this; },
      then(resolve, reject) {
        return Promise.resolve({ data: null, error: { code: "PGRST205", message: "table blog_posts not found" } }).then(resolve, reject);
      }
    };
    return { from() { return query; } };
  };

  assert.deepEqual(await loadPublishedBlogPosts(createClient), []);
});
