import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getRelatedBlogPosts } from "../lib/blog-related-posts.mjs";
import { BLOG_SEED_POSTS } from "../lib/blog-seed.mjs";
import { loadJsx } from "./helpers/load-jsx.mjs";

const article = (slug, title, category, extra = {}) => ({ slug, title, category, published: true, ...extra });
const premiere = article("premiere-pro-untuk-editing", "Premiere Pro untuk Editing Video", "Video & Animasi");

test("related articles prioritize the same software before broader topics and exclude unrelated new posts", () => {
  const office = article("office-terbaru", "Office untuk Dokumen", "Office & Produktivitas", { publishedAt: "2026-10-26" });
  const animation = article("after-effects-teks", "Animasi Teks After Effects", "Video & Animasi", { publishedAt: "2026-10-25" });
  const proxy = article("proxy-premiere", "Menggunakan Proxy Premiere Pro", "Video & Animasi", { publishedAt: "2026-10-01" });
  const results = getRelatedBlogPosts(premiere, [office, animation, proxy, premiere]);

  assert.deepEqual(results.map(({ slug }) => slug), [proxy.slug, animation.slug]);
});

test("Office readers get Word and Excel articles, including when software names differ", () => {
  const office = article("panduan-office", "Panduan Memilih Office untuk Kuliah", "Office & Produktivitas");
  const word = article("nomor-halaman-word", "Nomor Halaman Word untuk Skripsi", "Office & Produktivitas");
  const excel = article("tabel-excel", "PivotTable Excel untuk Laporan", "Office & Produktivitas");
  const spss = article("analisis-spss", "Analisis SPSS untuk Skripsi", "Riset & Statistik");

  assert.deepEqual(new Set(getRelatedBlogPosts(office, [spss, word, excel]).map(({ slug }) => slug)), new Set([word.slug, excel.slug]));
});

test("new articles outside the original slug mapping can find the same software across category labels", () => {
  const source = article("davinci-resolve-gratis-resmi", "DaVinci Resolve Gratis Resmi", "Tutorial Baru");
  const results = getRelatedBlogPosts(source, BLOG_SEED_POSTS);
  assert.equal(results[0].slug, "workflow-edit-video-pertama-dengan-davinci-resolve");
  assert.ok(results.every(({ category }) => category === "Video & Animasi"));
});

test("self links, drafts, unpublished records, duplicate slugs, and invalid records are excluded", () => {
  const published = article("premiere-proxy", "Premiere Proxy", "Video & Animasi");
  const records = [
    premiere, published, { ...published },
    article("premiere-draft", "Premiere Draft", "Video & Animasi", { published: false }),
    { slug: "premiere-unknown", title: "Premiere Unknown" },
    article("../private", "Premiere Secret", "Video & Animasi"),
    article("no-title", "", "Video & Animasi"), null
  ];
  assert.deepEqual(getRelatedBlogPosts(premiere, records), [published]);
});

test("common wording and generic categories do not force unrelated recommendations", () => {
  const source = article("panduan-memilih-software", "Panduan Memilih Software", "Tips Software");
  const candidate = article("tips-menggunakan-aplikasi", "Tips Menggunakan Aplikasi untuk Kerja", "Tips Software");
  assert.deepEqual(getRelatedBlogPosts(source, [candidate]), []);
  assert.deepEqual(getRelatedBlogPosts(null, [candidate]), []);
  assert.deepEqual(getRelatedBlogPosts(source, null), []);
});

test("meaningful subject words still relate articles on new topics without a known software name", () => {
  const source = article("mengatur-margin-dokumen", "Mengatur Margin Dokumen", "Tips Software");
  const related = article("margin-dokumen-cetak", "Margin Dokumen untuk Cetak", "Panduan Baru");
  assert.deepEqual(getRelatedBlogPosts(source, [related]), [related]);
});

test("selection is limited, deterministic, and does not reorder the input", () => {
  const posts = ["d", "c", "b", "a"].map((suffix) => article(`premiere-${suffix}`, "Panduan Premiere", "Video & Animasi"));
  const before = [...posts];
  assert.deepEqual(getRelatedBlogPosts(premiere, posts).map(({ slug }) => slug), ["premiere-a", "premiere-b", "premiere-c"]);
  assert.deepEqual(posts, before);
  assert.deepEqual(getRelatedBlogPosts(premiere, [...posts].reverse()), getRelatedBlogPosts(premiere, posts));
  assert.equal(getRelatedBlogPosts(premiere, posts, 1).length, 1);
  assert.equal(getRelatedBlogPosts(premiere, posts, 50).length, 3);
  assert.deepEqual(getRelatedBlogPosts(premiere, posts, 0), []);
});

test("related article cards render only relevant published links and hide an empty section", () => {
  const RelatedArticles = loadJsx(new URL("../app/blog/related-articles.js", import.meta.url)).default;
  const candidate = article("premiere-proxy", "Premiere <Proxy>", "Video & Animasi", { excerpt: "Panduan & contoh" });
  const html = renderToStaticMarkup(React.createElement(RelatedArticles, { post: premiere, posts: [candidate] }));
  assert.match(html, /Artikel terkait/);
  assert.match(html, /href="\/blog\/premiere-proxy"/);
  assert.match(html, /Premiere &lt;Proxy&gt;/);
  assert.equal(renderToStaticMarkup(React.createElement(RelatedArticles, { post: premiere, posts: [] })), "");
});
