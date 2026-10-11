import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import CatalogPageNav from "../catalog-page-nav";
import { createBlogIndexStructuredData } from "../../lib/blog.mjs";
import { getBlogReadingTime } from "../../lib/blog.mjs";
import { getPublishedBlogPosts } from "../../lib/blog-server";
import { createBreadcrumbStructuredData, serializeJsonLd, SITE_URL } from "../../lib/seo.mjs";
import { getBlogPagePath, normalizeBlogPage, paginateBlogPosts } from "../../lib/blog-pagination.mjs";
import BlogPagination from "./blog-pagination";

const title = "Blog Software, Aplikasi & Produktivitas | Aplikasi.id";
const description = "Baca artikel praktis tentang memilih software, aplikasi untuk kuliah dan kerja, desain, riset, serta produktivitas digital.";

export async function generateMetadata({ searchParams }) {
  const { page: requestedPage } = await searchParams;
  const page = normalizeBlogPage(requestedPage);
  const pageTitle = page === 1 ? title : `${title} — Halaman ${page}`;
  const pageDescription = page === 1 ? description : `${description} Halaman ${page}.`;
  const pagePath = getBlogPagePath(page);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: pagePath },
    openGraph: {
      type: "website",
      siteName: "Aplikasi.id",
      locale: "id_ID",
      url: new URL(pagePath, SITE_URL).toString(),
      title: pageTitle,
      description: pageDescription,
      images: [{ url: "/opengraph-image", alt: "Blog Aplikasi.id" }]
    },
    twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: ["/twitter-image"] }
  };
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export default async function BlogIndexPage({ searchParams }) {
  await connection();
  const [{ page: requestedPage }, allPosts] = await Promise.all([searchParams, getPublishedBlogPosts()]);
  const pagination = paginateBlogPosts(allPosts, requestedPage);
  if (normalizeBlogPage(requestedPage) !== pagination.page) notFound();
  const pagePath = getBlogPagePath(pagination.page);
  const breadcrumbData = createBreadcrumbStructuredData(SITE_URL, [
    { name: "Beranda", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(pagination.page > 1 ? [{ name: `Halaman ${pagination.page}`, path: pagePath }] : [])
  ]);

  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page blog-index-page">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createBlogIndexStructuredData(SITE_URL, pagination.page)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />
        <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/blog">Blog</Link>{pagination.page > 1 && <><span aria-hidden="true">/</span><span>Halaman {pagination.page}</span></>}</nav>
        <header className="catalog-page-hero">
          <span className="catalog-page-eyebrow">WAWASAN APLIKASI.ID</span>
          <h1>Blog software dan produktivitas</h1>
          <p>Artikel praktis untuk membantu memilih software, menyiapkan perangkat, dan memakai aplikasi dengan lebih efektif untuk kuliah, riset, desain, maupun kerja.</p>
        </header>
        <section className="blog-list-section" aria-labelledby="blog-list-heading">
          <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">ARTIKEL TERBARU</span><h2 id="blog-list-heading">Baca panduan dan tips</h2></div><span className="blog-post-total">{allPosts.length} artikel</span></div>
          {pagination.posts.length ? <div className="blog-post-grid">{pagination.posts.map((post) => <article className="blog-post-card" key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="blog-post-card-link">
              {post.coverImageUrl && <img className="blog-post-card-image" src={post.coverImageUrl} alt="" loading="lazy" />}
              <div className="blog-post-card-body">
                <span className="blog-post-category">{post.category}</span>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <span className="blog-post-card-meta">{formatDate(post.publishedAt)} · {getBlogReadingTime(post.content)} menit baca</span>
                <span className="blog-post-read-more">Baca artikel <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          </article>)}</div> : <div className="blog-empty-state"><h2>Artikel sedang disiapkan</h2><p>Artikel baru akan muncul di sini setelah diterbitkan melalui dashboard Aplikasi.id.</p><Link className="catalog-page-button" href="/#produk">Jelajahi katalog software <span aria-hidden="true">→</span></Link></div>}
          <BlogPagination page={pagination.page} pageCount={pagination.pageCount} total={pagination.total} firstItem={pagination.firstItem} lastItem={pagination.lastItem} />
        </section>
        <p className="catalog-page-note">Cari langkah instalasi atau bantuan pesanan? Kunjungi <Link href="/panduan">Pusat Panduan</Link> atau lihat <Link href="/#produk">katalog software</Link>.</p>
      </div>
    </main>
  </>;
}
