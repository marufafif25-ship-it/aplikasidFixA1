-- Jalankan setelah supabase/blog-posts.sql di SQL Editor Supabase.
-- Hanya artikel SEO baru; slug yang sudah ada tidak ditimpa.
begin;
insert into public.blog_posts (
  slug, title, excerpt, content, category, author, author_url, cover_image_url,
  published, published_at, updated_at
)
select
  seed.slug, seed.title, seed.excerpt, seed.content, seed.category, seed.author,
  seed.author_url, seed.cover_image_url, seed.published, now(), now()
from jsonb_to_recordset(
$blog_seed$
[
  {
    "slug": "spss-untuk-mac-cek-macos-intel-apple-silicon",
    "title": "SPSS untuk Mac: Cek Versi macOS, Intel, dan Apple Silicon",
    "excerpt": "Sebelum memilih SPSS untuk Mac, catat versi macOS dan jenis prosesor. Gunakan checklist ini untuk memeriksa kompatibilitas dan menanyakan paket yang sesuai.",
    "content": "**SPSS bisa digunakan di Mac, tetapi kecocokannya perlu diperiksa untuk kombinasi versi SPSS, versi macOS, dan prosesor yang dipakai.** Jangan memilih installer hanya berdasarkan label Mac atau nomor versi paling baru. Halaman ini membantu menyiapkan informasi sebelum memilih produk; bukan jaminan bahwa setiap versi di katalog mendukung semua Mac.\n\n## 1. Catat versi macOS dan prosesor Mac\n\nBuka menu Apple di sudut layar, lalu pilih **About This Mac / Mengenai Mac Ini**. Catat nama dan nomor versi macOS, informasi Chip atau Processor, serta memori. Pada Mac dengan Apple silicon, bagian Chip menampilkan nama chip; Mac berbasis Intel menampilkan informasi prosesornya. Langkah ini mengikuti [petunjuk Apple untuk mengenali Mac](https://support.apple.com/en-ca/102767).\n\nSiapkan catatan seperti contoh berikut. Ganti isinya dengan perangkat sendiri; contoh ini bukan rekomendasi kombinasi versi SPSS.\n\n| Informasi | Contoh catatan |\n| --- | --- |\n| Sistem operasi | Nama macOS dan nomor versi lengkap |\n| Prosesor | Intel atau nama chip Apple silicon |\n| Memori | Kapasitas RAM yang tercantum |\n| Kebutuhan penelitian | Versi SPSS yang diminta dosen dan jenis analisis |\n\nTidak perlu mengirim nomor seri Mac, kata sandi, atau data responden untuk menanyakan kecocokan software. Bila mengirim tangkapan layar, tutupi informasi yang tidak dibutuhkan.\n\n## 2. Periksa versi SPSS beserta pembaruannya\n\nJangan menyamakan nomor versi utama dengan seluruh pembaruannya. IBM mencatat dukungan Apple silicon mulai SPSS Statistics 27.0.1.0 pada macOS 11.0. Angka itu menjelaskan awal dukungan, bukan daftar kompatibilitas untuk semua macOS setelahnya. Cocokkan versi dan pembaruan yang akan digunakan melalui [IBM Software Product Compatibility Reports](https://www.ibm.com/software/reports/compatibility/clarity/index.html). Penjelasan awal dukungan tersedia pada [catatan IBM tentang perangkat ARM](https://www.ibm.com/support/pages/are-ibm-spss-client-products-supported-arm-architecture-devices).\n\nJika paket hanya menyebut SPSS 27, tanyakan pembaruan yang disertakan sebelum menyimpulkan kecocokannya. Periksa lagi saat berencana memperbarui macOS karena kombinasi perangkat lunaknya ikut berubah.\n\n## 3. Cocokkan dengan kebutuhan skripsi\n\nTanyakan kepada dosen atau lab versi dan fitur yang diperlukan. Catat apakah tugas memerlukan prosedur analisis tertentu, format keluaran tertentu, atau pertukaran berkas dengan komputer kampus. Memilih versi sebaiknya dimulai dari kebutuhan tersebut dan dukungan perangkat, bukan sekadar memilih angka paling tinggi.\n\nSebelum mulai mengolah data, baca [cara menyiapkan data kuesioner untuk SPSS](/blog/cara-menyiapkan-data-kuesioner-untuk-analisis-spss). Jika kebutuhan utamanya mencari akses software, periksa juga [lisensi kampus dan alternatif statistik gratis](/blog/spss-untuk-skripsi-lisensi-resmi-dan-alternatif-gratis).\n\n## 4. Tanyakan paket dan ketentuan pembelian\n\nBuka [SPSS untuk macOS](/produk/app-spssmac) untuk melihat pilihan versi, harga, dan ketentuan pembelian terbaru. Paket [SPSS untuk Windows](/produk/app-1790154210043) merupakan produk berbeda; installer Windows tidak menggantikan installer macOS.\n\nGunakan pesan berikut saat [menghubungi CS](/kontak):\n\n> Saya memakai macOS [versi], prosesor [Intel/nama chip], dan RAM [kapasitas]. Kampus meminta SPSS [versi/fitur]. Versi dan pembaruan mana yang sesuai? Bagaimana metode aktivasi dan bantuan instalasinya?\n\nPeriksa jenis lisensi, masa berlaku, jumlah perangkat, metode aktivasi, dan isi pembelian sebelum checkout. Masa berlaku lisensi dan cakupan garansi adalah dua informasi berbeda; jangan menganggap keduanya sama bila rinciannya belum tercantum.\n\n## Sebelum menginstal\n\nCadangkan berkas penelitian, pastikan unduhan selesai, dan ikuti petunjuk untuk versi yang diterima. Jika ada pesan kesalahan, catat teksnya serta tahap saat muncul dan gunakan [panduan meminta bantuan teknis](/panduan/meminta-bantuan-teknis). Hentikan proses bila muncul peringatan keamanan dan minta pemeriksaan sumber file. Jangan mematikan perlindungan perangkat hanya agar instalasi berlanjut.",
    "category": "Statistik & Riset",
    "author": "Aplikasi.id",
    "author_url": null,
    "cover_image_url": null,
    "published": true
  }
]
$blog_seed$::jsonb
) as seed(
  slug text,
  title text,
  excerpt text,
  content text,
  category text,
  author text,
  author_url text,
  cover_image_url text,
  published boolean
)
on conflict (slug) do nothing;
commit;
