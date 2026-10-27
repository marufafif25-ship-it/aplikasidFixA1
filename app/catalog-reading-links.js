import Link from "next/link";
import { getPublishedBlogPosts } from "../lib/blog-server";
import { selectPublishedReading } from "../lib/product-buying-guides.mjs";

export default async function CatalogReadingLinks({ slugs }) {
  let posts;
  try { posts = await getPublishedBlogPosts(); }
  catch { return null; }
  const reading = selectPublishedReading(slugs, posts);
  if (!reading.length) return null;
  return <section className="category-help-section" aria-label="Panduan terkait">
    <span className="catalog-page-eyebrow">PANDUAN PRAKTIS</span>
    <h2>Baca sebelum memilih</h2>
    <ul>{reading.map((post) => <li key={post.slug}><Link href={`/blog/${post.slug}`}>{post.title}</Link></li>)}</ul>
  </section>;
}
