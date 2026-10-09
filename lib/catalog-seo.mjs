import { resolveSiteUrl } from "./seo.mjs";

export const productCategories = [
  {
    value: "Design",
    slug: "desain-grafis",
    label: "Desain & Grafis",
    title: "Software Desain Grafis & Pengolahan Foto",
    seoTitle: "Software Desain Grafis dan Foto",
    description: "Jelajahi software untuk desain grafis, pengolahan foto, ilustrasi, dan produksi aset visual.",
    intro: "Kategori ini mengumpulkan aplikasi untuk mengolah foto, membuat materi visual, dan menyiapkan aset desain. Bandingkan nama software, versi, sistem operasi, dan spesifikasi yang tercantum sebelum memilih.",
    useCases: "mengolah foto, membuat desain grafis, ilustrasi, dan menyiapkan aset visual",
    checklist: [
      "Cocokkan versi aplikasi dengan Windows atau macOS yang terpasang.",
      "Periksa kapasitas memori dan ruang penyimpanan berdasarkan kebutuhan versi yang dipilih.",
      "Pastikan fitur yang dibutuhkan tercantum pada spesifikasi produk sebelum checkout."
    ]
  },
  {
    value: "Engineering",
    slug: "engineering-3d",
    label: "Engineering & 3D",
    title: "Software Engineering, CAD & Pemodelan 3D",
    seoTitle: "Software Engineering, CAD & 3D",
    description: "Temukan software CAD dan pemodelan 3D untuk gambar teknik, desain ruang, serta visualisasi proyek.",
    intro: "Software engineering dan 3D dipakai untuk kebutuhan seperti gambar teknik, pemodelan ruang, dan visualisasi proyek. Kebutuhan perangkat dapat berbeda cukup jauh antarversi, jadi periksa sistem operasi serta detail versi sebelum membeli.",
    useCases: "gambar teknik, CAD, pemodelan ruang, dan visualisasi 3D",
    checklist: [
      "Periksa versi CAD atau pemodelan yang sesuai dengan file kerja dan alur kolaborasi Anda.",
      "Cocokkan sistem operasi, prosesor, memori, kartu grafis, dan ruang penyimpanan dengan persyaratan versi.",
      "Untuk plugin atau renderer tambahan, pastikan versi pendukungnya disebut pada spesifikasi produk."
    ]
  },
  {
    value: "Video",
    slug: "video-editing",
    label: "Video & Animasi",
    title: "Software Editing Video & Produksi Konten",
    seoTitle: "Software Editing Video & Animasi",
    description: "Bandingkan software editing video dan produksi konten berdasarkan versi, sistem operasi, serta fitur yang tersedia.",
    intro: "Kategori video mencakup aplikasi untuk menyunting footage, mengatur timeline, dan menyelesaikan produksi konten. Resolusi video, efek, serta proyek yang kompleks dapat membutuhkan perangkat lebih kuat; cek persyaratan resmi versi yang akan digunakan.",
    useCases: "menyunting video, mengatur timeline, mengolah warna, dan menyiapkan konten",
    checklist: [
      "Pastikan aplikasi mendukung sistem operasi dan format footage yang digunakan.",
      "Periksa kebutuhan memori, ruang penyimpanan, prosesor, dan kartu grafis untuk resolusi proyek Anda.",
      "Cek apakah produk mencakup aplikasi utama, plugin, atau materi proyek tambahan."
    ]
  },
  {
    value: "Office",
    slug: "office-produktivitas",
    label: "Office & Produktivitas",
    title: "Software Office & Produktivitas Kerja",
    seoTitle: "Software Office & Produktivitas",
    description: "Cari software untuk dokumen, spreadsheet, presentasi, PDF, dan pekerjaan produktivitas sehari-hari.",
    intro: "Aplikasi office membantu menyusun dokumen, spreadsheet, presentasi, dan pekerjaan administrasi. Periksa edisi, versi, sistem operasi, dan cara aktivasi yang disertakan agar sesuai dengan perangkat serta kebutuhan kerja Anda.",
    useCases: "menyusun dokumen, mengolah spreadsheet, membuat presentasi, dan produktivitas kerja",
    checklist: [
      "Cocokkan edisi dan tahun aplikasi dengan format dokumen yang Anda gunakan.",
      "Pastikan dukungan sistem operasi dan jumlah perangkat sesuai dengan kebutuhan.",
      "Baca ketentuan aktivasi dan penggunaan lisensi pada detail serta petunjuk produk."
    ]
  },
  {
    value: "Utility",
    slug: "system-utility",
    label: "System & Utility",
    title: "Software Utility untuk Perangkat & File",
    seoTitle: "Software System & Utility",
    description: "Jelajahi software utilitas untuk membantu pengelolaan unduhan, pemulihan file, dan kebutuhan sistem lainnya.",
    intro: "Software utilitas mendukung tugas tertentu seperti mengelola unduhan atau memulihkan file. Periksa fungsi aplikasi, versi, serta batasan penggunaan sebelum mengandalkannya untuk data penting atau pekerjaan rutin.",
    useCases: "mengelola unduhan, memulihkan file, dan menangani tugas utilitas pada perangkat",
    checklist: [
      "Pastikan utilitas sesuai dengan jenis file, perangkat, dan sistem operasi Anda.",
      "Untuk pemulihan data, hentikan penulisan baru ke media penyimpanan dan buat salinan bila memungkinkan.",
      "Periksa versi dan batasan fitur sebelum menjalankan aplikasi pada file penting."
    ]
  }
];

export function getCategoryByValue(value) {
  return productCategories.find((category) => category.value === value) || null;
}

export function getCategoryBySlug(slug) {
  return productCategories.find((category) => category.slug === slug) || null;
}

export function getCategoryPath(categoryOrValue) {
  const category = typeof categoryOrValue === "string"
    ? getCategoryByValue(categoryOrValue) || getCategoryBySlug(categoryOrValue)
    : categoryOrValue;
  return category ? `/kategori/${encodeURIComponent(category.slug)}` : "/kategori";
}

export function getProductPath(productOrId) {
  const id = typeof productOrId === "object" ? productOrId?.id : productOrId;
  return id ? `/produk/${encodeURIComponent(String(id))}` : "/";
}

export function getProductDescription(product) {
  const editorialDescription = typeof product.description === "string" ? product.description.trim() : "";
  if (editorialDescription) return editorialDescription;

  const category = getCategoryByValue(product.category);
  const useCases = category?.useCases || "kebutuhan software sehari-hari";
  const versions = product.versions?.trim() || "versi yang tercantum pada katalog";
  const operatingSystems = product.os?.trim() || "sistem operasi yang perlu dikonfirmasi";
  const features = Array.isArray(product.specs) ? product.specs.filter(Boolean).slice(0, 3).join(", ") : "";
  const featureSentence = features ? ` Fitur pada katalog meliputi ${features}.` : "";

  return `${product.title} dapat digunakan untuk ${useCases}. Halaman ini merangkum pilihan versi ${versions}, dukungan sistem operasi ${operatingSystems}, harga, dan spesifikasi produk.${featureSentence} Cocokkan versi dengan perangkat Anda sebelum checkout.`;
}

export function getProductMetaTitle(product) {
  const name = (product.seoTitle || product.title || "Software").trim();
  return name.toLowerCase().includes("aplikasi.id") ? name : `${name} | Aplikasi.id`;
}

export function getProductMetaDescription(product) {
  const source = product.seoDescription?.trim() || getProductDescription(product);
  const normalized = source.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  const cut = normalized.slice(0, 157).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

export function createProductStructuredData({ product, description, canonicalUrl, siteUrl, imageUrl }) {
  const baseUrl = resolveSiteUrl(siteUrl);
  const structuredImage = imageUrl ? new URL(imageUrl, baseUrl) : null;
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    sku: String(product.id),
    url: canonicalUrl,
    category: getCategoryByValue(product.category)?.label || product.category
  };

  if (structuredImage && ["http:", "https:"].includes(structuredImage.protocol)) productData.image = structuredImage.toString();
  if (Number.isFinite(Number(product.price)) && Number(product.price) >= 0) {
    productData.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "IDR",
      price: Number(product.price)
    };
  }

  return productData;
}
