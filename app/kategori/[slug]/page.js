import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import CatalogPageNav from "../../catalog-page-nav";
import CatalogProductCard from "../../catalog-product-card";
import { createBreadcrumbStructuredData, serializeJsonLd, SITE_URL } from "../../../lib/seo.mjs";
import { productCategories, getCategoryBySlug, getCategoryPath } from "../../../lib/catalog-seo.mjs";
import { getStorefront } from "../../../lib/storefront-server";

export const dynamicParams = false;

export function generateStaticParams() {
  return productCategories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Kategori tidak ditemukan | Aplikasi.id", robots: { index: false, follow: false } };

  const title = `${category.seoTitle} | Aplikasi.id`;
  const canonical = getCategoryPath(category);
  return {
    title,
    description: category.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Aplikasi.id",
      locale: "id_ID",
      url: new URL(canonical, SITE_URL).toString(),
      title,
      description: category.description,
      images: [{ url: "/opengraph-image", alt: category.title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: category.description,
      images: [{ url: "/twitter-image", alt: category.title }]
    }
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  await connection();
  const { products: allProducts } = await getStorefront();
  const products = allProducts.filter((product) => product.category === category.value);
  const breadcrumbData = createBreadcrumbStructuredData(SITE_URL, [
    { name: "Beranda", path: "/" },
    { name: "Kategori software", path: "/kategori" },
    { name: category.label, path: getCategoryPath(category) }
  ]);

  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />
        <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/kategori">Kategori software</Link><span aria-hidden="true">/</span><span>{category.label}</span></nav>
        <header className="catalog-page-hero">
          <span className="catalog-page-eyebrow">{products.length} PRODUK DALAM KATEGORI</span>
          <h1>{category.title}</h1>
          <p>{category.intro}</p>
          <p>{category.description}</p>
        </header>

        <section className="catalog-page-section" aria-labelledby="category-products-heading">
          <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">PILIHAN PRODUK</span><h2 id="category-products-heading">Software {category.label}</h2></div></div>
          {products.length ? <div className="seo-products-grid">{products.map((product) => <CatalogProductCard key={product.id} product={product} />)}</div> : <p className="catalog-page-empty">Belum ada produk di kategori ini. Hubungi CS untuk informasi produk yang sedang tersedia.</p>}
        </section>

        <section className="category-help-section" aria-labelledby="category-checklist-heading">
          <span className="catalog-page-eyebrow">SEBELUM MEMILIH</span>
          <h2 id="category-checklist-heading">Cara memeriksa kecocokan software</h2>
          <p>{category.description} Gunakan daftar berikut untuk menyaring pilihan dan mengurangi risiko salah versi.</p>
          <ul>{category.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          <Link className="catalog-page-button" href="/panduan">Buka panduan instalasi <span aria-hidden="true">→</span></Link>
        </section>

        <p className="catalog-page-note">Mau membandingkan kategori lain? <Link href="/kategori">Lihat semua kategori software</Link>.</p>
      </div>
    </main>
  </>;
}
