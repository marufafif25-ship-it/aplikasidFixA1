# Admin, akun, SEO, aset, dan utilitas operasional

Audit source lokal pada 22 Oktober 2026. Baca `AGENTS.md`, `PROJECT_OVERVIEW.md`, dan `CLAUDE.md` sebelum mengubah implementasi. Dokumen ini menjelaskan perilaku yang terlihat di repository; status konfigurasi lokal dan hasil verifikasi ada di `KONFIGURASI_DAN_STATUS.md`. Konfigurasi hosting, dashboard provider, serta data production tidak diperiksa lewat jaringan dalam audit ini.

## Entry point yang benar

- Situs aktif yang dijalankan `npm run dev` adalah Next.js di `app/` dan `lib/`.
- Dashboard adalah **`/adminn`**, dengan dua huruf n. `app/adminn/layout.js` memberi metadata `noindex, nofollow`.
- `/akun` adalah pencarian pembelian dengan email checkout; `/login` hanya redirect ke `/akun`.
- Root `index.html`, `app.js`, `styles.css`, dan `server.py` merupakan prototipe lama. Mengubahnya tidak mengubah aplikasi Next.js.
- `scripts/`, `referensi/`, dan `SpreadsheetYangLama/` adalah pendukung dan arsip migrasi; bukan sumber katalog runtime.

## Dashboard `/adminn`

### Login dan data awal

`app/adminn/page.js` adalah client component. Ia memakai fungsi di `lib/products-api.js` untuk:

1. Memulihkan user Supabase Auth melalui `getAdminUser()`.
2. Membaca `products`, pengaturan `homepage`, dan `footer` langsung dari Supabase memakai key publik dan RLS.
3. Menampilkan form login jika belum memiliki sesi admin.
4. Login memakai email dan password melalui `signInWithPassword`, lalu membaca role dari `admin_users`.
5. Memuat artikel admin setelah sesi siap.

Form login menerima role `admin` dan `owner`; akun Supabase Auth saja belum cukup. Penyimpanan katalog memerlukan bearer access token dan diteruskan ke `/api/catalog`. UI dashboard bukan pengganti pemeriksaan API dan RLS. Keluar memakai Supabase `signOut()`.

Browser menyimpan cache dengan key `aplikasiid_products`, `aplikasiid_hero`, dan `aplikasiid_footer`. Ini bukan database production. Produk tetap dibaca dari Supabase pada pemuatan halaman; urutan lama dari localStorage hanya dipakai jika seluruh data remote belum memiliki `sortOrder`. Hero/footer lokal dapat terlihat lebih dulu sambil pengaturan remote dimuat. JSON localStorage hero/footer dibaca tanpa `try/catch`; jika dashboard gagal pada browser tertentu setelah data lokal rusak, periksa tiga key tersebut sebelum mengubah database.

### Editor produk

Form memuat ID, judul, kategori, OS, deskripsi, kompatibilitas/persyaratan, judul/deskripsi SEO opsional, harga jual/coret, rating, penjualan, versi, spesifikasi, URL beli, logo, gambar katalog, dan warna.

- ID produk menjadi URL `/produk/[id]`; saat edit, ID dibuat read-only. Pilih ID stabil ketika membuat produk.
- Kategori pilihan admin saat ini: `Design`, `Engineering`, `Video`, `Office`, `Utility`, `Game`.
- `specs` dari textarea dipisah dengan koma; nilai harga/rating/sales dikonversi ke angka saat disimpan.
- Versi tersedia disimpan di `versions`, kegunaan di `description`, dan batasan OS/paket di `compatibility`. Jangan memasukkan semuanya ke judul lagi; presentasi publik memakai helper tersendiri.
- Produk disimpan melalui `saveProduct` → `save_products` di `/api/catalog`. Hapus memakai `delete_product`, dengan konfirmasi browser.
- Daftar admin berisi 15 produk per halaman; pencarian lokal mencocokkan judul, kategori, dan ID.
- Tombol **Muat Ulang dari Supabase** membaca ulang katalog dan membatalkan form edit; bukan reset atau penghapusan database.
- Statistik “URL beli aktif” hanya menghitung `buyUrl` yang terisi. Itu tidak membuktikan URL checkout benar atau masih berfungsi.

Upload gambar katalog menggunakan sesi admin ke bucket `product-images`, bukan file base64 baru di database. UI menerima PNG, JPG/JPEG, WebP, dan GIF, maksimal 5 MB. `lib/product-image-upload.mjs` memvalidasi file dan sesi, membuat nama unik, mengunggah file asli, lalu memberi URL publik. **Upload dan simpan produk adalah dua langkah terpisah**; setelah upload, admin harus menyimpan produk. Upload yang sudah berhasil dapat menyisakan objek Storage jika form dibatalkan. Periksa `supabase/product-images.sql` jika bucket/policy belum tersedia.

### Urutan katalog

`app/adminn/order-editor.js` membuka `<dialog>` dengan seluruh produk. Susunan bisa diubah melalui drag desktop, panah, atau dropdown posisi. `moveItem` menjaga indeks valid. Simpan mengirim **semua produk** dengan `sortOrder` berurutan mulai nol melalui `saveProducts`; daftar yang disusun dipertahankan jika request gagal. Ref mencegah penyimpanan ganda serta penutupan saat proses simpan berlangsung. Posisi nomor 1 tampil paling awal pada katalog. Keterangan “halaman katalog” di dialog memakai 12 produk per halaman, berbeda dengan pagination daftar admin yang memakai 15.

`lib/admin-scroll.mjs` dipakai saat memilih produk atau artikel untuk edit; ia melakukan `scrollIntoView({ block: "start" })`, dengan gerakan instan jika reduced motion aktif.

### Homepage dan footer

- Hero: dua baris judul, deskripsi, label/tujuan dua tombol, dan tiga trust badge. Tujuan tombol adalah anchor `produk`, `bantuan`, atau `garansi`.
- Jumlah software diturunkan dari total katalog, bukan badge angka CSV lama.
- Footer: brand, deskripsi, copyright, WhatsApp, TikTok. Helper normalisasi menerima `instagram` lama sebagai fallback TikTok dan mengabaikan `email` lama.
- **Kembalikan Default** hanya mengubah form; perlu simpan untuk menerapkan ke server.
- Jika penyimpanan hero/footer ke server gagal, implementasi menyimpan ke localStorage dan menampilkan pemberitahuan **“Tersimpan di browser saja”**. Jangan menyatakan perubahan sudah tampil bagi semua pembeli sebelum simpan Supabase berhasil.

### Visibilitas Akun Saya

Checkbox fitur menyimpan `homepage.accountEnabled` sebagai boolean. Nilai aktif harus persis `true`; string `"true"` tidak mengaktifkan fitur. Default-nya `false`. Form khusus mengambil pengaturan homepage terbaru sebelum mengganti flag agar bidang homepage lain tetap mengikuti server.

Saat dimatikan, tautan akun disembunyikan dan `/akun` redirect ke `/` dari server. Ini bukan penghapusan pesanan. Periksa implementasi server/API bersama bila mengubah batas akses: toggle UI bukan mekanisme verifikasi identitas.

### Link unduhan Lynk

`app/adminn/download-editor.js` memakai `/api/admin/downloads` dengan bearer token dan `cache: "no-store"`. Ia menampilkan daftar mapping beserta item transaksi yang belum diisi; admin dapat memilih item atau memasukkan ID manual, nama, keterangan sampai 3.000 karakter, link, dan status aktif.

- ID yang dibutuhkan adalah **`items[].uuid` pada transaksi Lynk**, bukan ID katalog `app-*`, judul produk, atau kode pendek checkout.
- Link harus HTTPS di `drive.google.com`, divalidasi di client dan server.
- Simpan berlaku bagi semua pembeli item Lynk yang sama. Status nonaktif menghilangkan akses mapping dari hasil pembeli tanpa menghapus transaksi.
- Nama/keterangan mapping yang tampil kepada pembeli terpisah dari deskripsi katalog.
- Jika pembelian ada tetapi tombol Drive belum muncul, cek kesamaan ID item dan status mapping sebelum mengubah data webhook.

### Blog

Editor blog berada pada dashboard yang sama; fungsi request ada di `lib/blog-api.js`, API di `/api/admin/blog`.

- Daftar admin memuat draf dan artikel terbit. Artikel publik dan sitemap hanya memuat yang terbit.
- Slug bisa otomatis dibuat dari judul ketika membuat artikel; setelah edit slug dibuat read-only agar URL stabil.
- Isi memakai Markdown. Judul, ringkasan, kategori, penulis, link bio opsional, cover opsional, dan status terbit disimpan bersama artikel.
- **Jumlah dilihat adalah angka manual yang disalin dari Google Analytics**, bukan hit counter otomatis atau integrasi GA API. Timestamp pembaruan ditampilkan dalam Asia/Jakarta.
- Hapus memakai konfirmasi browser; saat menyimpan, aksi blog lain dikunci.
- Migrasi `blog-posts.sql` diperlukan; `blog-views.sql` diperlukan untuk penyimpanan views. Pengaturan produk terkait untuk 30 artikel awal berada di `lib/blog-product-links.mjs`, bukan textarea isi artikel.

## Akun pembeli

`app/akun/page.js` memanggil `connection()`, membaca `getStorefront()`, lalu memeriksa flag akun. Metadata halaman melarang indexing. Client `app/akun/account.js` dan `account.css` mengelola UI pencarian.

Pembeli memasukkan email checkout, client menormalisasi trim/huruf kecil lalu mengirim `POST /api/purchases` dengan `{ email, page }`. Pagination memakai indeks mulai nol dan tampilan nomor mulai satu. API mengembalikan 10 transaksi per halaman dan `hasNext`. `AbortController` membatalkan pencarian lama agar respons lama tidak menimpa pencarian terbaru; respons diminta tanpa cache.

Hasil menampilkan waktu diterima dalam WIB, status lunas, item/jumlah, keterangan mapping, dan tautan Google Drive. Jika mapping belum tersedia, UI mengarahkan pembeli ke bukti pembelian Lynk atau bantuan. Pembelian sebelum pencatatan webhook aktif mungkin tidak ada dalam database.

**Akses saat ini hanya berdasarkan pengetahuan email checkout.** Tidak ada password pembeli, OTP, atau login Supabase di halaman ini. Jangan menganggap `/login` sebagai autentikasi pembeli dan jangan menjanjikan verifikasi email yang belum diimplementasikan.

## Widget chat

`app/chat-widget.js` adalah client widget pada beranda. Detail provider/server ada di dokumen backend.

- Pesan awal, draft, riwayat, pending, dan error hanya berada di memori komponen; tidak ada penyimpanan percakapan ke localStorage di file ini.
- Tombol FAQ langsung memakai jawaban `faqItems` tanpa request AI; maksimal tiga saran awal.
- Pesan bebas dikirim ke `/api/chat`; hanya satu request aktif, timeout client 75 detik, pembatalan saat unmount.
- Riwayat request dibentuk helper `chatRequestMessages`; riwayat internal dibatasi 18 pesan dan jawaban yang masuk konteks dipotong ke batas input.
- Jika request gagal, jawaban FAQ yang cocok dipakai sebagai fallback. Jika tidak cocok, pertanyaan dikembalikan ke draft selama tidak menimpa draft baru.
- Jawaban bot dirender dengan `react-markdown` + `remark-gfm`, HTML mentah dilewati dan gambar dinonaktifkan.
- Klik di luar menutup panel; Escape/tombol tutup mengembalikan fokus ke launcher. Area log mengumumkan pesan secara `aria-live` dan auto-scroll.
- Link CS WhatsApp berasal dari pengaturan footer, bukan kredensial provider AI.

## Analytics dan SEO

### Analytics

`app/layout.js` memuat GA melalui script di `<head>` dan menginisialisasi `gtag('config', ...)`. Measurement ID publik yang ada di source adalah `G-RDXXT1B7K2`.

Meta Pixel ID publik `28299406323089200` berada di `lib/meta-pixel.mjs`. Root layout memuat bootstrap dengan `next/script` strategi `beforeInteractive`, mengirim PageView awal, dan menyediakan fallback gambar `noscript`. `app/meta-pixel-page-views.js` memakai `usePathname()` untuk PageView navigasi berikutnya: initial effect dan pathname sama dilewati. Perubahan query string saja tidak terdeteksi helper ini.

Script dipasang di root sehingga berlaku juga pada route yang memakai root layout, termasuk admin/akun. Audit source ini tidak membuktikan event diterima dashboard provider. Pengujian GA hanya memeriksa keberadaan/config source; Meta memiliki test helper pergantian path. Tidak ada pemanggilan Purchase event pada file analytics yang diaudit ini. Jangan mengubah ID tracking tanpa permintaan bisnis yang jelas.

### Metadata, sitemap, structured data

- `lib/seo.mjs` menentukan `SITE_URL` dari environment atau default `https://www.aplikasid.com`; URL dinormalisasi ke origin dan hanya HTTP/HTTPS diterima.
- Root layout menetapkan bahasa Indonesia, judul/deskripsi global, metadataBase, Open Graph locale `id_ID`, Twitter card, robots, dan favicon `/untukFaviconfix.png`.
- `createWebsiteStructuredData` menghasilkan Organization + WebSite; breadcrumb dibuat helper tersendiri. `serializeJsonLd` meng-escape `<` serta Unicode line separator untuk penyisipan JSON-LD aman pada script.
- `app/sitemap.js` memakai `connection()` lalu membaca katalog dan artikel terbit. Sitemap memuat beranda, indeks panduan/blog/kategori, semua kategori statis, produk saat ini, panduan statis, dan artikel terbit. `lastModified` artikel berasal dari `updatedAt`/`publishedAt`; admin, akun, login, dan API tidak dimasukkan.
- `app/robots.js` memakai `createRobots`: izinkan `/`, larang `/api/`, tautkan `/sitemap.xml`. Pembatasan robots adalah arahan crawler, bukan otorisasi.
- `app/opengraph-image.js` dan `twitter-image.js` memakai `lib/seo-image.jsx`/`ImageResponse` untuk PNG 1200 × 630 yang sama. Teks domain pada gambar masih statis `WWW.APLIKASID.COM`, terpisah dari environment origin.
- Ada file verifikasi Search Console `public/google6bdd09b63391827f.html`; pertahankan bila domain masih memakai metode verifikasi itu.

Dokumentasi lokal yang diperiksa: metadata file conventions dan installation/CLI di `node_modules/next/dist/docs/`. Metadata file Next dapat di-cache secara default; jangan menyalin strategi caching dari ingatan versi lain. Lihat panduan lokal terkait sebelum mengubah metadata, API, atau caching.

## Aset: lokasi yang benar untuk perubahan

Ada dua pohon aset dengan peran berbeda:

| Lokasi | Pemakaian |
| --- | --- |
| `public/assets/` | File yang disajikan Next sebagai `/assets/...`. Lokasi ini menentukan hasil request URL statis runtime. |
| `assets/` | Salinan/sumber kerja prototipe dan input script video. Tidak otomatis disajikan Next sebagai `/assets`. |
| Supabase Storage `product-images` | Upload gambar katalog baru dari admin. URL disimpan pada produk. |
| `public/assets/imported/` | Gambar base64 CSV yang diekstrak script migrasi lokal. |
| `public/untukFavicon*.png` | Favicon publik; root layout memilih versi `fix`. |

Inventaris saat audit: `assets/` berisi 54 file gambar (tidak termasuk `.DS_Store`); `public/` berisi 43 file, termasuk gambar, favicon, dan HTML verifikasi. Tidak terlihat pipeline otomatis yang menyinkronkan kedua folder.

Sebanyak 15 file `assets/` tidak punya salinan pada path relatif yang sama di `public/assets/`: PNG Stata Windows/Mac, Anates, Nvivo, Visio, Smartpls, Eviews, Acrobat, Mendeley, SPSS Windows/Mac, dua favicon, `katalogNitro.webp`, dan `VersiWebp/spssmacrevisi.webp`. Ini belum tentu tautan rusak karena beberapa memiliki padanan WebP atau lokasi favicon publik berbeda. **`assets/katalogDavinci.png` berbeda isi dari `public/assets/katalogDavinci.png`**. Jangan menyalin seluruh folder tanpa mengecek apakah menimpa revisi yang lebih baru.

Nama file memakai kapitalisasi yang tidak seragam, misalnya `KatalogSketchup.webp`, `SPssWin.webp`, `SpssMac.webp`; pertahankan ejaan saat menulis URL agar deployment Linux tidak bermasalah. Pemilihan gambar katalog runtime juga dipengaruhi `lib/catalog-images.js`, bukan hanya field database.

`next.config.mjs` mengizinkan format optimasi WebP dan local patterns `/assets/**` tanpa query string, serta `/api/product-image/**`. Konfigurasi ini tidak mempublikasikan folder root `assets/` dan tidak mendaftarkan `remotePatterns`. Ikuti pemakaian komponen gambar yang sudah ada ketika menambah URL remote.

## Runtime lama dan arsip migrasi

### Root prototipe

`index.html` memuat `styles.css` dan `app.js`, Google Fonts, serta Font Awesome CDN. Ia berisi hero, filter, kartu, modal keranjang/checkout, simulasi pembayaran/email, invoice lookup, request software, serta modal seller admin.

`app.js` mengandung katalog seed 10 produk dan class `AplikasiIdStore`. Produk/pesanan disimpan di localStorage; keranjang hanya memori. Tombol beli bisa membuka `buyUrl`; jalur tanpa URL memasuki checkout simulasi. `processPayment()` membuat pesanan lokal berstatus lunas, dan tombol simulasi hanya membuka tampilan email. **Tidak ada pengiriman email atau pemrosesan gateway sungguhan pada alur ini.** Request software hanya toast; admin lama tidak memiliki autentikasi server. Pencarian invoice lama bahkan mengizinkan pencocokan sebagian email. Data seed dan klaim UI lama tidak membuktikan perilaku runtime Next.js.

`styles.css` hanya sistem tampilan prototipe (navbar, hero, kartu, modal, email simulasi, toast, responsive), sedangkan aplikasi Next memuat `app/globals.css` dan stylesheet route/komponen. Jangan memperbaiki bug UI Next dengan mengedit root CSS.

`server.py` menjalankan `SimpleHTTPRequestHandler` dari root repository di port 8080, bind semua interface, serta menambah CORS `*` dan header no-cache. Karena root kerja adalah repository dan handler tidak memberi daftar larangan file sensitif, **jangan gunakan server ini sebagai hosting production atau mengeksposnya ke jaringan/tunnel**: file lokal repository, termasuk konfigurasi privat bila diketahui path-nya, dapat tersaji. Gunakan runtime Next untuk proyek ini. `.vscode/settings.json` hanya mengatur port Live Server 5501; itu juga bukan konfigurasi Next.

### CSV dan Google Apps Script

Inventaris CSV publik lama:

| File `SpreadsheetYangLama/` | Isi saat audit |
| --- | --- |
| `AplikasiID Products - products.csv` | 14 produk, 15 kolom; satu gambar data URL besar. Tidak memuat kolom deskripsi/SEO baru. |
| `AplikasiID Products - chat_faq.csv` | 3 FAQ: order, warranty, payment; kolom question/answer/keywords/active/sortOrder. |
| `AplikasiID Products - homepage_settings.csv` | 11 key/value; ada spasi pada key `primaryLabel ` yang dibersihkan importer. |
| `AplikasiID Products - footer.csv` | 6 key/value termasuk email lama yang dihapus dari hasil impor. |
| `AplikasiID Products - auth.csv` | Arsip autentikasi lama; sengaja tidak dibuka atau disalin dalam audit ini. Tidak dipakai Supabase Auth runtime. |

`referensi/google-apps-script-products-auth.js` adalah source deployment Spreadsheet lama: GET produk/homepage/footer/FAQ; POST autentikasi, simpan/hapus produk, serta simpan homepage/footer. Ia membandingkan login/password dari sheet auth secara langsung. **Aksi mutasi `doPost` lama tidak memeriksa sesi/token admin**; keberhasilan action auth tidak menjadi gerbang bagi action save/delete. Jangan mengaktifkan lagi sebagai backend situs sekarang. Tidak perlu memindahkan password sheet ke Claude atau frontend.

## Script pendukung dan efek samping

Script berikut tidak dijalankan oleh `npm run build` atau runtime storefront. Baca source dahulu; tabel ini adalah peta efek samping, bukan perintah yang otomatis perlu dijalankan.

| Script | Input/dependency | Output dan efek samping |
| --- | --- | --- |
| `scripts/export-sheet.mjs` | `LEGACY_PRODUCTS_API_URL`; `fetch` Node ke deployment Apps Script lama. | Empat GET publik dengan timeout 30 detik; menimpa `supabase/import-data.sql`. Tidak mengekspor auth. Produk/settings/FAQ di SQL memakai `ON CONFLICT DO NOTHING`; bukan update data yang sudah ada. Tidak menjalankan SQL. |
| `scripts/import-local-csv.py` | Python stdlib; empat CSV publik lokal, bukan auth. | Menimpa `supabase/import-data.sql`, dapat membuat/menimpa gambar hasil hash di `public/assets/imported/`. Memvalidasi ID unik, angka finite/integer urutan, dan base64 PNG/JPEG/WebP. Tidak menjalankan SQL. Default batas field CSV biasa terlalu kecil untuk gambar; script menaikkannya ke 100 juta. |
| `scripts/generate-blog-seed-sql.mjs` | Helper seed di `lib/blog-seed.mjs`, JSON seed dan additions. | Menimpa `supabase/blog-seed.sql`. Log singkat hanya menyebut JSON meskipun helper juga mengambil tambahan artikel. Tidak mengimpor ke database. |
| `scripts/render-meta-ad.mjs` | `sharp`, logo lokal `assets/`; jalankan dari root repo. | **Menghapus rekursif** `/tmp/aplikasid-meta-ad-frames`, lalu membuat 450 PNG 1080 × 1920 untuk video 15 detik/30 fps; membuat folder `output/`, belum menghasilkan MP4. |
| `scripts/render-deadline-reels.mjs` | `sharp`, logo lokal dan `output/aplikasid-deadline-opening-stock.jpg`. | **Menghapus folder frame /tmp yang sama**, membuat 450 frame alternatif. Jangan dijalankan bersamaan dengan render lain atau encoder yang membaca folder itu. |
| `scripts/encode-meta-ad.swift` | macOS Swift + AVFoundation/CoreGraphics/CoreVideo/ImageIO; 450 frame di folder /tmp tersebut. | H.264 MP4 1080 × 1920 30 fps, default `output/aplikasid-meta-ad-15s.mp4`; **menghapus file output yang sudah ada** terlebih dahulu. |
| `scripts/mix-meta-ad-audio.py` | Python stdlib; WAV narasi PCM 16-bit lokal (argumen pertama/default /tmp). | Menulis/menimpa WAV stereo 44,1 kHz sepanjang 15 detik; resample narasi, musik sintetis, ducking, limiter. Output argumen kedua/default `/tmp/aplikasid-meta-ad-mix.wav`. |
| `scripts/attach-meta-ad-audio.swift` | macOS Swift + AVFoundation; argumen video, audio, output. | Menggabungkan durasi video dan audio lalu mengekspor MP4; **menghapus file output** terlebih dahulu. Tidak memvalidasi kelengkapan argumen sebelum mengaksesnya. |

SQL hasil generator hanya file sampai seseorang menerapkannya di Supabase. Baca SQL dan identifikasi project tujuan sebelum mengeksekusi. Kedua renderer video memakai direktori /tmp tetap sehingga outputnya saling menggantikan. Materi `output/` adalah artefak iklan, tidak dipublikasikan storefront otomatis. Screenshot `referensi/image.png` dan `image1.png` adalah referensi visual Arkasoft; bukan kode aplikasi aktif.

## Dependency dan perintah

Versi yang tersimpan dalam `package-lock.json` (lockfile v3) pada audit:

| Paket | Versi lock | Deklarasi package.json |
| --- | --- | --- |
| Next.js | 16.4.3 (dari 16.4.0, 25 Okt 2026) | `latest` |
| React / React DOM | 19.2.8 / 19.2.8 | `latest` |
| `@supabase/supabase-js` | 2.117.0 | `^2.117.0` |
| `react-markdown` | 10.1.0 | `^10.1.0` |
| `remark-gfm` | 4.0.1 | `^4.0.1` |

Paket Next mensyaratkan Node >= 20.9.0. Karena Next/React memakai `latest`, pertahankan lockfile dan gunakan `npm ci` untuk lingkungan baru yang harus mereproduksi dependency saat ini; `npm install` bisa mengubah resolusi/lock jika kondisi dependency berubah. Jangan melakukan upgrade sekalian dengan perbaikan fitur kecil.

`sharp` 0.35.5 tersedia dalam lock sebagai optional dependency Next (`^0.35.4`), tetapi **bukan dependency langsung proyek** walaupun renderer iklan mengimpornya langsung. Instalasi dengan optional dependencies dihilangkan atau native package tidak tersedia dapat membuat script iklan gagal. Python/Swift dan stok/narasi lokal tidak dipasang oleh npm.

Perintah utama:

```sh
npm ci
npm run dev
npm test
npm run build
npm start
```

`npm start` memerlukan build lebih dulu. **`npm run lint` saat ini rusak**: script berisi `next lint`, sementara CLI Next lokal sudah tidak menyediakan perintah itu. Verifikasi audit menghasilkan `Invalid project directory .../lint`. Panduan lokal menyarankan linter CLI tersendiri; `next build` versi 16 juga tidak menjalankan lint otomatis. Kegagalan ini sudah ada sebelum handoff dan tidak diperbaiki oleh pembuatan dokumentasi.

## Peta file dan unit test relevan

Semua test otomatis utama memakai `node:test`/`assert`; `npm test` menjalankan `tests/*.test.mjs`. Untuk fitur baru, tambahkan unit test sesuai `AGENTS.md`; jangan menganggap build pengganti unit test.

| Bagian | File implementasi utama | Test yang dibaca/dirujuk |
| --- | --- | --- |
| Scroll editor admin | `lib/admin-scroll.mjs`, `app/adminn/page.js` | `tests/admin-scroll.test.mjs` |
| Toggle akun | `lib/account-feature.mjs`, `app/akun/page.js`, form dashboard | `tests/account-feature.test.mjs` |
| Upload katalog | `lib/product-image-upload.mjs`, wrapper `.js`, dashboard | `tests/product-image-upload.test.mjs` |
| Link Drive/mapping | `lib/product-downloads.mjs`, download editor/API | `tests/product-downloads.test.mjs`, `tests/product-downloads-rls.mjs` |
| Pencarian pembelian | `lib/purchase-lookup.mjs`, akun/API | `tests/purchase-lookup.test.mjs`, `tests/lynk-orders-rls.mjs` |
| Blog admin/publik | `lib/blog.mjs`, `lib/blog-data.mjs`, `lib/blog-pagination.mjs` | `tests/blog.test.mjs`, `tests/blog-data.test.mjs`, `tests/blog-pagination.test.mjs` |
| Isi seed/produk terkait | `lib/blog-seed.mjs`, `lib/blog-product-links.mjs` | `tests/blog-seed.test.mjs`, `tests/blog-product-links.test.mjs` |
| Klik di luar widget | `lib/chat-widget.mjs`, widget | `tests/chat-widget.test.mjs` |
| Request/konteks chat | `lib/chat.mjs`, client helper/API | `tests/chat.test.mjs` |
| Google Analytics | `app/layout.js` | `tests/google-analytics.test.mjs` |
| Meta PageView | `lib/meta-pixel.mjs`, layout, route tracker | `tests/meta-pixel.test.mjs` |
| SEO umum | `lib/seo.mjs`, robots/sitemap | `tests/seo.test.mjs` |
| Presentasi katalog/responsive | helper presentasi, storefront/CSS | `tests/product-presentation.test.mjs`, `tests/product-card-mobile-layout.test.mjs`, `tests/hero-mobile-layout.test.mjs`, `tests/catalog-seo.test.mjs` |

File RLS bernama `*-rls.mjs` **tidak termasuk glob `npm test`** dan memerlukan PGlite; lihat `supabase/README.md` dan dokumen status untuk cara/hasil audit terpisah. Unit test source/helper tidak setara verifikasi klik UI lengkap, event analytics diterima provider, bucket production, atau transaksi checkout nyata.

## Cakupan audit ini

Dibaca: seluruh file `app/adminn/`, `app/akun/`, `app/login/`; chat widget, root layout, analytics tracker; helper admin-scroll/Meta/SEO; metadata robots/sitemap/social image; seluruh delapan script; Apps Script referensi; prototipe HTML/JS/CSS/Python; struktur/dependency package dan lock; Next config; VS Code settings; empat CSV publik (struktur/data publik tanpa menyalin gambar panjang); daftar dan kesamaan hash aset. File auth CSV, nilai environment lokal, isi rahasia, serta konfigurasi layanan production tidak dibuka oleh audit bagian ini. Tidak ada script migrasi, renderer, atau request remote yang dijalankan.
