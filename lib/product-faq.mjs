import { getProductPlatform } from "./product-presentation.mjs";
import { getProductPurchaseDetails } from "./product-purchase-info.mjs";

const text = (value) => typeof value === "string" ? value.trim() : "";

export function getProductFaq(product) {
  if (!product || typeof product !== "object") return [];
  const title = text(product.title) || "produk ini";
  const platform = getProductPlatform(product);
  const versions = text(product.versions);
  const compatibility = text(product.compatibility);
  const specs = Array.isArray(product.specs) ? [...new Set(product.specs.map(text).filter(Boolean))] : [];
  const purchaseDetails = getProductPurchaseDetails(product);
  const licensing = purchaseDetails.filter(({ key }) => ["licenseType", "licenseDuration", "deviceLimit", "activationMethod"].includes(key));
  const delivery = purchaseDetails.find(({ key }) => key === "deliveryInfo");
  const warranty = purchaseDetails.find(({ key }) => key === "warrantyInfo");
  const items = [];

  if (platform) items.push({ id: "platform", question: `Sistem operasi apa yang didukung ${title}?`, answer: `Sistem operasi yang tercantum untuk ${title}: ${platform}. Cocokkan juga persyaratan versi yang Anda pilih sebelum membeli.` });
  if (versions) items.push({ id: "versions", question: `Versi ${title} apa saja yang tersedia?`, answer: `Pilihan versi pada produk ini: ${versions}. Pastikan versi yang dipilih sesuai dengan sistem operasi dan kebutuhan Anda.` });
  if (compatibility) items.push({ id: "compatibility", question: `Apa yang perlu diperhatikan sebelum membeli ${title}?`, answer: compatibility });
  if (specs.length) items.push({ id: "features", question: `Apa saja fitur dan informasi yang tercantum untuk ${title}?`, answer: specs.map((spec) => `• ${spec}`).join("\n") });
  if (licensing.length) items.push({ id: "license", question: `Bagaimana ketentuan lisensi dan aktivasi ${title}?`, answer: licensing.map(({ label, value }) => `${label}: ${value}`).join("\n") + (licensing.length < 4 ? "\nKonfirmasi ketentuan lisensi lain yang belum tercantum kepada CS sebelum membeli." : "") });
  if (delivery) items.push({ id: "delivery", question: `Apa yang saya terima saat membeli ${title}?`, answer: delivery.value });
  if (warranty) items.push({ id: "warranty", question: `Apa cakupan garansi untuk ${title}?`, answer: warranty.value });
  return items;
}
