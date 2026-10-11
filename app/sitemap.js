import { guides } from "../lib/guides";
import { productCategories } from "../lib/catalog-seo.mjs";
import { createSitemap, SITE_URL } from "../lib/seo.mjs";
import { getStorefront } from "../lib/storefront-server";
import { getPublishedBlogPosts } from "../lib/blog-server";
import { connection } from "next/server";

export default async function sitemap() {
  await connection();
  const [{ products }, blogPosts] = await Promise.all([getStorefront(), getPublishedBlogPosts()]);
  return createSitemap(
    SITE_URL,
    guides.map(({ slug }) => slug),
    products.map(({ id }) => id),
    productCategories.map(({ slug }) => slug),
    blogPosts
  );
}
