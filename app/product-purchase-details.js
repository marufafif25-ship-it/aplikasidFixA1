import Link from "next/link";
import { getProductPurchaseDetails } from "../lib/product-purchase-info.mjs";
import { getProductSupportUrl } from "../lib/store-profile.mjs";

export default function ProductPurchaseDetails({ product, whatsapp }) {
  const details = getProductPurchaseDetails(product);
  const hasDelivery = details.some(({ key }) => key === "deliveryInfo");
  const missingTerms = [
    ["licenseType", "jenis lisensi"], ["licenseDuration", "masa berlaku"],
    ["deviceLimit", "jumlah perangkat"], ["activationMethod", "metode aktivasi"]
  ].filter(([key]) => !details.some((detail) => detail.key === key)).map(([, label]) => label);

  return <section className="product-detail-features product-purchase-details" aria-labelledby="product-purchase-heading">
    <span className="catalog-page-eyebrow">INFORMASI PEMBELIAN</span>
    <h2 id="product-purchase-heading">Lisensi, aktivasi, dan isi pembelian</h2>
    {details.length > 0 && <dl className="purchase-detail-list">
      {details.map(({ key, label, value }) => <div key={key}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>}
    {!hasDelivery && <div className="purchase-delivery-note"><h3>Pengiriman digital</h3><p>Periksa email pesanan dari Lynk pada alamat yang digunakan saat checkout untuk membuka akses produk dan panduan yang disertakan. Cek folder spam atau promosi jika email belum terlihat.</p></div>}
    {missingTerms.length > 0 && <p className="purchase-confirmation-note">Konfirmasi {missingTerms.join(", ")} kepada CS sebelum membeli produk ini.</p>}
    <div className="purchase-detail-actions"><a className="catalog-page-button" href={getProductSupportUrl(whatsapp, product.title)}>Tanyakan produk ini ke CS <span aria-hidden="true">↗</span></a><Link href="/garansi">Garansi &amp; pengembalian</Link></div>
  </section>;
}
