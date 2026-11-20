// Ketentuan umum dikonfirmasi pemilik toko pada 20 November 2026.
// Metode aktivasi dan cakupan garansi tetap mengikuti informasi tiap produk.
export const defaultProductPurchaseTerms = Object.freeze({
  licenseType: "Lisensi resmi",
  licenseDuration: "5 tahun",
  deviceLimit: "1 pembelian untuk 1 laptop atau PC"
});

export const productPurchaseFields = [
  { key: "licenseType", label: "Jenis lisensi", placeholder: "Jika kosong, mengikuti ketentuan toko: Lisensi resmi" },
  { key: "licenseDuration", label: "Masa berlaku", placeholder: "Jika kosong, mengikuti ketentuan toko: 5 tahun" },
  { key: "deviceLimit", label: "Jumlah perangkat", placeholder: "Jika kosong, mengikuti ketentuan toko: 1 pembelian untuk 1 laptop atau PC" },
  { key: "activationMethod", label: "Metode aktivasi", placeholder: "Jelaskan proses aktivasi tanpa menuliskan kunci atau kredensial" },
  { key: "deliveryInfo", label: "Isi & pengiriman pembelian", placeholder: "Jelaskan file, panduan, atau layanan yang diterima pembeli" },
  { key: "warrantyInfo", label: "Cakupan garansi produk", placeholder: "Jelaskan bantuan yang dicakup, durasi, dan batasannya" }
];

export function getProductPurchaseDetails(product = {}) {
  const hasProduct = typeof product?.title === "string" && Boolean(product.title.trim())
    || typeof product?.id === "string" && Boolean(product.id.trim());
  return productPurchaseFields.flatMap(({ key, label }) => {
    const explicit = typeof product?.[key] === "string" ? product[key].trim() : "";
    const value = explicit || (hasProduct ? defaultProductPurchaseTerms[key] : "");
    return value ? [{ key, label, value }] : [];
  });
}

export function normalizeProductPurchaseFields(product = {}) {
  return Object.fromEntries(productPurchaseFields.map(({ key }) => [
    key, typeof product[key] === "string" ? product[key].trim() : ""
  ]));
}
