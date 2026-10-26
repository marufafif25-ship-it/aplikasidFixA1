import Link from "next/link";
import { getStorefront } from "../../../lib/storefront-server";
import { getStoreProfile } from "../../../lib/store-profile.mjs";

export const metadata = {
  title: "Kontak & Bantuan aplikasi_id | Aplikasi.id",
  description: "Hubungi kanal resmi aplikasi_id untuk bertanya tentang produk, memilih versi software, dan meminta bantuan pesanan Aplikasi.id.",
  alternates: { canonical: "/kontak" }
};

export default async function ContactStorePage() {
  const { footer } = await getStorefront();
  const profile = getStoreProfile(footer);
  return <>
    <header className="catalog-page-hero"><span className="catalog-page-eyebrow">KONTAK RESMI</span><h1>Ada yang ingin ditanyakan?</h1><p>Hubungi {profile.operatorName} untuk membantu memilih produk, memastikan versi yang sesuai, atau menyampaikan kendala pada pesanan Anda.</p></header>
    <div className="store-information-grid">
      <section className="product-detail-panel"><h2>Bantuan melalui WhatsApp</h2><p>Gunakan tautan kontak yang tercantum di halaman ini untuk pertanyaan produk dan bantuan pesanan.</p>{profile.supportHours && <p><strong>Jam layanan:</strong> {profile.supportHours}</p>}{profile.location && <p><strong>Lokasi operasional:</strong> {profile.location}</p>}<div className="purchase-detail-actions">{profile.whatsapp ? <a className="catalog-page-button" href={profile.whatsapp}>Hubungi CS WhatsApp ↗</a> : <Link className="catalog-page-button" href="/?chat=1#bantuan">Buka chat bantuan →</Link>}</div></section>
      <section className="product-detail-panel"><h2>Siapkan informasi ini</h2><ul className="store-information-steps"><li>Sebelum membeli: nama produk, versi yang diinginkan, dan sistem operasi perangkat.</li><li>Untuk pesanan: nomor pesanan dan nama produk yang dibeli.</li><li>Untuk kendala: pesan kesalahan serta screenshot yang membantu menjelaskan masalah.</li></ul><p>Jangan mengirim kata sandi, OTP, atau kunci lisensi dalam screenshot.</p></section>
    </div>
    <section className="category-help-section"><h2>Temukan panduan dan kabar toko</h2><p>Panduan pembelian, unduhan, dan instalasi tersedia di pusat bantuan. Media sosial toko dapat dibuka melalui tautan resmi berikut.</p><div className="purchase-detail-actions"><Link className="catalog-page-button" href="/panduan">Buka pusat bantuan →</Link>{profile.tiktok && <a href={profile.tiktok} target="_blank" rel="noreferrer">TikTok {profile.operatorName} ↗</a>}<Link href="/garansi">Garansi &amp; pengembalian</Link></div></section>
  </>;
}
