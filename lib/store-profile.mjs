export const storeInformationPages = [
  { path: "/tentang", label: "Tentang kami" },
  { path: "/kontak", label: "Kontak" },
  { path: "/garansi", label: "Garansi & pengembalian" }
];

export const defaultStoreProfile = {
  operatorName: "aplikasi_id",
  aboutText: "Aplikasi.id menyediakan katalog software dan game untuk kebutuhan kuliah, penelitian, desain, pekerjaan, dan hiburan. Katalog dilengkapi informasi versi, sistem operasi, harga, serta panduan untuk membantu Anda memilih produk yang sesuai.",
  location: "",
  supportHours: "",
  refundPolicy: ""
};

const text = (value) => typeof value === "string" ? value.trim() : "";

function publicUrl(value, hosts) {
  try {
    const url = new URL(text(value));
    if (url.protocol !== "https:" || url.username || url.password || !hosts.includes(url.hostname)) return "";
    return url.href;
  } catch { return ""; }
}

export function getStoreProfile(footer = {}) {
  return {
    brand: text(footer.brand) || "Aplikasi.id",
    operatorName: text(footer.operatorName) || defaultStoreProfile.operatorName,
    aboutText: text(footer.aboutText) || defaultStoreProfile.aboutText,
    location: text(footer.location),
    supportHours: text(footer.supportHours),
    refundPolicy: text(footer.refundPolicy),
    whatsapp: publicUrl(footer.whatsapp, ["wa.me", "api.whatsapp.com", "www.whatsapp.com"]),
    tiktok: publicUrl(footer.tiktok, ["tiktok.com", "www.tiktok.com"])
  };
}

export function getProductSupportUrl(whatsapp, productTitle) {
  const safeUrl = publicUrl(whatsapp, ["wa.me", "api.whatsapp.com", "www.whatsapp.com"]);
  if (!safeUrl) return "/kontak";
  const url = new URL(safeUrl);
  url.searchParams.set("text", `Halo aplikasi_id, saya ingin menanyakan lisensi, aktivasi, dan isi pembelian ${text(productTitle) || "produk ini"} sebelum checkout.`);
  return url.href;
}

export function createStoreProfileStructuredData(footer, siteUrl) {
  const profile = getStoreProfile(footer);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": new URL("/#organization", siteUrl).href,
    name: profile.brand,
    alternateName: profile.operatorName,
    url: new URL(siteUrl).origin,
    description: profile.aboutText
  };
  if (profile.tiktok) organization.sameAs = [profile.tiktok];
  if (profile.whatsapp) organization.contactPoint = {
    "@type": "ContactPoint", contactType: "customer support", url: profile.whatsapp, availableLanguage: "Indonesian"
  };
  return organization;
}
