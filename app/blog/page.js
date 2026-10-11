import Link from "next/link";
import { connection } from "next/server";
import CatalogPageNav from "../catalog-page-nav";
import { createBlogIndexStructuredData } from "../../lib/blog.mjs";
import { getBlogReadingTime } from "../../lib/blog.mjs";
import { getPublishedBlogPosts } from "../../lib/blog-server";
import { createBreadcrumbStructuredData, serializeJsonLd, SITE_URL } from "../../lib/seo.mjs";

const title = "Blog Software, Aplikasi & Produktivitas | Aplikasi.id";
const description = "Baca artikel praktis tentang memilih software, aplikasi untuk kuliah dan kerja, desain, riset, serta produktivitas digital.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    siteName: "Aplikasi.id",
    locale: "id_ID",
    url: "/blog",
    title,
    description,
    images: [{ url: "/opengraph-image", alt: "Blog Aplikasi.id" }]
  },
  twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] }
};

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export default async function BlogIndexPage() {
  await connection();
  const posts = await getPublishedBlogPosts();
  const breadcrumbData = createBreadcrumbStructuredData(SITE_URL, [
    { name: "Beranda", path: "/" },
    { name: "Blog", path: "/blog" }
  ]);

  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page blog-index-page">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createBlogIndexStructuredData(SITE_URL)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />
        <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Blog</span></nav>
        <header className="catalog-page-hero">
          <span className="catalog-page-eyebrow">WAWASAN APLIKASI.ID</span>
          <h1>Blog software dan produktivitas</h1>
          <p>Artikel praktis untuk membantu memilih software, menyiapkan perangkat, dan memakai aplikasi dengan lebih efektif untuk kuliah, riset, desain, maupun kerja.</p>
        </header>
        <section className="blog-list-section" aria-labelledby="blog-list-heading">
          <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">ARTIKEL TERBARU</span><h2 id="blog-list-heading">Baca panduan dan tips</h2></div></div>
          {posts.length ? <div className="blog-post-grid">{posts.map((post) => <article className="blog-post-card" key={post.slug}>
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
        </section>
        <p className="catalog-page-note">Cari langkah instalasi atau bantuan pesanan? Kunjungi <Link href="/panduan">Pusat Panduan</Link> atau lihat <Link href="/#produk">katalog software</Link>.</p>
      </div>
    </main>
  </>;
}
