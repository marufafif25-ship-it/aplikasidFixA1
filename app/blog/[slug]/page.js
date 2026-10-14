import Link from "next/link";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import CatalogPageNav from "../../catalog-page-nav";
import BlogRelatedProducts from "../related-products";
import { createBlogPostingStructuredData, getBlogReadingTime } from "../../../lib/blog.mjs";
import { getPublishedBlogPost, getPublishedBlogPosts } from "../../../lib/blog-server";
import { createBreadcrumbStructuredData, serializeJsonLd, SITE_URL } from "../../../lib/seo.mjs";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function formatBlogViews(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function getImageUrl(post) {
  return post.coverImageUrl ? new URL(post.coverImageUrl, SITE_URL).toString() : new URL("/opengraph-image", SITE_URL).toString();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan | Aplikasi.id", robots: { index: false, follow: false } };

  const title = `${post.title} | Blog Aplikasi.id`;
  const canonical = `/blog/${post.slug}`;
  const image = getImageUrl(post);
  return {
    title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: "Aplikasi.id",
      locale: "id_ID",
      url: new URL(canonical, SITE_URL).toString(),
      title,
      description: post.excerpt,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: [post.author],
      section: post.category,
      images: [{ url: image, alt: post.title }]
    },
    twitter: { card: "summary_large_image", title, description: post.excerpt, images: [image] }
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  await connection();
  const posts = await getPublishedBlogPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const wasUpdatedAfterPublishing = post.publishedAt && post.updatedAt && Date.parse(post.updatedAt) > Date.parse(post.publishedAt);
  const relatedPosts = posts.filter((item) => item.slug !== slug).slice(0, 3);
  const articleUrl = `/blog/${post.slug}`;
  const breadcrumbData = createBreadcrumbStructuredData(SITE_URL, [
    { name: "Beranda", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: articleUrl }
  ]);

  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page blog-article-page">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createBlogPostingStructuredData(post, SITE_URL)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />
        <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/blog">Blog</Link><span aria-hidden="true">/</span><span>{post.title}</span></nav>
        <article className="blog-reading">
          <header className="blog-reading-header">
            <span className="blog-post-category">{post.category}</span>
            <h1>{post.title}</h1>
            <p className="blog-reading-excerpt">{post.excerpt}</p>
            <div className="blog-reading-meta"><span>Oleh {post.authorUrl ? <Link href={post.authorUrl}>{post.author}</Link> : post.author}</span><span>Diterbitkan {formatDate(post.publishedAt)}</span>{wasUpdatedAfterPublishing && <span>Diperbarui {formatDate(post.updatedAt)}</span>}<span>{getBlogReadingTime(post.content)} menit baca</span>{post.views > 0 && <span>{formatBlogViews(post.views)} dilihat</span>}</div>
            {post.coverImageUrl && <img className="blog-reading-cover" src={post.coverImageUrl} alt={post.title} fetchPriority="high" />}
          </header>
          <div className="blog-reading-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown></div>
          <Suspense fallback={null}><BlogRelatedProducts slug={slug} posts={posts} /></Suspense>
          <footer className="blog-reading-footer"><Link className="guide-text-link" href="/blog">← Kembali ke Blog</Link><Link className="catalog-page-button" href="/#produk">Lihat katalog software <span aria-hidden="true">→</span></Link></footer>
        </article>
        {relatedPosts.length > 0 && <section className="catalog-page-section blog-related-section" aria-labelledby="blog-related-heading">
          <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">LANJUTKAN MEMBACA</span><h2 id="blog-related-heading">Artikel lainnya</h2></div><Link href="/blog">Semua artikel <span aria-hidden="true">→</span></Link></div>
          <div className="blog-related-grid">{relatedPosts.map((item) => <Link className="blog-related-card" href={`/blog/${item.slug}`} key={item.slug}><span className="blog-post-category">{item.category}</span><strong>{item.title}</strong><span>{item.excerpt}</span></Link>)}</div>
        </section>}
      </div>
    </main>
  </>;
}
