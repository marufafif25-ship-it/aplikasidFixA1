# Konfigurasi, setup, dan status serah terima

Snapshot lokal **22 Oktober 2026, Asia/Jakarta**, basis Git `294cc41`, branch `main`. Kondisi production dan dashboard layanan tidak diperiksa. Gunakan [HANDOFF_CLAUDE.md](../../HANDOFF_CLAUDE.md) sebagai pintu masuk.

## Runtime dan dependency

| Komponen | Terpasang saat audit |
| --- | --- |
| Node.js / npm lokal | 24.21.0 / 11.19.0 |
| Next.js | 16.4.3 (dinaikkan dari 16.4.0 pada 25 Okt 2026, advisory critical) |
| React / React DOM | 19.2.8 / 19.2.8 |
| Supabase JS | 2.117.0 |
| react-markdown / remark-gfm | 10.1.0 / 4.0.1 |

`package.json` memakai `latest` untuk Next/React, tetapi `package-lock.json` mencatat versi terkunci. Gunakan `npm ci` untuk clone baru dengan lock yang ada; jangan memperbarui dependency hanya untuk memahami proyek. Panduan Next lokal menyebut minimum Node 20.9, tetapi dependency lain juga memiliki kebutuhan engine; Node 24.21.0 adalah versi yang benar-benar diuji di snapshot ini.

Tidak ada TypeScript app, ORM, test browser, ESLint config, CI workflow, atau konfigurasi provider deploy dalam file yang terdaftar Git. Node test runner dipakai langsung, tanpa Jest/Vitest.

## Env: nama lengkap dan kondisi lokal

Nilai rahasia tidak disalin di sini. Status “terisi” hanya membuktikan ada nilai di `.env.local`, bukan bahwa key valid, punya akses, atau cocok dengan production. Nama alias diperiksa juga.

| Variabel | Pemakai / fungsi | Kondisi `.env.local` saat audit |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase.js`, `lib/storefront-server.js`, `lib/supabase-service.js`, route webhook; URL project | Terisi |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client browser dan server biasa; public key dengan RLS | Terisi |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Alias lama public key, dipakai jika publishable key tidak ada | Tidak ada; tidak diperlukan jika nama utama terisi |
| `SUPABASE_SECRET_KEY` | Webhook, pencarian pembelian, daftar transaksi/pemetaan admin melalui client server | **Tidak ada; diperlukan untuk fitur transaksi nyata** |
| `SUPABASE_SERVICE_ROLE_KEY` | Alias lama secret server, dipakai jika nama utama tidak ada | **Tidak ada** |
| `LYNK_MERCHANT_KEY` | Verifikasi signature `POST /api/webhook/lynk` | Terisi |
| `SUMOPOD_API_KEY` | `lib/chat.mjs` melalui `app/api/chat/route.js`; server-only | Terisi |
| `SUMOPOD_MODEL` | Pemilihan model chat | Terisi; default kode `gpt-4o-mini` |
| `SUMOPOD_BASE_URL` | Endpoint OpenAI-compatible untuk chat | Terisi; default kode `https://ai.sumopod.com/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, metadata, sitemap di `lib/seo.mjs` | Tidak ada; fallback kode `https://www.aplikasid.com` |

Variabel pendukung di luar runtime storefront:

| Variabel | Fungsi |
| --- | --- |
| `LEGACY_PRODUCTS_API_URL` | Hanya `scripts/export-sheet.mjs`, URL deployment Apps Script lama. Tidak dibutuhkan aplikasi Next saat ini. |
| `PGLITE_MODULE` | Hanya dua test RLS; override lokasi modul PGlite. Jika tidak diisi, mencoba `@electric-sql/pglite`. |

Template `.env.example` sudah berisi konfigurasi runtime dan komentar alias. Tidak ada variabel baru yang ditambahkan dalam serah terima ini. Google Analytics, Meta Pixel, dan verifikasi Search Console dikonfigurasi dalam source/file publik, bukan env.

### Melanjutkan di laptop yang sama

Gunakan `.env.local` yang sudah ada. Claude dengan akses repo lokal dapat membaca atau menggunakan konfigurasi ketika debugging integrasi memang memerlukannya. Hindari mencetak semua env, menempel key ke chat, atau memasukkannya ke dokumen/commit. Untuk memeriksa keberadaan env, cukup tampilkan nama dan boolean ada/tidak; untuk memeriksa layanan, gunakan hasil operasi yang tidak membocorkan token.

`SUPABASE_SECRET_KEY`/alias yang hilang perlu diisi **jika menguji transaksi nyata secara lokal**. Ambil key dari project Supabase yang benar, masukkan ke file lokal dan env hosting secara privat. Jangan menaruhnya pada `NEXT_PUBLIC_*`. Restart dev server setelah perubahan env. Variabel `NEXT_PUBLIC_*` dapat masuk bundle saat build; hosting perlu build/deploy ulang setelah konfigurasinya berubah.

### Berpindah komputer atau memakai Claude web

Git tidak membawa `.env.local`, `SpreadsheetYangLama/*auth*.csv`, `node_modules/`, `.next/`, dan `output/`. Clone repo memberi source dan template env, bukan semua konfigurasi. Pindahkan env yang diperlukan secara privat ke komputer/hosting tujuan. Password admin dibuat/dikelola melalui Supabase Auth; akun spreadsheet lama bukan akun admin Next.

Claude web tidak otomatis mendapat akses laptop, Supabase, Lynk, atau hosting. Berikan dokumen dan source relevan; kerjakan konfigurasi key di panel layanan atau file lokal, tanpa menyebarkannya bersama arsip source.

## Menjalankan aplikasi

```sh
npm ci
npm run dev
```

Buka URL yang dicetak Next (default `http://localhost:3000`). Route penting: `/`, `/kategori`, `/produk/[id]`, `/blog`, `/panduan`, `/adminn`; `/akun` mengarah ke beranda jika toggle akun belum boolean `true`.

Untuk clone baru, jika `.env.local` belum ada, buat dari `.env.example` dan isi URL/public key terlebih dahulu. Jangan menjalankan penyalinan template di atas env yang sudah berisi key. Build dapat selesai meskipun integrasi transaksi belum dikonfigurasi; mengakses fitur yang membutuhkan key server baru menguji bagian tersebut.

## Database dan aktivasi layanan

Urutan dependensi migrasi (bukan perintah yang otomatis harus dijalankan ulang ke production):

1. `supabase/schema.sql` untuk katalog/settings/FAQ serta tabel keanggotaan role `admin_users` dan policy dasar.
2. Buat/konfirmasi user admin di Supabase Auth; isi `admin_users` dengan UUID user yang benar dan role `owner`/`admin` (contoh pada README).
3. `supabase/import-data.sql` hanya untuk impor awal yang memang dibutuhkan; ID yang sudah ada tidak ditimpa. Periksa snapshot sebelum menjalankan.
4. `supabase/product-images.sql` setelah schema untuk bucket publik dengan izin tulis admin.
5. `supabase/lynk-orders.sql` dan `supabase/product-downloads.sql` untuk transaksi/unduhan; policy product-downloads memeriksa role pada tabel `admin_users` dari schema.
6. `supabase/blog-posts.sql`, kemudian `supabase/blog-views.sql`; `supabase/blog-seed.sql` hanya jika perlu menambah 30 artikel seed yang belum ada.
7. Isi env server hosting, cocokkan URL webhook/merchant key di Lynk, siapkan pemetaan `items[].uuid` ke link Drive melalui `/adminn`, lalu verifikasi alur yang memang diaktifkan.

Rincian kontrak dan RLS ada di [Backend dan data](BACKEND_DAN_DATA.md), langkah manual di [supabase/README.md](../../supabase/README.md). Jangan menganggap semua migrasi sudah berjalan hanya karena file SQL tersedia.

## Hasil verifikasi lokal

| Pemeriksaan | Hasil saat serah terima | Batas |
| --- | --- | --- |
| `npm test` | **Lulus: 95/95**, gagal 0, skipped 0 | Menjalankan `tests/*.test.mjs`, umumnya memakai dependency tiruan. Dua file RLS di luar glob. |
| `npm run build` | **Lulus**, Next.js 16.4.0 Turbopack; diulang lulus pada 16.4.3 (25 Okt 2026) | Kompilasi/prerender lokal. Bukan pengujian alur pembayaran, chat berbayar, atau akses admin production. |
| `npm run lint` | **Gagal**, exit 1: `Invalid project directory .../lint` | Script masih `next lint`; CLI terpasang tidak mendukungnya. Belum diperbaiki dalam pekerjaan dokumentasi ini. |
| `node tests/lynk-orders-rls.mjs` dengan `PGLITE_MODULE` | **Lulus**, exit 0 | Migrasi ulang, idempotensi, isolasi email/role dan penolakan akses yang tidak berhak pada PGlite lokal. |
| `node tests/product-downloads-rls.mjs` dengan `PGLITE_MODULE` | **Lulus**, exit 0 | Migrasi ulang, izin admin, isolasi pelanggan/anon, batas keterangan dan akses server pada PGlite lokal. |

### Menjalankan test

```sh
npm test
node --test tests/product-presentation.test.mjs tests/catalog-seo.test.mjs
node --test tests/lynk-webhook.test.mjs tests/purchase-lookup.test.mjs tests/product-downloads.test.mjs
node --test tests/chat.test.mjs tests/chat-widget.test.mjs
npm run build
```

Dua test RLS tidak termasuk `npm test` dan membutuhkan dependency PGlite yang tidak ada dalam package aplikasi. Instal terpisah agar tidak mengubah dependency proyek:

```sh
npm install --prefix /tmp/aplikasid-handoff-db-check --no-audit --no-fund --package-lock=false @electric-sql/pglite
PGLITE_MODULE=/tmp/aplikasid-handoff-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/lynk-orders-rls.mjs
PGLITE_MODULE=/tmp/aplikasid-handoff-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/product-downloads-rls.mjs
```

Kedua perintah RLS di atas dijalankan dan lulus pada audit ini. PGlite dipasang hanya di `/tmp/aplikasid-handoff-db-check`, tanpa mengubah `package.json` atau lockfile proyek. Direktori `/tmp` dapat dibersihkan sistem; ulangi instalasi terpisah bila modul sudah tidak ada.

Perubahan serah terima ini hanya dokumentasi; tidak menambah fitur runtime sehingga tidak ditambahkan test yang hanya menguji teks panduan.

## Riwayat perubahan terakhir yang relevan

| Commit | Tujuan perubahan menurut riwayat Git |
| --- | --- |
| `294cc41` | Memperjelas platform, kegunaan, versi dan rincian pembelian produk. |
| `49a04d7` | Menampilkan judul produk mobile secara utuh. |
| `29ae232` | Menambah tautan produk terkait untuk seluruh 30 artikel Blog. |
| `e6d07b0` | Memperbarui dependency setelah audit saat itu; bukan bukti audit terbaru. |
| `9e94155` | Menambah Views Blog yang diisi manual dari Google Analytics. |
| `dc2eb7a` | Menambah artikel dan pagination indeks Blog. |

Snapshot awal workspace bersih. Pekerjaan serah terima ini memperbarui `CLAUDE.md`/`PROJECT_OVERVIEW.md` serta menambah `HANDOFF_CLAUDE.md` dan `docs/claude/`; source runtime, env, SQL, dependency, dan data tidak diubah. Tidak dibuat commit atau push dalam sesi ini.

## Temuan yang pasti, bukan dugaan backlog

- **Lint:** butuh konfigurasi dan perintah linter yang sesuai Next terpasang jika pemilik ingin memakai lint. `next build` sejak Next 16 juga tidak otomatis menjalankan lint (lihat docs lokal installation).
- **Domain:** `lib/seo.mjs` default `.com`; contoh URL webhook di `supabase/README.md` memakai `.my.id`. Domain aktif, DNS, redirect, dan konfigurasi Lynk perlu diperiksa di layanan jika tugas menyangkutnya.
- **Key server lokal:** belum ada dua nama secret Supabase di `.env.local`. Tidak menyimpulkan key hosting hilang.
- **Toggle akun:** mengatur visibilitas, bukan akses endpoint; pencarian email-only tetap bisa dipanggil langsung. Belum ada rate limiter aplikasi pada endpoint pembelian.
- **Limiter chat:** 20 permintaan/menit dan 3 bersamaan per proses, bukan agregat antarinstance. Ubah ke limiter bersama hanya bila kebutuhan deployment mengharuskannya.
- **Storage:** upload baru yang tidak jadi disimpan serta file produk yang dihapus tidak otomatis dibersihkan.
- **Migrasi/seed:** regenerasi SQL mengubah file lokal; SQL harus diterapkan terpisah. Seed memakai konflik yang mempertahankan data lama, sehingga mengganti source seed tidak memperbarui baris lama secara otomatis.
- **Legacy preview:** `server.py` menyajikan root proyek dengan CORS terbuka; jangan jadikan server ini hosting toko Next atau cara membagikan folder yang berisi env/arsip auth.

Belum diverifikasi: isi database production, daftar admin, bucket/policy yang sudah diterapkan, webhook delivery nyata, transaksi lama, mapping unduhan aktif, izin berbagi Drive, kuota/model Qwen nyata, dashboard analytics, domain/hosting/deployment, dan audit dependency terbaru. Tidak ada perubahan layanan atau data production dalam pekerjaan ini.
