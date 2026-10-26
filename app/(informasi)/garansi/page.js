import Link from "next/link";
import { getStorefront } from "../../../lib/storefront-server";
import { getStoreProfile } from "../../../lib/store-profile.mjs";

export const metadata = {
  title: "Garansi, Bantuan & Pengembalian | Aplikasi.id",
  description: "Pelajari bantuan instalasi, penanganan link unduhan, dan cara menghubungi aplikasi_id untuk pertanyaan garansi atau pengembalian dana.",
  alternates: { canonical: "/garansi" }
};

export default async function StoreWarrantyPage() {
  const { footer } = await getStorefront();
  const profile = getStoreProfile(footer);
  return <>
    <header className="catalog-page-hero"><span className="catalog-page-eyebrow">BANTUAN SETELAH PEMBELIAN</span><h1>Garansi dan pengembalian</h1><p>Periksa keterangan garansi pada produk yang Anda pilih. Halaman ini membantu Anda menemukan panduan dan menghubungi {profile.operatorName} saat ada kendala.</p></header>
    <div className="store-information-grid">
      <section className="product-detail-panel"><h2>Bantuan instalasi dan unduhan</h2><p>Informasi garansi di beranda mencakup bantuan instalasi dan penggantian link unduhan yang bermasalah selama 5 tahun. Periksa juga rincian dan batasan pada halaman produk serta informasi pesanan Anda.</p><p>Masa bantuan tersebut tidak menjelaskan masa berlaku lisensi, hak pembaruan, atau jumlah perangkat. Pastikan ketentuan penggunaan produk sebelum checkout.</p><Link className="guide-text-link" href="/panduan">Baca panduan instalasi &amp; unduhan →</Link></section>
      <section className="product-detail-panel"><h2>Cara meminta bantuan</h2><ol className="store-information-steps"><li>Siapkan nomor pesanan dan nama produk dari email checkout.</li><li>Jelaskan kendala dan sertakan screenshot tanpa kata sandi, OTP, atau kunci lisensi.</li><li>Hubungi CS melalui halaman kontak resmi untuk pemeriksaan sesuai keterangan produk.</li></ol><Link className="guide-text-link" href="/kontak">Buka kontak resmi →</Link></section>
    </div>
    <section className="product-detail-features store-refund-policy"><span className="catalog-page-eyebrow">PENGEMBALIAN DANA</span><h2>Ketentuan pengembalian</h2>{profile.refundPolicy ? <p>{profile.refundPolicy}</p> : <p>Konfirmasi ketentuan pengembalian dana kepada CS sebelum melakukan pembayaran. Untuk pertanyaan terkait pesanan yang sudah dibayar, siapkan nomor pesanan, nama produk, dan penjelasan kendala saat menghubungi CS.</p>}<div className="purchase-detail-actions"><Link className="catalog-page-button" href="/kontak">Tanyakan ketentuan ke CS →</Link></div></section>
  </>;
}
