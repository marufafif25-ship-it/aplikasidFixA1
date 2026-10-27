const guides = {
  "app-1790154210043": {
    heading: "Memilih SPSS untuk skripsi di Windows",
    purpose: "Gunakan SPSS untuk mengolah data kuesioner dan membaca hasil analisis penelitian. Sebelum memilih versi, cocokkan kebutuhan analisis dengan arahan pembimbing dan berkas yang akan dikerjakan.",
    checklist: ["Catat versi Windows dan versi SPSS yang diminta kampus atau tim penelitian.", "Periksa struktur variabel, kode jawaban, dan nilai kosong pada data sebelum dianalisis.", "Konfirmasi edisi, metode aktivasi, masa penggunaan, dan cakupan bantuan instalasi sebelum checkout."],
    articleSlugs: ["cara-menyiapkan-data-kuesioner-untuk-analisis-spss", "cara-mengatur-variabel-di-spss-untuk-penelitian", "cara-membaca-tabel-frekuensi-spss-untuk-penelitian"]
  },
  "app-spssmac": {
    heading: "Memilih SPSS untuk penelitian di Mac",
    purpose: "Paket SPSS untuk macOS berbeda dari paket Windows. Siapkan informasi perangkat dan kebutuhan penelitian agar pilihan versi dapat diperiksa sebelum membeli.",
    checklist: ["Catat versi macOS dan jenis prosesor Mac: Intel atau Apple silicon.", "Cocokkan versi SPSS dengan berkas penelitian serta ketentuan kampus atau tim.", "Konfirmasi dukungan untuk kombinasi perangkat Anda, ketentuan lisensi, dan bantuan yang termasuk dalam paket."],
    articleSlugs: ["cara-menyiapkan-data-kuesioner-untuk-analisis-spss", "cara-mengatur-variabel-di-spss-untuk-penelitian"]
  },
  "app-office": {
    heading: "Memilih Office untuk kuliah dan pekerjaan",
    purpose: "Tentukan kebutuhan utama Anda: menulis di Word, mengolah data di Excel, atau menyusun presentasi di PowerPoint. Periksa edisi yang ditawarkan karena Office dan Microsoft 365 memiliki ketentuan penggunaan yang berbeda.",
    checklist: ["Sebutkan Windows atau macOS serta versi sistem operasi yang digunakan.", "Konfirmasi edisi, masa penggunaan, jumlah perangkat, dan metode aktivasi yang diterima.", "Jika memerlukan layanan cloud atau fitur tertentu, pastikan layanan tersebut dinyatakan termasuk dalam penawaran."],
    articleSlugs: ["panduan-memilih-software-office-untuk-kuliah-dan-kerja", "cara-membuat-daftar-isi-otomatis-di-word-untuk-skripsi", "cara-membuat-pivot-table-excel-untuk-laporan"]
  },
  "app-autocad": {
    heading: "Memilih AutoCAD sesuai proyek dan perangkat",
    purpose: "Mulai dari file gambar yang akan dibuka dan kebutuhan pekerjaan CAD Anda. Pilihan versi dan fitur untuk Windows serta macOS dapat berbeda; pastikan pilihan mendukung alur kolaborasi proyek.",
    checklist: ["Catat versi AutoCAD yang digunakan rekan kerja atau dosen dan format file yang diminta.", "Cocokkan sistem operasi, RAM, GPU, dan ruang penyimpanan dengan persyaratan versi pilihan.", "Konfirmasi edisi, ketentuan lisensi, dan komponen tambahan yang diperlukan untuk pekerjaan Anda."],
    articleSlugs: ["autocad-vs-sketchup-memilih-aplikasi-untuk-proyek", "cek-spesifikasi-laptop-sebelum-menjalankan-autocad-sketchup", "cara-mengatur-layer-autocad-agar-gambar-teknik-rapi"]
  },
  "app-photoshop": {
    heading: "Memilih Photoshop untuk pengolahan foto dan desain",
    purpose: "Sesuaikan pilihan Photoshop dengan pekerjaan berbasis piksel yang Anda lakukan, seperti menyunting foto atau menyusun materi visual. Periksa kebutuhan perangkat untuk versi yang ingin digunakan.",
    checklist: ["Cocokkan versi aplikasi dengan Windows, RAM, GPU, dan ruang penyimpanan komputer Anda.", "Jika proyek memerlukan plugin, fitur AI, atau layanan cloud, konfirmasi dukungan dan apakah komponen tersebut termasuk.", "Pastikan metode aktivasi, masa penggunaan, dan bantuan instalasi sudah jelas sebelum membeli."],
    articleSlugs: ["photoshop-atau-lightroom-memilih-alur-edit-foto", "photoshop-edit-foto-tanpa-merusak-file-asli"]
  }
};

export function getProductBuyingGuide(id) {
  return Object.hasOwn(guides, id) ? guides[id] : null;
}

export function selectPublishedReading(slugs, posts) {
  return slugs.flatMap((slug) => {
    const post = posts.find((item) => item.slug === slug && item.published === true);
    return post ? [{ slug: post.slug, title: post.title }] : [];
  });
}
