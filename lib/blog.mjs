import { resolveSiteUrl } from "./seo.mjs";

const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyBlogTitle(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " dan ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

function normalizePublicUrl(value, label) {
  const urlValue = String(value || "").trim();
  if (!urlValue) return "";
  if (urlValue.startsWith("/") && !urlValue.startsWith("//")) return urlValue;
  try {
    const url = new URL(urlValue);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {}
  throw new TypeError(`${label} harus memakai URL HTTP(S) atau path lokal yang diawali /.`);
}

export function normalizeBlogPost(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Data artikel tidak valid.");
  }

  const title = String(input.title || "").trim();
  const slug = slugifyBlogTitle(input.slug || title);
  const excerpt = String(input.excerpt || "").trim();
  const content = String(input.content || "").trim();
  const author = String(input.author || "Aplikasi.id").trim();
  const authorUrl = normalizePublicUrl(input.authorUrl, "Link bio penulis");
  const category = String(input.category || "Tips Software").trim();

  if (!title || title.length > 180) throw new TypeError("Judul artikel wajib diisi dan maksimal 180 karakter.");
  if (!slug || slug.length > 120 || !BLOG_SLUG_PATTERN.test(slug)) throw new TypeError("URL artikel harus berupa slug huruf kecil, angka, dan tanda hubung.");
  if (!excerpt || excerpt.length > 320) throw new TypeError("Ringkasan artikel wajib diisi dan maksimal 320 karakter.");
  if (!content || content.length > 100000) throw new TypeError("Isi artikel wajib diisi dan maksimal 100.000 karakter.");
  if (!author || author.length > 120) throw new TypeError("Nama penulis wajib diisi dan maksimal 120 karakter.");
  if (authorUrl.length > 500) throw new TypeError("Link bio penulis maksimal 500 karakter.");
  if (!category || category.length > 80) throw new TypeError("Kategori artikel wajib diisi dan maksimal 80 karakter.");
  if (typeof input.published !== "boolean") throw new TypeError("Status terbit artikel tidak valid.");

  return {
    slug,
    title,
    excerpt,
    content,
    category,
    author,
    coverImageUrl: normalizePublicUrl(input.coverImageUrl, "Gambar"),
    authorUrl,
    published: input.published
  };
}

export function blogPostFromRow(row) {
  const post = normalizeBlogPost({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: row.author,
    authorUrl: row.author_url,
    coverImageUrl: row.cover_image_url,
    published: row.published
  });
  return { ...post, publishedAt: row.published_at || null, updatedAt: row.updated_at || null };
}

export function getBlogReadingTime(content) {
  const words = String(content || "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function createBlogPostingStructuredData(post, siteUrl) {
  const baseUrl = resolveSiteUrl(siteUrl);
  const url = new URL(`/blog/${encodeURIComponent(post.slug)}`, baseUrl).toString();
  const authorIsOrganization = post.author.trim().toLowerCase() === "aplikasi.id";
  const image = post.coverImageUrl ? new URL(post.coverImageUrl, baseUrl).toString() : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.excerpt,
    ...(image ? { image: [image] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt || post.publishedAt ? { dateModified: post.updatedAt || post.publishedAt } : {}),
    author: {
      "@type": authorIsOrganization ? "Organization" : "Person",
      name: post.author,
      ...(post.authorUrl ? { url: new URL(post.authorUrl, baseUrl).toString() } : {})
    },
    publisher: { "@id": `${baseUrl}/#organization` },
    articleSection: post.category,
    inLanguage: "id-ID"
  };
}

export function createBlogIndexStructuredData(siteUrl) {
  const baseUrl = resolveSiteUrl(siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Aplikasi.id",
    url: new URL("/blog", baseUrl).toString(),
    inLanguage: "id-ID",
    publisher: { "@id": `${baseUrl}/#organization` }
  };
}
