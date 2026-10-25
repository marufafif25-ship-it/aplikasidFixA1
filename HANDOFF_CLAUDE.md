# Serah terima Aplikasid untuk Claude

Disusun dari source lokal pada **22 Oktober 2026 (Asia/Jakarta)**. Basis aplikasi: commit `294cc41` pada branch `main`. Panduan ini dibuat agar proyek bisa dilanjutkan tanpa riwayat percakapan dengan asisten sebelumnya. Dokumen tidak memuat nilai API key, password, data pembeli, atau salinan database production.

## Tujuan proyek

Aplikasid adalah storefront software berbahasa Indonesia dan sumber penghasilan pemiliknya. Pelanggan mencari software, melihat detail, lalu membeli melalui checkout Lynk.id. Toko menyediakan panduan, blog SEO, chat bantuan, dashboard admin, dan pencarian pembelian/link Google Drive. Jaga toko tetap berfungsi saat mengembangkan fitur; ikuti tampilan dan JavaScript yang ada.

Tidak ada tugas fitur baru atau rencana bisnis lanjutan yang diasumsikan dalam serah terima ini. Setelah memahami bagian relevan, kerjakan permintaan terbaru pemilik.

## Mulai dalam beberapa menit

1. Baca `AGENTS.md` dan dokumen ini. Untuk pekerjaan lintas fitur, baca `PROJECT_OVERVIEW.md`.
2. Jalankan `git status --short` agar perubahan pemilik tidak tertimpa.
3. Pilih panduan bagian terkait dari tabel di bawah; buka source/test yang disebutkan di sana.
4. Jika dependency sudah ada, jalankan `npm run dev`. Untuk clone baru gunakan `npm ci`, lalu siapkan `.env.local` dari `.env.example` **hanya jika file lokal belum ada**. Jangan menimpa env yang sudah terisi.
5. Tambah/perbarui unit test untuk fitur baru/perubahan perilaku, jalankan test relevan dan build bila menyentuh aplikasi Next.js.

| Kebutuhan | Dokumen yang dibaca berikutnya |
| --- | --- |
| Memahami arsitektur menyeluruh | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Beranda, pencarian, kategori, produk, blog, panduan | [Storefront dan konten](docs/claude/STORE_FRONT_DAN_KONTEN.md) |
| API, Supabase, pembayaran, unduhan, chat | [Backend dan data](docs/claude/BACKEND_DAN_DATA.md) |
| Dashboard, akun, analytics, SEO, script, file lama | [Admin dan operasional](docs/claude/ADMIN_DAN_OPERASIONAL.md) |
| Env, setup, hasil test/build, hal yang belum diverifikasi | [Konfigurasi dan status](docs/claude/KONFIGURASI_DAN_STATUS.md) |
| Mencari tanggung jawab suatu file | [Peta file](docs/claude/PETA_FILE.md) |
| Setup Supabase dan migrasi | [supabase/README.md](supabase/README.md) |
| Setup dan perilaku chat | [CHAT_SETUP.md](CHAT_SETUP.md) |

## Arsitektur dan alur uang

```text
Browser pembeli
  -> app/page.js -> lib/storefront-server.js -> Supabase
  -> app/storefront.js (pencarian, filter, modal, checkout, chat)
  -> buyUrl -> checkout eksternal Lynk.id

Lynk payment.received
  -> app/api/webhook/lynk/route.js -> lib/lynk-webhook.mjs
  -> lynk_orders (idempotensi ref_id)

Pembeli -> /akun -> POST /api/purchases
  -> lynk_orders berdasarkan email checkout + paid
  -> product_downloads berdasarkan items[].uuid
  -> link Drive untuk item yang dipetakan dan aktif

Admin -> /adminn -> Supabase Auth + admin_users
  -> API katalog/blog/unduhan dan Storage product-images

Chat publik -> POST /api/chat
  -> katalog + FAQ + panduan publik
  -> Qwen melalui endpoint SumoPod -> jawaban / fallback FAQ
```

Source of truth data aktif ada di Supabase. Repo menyimpan kode, definisi panduan, migrasi, seed artikel dan snapshot migrasi katalog. Membaca repo tidak mengunduh isi database atau membuktikan bahwa schema production sama dengan SQL lokal.

## Aturan bisnis dan perilaku penting

- **Katalog:** tabel `products` memiliki `id`, `data` JSONB, dan `sort_order`. ID dipakai pada `/produk/[id]`; ubah judul tanpa mengganti ID. Harga dalam rupiah. Jangan membuat klaim lisensi, kompatibilitas, garansi, atau stok yang tidak ada dalam data pemilik.
- **Presentasi produk:** judul ringkas; `os`, `versions`, `description`, `compatibility`, dan `specs` menyimpan konteks lainnya. Helper `lib/product-presentation.mjs` menjaga normalisasi platform dan pencarian (judul/kategori/platform/versi/deskripsi/specs; `compatibility` belum ikut). Dua kolom kartu mobile dan judul utuh sudah punya regression test.
- **Checkout:** tombol menggunakan `buyUrl`; `lib/checkout.js` memvalidasi HTTP(S). UI tidak membuat pembayaran atau keranjang pembayaran sendiri.
- **Webhook:** signature SHA-256 memakai grandTotal + refId + message_id + merchant key sesuai implementasi; ini bukan HMAC raw body. Duplikat `ref_id` tidak boleh menimpa pemilik transaksi. `grandTotal` adalah hasil bersih penjual, bukan otomatis nominal yang dibayar pembeli.
- **Unduhan:** `product_downloads.lynk_item_id` harus sama persis dengan `lynk_orders.items[].uuid`. ID katalog, judul, dan kode URL checkout bukan bukti kecocokan. Pemetaan link Drive dikelola manual sekali per ID item; pembelian sebelum webhook aktif tidak otomatis tersedia.
- **Akun pembeli:** email checkout adalah satu-satunya bukti pencarian saat ini. Tidak ada login, password, OTP, atau verifikasi email pembeli dalam alur UI ini. Jangan menyatakan alurnya terverifikasi identitas.
- **Toggle akun:** hanya boolean `true` mengaktifkan menu/halaman/chat. Toggle tersebut tidak menutup `POST /api/purchases`; endpoint masih bisa dipanggil langsung.
- **Admin:** route `/adminn` memang benar. Supabase Auth + role `admin`/`owner` + RLS mengatur akses. Kredensial spreadsheet lama tidak dimigrasikan menjadi akun admin.
- **Cache:** `getStorefront()` meng-cache hasil 60 detik, tag `storefront`; API katalog melakukan `revalidateTag("storefront", { expire: 0 })`. SQL langsung mengikuti TTL. Blog publik memakai pembacaan database `no-store`.
- **Blog:** hanya artikel terbit tampil publik/sitemap, 9 per halaman. Slug artikel dikunci setelah dibuat dari dashboard. Views dimasukkan manual dari Google Analytics. Related products 30 artikel awal memakai pemetaan di `lib/blog-product-links.mjs`; mengikuti katalog dan gagal secara opsional jika katalog bermasalah.
- **Chat:** hanya konteks publik, tidak menerima transaksi, link Drive privat, atau key. FAQ/WhatsApp menjadi fallback. Tidak punya akses untuk memeriksa status pesanan atau mengubah pembelian. Riwayat hanya selama halaman terbuka.
- **Kontak:** layanan pelanggan memakai WhatsApp footer. Email toko sengaja tidak ditampilkan sebagai kanal CS.
- **Aset:** Next melayani `/assets/...` dari `public/assets/`; root `assets/` menyimpan aset sumber/arsip. Upload admin baru ke Supabase Storage, maksimal 5 MB; base64 lama masih didukung.

## Lokasi yang sering perlu diubah bersama

| Perubahan | Baca source/test ini bersama |
| --- | --- |
| Kartu/judul/pencarian produk | `app/storefront.js`, `app/catalog-product-card.js`, `app/globals.css`, `app/catalog-pages.css`, `lib/product-presentation.mjs`, test mobile/presentasi |
| Field produk/admin | `app/adminn/page.js`, `lib/products-api.js`, `app/api/catalog/route.js`, pemakai field di halaman produk/SEO/chat |
| Pembayaran dan akses pembelian | `lib/lynk-webhook.mjs`, `lib/purchase-lookup.mjs`, `lib/product-downloads.mjs`, route API terkait, `app/akun/`, SQL, test webhook/purchase/download/RLS |
| Chat | `app/chat-widget.js`, `lib/chat.mjs`, `lib/chat-client.mjs`, `lib/chat-widget.mjs`, `app/api/chat/route.js`, `CHAT_SETUP.md`, test chat |
| Artikel baru/SEO blog | `lib/blog.mjs`, `lib/blog-data.mjs`, `lib/blog-product-links.mjs`, `app/blog/`, `app/sitemap.js`, test blog/SEO |
| Domain/analytics | `lib/seo.mjs`, `app/layout.js`, `lib/meta-pixel.mjs`, `app/meta-pixel-page-views.js`, `public/google6bdd09b63391827f.html`, test SEO/analytics |

## Konfigurasi yang sudah tersedia

File `.env.local` ada di folder kerja asli, diabaikan Git. Saat pemeriksaan, URL/publishable key Supabase, merchant key Lynk, dan konfigurasi Qwen terisi. **Key server Supabase belum ada secara lokal**; webhook/pencarian pembelian nyata memerlukannya. Hosting bisa memiliki konfigurasi berbeda dan belum diperiksa.

Nama, alias, lokasi pemakaian, dan cara memeriksa env tanpa menampilkan nilainya tersedia di [Konfigurasi dan status](docs/claude/KONFIGURASI_DAN_STATUS.md). Claude dengan akses filesystem lokal dapat memakai file env tersebut saat diperlukan. Claude web tidak otomatis memiliki file lokal atau env hosting. Saat berpindah komputer, pindahkan env secara privat; berikan kebutuhan konfigurasi kepada asisten tanpa menaruh key di pesan atau source.

## Hasil pemeriksaan dan pekerjaan yang perlu diketahui

- `npm test`: **95 test lulus, 0 gagal** pada 22 Oktober 2026.
- `npm run build`: **lulus**, Next.js 16.4.0 / React 19.2.8.
- `npm run lint`: **gagal** karena script `next lint` sudah tidak tersedia pada CLI terpasang. Belum ada konfigurasi linter pengganti dalam repo.
- Dua pengujian RLS transaksi dan unduhan: **keduanya lulus** di PGlite terisolasi; rincian dan batas verifikasi ada di dokumen konfigurasi/status.
- Domain canonical default `.com`, sedangkan contoh URL webhook di README memakai `.my.id`; periksa pengaturan Lynk/hosting sebelum mengubah domain atau deploy.
- Limiter chat hanya per proses (20/menit, 3 bersamaan). Pencarian pembelian belum memiliki limiter aplikasi. Ini kondisi implementasi, bukan tugas perubahan yang otomatis diminta.
- Upload yang tidak jadi disimpan dan gambar produk yang dihapus tidak otomatis dibersihkan dari Storage.
- Tidak ada konfigurasi deploy/CI yang terdaftar di Git; jangan menebak provider hosting, kredensial admin, migrasi yang sudah diterapkan, kuota provider, atau kondisi production dari repo.

## Bekerja dengan Claude gratis atau konteks kecil

Untuk **Claude Code di folder yang sama**, `CLAUDE.md` menjadi pintu masuk instruksi dan mengimpor `AGENTS.md`. Minta Claude membaca dokumen bagian terkait sebelum mengerjakan tugas.

Untuk **Claude web**, tempel dokumen ini atau lampirkan bersama `AGENTS.md`. Kirim dokumen bagian dan source/test yang relevan sesuai tugas. Semua file proyek tidak perlu dimasukkan dalam satu pesan. Lampirkan isi file yang diminta; jangan menganggap Claude web sudah bisa membaca folder laptop.

Prompt awal siap salin:

```text
Kamu melanjutkan proyek Aplikasid, storefront software Next.js + Supabase
berbahasa Indonesia dan sumber penghasilan saya. Baca CLAUDE.md,
AGENTS.md, HANDOFF_CLAUDE.md, lalu panduan docs/claude yang terkait tugas.
Untuk pekerjaan lintas fitur baca PROJECT_OVERVIEW.md juga.

Source terbaru adalah acuan. Sebelum mengedit, jelaskan singkat alur yang
terkait dan baca implementasi serta testnya. Ikuti aturan Next.js lokal,
jaga alur checkout Lynk, ID item unduhan, otorisasi admin, dan rahasia server.
Tambahkan unit test untuk fitur baru; laporkan hasil test dan batas verifikasi.
Jika kamu hanya memakai Claude web, minta file relevan yang belum saya lampirkan.

Tugas saya sekarang: [tulis kebutuhan berikutnya di sini].
```

Setelah menyelesaikan tugas, catat perubahan dan hasil test di pesan akhir. Bila sesi akan berakhir, minta Claude membuat catatan singkat: permintaan pemilik, file berubah, keputusan penting, test terakhir, dan pekerjaan tersisa. Perbarui panduan hanya jika fakta proyek berubah; jangan menyimpan rahasia atau data pelanggan di catatan sesi.
