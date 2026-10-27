# Operasional SEO Aplikasi.id

Pemeriksaan 27 Oktober 2026, Asia/Jakarta. Pisahkan hasil laporan Google, perubahan kode lokal, dan status deployment.

## Kondisi yang sudah diperiksa

- Search Console properti `https://www.aplikasid.com/` dapat dibuka dari akun yang sudah login. Laporan Page indexing terakhir diperbarui **23 Oktober 2026**: **47 halaman indexed**, **43 discovered — currently not indexed**, dan **1 crawled — currently not indexed**.
- Satu URL pada kelompok crawled adalah `/opengraph-image?6ae6a70c338ef0a6`, bukan halaman produk atau artikel. Jangan menganggap angka 44 sebagai 44 halaman konten yang rusak.
- Laporan Sitemaps menunjukkan `/sitemap.xml` **Success**, terakhir dibaca **27 Oktober 2026**, dengan **95 discovered pages**. Angka ini bukan jumlah halaman yang terindeks.
- URL Inspection mengonfirmasi produk SPSS Windows dan SPSS macOS **URL is on Google / Page is indexed**. Masing-masing memiliki satu Product snippet, Merchant listing, dan Breadcrumb valid. Ada peringatan nonkritis; tidak ada alasan membuat rating atau ketentuan penjualan yang tidak terverifikasi untuk menghilangkannya.
- Laporan Performance pada filter Web/3 months menampilkan data grafik **8–25 Oktober 2026**: **11 clicks**, **282 impressions**, **CTR 3,9%**, dan **posisi rata-rata 15**. Ini baseline sebelum deployment perubahan SEO, bukan hasil perubahan ini. Query `s.id/aplikasid spss` memiliki empat klik dan 43 impressions; `adobe premiere pro` sembilan impressions tanpa klik; query Word dan AutoCAD juga mulai tampil. Sampelnya masih kecil, sehingga belum cukup untuk menyimpulkan volume pasar atau pertumbuhan.
- Ada URL artikel `/blog/davinci-resolve-gratis-resmi-cara-download-dan-beda-studio` yang dimasukkan sebagai sitemap dan menampilkan satu error. Artikel HTML bukan sitemap XML. Gunakan URL Inspection untuk artikel, bukan formulir Add a new sitemap. Entri lama tersebut belum dihapus.
- File verifikasi `public/google6bdd09b63391827f.html` sudah tersedia. Pertahankan file ini; tidak perlu mengganti token atau menambah pemilik Google.

## Perubahan dalam kode

- `next.config.mjs` dan `lib/canonical-redirects.mjs`: redirect 308 dari domain lama dan apex `.com` ke origin `NEXT_PUBLIC_SITE_URL` (default `https://www.aplikasid.com`). Path dan query dipertahankan. `/api`, `/_next`, `/adminn`, `/akun`, `/login`, dan file verifikasi Google dikecualikan agar integrasi dan sesi pada host lama tidak dialihkan.
- `lib/seo.mjs`: crawler boleh membaca `/api/product-image/` untuk gambar katalog lama; API lainnya tetap dilarang di robots. robots.txt bukan pengganti autentikasi.
- `/kategori/statistik-riset`: koleksi SPSS Windows/macOS, Stata, EViews, SmartPLS, Anates, dan Mendeley. Koleksi memakai ID produk yang ada dan tetap menampilkan kategori Office/Utility semula; tidak memerlukan migrasi database. Produk baru dapat ditambahkan melalui `productIds` pada `lib/catalog-seo.mjs`.
- `lib/product-buying-guides.mjs`: panduan pemilihan pada lima halaman produk, beserta tautan ke artikel yang benar-benar terbit. Harga, versi, platform, lisensi, FAQ, dan informasi pembelian tetap mengikuti katalog Supabase. Panduan bukan pernyataan bahwa layanan atau ketentuan lisensi tertentu disertakan.
- `lib/commerce-analytics.mjs` dan `app/commerce-analytics.js`: event GA4 `view_item`, `begin_checkout`, dan `contact_click` untuk WhatsApp. Payload hanya memakai field katalog publik; tidak menyertakan nomor WhatsApp, pesan pelanggan, email, token, atau URL checkout.
- Klik checkout **tidak** dianggap sebagai `purchase`. Pengukuran transaksi lunas dan atribusi sumber traffic masih membutuhkan integrasi yang diuji dengan Lynk dan GA4. Jangan menyimpulkan omzet dari jumlah klik.

## Setelah deployment

1. Pastikan Vercel membangun commit yang berisi perubahan ini dan `NEXT_PUBLIC_SITE_URL` memakai `https://www.aplikasid.com` jika variabel tersebut diatur di hosting.
2. Uji beranda, kategori riset, kelima produk, halaman informasi toko, robots, sitemap, dan file verifikasi. Pastikan API webhook pada host lama tetap menerima request tanpa redirect. Jangan mengganti seluruh domain menjadi redirect pada panel hosting karena pengecualian API di Next dapat terlewati.
3. Pastikan sitemap memuat `/kategori/statistik-riset`. Build lokal dengan katalog saat pemeriksaan menghasilkan **96 URL**. Angka dapat berubah bersama katalog/artikel.
4. Gunakan [URL Inspection](https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.aplikasid.com%2F) untuk halaman baru dan produk utama. Periksa live URL, canonical pilihan Google, dan status index. Request indexing sekali untuk URL yang penting dan sudah siap; pengulangan tidak menjamin lebih cepat.
5. Uji produk utama dengan [Rich Results Test](https://search.google.com/test/rich-results). Perbaiki error wajib; jangan menambah rating, stok, atau garansi yang belum diketahui untuk menghilangkan peringatan opsional.
6. Di GA4 Realtime/DebugView, buka halaman produk, klik checkout, dan klik WhatsApp. Harus ada `view_item`, `begin_checkout`, dan `contact_click` dengan nilai IDR sesuai produk. Jangan melakukan pembayaran hanya untuk menguji klik.

Produk prioritas:

| Produk | URL |
| --- | --- |
| SPSS Windows | `/produk/app-1790154210043` |
| SPSS macOS | `/produk/app-spssmac` |
| Office | `/produk/app-office` |
| AutoCAD | `/produk/app-autocad` |
| Photoshop | `/produk/app-photoshop` |

## Evaluasi empat minggu

- **Minggu 1:** validasi deployment, indexing, canonical, dan event. Catat impressions, clicks, CTR, serta posisi rata-rata per halaman dari Search Console sebagai baseline.
- **Minggu 2:** pilih halaman yang sudah mendapat impressions; cocokkan judul, ringkasan, dan isi dengan query yang tampil. Isi informasi lisensi/pembelian melalui admin hanya berdasarkan ketentuan yang sudah diverifikasi.
- **Minggu 3:** kembangkan satu atau dua panduan yang berhubungan dengan pertanyaan pelanggan nyata, menggunakan screenshot, contoh data/file, dan langkah yang dicoba. Periksa artikel yang sudah ada agar tidak membuat duplikat topik. Tautkan produk hanya jika relevan dengan kebutuhan pembaca.
- **Minggu 4:** bandingkan periode yang setara dan pisahkan pencarian merek dari pencarian kebutuhan. Nilai traffic bersama klik checkout/WhatsApp; angka pembelian harus bersumber dari transaksi lunas yang benar-benar tercatat.

Belum ada target jumlah pengunjung atau janji posisi Google. Pilih topik lanjutan dari data query dan pertanyaan pelanggan, bukan asumsi volume pencarian.

## Validasi pengembangan

- `npm test`: 137 test lulus setelah integrasi kode terbaru, termasuk redirect, koleksi riset, panduan produk, dan analytics.
- `npm run build`: lulus dengan Next.js 16.4.3.
- Pemeriksaan HTTP build production lokal: 13 endpoint merespons 200; koleksi riset menampilkan tujuh produk; lima halaman produk memuat panduan, tautan artikel, FAQ, dan informasi pembelian; redirect 308 mempertahankan path/query; file verifikasi di host lama tidak dialihkan.
- Build dan tes lokal tidak membuktikan perubahan sudah ter-deploy atau event sudah diterima GA4.

Referensi: [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start), [permintaan crawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Product snippet](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [event ecommerce GA4](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce).
