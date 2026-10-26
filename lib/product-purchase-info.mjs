export const productPurchaseFields = [
  { key: "licenseType", label: "Jenis lisensi", placeholder: "Isi jenis lisensi sesuai penawaran yang sudah diverifikasi" },
  { key: "licenseDuration", label: "Masa berlaku", placeholder: "Isi durasi serta batasan masa berlaku" },
  { key: "deviceLimit", label: "Jumlah perangkat", placeholder: "Isi jumlah perangkat dan ketentuan pindah perangkat" },
  { key: "activationMethod", label: "Metode aktivasi", placeholder: "Jelaskan proses aktivasi tanpa menuliskan kunci atau kredensial" },
  { key: "deliveryInfo", label: "Isi & pengiriman pembelian", placeholder: "Jelaskan file, panduan, atau layanan yang diterima pembeli" },
  { key: "warrantyInfo", label: "Cakupan garansi produk", placeholder: "Jelaskan bantuan yang dicakup, durasi, dan batasannya" }
];

export function getProductPurchaseDetails(product = {}) {
  return productPurchaseFields.flatMap(({ key, label }) => {
    const value = typeof product[key] === "string" ? product[key].trim() : "";
    return value ? [{ key, label, value }] : [];
  });
}

export function normalizeProductPurchaseFields(product = {}) {
  return Object.fromEntries(productPurchaseFields.map(({ key }) => [
    key, typeof product[key] === "string" ? product[key].trim() : ""
  ]));
}
