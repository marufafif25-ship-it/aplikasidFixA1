import Link from "next/link";
import { getRelatedBlogPosts } from "../../lib/blog-related-posts.mjs";

export default function BlogRelatedArticles({ post, posts }) {
  const relatedPosts = getRelatedBlogPosts(post, posts);
  if (!relatedPosts.length) return null;

  return <section className="catalog-page-section blog-related-section" aria-labelledby="blog-related-heading">
    <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">LANJUTKAN MEMBACA</span><h2 id="blog-related-heading">Artikel terkait</h2></div><Link href="/blog">Semua artikel <span aria-hidden="true">→</span></Link></div>
    <div className="blog-related-grid">{relatedPosts.map((item) => <Link className="blog-related-card" href={`/blog/${encodeURIComponent(item.slug)}`} key={item.slug}><span className="blog-post-category">{item.category}</span><strong>{item.title}</strong><span>{item.excerpt}</span></Link>)}</div>
  </section>;
}
