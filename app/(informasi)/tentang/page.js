import Link from "next/link";
import { getStorefront } from "../../../lib/storefront-server";
import { createStoreProfileStructuredData, getStoreProfile } from "../../../lib/store-profile.mjs";
import { serializeJsonLd, SITE_URL } from "../../../lib/seo.mjs";

export const metadata = {
  title: "Tentang aplikasi_id | Aplikasi.id",
  description: "Kenali aplikasi_id, pengelola Aplikasi.id, katalog software dan game, alur pembelian digital, serta kanal bantuan resmi toko.",
  alternates: { canonical: "/tentang" }
};

export default async function AboutStorePage() {
  const { footer } = await getStorefront();
  const profile = getStoreProfile(footer);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(createStoreProfileStructuredData(footer, SITE_URL)) }} />
    <header className="catalog-page-hero"><span className="catalog-page-eyebrow">KENALI TOKO KAMI</span><h1>Software yang sesuai, informasi yang jelas.</h1><p>{profile.aboutText}</p></header>
    <div className="store-information-grid">
      <section className="product-detail-panel"><h2>Tentang {profile.brand}</h2><dl className="store-profile-list"><div><dt>Pengelola toko</dt><dd>{profile.operatorName}</dd></div><div><dt>Website</dt><dd><Link href="/">www.aplikasid.com</Link></dd></div>{profile.location && <div><dt>Lokasi operasional</dt><dd>{profile.location}</dd></div>}</dl><p>Pertanyaan produk dan bantuan pesanan dilayani melalui kanal kontak resmi yang tercantum di situs ini.</p><Link className="guide-text-link" href="/kontak">Lihat kontak resmi →</Link></section>
      <section className="product-detail-panel"><h2>Dari memilih hingga menggunakan</h2><ol className="store-information-steps"><li>Periksa deskripsi, pilihan versi, sistem operasi, dan isi pembelian pada halaman produk.</li><li>Sampaikan kebutuhan perangkat dan pertanyaan lisensi kepada CS sebelum pembayaran jika ada yang belum jelas.</li><li>Selesaikan checkout di Lynk menggunakan email yang dapat Anda akses.</li><li>Buka email pesanan dan ikuti panduan produk. Hubungi CS bila memerlukan bantuan.</li></ol></section>
    </div>
    <section className="category-help-section"><span className="catalog-page-eyebrow">BANTUAN SEBELUM MEMBELI</span><h2>Mulai dari kebutuhan Anda</h2><p>Versi, kompatibilitas, isi paket, dan ketentuan penggunaan dapat berbeda antarproduk. Baca detail penawaran, lalu cocokkan dengan perangkat dan kebutuhan Anda.</p><div className="purchase-detail-actions"><Link className="catalog-page-button" href="/#produk">Jelajahi katalog →</Link><Link href="/panduan">Baca panduan pembelian</Link></div></section>
  </>;
}
