export const guideCategories = [
  { id: "mulai", label: "Mulai menggunakan", icon: "compass", description: "Kenali alur pembelian" },
  { id: "download", label: "Download produk", icon: "download", description: "Akses file pesananmu" },
  { id: "instalasi", label: "Instalasi software", icon: "monitor", description: "Siapkan dan pasang aplikasi" },
  { id: "aktivasi", label: "Aktivasi lisensi", icon: "key", description: "Mulai gunakan software" },
  { id: "kendala", label: "Solusi kendala", icon: "lifebuoy", description: "Temukan langkah perbaikan" },
];

// Editorial content for Aplikasi.id. Keep product-specific instructions in the
// documentation delivered with each order; do not promise unsupported policies.
export const guides = [
  {
    slug: "cara-membeli-software", category: "mulai", featured: true, minutes: 3,
    title: "Belanja software, dari pilih sampai terima",
    description: "Ikuti alur memilih produk, checkout, dan menemukan email pesanan dari Lynk.",
    sections: [
      { title: "Temukan produk yang sesuai", text: "Buka katalog Aplikasi.id. Gunakan pencarian atau kategori, lalu pilih Lihat Detail untuk memeriksa versi, kebutuhan perangkat, dan informasi produk sebelum membeli." },
      { title: "Selesaikan checkout", text: "Klik Beli Sekarang untuk membuka halaman checkout produk. Periksa kembali produk dan alamat email yang kamu masukkan, kemudian ikuti instruksi pembayaran di halaman tersebut." },
      { title: "Buka email pesanan", text: "Setelah pembayaran berhasil, periksa email dari Lynk, termasuk folder spam. Buka tautan produk melalui laptop atau komputer, lalu baca petunjuk yang disertakan sebelum menginstal." },
    ],
    note: "Simpan bukti pembayaran dan nomor pesanan agar mudah ditemukan saat membutuhkan bantuan.",
  },
  {
    slug: "mengunduh-produk", category: "download", featured: true, minutes: 3,
    title: "Menemukan dan mengunduh file pesanan",
    description: "Akses tautan Google Drive dan petunjuk produk dari email setelah pembayaran.",
    sections: [
      { title: "Cari email konfirmasi", text: "Gunakan pencarian email dengan kata Lynk atau nama produk. Pastikan kamu membuka kotak masuk dari alamat yang dipakai saat checkout, termasuk folder spam dan promosi." },
      { title: "Buka tautan produk", text: "Buka tautan Google Drive yang disertakan melalui komputer tempat software akan dipasang. Cocokkan nama folder dan versi dengan pesananmu." },
      { title: "Baca petunjuk lalu unduh", text: "Cari file panduan atau video tutorial yang tersedia. Unduh file yang diperlukan sesuai petunjuk produk, tunggu hingga selesai, lalu simpan di folder yang mudah ditemukan." },
    ],
    note: "Jika tautan meminta izin atau tidak bisa dibuka, hubungi CS dengan nomor pesanan dan tangkapan layar pesan yang muncul.",
  },
  {
    slug: "download-terputus", category: "download", minutes: 2,
    title: "Melanjutkan download yang terputus",
    description: "Periksa koneksi dan ruang penyimpanan ketika file belum selesai diunduh.",
    sections: [
      { title: "Periksa koneksi dan penyimpanan", text: "Pastikan koneksi internet stabil dan ruang kosong cukup untuk file unduhan. Hindari mematikan komputer saat unduhan masih berlangsung." },
      { title: "Periksa daftar unduhan", text: "Buka menu unduhan di browser. Jika tersedia pilihan lanjutkan, gunakan pilihan tersebut. Jika gagal, ulangi unduhan dari tautan pesanan yang sama." },
      { title: "Pastikan file lengkap", text: "Tunggu sampai browser menyatakan unduhan selesai sebelum membuka atau mengekstrak file. Jika masalah berulang, catat pesan kesalahan dan sampaikan ke CS." },
    ],
  },
  {
    slug: "persiapan-instalasi", category: "instalasi", featured: true, minutes: 3,
    title: "Checklist sebelum memasang software",
    description: "Persiapkan perangkat dan file supaya proses instalasi lebih lancar.",
    sections: [
      { title: "Cocokkan kebutuhan perangkat", text: "Bandingkan sistem operasi, arsitektur perangkat, memori, dan ruang penyimpanan dengan persyaratan versi software pada detail produk atau dokumentasi produsennya." },
      { title: "Siapkan file dan cadangan", text: "Pastikan unduhan sudah selesai. Cadangkan dokumen penting dan simpan pekerjaan yang masih terbuka. Jika produk berupa arsip, ikuti petunjuk ekstraksi yang disertakan." },
      { title: "Ikuti panduan produk", text: "Baca dokumentasi atau tonton video tutorial yang diterima bersama pesanan. Urutan instalasi dapat berbeda untuk setiap software dan versi." },
    ],
    note: "Jika sistem menampilkan peringatan keamanan, hentikan proses dan minta CS memeriksa file serta sumber unduhannya sebelum melanjutkan.",
  },
  {
    slug: "memilih-versi-software", category: "instalasi", minutes: 2,
    title: "Memilih versi yang cocok untuk perangkat",
    description: "Hindari salah installer dengan mencocokkan sistem operasi dan versi produk.",
    sections: [
      { title: "Catat informasi perangkat", text: "Buka informasi sistem pada pengaturan perangkat. Catat sistem operasi, tipe prosesor atau arsitektur, kapasitas memori, dan ruang penyimpanan yang tersedia." },
      { title: "Periksa detail produk", text: "Pastikan versi yang dipilih mendukung perangkatmu. Installer Windows dan macOS tidak dapat saling menggantikan. Periksa pula persyaratan untuk versi software yang dibeli." },
      { title: "Konfirmasi bila ragu", text: "Kirim nama produk dan informasi perangkat ke CS sebelum membeli atau menginstal. Hindari memilih versi hanya karena nomor versinya paling baru." },
    ],
  },
  {
    slug: "menggunakan-lisensi", category: "aktivasi", minutes: 3,
    title: "Menggunakan lisensi sesuai petunjuk produk",
    description: "Kenali informasi yang perlu diperiksa sebelum menjalankan aktivasi.",
    sections: [
      { title: "Periksa metode aktivasi", text: "Baca detail produk dan instruksi pesanan. Metode aktivasi dapat berupa kunci lisensi atau akun, tergantung produk. Gunakan metode yang memang disertakan untuk pesananmu." },
      { title: "Cocokkan edisi dan versi", text: "Pastikan software yang terpasang sesuai dengan edisi serta versi lisensi. Jika menggunakan kunci, salin dengan teliti tanpa spasi tambahan melalui menu aktivasi resmi aplikasi." },
      { title: "Periksa hasil aktivasi", text: "Ikuti instruksi aplikasi dan lihat status lisensi setelah selesai. Jika muncul pesan kesalahan, catat pesannya lalu hubungi CS dengan nomor pesanan." },
    ],
    note: "Jangan membagikan kunci lisensi, kata sandi, atau tautan masuk akun di ruang publik.",
  },
  {
    slug: "aktivasi-perangkat-baru", category: "aktivasi", minutes: 2,
    title: "Sebelum pindah ke perangkat baru",
    description: "Periksa ketentuan lisensi sebelum memasang ulang atau memindahkan software.",
    sections: [
      { title: "Periksa ketentuan produk", text: "Jumlah perangkat dan hak pemindahan lisensi berbeda untuk setiap produk. Baca ketentuan pada pesanan atau dokumentasi lisensi yang diberikan." },
      { title: "Simpan informasi pesanan", text: "Simpan nomor pesanan dan petunjuk aktivasi. Cadangkan dokumen serta pengaturan aplikasi yang kamu perlukan sebelum mengganti perangkat." },
      { title: "Minta arahan CS", text: "Jika ketentuan pemindahan belum jelas, hubungi CS sebelum menghapus instalasi lama atau melakukan aktivasi baru. Sebutkan produk, versi, dan alasan pemindahan." },
    ],
  },
  {
    slug: "pesanan-belum-diterima", category: "kendala", minutes: 3,
    title: "Sudah bayar, tetapi email belum ditemukan?",
    description: "Langkah pemeriksaan sebelum meminta bantuan untuk pesanan yang belum diterima.",
    sections: [
      { title: "Periksa status pembayaran", text: "Lihat kembali bukti pembayaran dan halaman checkout. Pastikan transaksi telah berhasil, bukan masih menunggu pembayaran atau verifikasi." },
      { title: "Periksa alamat dan folder email", text: "Pastikan kotak masuk sesuai dengan alamat saat checkout. Cari email dari Lynk di inbox, spam, dan promosi." },
      { title: "Kirim informasi ke CS", text: "Siapkan nomor pesanan, nama produk, waktu pembayaran, dan bukti transaksi. Sampaikan kendala melalui kontak resmi di situs agar CS dapat melakukan pemeriksaan." },
    ],
  },
  {
    slug: "meminta-bantuan-teknis", category: "kendala", minutes: 2,
    title: "Informasi yang perlu disiapkan untuk CS",
    description: "Bantu tim memahami kendala instalasi atau aktivasi dengan informasi yang tepat.",
    sections: [
      { title: "Jelaskan kendalanya", text: "Sebutkan nama dan versi software, sistem operasi, serta tahap ketika masalah muncul. Tulis langkah yang sudah kamu coba dan pesan kesalahan yang terlihat." },
      { title: "Siapkan bukti pendukung", text: "Sertakan nomor pesanan dan tangkapan layar kendala. Tutupi kata sandi, kunci lisensi, serta informasi lain yang tidak diperlukan dalam tangkapan layar." },
      { title: "Gunakan kontak resmi", text: "Buka tautan CS dari situs Aplikasi.id. Untuk pertanyaan garansi, sertakan detail produk supaya tim dapat memeriksa ketentuan yang berlaku pada pesananmu." },
    ],
  },
];

export const guideFaqs = [
  { question: "Di mana saya menerima file produk?", answer: "Periksa email pesanan dari Lynk pada alamat yang digunakan saat checkout. Buka tautan produk dan ikuti panduan yang disertakan. Cek folder spam atau promosi jika email belum terlihat." },
  { question: "Apakah ada petunjuk instalasi?", answer: "Periksa dokumentasi atau video tutorial di folder produk yang diterima. Ikuti petunjuk untuk versi yang kamu beli. Hubungi CS jika panduan tidak ditemukan atau ada langkah yang belum jelas." },
  { question: "Bisa dipakai di beberapa perangkat?", answer: "Ketentuan jumlah perangkat mengikuti lisensi masing-masing produk. Periksa detail produk dan petunjuk pesanan, atau tanyakan ke CS sebelum mengaktifkan di perangkat lain." },
  { question: "Bagaimana meminta bantuan atau mengecek garansi?", answer: "Hubungi CS melalui kontak resmi Aplikasi.id. Siapkan nomor pesanan, nama produk, dan tangkapan layar kendala agar tim dapat memeriksa masalah serta ketentuan produkmu." },
];

export function filterGuides(query, category = "all") {
  const words = query.toLocaleLowerCase("id").trim().split(/\s+/).filter(Boolean);
  return guides.filter((guide) => {
    const label = guideCategories.find((item) => item.id === guide.category).label;
    const text = `${guide.title} ${guide.description} ${label} ${guide.sections.map((section) => `${section.title} ${section.text}`).join(" ")}`.toLocaleLowerCase("id");
    return (category === "all" || guide.category === category) && words.every((word) => text.includes(word));
  });
}
