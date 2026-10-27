import { storeInformationPages } from "./store-profile.mjs";

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://www.aplikasid.com");

export function resolveSiteUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new TypeError("Site URL harus menggunakan HTTP atau HTTPS.");
  }
  return url.origin;
}

export function createSitemap(siteUrl, guideSlugs, productIds = [], categorySlugs = [], blogPosts = []) {
  const baseUrl = resolveSiteUrl(siteUrl);
  const publicRoutes = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/panduan", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/kategori", changeFrequency: "weekly", priority: 0.8 },
    ...storeInformationPages.map(({ path }) => ({ path, changeFrequency: "monthly", priority: 0.5 })),
    ...categorySlugs.map((slug) => ({ path: `/kategori/${encodeURIComponent(slug)}`, changeFrequency: "weekly", priority: 0.7 })),
    ...productIds.map((id) => ({ path: `/produk/${encodeURIComponent(id)}`, changeFrequency: "weekly", priority: 0.7 })),
    ...guideSlugs.map((slug) => ({ path: `/panduan/${encodeURIComponent(slug)}`, changeFrequency: "monthly", priority: 0.6 })),
    ...blogPosts.map((post) => ({ path: `/blog/${encodeURIComponent(post.slug)}`, lastModified: post.updatedAt || post.publishedAt || undefined, changeFrequency: "monthly", priority: 0.7 }))
  ];

  return publicRoutes.map(({ path, ...metadata }) => ({ url: new URL(path, baseUrl).toString(), ...metadata }));
}

export function createRobots(siteUrl) {
  const baseUrl = resolveSiteUrl(siteUrl);
  return {
    rules: { userAgent: "*", allow: ["/", "/api/product-image/"], disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", baseUrl).toString()
  };
}

export function createWebsiteStructuredData(siteUrl) {
  const baseUrl = resolveSiteUrl(siteUrl);
  const organizationId = `${baseUrl}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Aplikasi.id",
        url: baseUrl,
        logo: new URL("/assets/logos/aplikasid-hitamputih.png", baseUrl).toString()
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: "Aplikasi.id",
        url: baseUrl,
        inLanguage: "id-ID",
        publisher: { "@id": organizationId }
      }
    ]
  };
}

export function createBreadcrumbStructuredData(siteUrl, items) {
  const baseUrl = resolveSiteUrl(siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, path }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: new URL(path, baseUrl).toString()
    }))
  };
}

export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
