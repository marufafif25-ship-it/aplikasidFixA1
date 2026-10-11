import test from "node:test";
import assert from "node:assert/strict";
import {
  blogPostFromRow,
  createBlogIndexStructuredData,
  createBlogPostingStructuredData,
  getBlogReadingTime,
  normalizeBlogPost,
  slugifyBlogTitle
} from "../lib/blog.mjs";

const post = {
  title: "Cara Memilih Software & Aplikasi",
  slug: "cara-memilih-software-dan-aplikasi",
  excerpt: "Panduan memilih software berdasarkan kebutuhan dan perangkat.",
  category: "Tips Software",
  author: "Aplikasi.id",
  authorUrl: "/tentang-kami",
  content: "## Kenali kebutuhan\n\nPilih aplikasi sesuai pekerjaan yang perlu diselesaikan.",
  coverImageUrl: "/assets/blog/software.jpg",
  published: true,
  publishedAt: "2026-10-10T12:00:00.000Z",
  updatedAt: "2026-10-11T12:00:00.000Z"
};

test("blog slugs are readable and stable for Indonesian titles", () => {
  assert.equal(slugifyBlogTitle("Memilih Aplikasi & Software untuk Kuliah"), "memilih-aplikasi-dan-software-untuk-kuliah");
  assert.equal(normalizeBlogPost({ ...post, slug: "" }).slug, "cara-memilih-software-dan-aplikasi");
});

test("blog posts validate content, metadata, publish status, and safe cover URLs", () => {
  const normalized = normalizeBlogPost(post);
  assert.equal(normalized.published, true);
  assert.equal(normalized.coverImageUrl, "/assets/blog/software.jpg");
  assert.equal(normalized.views, 0);
  assert.equal(normalizeBlogPost({ ...post, views: "789" }).views, 789);
  assert.equal(normalizeBlogPost({ ...post, slug: "Huruf Besar!" }).slug, "huruf-besar");
  assert.throws(() => normalizeBlogPost({ ...post, excerpt: "" }), /Ringkasan/);
  assert.throws(() => normalizeBlogPost({ ...post, coverImageUrl: "javascript:alert(1)" }), /URL HTTP/);
  assert.throws(() => normalizeBlogPost({ ...post, authorUrl: "javascript:alert(1)" }), /Link bio/);
  assert.throws(() => normalizeBlogPost({ ...post, published: "true" }), /Status terbit/);
  assert.throws(() => normalizeBlogPost({ ...post, views: "-1" }), /Jumlah dilihat/);
  assert.throws(() => normalizeBlogPost({ ...post, views: "1.5" }), /Jumlah dilihat/);
});

test("blog database rows map to the public article shape", () => {
  const mapped = blogPostFromRow({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    author_url: post.authorUrl,
    content: post.content,
    cover_image_url: post.coverImageUrl,
    published: true,
    views: "789",
    views_updated_at: "2026-10-11T13:00:00.000Z",
    published_at: post.publishedAt,
    updated_at: post.updatedAt
  });
  assert.equal(mapped.coverImageUrl, post.coverImageUrl);
  assert.equal(mapped.publishedAt, post.publishedAt);
  assert.equal(mapped.updatedAt, post.updatedAt);
  assert.equal(mapped.views, 789);
  assert.equal(mapped.viewsUpdatedAt, "2026-10-11T13:00:00.000Z");
});

test("blog article schema identifies the article, author, publisher, dates, and language", () => {
  const data = createBlogPostingStructuredData(post, "https://www.aplikasid.com");
  assert.equal(data["@type"], "BlogPosting");
  assert.equal(data.mainEntityOfPage["@id"], "https://www.aplikasid.com/blog/cara-memilih-software-dan-aplikasi");
  assert.equal(data.author["@type"], "Organization");
  assert.equal(data.author.url, "https://www.aplikasid.com/tentang-kami");
  assert.equal(data.datePublished, post.publishedAt);
  assert.equal(data.dateModified, post.updatedAt);
  assert.equal(data.image[0], "https://www.aplikasid.com/assets/blog/software.jpg");
  assert.equal(data.publisher["@id"], "https://www.aplikasid.com/#organization");
  assert.equal(data.inLanguage, "id-ID");
});

test("blog index schema uses the canonical site URL", () => {
  const data = createBlogIndexStructuredData("https://www.aplikasid.com");
  assert.equal(data["@type"], "Blog");
  assert.equal(data.url, "https://www.aplikasid.com/blog");
  assert.equal(createBlogIndexStructuredData("https://www.aplikasid.com", 2).url, "https://www.aplikasid.com/blog?page=2");
});

test("blog reading time is at least one minute and scales with article length", () => {
  assert.equal(getBlogReadingTime("Satu dua tiga empat."), 1);
  assert.equal(getBlogReadingTime(Array(401).fill("software").join(" ")), 3);
});
