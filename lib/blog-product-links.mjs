import { getProductPath } from "./catalog-seo.mjs";

const OFFICE_GUIDE = "panduan-memilih-software-office-untuk-kuliah-dan-kerja";
const SPSS_GUIDE = "cara-menyiapkan-data-kuesioner-untuk-analisis-spss";
const CAD_GUIDE = "autocad-vs-sketchup-memilih-aplikasi-untuk-proyek";

// Pilihan editorial untuk 30 artikel yang sudah terbit. Nama produk selalu
// diambil dari katalog aktif; ID yang sudah dihapus tidak dibuatkan tautan.
const POST_PRODUCT_LINKS = {
  "panduan-memilih-software-office-untuk-kuliah-dan-kerja": {
    intro: "Lihat pilihan Office untuk dokumen, spreadsheet, dan presentasi. Cocokkan edisi serta perangkat sebelum memilih.",
    productIds: ["app-office"]
  },
  "cara-menyiapkan-data-kuesioner-untuk-analisis-spss": {
    intro: "Siapkan tabel kuesioner di Excel, lalu pilih SPSS sesuai sistem operasi yang digunakan untuk analisis.",
    productIds: ["app-office", "app-1790154210043", "app-spssmac"]
  },
  "photoshop-atau-lightroom-memilih-alur-edit-foto": {
    intro: "Bandingkan pilihan Photoshop dan Lightroom untuk alur penyuntingan foto yang kamu perlukan.",
    productIds: ["app-photoshop", "app-lightroom"]
  },
  "kapan-menggunakan-coreldraw-untuk-desain-vektor": {
    intro: "Lihat CorelDRAW untuk pekerjaan vektor dan Photoshop untuk pengolahan foto pendamping desain.",
    productIds: ["app-coreldraw", "app-photoshop"]
  },
  "autocad-vs-sketchup-memilih-aplikasi-untuk-proyek": {
    intro: "Bandingkan pilihan AutoCAD dan SketchUp berdasarkan keluaran proyek serta perangkat yang kamu gunakan.",
    productIds: ["app-autocad", "app-sketchup"]
  },
  "cek-spesifikasi-laptop-sebelum-menjalankan-autocad-sketchup": {
    intro: "Gunakan checklist spesifikasi di atas saat memeriksa versi AutoCAD dan SketchUp yang akan dipilih.",
    productIds: ["app-autocad", "app-sketchup"],
    guideSlug: CAD_GUIDE
  },
  "workflow-edit-video-pertama-dengan-davinci-resolve": {
    intro: "Lihat DaVinci Resolve Studio di katalog dan periksa edisi serta persyaratan perangkat untuk proyek videomu.",
    productIds: ["app-davinci"]
  },
  "cara-membuat-pdf-hasil-scan-bisa-dicari": {
    intro: "Bandingkan Adobe Acrobat Pro dan Nitro PDF Pro untuk kebutuhan PDF. Periksa dukungan OCR pada versi yang ditawarkan.",
    productIds: ["app-1788704020346", "app-1788703953321"]
  },
  "cara-menata-referensi-skripsi-dengan-mendeley": {
    intro: "Katalog menyediakan Mendeley Desktop dan Microsoft Office. Cocokkan versi serta integrasi sitasinya dengan alur penulisan skripsimu.",
    productIds: ["app-mendeley", "app-office"]
  },
  "checklist-aman-sebelum-mengunduh-dan-memasang-software": {
    intro: "Berikut contoh produk untuk diperiksa dengan checklist ini. Pastikan versi, kompatibilitas, lisensi, dan dukungannya sesuai sebelum membeli.",
    productIds: ["app-office", "app-photoshop", "app-autocad"]
  },
  "cara-membuat-daftar-isi-otomatis-di-word-untuk-skripsi": {
    intro: "Lihat pilihan Office untuk menyusun skripsi di Word, termasuk daftar isi dan dokumen pendukungnya.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-membuat-nomor-halaman-word-berbeda-setiap-bab": {
    intro: "Lihat pilihan Office untuk menata dokumen Word dengan section dan penomoran halaman sesuai pedoman kampus.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-merapikan-data-excel-sebelum-dianalisis": {
    intro: "Lihat pilihan Office untuk menyiapkan dan memeriksa tabel Excel sebelum data dianalisis.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-membuat-pivot-table-excel-untuk-laporan": {
    intro: "Lihat pilihan Office untuk membuat ringkasan laporan dengan PivotTable di Excel.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-memilih-grafik-excel-agar-data-mudah-dibaca": {
    intro: "Lihat pilihan Office untuk mengolah grafik Excel dan membawa hasilnya ke laporan atau presentasi.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-membuat-presentasi-powerpoint-yang-jelas-dan-aksesibel": {
    intro: "Lihat pilihan Office untuk menyusun presentasi PowerPoint beserta dokumen dan spreadsheet pendukungnya.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-mengatur-catatan-kuliah-di-onenote": {
    intro: "Untuk dokumen Word, spreadsheet Excel, dan presentasi pendamping catatan kuliahmu, lihat pilihan Office berikut.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-mengelola-versi-file-di-google-drive-untuk-tim": {
    intro: "Jika tim juga menyunting berkas Word, Excel, atau PowerPoint di komputer, lihat pilihan Office untuk pekerjaan tersebut.",
    productIds: ["app-office"],
    guideSlug: OFFICE_GUIDE
  },
  "cara-mengatur-variabel-di-spss-untuk-penelitian": {
    intro: "Pilih SPSS sesuai sistem operasi dan versi yang diperlukan untuk mengatur variabel penelitianmu.",
    productIds: ["app-1790154210043", "app-spssmac"],
    guideSlug: SPSS_GUIDE
  },
  "cara-membaca-tabel-frekuensi-spss-untuk-penelitian": {
    intro: "Lihat pilihan SPSS untuk melanjutkan pengolahan data dan membaca output penelitian pada perangkatmu.",
    productIds: ["app-1790154210043", "app-spssmac"],
    guideSlug: SPSS_GUIDE
  },
  "photoshop-edit-foto-tanpa-merusak-file-asli": {
    intro: "Lihat pilihan Photoshop untuk mempraktikkan alur penyuntingan foto dengan layer.",
    productIds: ["app-photoshop"],
    guideSlug: "photoshop-atau-lightroom-memilih-alur-edit-foto"
  },
  "cara-menyiapkan-artboard-illustrator-untuk-desain-web": {
    intro: "Lihat pilihan Illustrator untuk menyiapkan artboard dan aset vektor bagi desain web.",
    productIds: ["app-1791301337000"]
  },
  "persiapan-file-coreldraw-sebelum-dicetak": {
    intro: "Lihat pilihan CorelDRAW untuk menyiapkan desain vektor, lalu cocokkan format keluarannya dengan permintaan percetakan.",
    productIds: ["app-coreldraw"],
    guideSlug: "kapan-menggunakan-coreldraw-untuk-desain-vektor"
  },
  "cara-merapikan-project-video-premiere-pro-dengan-bin": {
    intro: "Lihat pilihan Premiere Pro untuk mengelola media dan menyunting proyek video bersama tim.",
    productIds: ["app-premiere"]
  },
  "cara-menggunakan-proxy-premiere-pro-untuk-edit-video-berat": {
    intro: "Lihat pilihan Premiere Pro dan periksa kecocokan versi serta perangkat untuk alur kerja proxy.",
    productIds: ["app-premiere"],
    guideSlug: "cara-merapikan-project-video-premiere-pro-dengan-bin"
  },
  "cara-membuat-animasi-teks-sederhana-di-after-effects": {
    intro: "Lihat pilihan After Effects untuk mempraktikkan animasi teks pada komposisi videomu.",
    productIds: ["app-1791301758757"]
  },
  "cara-export-video-after-effects-dengan-render-queue": {
    intro: "Lihat pilihan After Effects untuk menyusun komposisi dan mengekspornya melalui Render Queue.",
    productIds: ["app-1791301758757"]
  },
  "cara-mengatur-layer-autocad-agar-gambar-teknik-rapi": {
    intro: "Lihat pilihan AutoCAD untuk mengerjakan gambar teknik dengan struktur layer yang rapi.",
    productIds: ["app-autocad"],
    guideSlug: CAD_GUIDE
  },
  "cara-menggunakan-block-autocad-dan-menjaga-skala": {
    intro: "Lihat pilihan AutoCAD untuk pekerjaan drafting dengan objek berulang dan skala gambar yang konsisten.",
    productIds: ["app-autocad"],
    guideSlug: CAD_GUIDE
  },
  "groups-dan-components-sketchup-untuk-model-3d-rapi": {
    intro: "Lihat pilihan SketchUp untuk membangun model dengan groups dan components.",
    productIds: ["app-sketchup"],
    guideSlug: CAD_GUIDE
  }
};

export function getBlogProductLinks(slug, catalogProducts = [], publishedPosts = []) {
  if (!Object.hasOwn(POST_PRODUCT_LINKS, slug) || !Array.isArray(catalogProducts)) return null;
  const selection = POST_PRODUCT_LINKS[slug];
  const catalog = new Map(catalogProducts
    .filter((product) => typeof product?.id === "string" && typeof product.title === "string" && product.title.trim())
    .map((product) => [product.id, product]));
  const products = selection.productIds.flatMap((id) => {
    const product = catalog.get(id);
    return product ? [{ id, title: product.title, href: getProductPath(id) }] : [];
  });
  if (!products.length) return null;

  const guide = publishedPosts.find((post) => post.slug === selection.guideSlug && post.slug !== slug && post.published === true);
  return {
    intro: selection.intro,
    products,
    guide: guide ? { title: guide.title, href: "/blog/" + encodeURIComponent(guide.slug) } : null
  };
}

export async function loadBlogProductLinks(slug, loadStorefront, publishedPosts = []) {
  if (!Object.hasOwn(POST_PRODUCT_LINKS, slug)) return null;
  try {
    const { products } = await loadStorefront();
    return getBlogProductLinks(slug, products, publishedPosts);
  } catch {
    // Produk terkait bersifat tambahan; gangguan katalog tidak menutup artikel.
    return null;
  }
}
