import Link from "next/link";
import { connection } from "next/server";
import CatalogPageNav from "../catalog-page-nav";
import { getStorefront } from "../../lib/storefront-server";
import { productCategories, getCategoryPath, isProductInCategory } from "../../lib/catalog-seo.mjs";

export const metadata = {
  title: "Kategori Software & Game | Aplikasi.id",
  description: "Jelajahi software statistik dan riset, desain, engineering, game, video, office, dan utility. Bandingkan produk, versi, serta sistem operasinya.",
  alternates: { canonical: "/kategori" },
  openGraph: {
    type: "website",
    siteName: "Aplikasi.id",
    locale: "id_ID",
    url: "/kategori",
    title: "Kategori Software & Game | Aplikasi.id",
    description: "Jelajahi software statistik dan riset, desain, engineering, game, video, office, dan utility. Bandingkan produk, versi, serta sistem operasinya.",
    images: [{ url: "/opengraph-image", alt: "Kategori produk Aplikasi.id" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Kategori Software & Game | Aplikasi.id",
    description: "Jelajahi software statistik dan riset, desain, engineering, game, video, office, dan utility.",
    images: [{ url: "/twitter-image", alt: "Kategori produk Aplikasi.id" }]
  }
};

export default async function CategoryIndexPage() {
  await connection();
  const { products } = await getStorefront();
  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page">
      <div className="container">
        <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Kategori produk</span></nav>
        <header className="catalog-page-hero">
          <span className="catalog-page-eyebrow">PILIH BERDASARKAN KEBUTUHAN</span>
          <h1>Kategori Produk Digital</h1>
          <p>Jelajahi aplikasi, software, dan game untuk kebutuhan kerja, kreativitas, maupun hiburan. Buka kategori untuk memeriksa pilihan, platform, kompatibilitas, dan detail produk.</p>
        </header>
        <section aria-labelledby="category-list-heading">
          <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">JELAJAHI KATALOG</span><h2 id="category-list-heading">Pilih kategori</h2></div></div>
          <div className="category-hub-grid">
            {productCategories.map((category) => {
              const count = products.filter((product) => isProductInCategory(product, category)).length;
              return <Link className="category-hub-card" href={getCategoryPath(category)} key={category.slug}>
                <span className="catalog-page-eyebrow">{count} produk</span>
                <h2>{category.title}</h2>
                <p>{category.intro}</p>
                <span className="category-hub-link">Lihat kategori <span aria-hidden="true">→</span></span>
              </Link>;
            })}
          </div>
        </section>
        <p className="catalog-page-note">Belum yakin versi mana yang cocok? Periksa sistem operasi dan spesifikasi perangkat, lalu buka <Link href="/panduan">pusat panduan</Link> atau hubungi CS sebelum checkout.</p>
      </div>
    </main>
  </>;
}
