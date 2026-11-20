# Operasional SEO Aplikasi.id

## Pemeriksaan dan perubahan 20 November 2026

Status ini membedakan situs live, perubahan lokal, dan data Google yang belum dapat dibaca.

- **Situs live:** beranda, produk SPSS Windows/macOS, kategori riset, blog, robots.txt, serta sitemap merespons HTTP 200. Halaman yang diperiksa memakai canonical `https://www.aplikasid.com` dan mengizinkan indeks. Domain apex serta URL produk pada domain lama mengarah ke domain kanonis. Sitemap live berisi 96 URL, termasuk 35 artikel. Ini pemeriksaan akses teknis, bukan bukti indeks Google terbaru.
- **Search Console terbaru belum diperiksa:** akun Chrome awal tidak memiliki akses ke properti; setelah pengguna menyebut akun kampusapp, koneksi browser tidak dapat membaca jendela Chrome. Angka pada catatan Oktober di bawah tetap merupakan data historis. Jangan menggunakannya sebagai angka November atau menganggap hasil pencarian `site:` yang kosong sebagai bukti deindex.
- **Ketentuan produk dari pemilik:** pada percakapan 20 November, pemilik mengonfirmasi semua produk memakai lisensi resmi, masa berlaku 5 tahun, dan 1 pembelian untuk 1 laptop/PC. Tidak ada data tambahan untuk menyimpulkan metode aktivasi atau cakupan garansi. Pembacaan katalog publik saat audit menunjukkan tiga field lisensi tersebut belum diisi pada produk; nilai umum diterapkan melalui helper presentasi, tanpa menulis ulang katalog Supabase.

Perubahan lokal:

1. `lib/product-purchase-info.mjs`: ketentuan umum tampil pada halaman produk serta FAQ untuk produk dengan field kosong. Nilai khusus yang diisi admin tetap diutamakan. Placeholder editor menjelaskan nilai umum tersebut. Chat menerima ketentuan yang sama melalui whitelist field publik.
2. `lib/catalog-seo.mjs`: ringkasan yang sebelumnya berupa salinan deskripsi terpotong diganti kalimat lengkap tentang nama, platform, versi, harga, kompatibilitas, dan lisensi. Daftar versi panjang diarahkan ke halaman detail, bukan dipotong di tengah daftar. Teks SEO khusus tetap dipertahankan. Ringkasan tidak menjanjikan posisi atau tampilan snippet Google.
3. `lib/product-buying-guides.mjs`: panduan pemilihan Premiere Pro dan tautan artikel yang relevan, melengkapi lima produk prioritas sebelumnya.
4. `lib/blog-product-links.mjs`: lima artikel terbit tentang akses gratis/edukasi mendapat produk terkait yang sesuai. Penawaran toko dijelaskan terpisah dari akses gratis pengembang; artikel Mendeley/Zotero menautkan Office untuk penulisan, bukan mengarahkan pembaca ke Mendeley Desktop lama.
5. `lib/blog-seo-additions.mjs`: satu artikel baru, **SPSS untuk Mac: Cek Versi macOS, Intel, dan Apple Silicon**, dengan checklist perangkat, pembaruan versi SPSS, sumber Apple/IBM, serta tautan produk dan panduan. Topik ini menjawab kebutuhan memilih perangkat; belum ada data kueri November untuk menyatakan volume pencariannya. Artikel masuk seed SQL, belum diterbitkan ke database.

Penerapan yang masih diperlukan:

1. Deploy perubahan kode melalui alur hosting proyek. Tidak ada deployment atau push Git pada pekerjaan ini.
2. Impor **`supabase/blog-seo-refresh.sql`** setelah schema blog tersedia, atau masukkan artikel baru melalui admin. File ini hanya menambahkan artikel SPSS Mac tanpa memulihkan artikel lama yang pernah dihapus; slug yang sudah ada tidak ditimpa. `supabase/blog-seed.sql` tetap tersedia untuk instalasi awal. Artikel lokal tidak otomatis muncul di production. Setelah terbit, tautan dari produk SPSS Mac serta sitemap mengikuti data terbit secara otomatis.
3. Buka Search Console dengan akun kampusapp. Ambil Performance untuk periode 3 bulan, pisahkan kueri merek dan nonmerek, lalu lihat pasangan Queries/Pages. Catat klik, tayangan, CTR, dan posisi bersama rentang tanggalnya. Untuk Page indexing, catat tanggal laporan, jumlah indexed/not indexed, alasan, dan contoh URL; periksa URL prioritas melalui URL Inspection sebelum memutuskan tindakan.
4. Setelah deployment/publikasi, periksa metadata dan canonical produk prioritas, sitemap, artikel baru, serta ketentuan pembelian. Request indexing pada URL baru yang siap tanpa mengulang permintaan berkali-kali.

Validasi lokal: `npm test` lulus **150 test**. Pemeriksaan HTTP pada build production lokal lulus untuk enam produk prioritas, lima artikel dengan produk terkait, robots, dan sitemap (13 endpoint). Artikel baru berhasil dirender dengan Markdown, tabel, tautan produk, serta sumber resmi. `npm run build` lulus pada percobaan ulang, tetapi Next.js 16.4.3 memunculkan peringatan kerentanan keamanan dependency; pemeriksaan pertama menghentikan build. Peningkatan keamanan dependency masih perlu dikerjakan terpisah dan belum diterapkan pada pekerjaan SEO ini.

## Catatan historis Oktober 2026

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
