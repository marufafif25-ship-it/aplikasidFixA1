import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import CatalogPageNav from "../../catalog-page-nav";
import CatalogProductCard from "../../catalog-product-card";
import { getCheckoutUrl } from "../../../lib/checkout";
import {
  createProductStructuredData,
  getCategoryByValue,
  getCategoryPath,
  getProductDescription,
  getProductMetaDescription,
  getProductMetaTitle,
  getProductPath
} from "../../../lib/catalog-seo.mjs";
import { createBreadcrumbStructuredData, serializeJsonLd, SITE_URL } from "../../../lib/seo.mjs";
import { getStorefront } from "../../../lib/storefront-server";

const formatRp = (amount) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(Number(amount) || 0);

async function findProduct(id) {
  const { products } = await getStorefront();
  return products.find((product) => String(product.id) === id) || null;
}

function getProductImage(product) {
  return product.catalogImageUrl || product.imageUrl || "/assets/logos/aplikasid.png";
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) return { title: "Produk tidak ditemukan | Aplikasi.id", robots: { index: false, follow: false } };

  const title = getProductMetaTitle(product);
  const description = getProductMetaDescription(product);
  const canonical = getProductPath(product);
  const image = new URL(getProductImage(product), SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Aplikasi.id",
      locale: "id_ID",
      url: new URL(canonical, SITE_URL).toString(),
      title,
      description,
      images: [{ url: image, alt: product.title }]
    },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image, alt: product.title }] }
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  await connection();
  const product = await findProduct(id);
  if (!product) notFound();

  const category = getCategoryByValue(product.category);
  const categoryLabel = category?.label || product.category;
  const categoryPath = getCategoryPath(category || product.category);
  const productPath = getProductPath(product);
  const canonicalUrl = new URL(productPath, SITE_URL).toString();
  const imageUrl = getProductImage(product);
  const description = getProductDescription(product);
  const checkoutUrl = getCheckoutUrl(product.buyUrl);
  const relatedProducts = category
    ? (await getStorefront()).products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
    : [];
  const productData = createProductStructuredData({ product, description, canonicalUrl, siteUrl: SITE_URL, imageUrl });
  const breadcrumbData = createBreadcrumbStructuredData(SITE_URL, [
    { name: "Beranda", path: "/" },
    { name: "Kategori software", path: "/kategori" },
    ...(category ? [{ name: category.label, path: categoryPath }] : []),
    { name: product.title, path: productPath }
  ]);
  const localImage = imageUrl.startsWith("/assets/") || imageUrl.startsWith("/api/product-image/");

  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page product-detail-page">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />
        <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/kategori">Kategori</Link><span aria-hidden="true">/</span><Link href={categoryPath}>{categoryLabel}</Link><span aria-hidden="true">/</span><span>{product.title}</span></nav>

        <article className="product-detail-hero">
          <div className="product-detail-image"><Image src={imageUrl} alt={product.title} width={560} height={420} unoptimized={!localImage} priority sizes="(max-width: 800px) 100vw, 45vw" /></div>
          <div className="product-detail-content">
            <Link className="catalog-page-eyebrow product-category-link" href={categoryPath}>{categoryLabel}</Link>
            <h1>{product.title}</h1>
            <p className="product-detail-description">{description}</p>
            <div className="product-detail-price">
              <div><span>Harga saat ini</span><strong>{formatRp(product.price)}</strong></div>
              {Number(product.originalPrice) > Number(product.price) && <del>{formatRp(product.originalPrice)}</del>}
            </div>
            {checkoutUrl
              ? <a className="catalog-page-button product-buy-button" href={checkoutUrl} target="_blank" rel="noreferrer">Beli produk ini <span aria-hidden="true">↗</span></a>
              : <Link className="catalog-page-button product-buy-button" href="/?chat=1#bantuan">Tanya ketersediaan ke CS <span aria-hidden="true">→</span></Link>}
            <p className="product-detail-purchase-note">Periksa versi dan dukungan perangkat di bawah ini sebelum checkout.</p>
          </div>
        </article>

        <div className="product-detail-sections">
          <section className="product-detail-panel" aria-labelledby="product-versions-heading">
            <span className="catalog-page-eyebrow">PILIH VERSI</span>
            <h2 id="product-versions-heading">Versi yang tersedia</h2>
            <p>{product.versions?.trim() || "Tanyakan pilihan versi yang tersedia kepada CS sebelum checkout."}</p>
          </section>
          <section className="product-detail-panel" aria-labelledby="product-compatibility-heading">
            <span className="catalog-page-eyebrow">KOMPATIBILITAS</span>
            <h2 id="product-compatibility-heading">Perangkat dan sistem operasi</h2>
            <p><strong>Sistem operasi:</strong> {product.os?.trim() || "Perlu dikonfirmasi dengan CS."}</p>
            <p>{product.compatibility?.trim() || "Persyaratan perangkat dapat berbeda untuk tiap versi. Cocokkan versi yang dipilih dengan sistem operasi dan spesifikasi komputer Anda; hubungi CS jika persyaratan minimum belum tercantum."}</p>
          </section>
        </div>

        {product.specs?.length > 0 && <section className="product-detail-features" aria-labelledby="product-features-heading">
          <span className="catalog-page-eyebrow">RINGKASAN PRODUK</span>
          <h2 id="product-features-heading">Fitur dan informasi pada katalog</h2>
          <ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>
        </section>}

        <section className="category-help-section product-version-help" aria-labelledby="version-check-heading">
          <span className="catalog-page-eyebrow">SEBELUM CHECKOUT</span>
          <h2 id="version-check-heading">Pastikan versi sesuai dengan komputer Anda</h2>
          <p>Daftar versi dan sistem operasi di halaman ini membantu penyaringan awal. Persyaratan prosesor, memori, kartu grafis, serta aktivasi bisa berbeda antarversi, jadi konfirmasi detail yang belum tercantum sebelum membeli.</p>
          <Link className="catalog-page-button" href="/panduan/memilih-versi-software">Baca panduan memilih versi <span aria-hidden="true">→</span></Link>
        </section>

        {relatedProducts.length > 0 && <section className="catalog-page-section" aria-labelledby="related-products-heading">
          <div className="catalog-page-section-heading"><div><span className="catalog-page-eyebrow">KATEGORI {categoryLabel.toUpperCase()}</span><h2 id="related-products-heading">Produk terkait</h2></div><Link href={categoryPath}>Lihat semua <span aria-hidden="true">→</span></Link></div>
          <div className="seo-products-grid">{relatedProducts.map((item) => <CatalogProductCard key={item.id} product={item} />)}</div>
        </section>}
        <p className="catalog-page-note">Lihat pilihan lain di <Link href={categoryPath}>kategori {categoryLabel}</Link> atau <Link href="/kategori">semua kategori software</Link>.</p>
      </div>
    </main>
  </>;
}
