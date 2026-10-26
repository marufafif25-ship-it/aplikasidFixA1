# Gambaran Besar Proyek Aplikasid

Dokumen ini merangkum arsitektur yang terlihat di source code repository. Gunakan bersama AGENTS.md; periksa konfigurasi Supabase dan hosting yang aktif sebelum menganggap detail operasional di repo masih sama dengan production.

## Tujuan dan bentuk aplikasi

Aplikasid adalah toko online katalog software. Aplikasi utama memakai Next.js App Router, React, JavaScript, dan Supabase. Pembeli memilih produk di situs lalu menyelesaikan pembayaran di halaman checkout Lynk.id. Situs menyediakan dashboard admin, pusat panduan, chat bantuan, dan halaman untuk mencari pembelian serta membuka link unduhan Google Drive.

Alur singkat:

- Browser pembeli → Next.js → Supabase (katalog, pengaturan, FAQ)
- Pembeli → checkout eksternal Lynk.id → webhook Lynk → Next.js API → Supabase (transaksi)
- Pembeli → /akun → Next.js API → transaksi dan pemetaan link unduhan
- Admin → Supabase Auth → API admin atau Supabase Storage
- Chat → Next.js API → Qwen melalui SumoPod

## Source of truth dan batas repository

- Aplikasi Next.js yang dijalankan oleh npm run dev berada di app/ dan lib/.
- File root index.html, app.js, styles.css, dan server.py adalah bagian aplikasi atau preview lama. File tersebut bukan entry point aplikasi Next.js saat ini.
- SpreadsheetYangLama/, referensi/, dan sebagian scripts/ membantu migrasi atau pekerjaan pendukung; data katalog production dibaca dari Supabase.
- CLAUDE.md mengimpor @AGENTS.md dan menyediakan pintu masuk panduan Claude. Ringkasan serah terima ada di HANDOFF_CLAUDE.md; rincian per bagian, konfigurasi, hasil pemeriksaan, dan peta file ada di docs/claude/. Instruksi bersama untuk Claude dan Codex tetap ada di AGENTS.md.
- SQL migrasi database ada di supabase/. Petunjuk setup dan beberapa catatan operasional rinci ada di supabase/README.md; setup chat ada di CHAT_SETUP.md.

Jangan mengubah file lama atau CSV sumber migrasi dengan asumsi itu akan mengubah situs aktif. Telusuri pemakaiannya dulu.

## Struktur kode utama

| Lokasi | Tanggung jawab |
| --- | --- |
| app/ | Halaman App Router, layout, komponen UI, dan API routes. |
| app/api/ | Endpoint katalog/admin, pembelian, webhook Lynk, chat, dan gambar katalog lama. |
| lib/ | Akses Supabase, logika katalog, checkout, chat, pembelian, unduhan, SEO, dan helper yang bisa diuji terpisah. |
| assets/ | Aset sumber/arsip dan input script pendukung. |
| public/ | Aset statis runtime; URL /assets/... dilayani dari public/assets/. |
| supabase/ | Skema dan migrasi SQL. Jalankan migrasi di project Supabase yang benar, bukan di build aplikasi. |
| tests/ | Unit test Node.js menggunakan node:test. |
| scripts/ | Ekspor/impor data dan utilitas pendukung. Periksa isi script sebelum menjalankannya karena sebagian memerlukan file atau environment tertentu. |

### Halaman dan endpoint

| URL | Fungsi |
| --- | --- |
| / | Beranda, katalog yang bisa dicari/diurutkan, dan chat. |
| /kategori dan /kategori/[slug] | Indeks kategori dan landing page SEO. Slug/nama kategori didefinisikan di lib/catalog-seo.mjs. |
| /blog dan /blog/[slug] | Indeks artikel dan halaman artikel SEO yang dikelola admin. Hanya artikel terbit yang dibuka untuk publik dan masuk sitemap. |
| /produk/[id] | Detail produk; id produk menjadi bagian URL. |
| /tentang, /kontak, /garansi | Identitas aplikasi_id, kontak resmi, serta informasi bantuan dan pengembalian. Konten mengikuti pengaturan footer. |
| /panduan dan /panduan/[slug] | Pusat panduan. Isi panduan didefinisikan statis di lib/guides.js. |
| /adminn | Dashboard admin. Ejaan route saat ini memang /adminn. |
| /akun | Pencarian transaksi berdasarkan email checkout; hanya tampil saat homepage.accountEnabled aktif. |
| /login | Mengarahkan pengguna ke /akun. |
| POST /api/catalog | Simpan/hapus produk atau simpan pengaturan; memerlukan bearer token admin. |
| GET/POST/DELETE /api/admin/blog | Baca dan kelola artikel blog; memerlukan bearer token admin/owner. |
| GET/POST /api/admin/downloads | Daftar dan simpan pemetaan ID item Lynk ke link Google Drive; memerlukan role admin. |
| POST /api/webhook/lynk | Validasi webhook pembayaran dan simpan transaksi. |
| POST /api/purchases | Cari transaksi lunas dengan email checkout dan pagination. |
| POST /api/chat | Chat bantuan dengan konteks toko. |
| GET /api/product-image/[id]/[field] | Sajikan gambar base64 lama yang tersimpan di data produk. |

## Data dan alur penting

### Katalog, pengaturan, dan admin

app/page.js memuat katalog awal dari lib/storefront-server.js. Fungsi getStorefront() mengambil produk, pengaturan homepage/footer, dan FAQ aktif dari Supabase; hasilnya di-cache 60 detik dengan tag storefront. Perubahan dari dashboard dikirim melalui POST /api/catalog, yang memeriksa token dan role admin/owner, lalu menghapus cache tersebut.

Data produk disimpan di products.data sebagai JSONB, dengan ID dan urutan terpisah. Halaman produk/kategori mengambil data dari katalog yang sama. URL checkout tersimpan pada buyUrl; lib/checkout.js hanya mengizinkan URL HTTP(S) yang valid dan checkout berlangsung di Lynk.id, bukan diproses sendiri oleh aplikasi.

Judul produk dibuat ringkas; sistem operasi ditampilkan terpisah pada kartu. Simpan kegunaan produk di `description`, pilihan versi di `versions`, serta batasan paket dan persyaratan di `compatibility`. Tombol Lihat Detail di beranda membuka halaman `/produk/[id]` yang menampilkan deskripsi, versi, kompatibilitas, dan fitur produk; alurnya sama dengan produk terkait di blog. `lib/product-presentation.mjs` menyamakan penulisan platform serta mempertahankan pencarian berdasarkan kegunaan, versi, dan isi paket setelah judul dipersingkat. Konteks chat hanya menerima deskripsi dan kompatibilitas publik dengan panjang terbatas.

Informasi pembelian tambahan disimpan pada JSON produk: `licenseType`, `licenseDuration`, `deviceLimit`, `activationMethod`, `deliveryInfo`, dan `warrantyInfo`. Isian tersedia di dashboard, lalu ditampilkan sebagai teks di halaman produk. Field kosong tidak diisi dengan asumsi lisensi atau garansi; pengunjung diarahkan mengonfirmasi ketentuan yang belum tersedia kepada CS. Jangan menyimpan kunci lisensi, kredensial, atau link unduhan privat pada field publik ini. Tidak perlu migrasi SQL karena tetap memakai `products.data`.

Identitas toko disimpan bersama pengaturan footer: `operatorName`, `aboutText`, `location`, `supportHours`, dan `refundPolicy`. Pengelola default adalah `aplikasi_id`; lokasi, jam layanan, dan kebijakan pengembalian hanya ditampilkan jika diisi. Kontak resmi mengikuti URL WhatsApp/TikTok footer yang sudah aktif. Halaman `/tentang`, `/kontak`, dan `/garansi` ada di route group `app/(informasi)/`, tertaut dari footer/halaman produk/blog/panduan, serta masuk sitemap. Data terstruktur identitas pada halaman Tentang memakai ID organisasi yang sama dengan layout utama. Jangan menganggap keberadaan sitemap sebagai bukti indeks; periksa laporan dan URL Inspection di Search Console untuk status terbaru.

Artikel disimpan per baris di `blog_posts`. Halaman publik merender Markdown menjadi HTML di server, metadata dan `BlogPosting` JSON-LD dibuat per artikel, dan sitemap hanya memuat artikel terbit. Indeks Blog menampilkan 9 artikel per halaman melalui URL `?page=`. Terapkan `supabase/blog-posts.sql` setelah schema utama sebelum mengelola artikel dari `/adminn`. Migrasi `supabase/blog-views.sql` menambahkan kolom untuk total Views Google Analytics yang dimasukkan manual dari dashboard; nilai nol tidak ditampilkan ke publik.

Blok **Produk terkait** di akhir 30 artikel awal memakai pemetaan slug ke ID produk di `lib/blog-product-links.mjs`. Nama dan ketersediaan produk mengikuti katalog aktif; panduan lanjutan hanya ditautkan bila artikelnya terbit. Blok dirender di server oleh `app/blog/related-products.js`, sehingga berlaku juga untuk artikel yang sudah tersimpan di Supabase tanpa migrasi atau penggantian isi Markdown. Tambahkan pemetaan saat membuat artikel baru atau mengganti ID produk. Jika katalog gagal dimuat, artikel tetap dapat dibaca.

Dashboard memakai Supabase Auth. Role disimpan di admin_users; RLS database menjadi lapisan otorisasi selain pemeriksaan API. Upload gambar baru dilakukan dari sesi admin ke bucket Storage product-images. Gambar base64 lama masih ditangani route gambar khusus.

### Pembayaran dan unduhan

POST /api/webhook/lynk memeriksa X-Lynk-Signature, memvalidasi pembayaran payment.received, lalu memasukkan transaksi ke lynk_orders. Konflik ref_id diabaikan agar pengiriman webhook berulang tidak menimpa transaksi yang sudah ada. Data transaksi menyimpan email, item, jumlah, dan data pembayaran terpilih; handler tidak menyimpan payload mentah.

Admin memetakan items[].uuid dari Lynk ke product_downloads.lynk_item_id, judul, keterangan, dan URL Google Drive. POST /api/purchases menormalkan email (trim dan huruf kecil), membaca transaksi paid, membatasi hasil ke 10 transaksi per halaman, lalu menambahkan link hanya jika ID item cocok persis. Respons tidak di-cache.

**Kebijakan akses yang penting:** /akun memakai email checkout sebagai satu-satunya bukti pencarian. Mengetahui email itu cukup untuk melihat hasil dan link unduhan; ini bukan verifikasi identitas. Implementasi API menggunakan server secret Supabase. Pertahankan pemahaman ini saat mengubah UX atau keamanan fitur.

Toggle homepage.accountEnabled mengatur visibilitas navigasi, halaman /akun, dan arahan chat. Endpoint POST /api/purchases sendiri tidak memeriksa toggle tersebut dan tetap dapat dipanggil langsung.

### Chat bantuan

Widget chat berada di beranda. Server menambahkan katalog publik, FAQ aktif, dan panduan ke konteks model Qwen melalui endpoint OpenAI-compatible SumoPod. Kunci API hanya dibaca server. FAQ dapat menjadi fallback saat AI gagal. Batas, validasi, limiter lokal, dan penanganan output model ada di lib/chat.mjs; konfigurasi aktivasi lebih rinci ada di CHAT_SETUP.md.

### Database Supabase

SQL utama dan tambahan:

- supabase/schema.sql: admin_users, products, site_settings, chat_faq, serta policy dasar.
- supabase/lynk-orders.sql: lynk_orders dan akses transaksi.
- supabase/product-downloads.sql: pemetaan unduhan privat.
- supabase/product-images.sql: bucket Storage publik dengan upload terbatas untuk admin.
- supabase/blog-posts.sql: tabel artikel blog dan policy baca/tulis berbasis role.
- supabase/blog-views.sql: kolom untuk total Views artikel yang disalin manual dari Google Analytics.
- supabase/blog-seed.sql: 30 artikel untuk diimpor setelah tabel Blog dibuat; 10 artikel awal bersumber dari `lib/blog-seed.json` dan 20 artikel tambahan dari `lib/blog-seed-additions.mjs`.
- supabase/import-data.sql: hasil impor katalog; dapat dibuat ulang dari data migrasi, jadi periksa sebelum menimpanya.

Policy dasarnya memberi pembacaan katalog publik dan penulisan data katalog kepada admin/owner. Tabel transaksi dan pemetaan unduhan tidak dibuka untuk pembaca anonim. Jangan memakai Supabase secret/service-role key di browser atau variabel NEXT_PUBLIC_*.

## Variabel lingkungan

.env.example adalah daftar awal konfigurasi; salin ke .env.local untuk pengembangan dan jangan commit file lokal tersebut.

| Variabel | Pemakaian |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | URL project Supabase. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Key publik untuk akses browser/server biasa; NEXT_PUBLIC_SUPABASE_ANON_KEY diterima sebagai nama lama. |
| SUPABASE_SECRET_KEY | Akses server untuk webhook dan pencarian transaksi; SUPABASE_SERVICE_ROLE_KEY diterima sebagai nama lama. Rahasia. |
| LYNK_MERCHANT_KEY | Validasi signature webhook Lynk. Rahasia. |
| QWEN_API_KEY | Kredensial chat SumoPod. Rahasia. |
| QWEN_MODEL, QWEN_BASE_URL | Model dan endpoint chat; default ada di lib/chat.mjs. |
| NEXT_PUBLIC_SITE_URL | Origin kanonis untuk metadata dan sitemap; default di lib/seo.mjs adalah https://www.aplikasid.com. |

Google Analytics dan Meta Pixel saat ini dikonfigurasi di source (app/layout.js, lib/meta-pixel.mjs), bukan lewat environment variable.

## Menjalankan dan memeriksa perubahan

Perintah umum:

- npm install
- npm run dev
- npm test
- npm run build

npm test menjalankan node --test tests/*.test.mjs. Test helper dan API umumnya memakai dependency tiruan agar tidak menghubungi layanan produksi. Tes kebijakan RLS tambahan dan langkah Supabase ada di bagian testing pada supabase/README.md; beberapa membutuhkan PGlite.

Sebelum mengubah fitur, baca AGENTS.md, cari implementasi terkait di app/ dan lib/, lalu baca test yang sudah ada. Untuk perubahan Next.js, instruksi repo mewajibkan membaca dokumentasi lokal yang relevan di node_modules/next/dist/docs/ terlebih dahulu karena versi dependency memakai next: latest. Tambahkan atau perbarui unit test untuk fitur baru dan perubahan perilaku.

## Catatan operasional untuk penerus

- supabase/README.md mencantumkan URL webhook https://www.aplikasid.my.id/api/webhook/lynk, sedangkan default origin situs di lib/seo.mjs adalah https://www.aplikasid.com. Verifikasi domain production dan URL webhook di konfigurasi Lynk sebelum deploy atau mengubah salah satunya.
- Migrasi SQL harus diterapkan pada Supabase yang dipakai aplikasi. Build lokal yang berhasil tidak membuktikan bahwa key, schema, RLS, bucket Storage, webhook, atau provider chat production sudah aktif.
- Untuk perubahan alur pembelian, cek bersama lib/lynk-webhook.mjs, lib/purchase-lookup.mjs, lib/product-downloads.mjs, endpoint terkait, SQL, dan test. Kesesuaian ID item Lynk adalah kunci pengaitan transaksi ke link unduhan.
- Untuk perubahan tampilan katalog, periksa beranda, landing kategori, detail produk, dan tampilan mobile agar isi serta navigasi tetap konsisten.
