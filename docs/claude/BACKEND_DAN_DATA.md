# Backend, integrasi, dan data Aplikasid

Catatan ini disusun dari source repository pada 22 Oktober 2026. Ini menjelaskan implementasi yang tersedia, bukan konfirmasi bahwa environment hosting, migrasi database, webhook, kuota AI, atau data production sudah sesuai. Mulai dari `AGENTS.md` dan `PROJECT_OVERVIEW.md`; untuk perubahan Next.js baca panduan lokal yang relevan di `node_modules/next/dist/docs/` sebelum mengubah kode.

Tidak ada nilai kredensial lokal yang disalin ke dokumen ini. Nama variabel, lokasi penggunaannya, kontrak API, serta cara diagnosis dijelaskan agar pekerjaan bisa diteruskan dari workspace yang sama. `.env.local` tetap file konfigurasi lokal dan tidak perlu dimasukkan ke dokumen, chat, atau Git.

## 1. Alur bisnis dan sumber kebenaran

```text
Pembeli → halaman Next.js → getStorefront() → Supabase publik (cache 60 detik)
Pembeli → buyUrl → checkout Lynk.id
Lynk → POST /api/webhook/lynk → validasi signature → lynk_orders
Admin → Supabase Auth → role admin_users → CRUD API / Storage
Admin → product_downloads: ID item Lynk → judul, keterangan, link Drive
Pembeli → /akun → POST /api/purchases → service Supabase → order paid + unduhan
Pengunjung → POST /api/chat → katalog/FAQ/panduan publik → Qwen via SumoPod
Pengunjung → /blog → query blog_posts terbit → Markdown + metadata/JSON-LD
```

- Data katalog aktif ada di Supabase, bukan `lib/products.js`, `app.js`, CSV, atau `supabase/import-data.sql` yang ada di checkout Git.
- `products.id` adalah ID katalog/URL halaman produk. `items[].uuid` dari webhook Lynk adalah ID pembelian. Keduanya **tidak otomatis sama**. Pemetaan unduhan memakai `product_downloads.lynk_item_id = items[].uuid` secara persis.
- Checkout dan distribusi awal dari Lynk berjalan di luar server aplikasi. Backend ini mencatat pemberitahuan pembayaran, bukan memproses pembayaran atau mengambil file/link unduhan langsung dari Lynk.
- Pembelian lama sebelum webhook aktif tidak otomatis tersedia di `/akun`. Tidak ada backfill transaksi dalam kode endpoint ini.
- **Akses pembelian berbasis email checkout adalah pilihan pemilik yang disengaja.** Tidak memakai login pembeli, OTP, atau verifikasi kepemilikan email. Mengetahui email cukup untuk meminta transaksi dan link yang cocok.

## 2. Peta modul dan batas kepercayaan

| File | Peran dan hal yang perlu diingat |
| --- | --- |
| `lib/supabase.js` | `getSupabase()` membuat singleton Supabase dengan URL/key publik. Dipakai sesi Supabase Auth browser dan query yang dibatasi RLS. Pesan konfigurasi hilang meminta isi `.env.local`. |
| `lib/storefront-server.js` | `serverSupabase(token?)` membuat client publik server dengan bearer opsional, sesi tidak dipersisten, fetch `no-store`, timeout 10 detik. `getStorefront()` membungkus tiga query dengan cache Next. |
| `lib/supabase-service.js` | `import "server-only"`; client secret/service role hanya server, tanpa sesi persisten, fetch `no-store`, timeout 10 detik. Untuk pencarian pembelian dan daftar item transaksi di admin unduhan. |
| `lib/products-api.js` | Adapter browser untuk baca produk/settings/FAQ, login/logout, baca role sendiri, dan mutation `/api/catalog` memakai access token sesi. |
| `lib/lynk-webhook.mjs` | Validasi hash signature, body, event, dan whitelist field transaksi; dependency `savePurchase` bisa ditiru di unit test. |
| `lib/purchase-lookup.mjs` | Handler publik validasi email/page, pagination, ambil mapping unduhan, dan respons privat. Dependensi database diinjeksi oleh route. |
| `lib/product-downloads.mjs` | Pemeriksa URL Google Drive dan join aman ID item. Hasil respons sengaja membuang email, totals, harga, dan UUID internal. |
| `lib/account-feature.mjs` | Fitur aktif hanya bila `homepage.accountEnabled === true`. String `"true"` tidak mengaktifkannya. |
| `lib/chat.mjs` | Konfigurasi provider, instruksi, whitelist konteks, validasi, limiter, timeout, filter konten akhir, dan handler publik. |
| `lib/chat-client.mjs` | Batas input, potong riwayat menjadi pasangan utuh, dan pencocokan FAQ tanpa memanggil AI. |
| `lib/chat-widget.mjs` | Helper mendeteksi klik di luar widget; diuji terpisah dari React. |
| `lib/blog-api.js` | Adapter browser API admin blog dengan bearer dan `cache: "no-store"`. |
| `lib/blog-server.js` | Memanggil loader artikel terbit; lookup satu slug masih memuat daftar artikel lalu `.find()`. |
| `lib/blog-data.mjs` | Query ulang Supabase setiap pemanggilan, fallback migrasi tabel/kolom Views. Tidak memakai cache `storefront`. |
| `lib/blog.mjs` | Validasi artikel, slug, URL publik, Views, mapping snake_case database → camelCase aplikasi, waktu baca, JSON-LD. |
| `lib/blog-product-links.mjs` | Pilihan editorial slug artikel → ID produk aktif; artikel yang tidak dipetakan tidak memuat katalog, kegagalan katalog menghasilkan `null`. |
| `lib/catalog-images.js` dan `.json` | Penggantian pasangan gambar lama bila hash gambar persis masih cocok; edit admin berikutnya didahulukan. |
| `lib/product-image-upload.js` dan `.mjs` | Adapter browser + helper upload asli ke Storage dari sesi admin; bukan base64. |

### Kredensial dan konfigurasi

| Variabel | Dibaca oleh | Sifat |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Ketiga jenis client Supabase dan route webhook | URL project; harus project yang sama dengan migrasi/data/Auth/Storage. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client publik browser/server | Key publik; fallback nama lama `NEXT_PUBLIC_SUPABASE_ANON_KEY`. RLS wajib tetap benar. |
| `SUPABASE_SECRET_KEY` | `serviceSupabase()` dan route webhook | Rahasia server; fallback nama lama `SUPABASE_SERVICE_ROLE_KEY`. Dapat melewati RLS, jangan kirim ke client. |
| `LYNK_MERCHANT_KEY` | Route/helper webhook | Rahasia untuk signature Lynk. |
| `QWEN_API_KEY` | `chatConfig(process.env)` di route chat | Rahasia server, dipakai header bearer provider. |
| `QWEN_MODEL` | Chat | Default source `qwen3.7-flash-2026-07-15`. Validasi nama harus berawalan `qwen` dan pola karakter terbatas. |
| `QWEN_BASE_URL` | Chat | Default source `https://ai.sumopod.com/v1`; harus HTTPS tanpa username/password/query/hash. |
| `NEXT_PUBLIC_SITE_URL` | `lib/seo.mjs` | Origin canonical SEO, default `https://www.aplikasid.com`. |

Gunakan `.env.example` sebagai nama/format konfigurasi. Restart dev server setelah mengganti env; isi env hosting secara terpisah. Memiliki file lokal tidak membuktikan env deployment sudah terisi. Untuk melanjutkan dari komputer yang sama Claude dapat menjalankan proyek memakai environment lokal tanpa menyalin nilainya ke berkas panduan.

Snapshot status konfigurasi lokal (nama variabel dan terisi/tidak, tanpa nilai rahasia) serta hasil verifikasi sesi handoff dicatat terpisah di `docs/claude/KONFIGURASI_DAN_STATUS.md`. Gunakan dokumen itu untuk diagnosis awal; tetap cek ulang env saat berpindah komputer/hosting.

## 3. Katalog, settings, admin, dan cache

`getStorefront()` menjalankan paralel:

1. `products`: `id,data,sort_order`, urut `sort_order` lalu `id`.
2. `site_settings`: `id,data`; hanya dua ID schema yaitu `homepage` dan `footer`.
3. `chat_faq`: hanya `active = true`, urut `sort_order`.

Satu query error membuat seluruh loader gagal dengan pesan umum. Tidak ada fallback ke katalog contoh/localStorage. Loader menggabungkan `products.data` dengan ID/urutan kolom sehingga ID/urutan kolom menjadi hasil akhir, menerapkan gambar pengganti, mengubah data URI gambar lama menjadi URL API dengan versi SHA-256 16 karakter, dan menghapus `footer.email` dari hasil server. FAQ juga digabung ID/urutan kolom serta `active: true`.

Cache Next: key `storefront-webp-v4`, umur revalidasi 60 detik, tag `storefront`. Mutation lewat `/api/catalog` memanggil `revalidateTag("storefront", { expire: 0 })` agar pembacaan berikutnya mengambil data baru. Update langsung lewat SQL Editor/Supabase mengikuti cache 60 detik. Fetch Supabase di dalam loader tetap `no-store`; ini tidak meniadakan cache pembungkus Next. Produk tidak memiliki pagination pada query katalog sekarang; bila katalog berkembang, perhatikan batas jumlah baris Supabase yang dikonfigurasi pada project.

`lib/products-api.js` membaca produk di browser dengan urut `sort_order` saja (tanpa urut kedua `id` dan tanpa menambahkan `sortOrder` dari kolom). Dashboard mengatur ulang urutannya sendiri. `fetchHomepageSettings()`, `fetchFooterSettings()` membaca `site_settings.data` langsung; tidak melalui cache atau penghapusan `footer.email` pada loader server. Jangan taruh rahasia pada JSONB publik walau field tidak terlihat di UI.

### `POST /api/catalog`

Otorisasi: `Authorization: Bearer <access_token>` → `auth.getUser(token)` → baris `admin_users` sendiri dengan role `admin`/`owner`. Client mutation memakai **key publik + token admin**, bukan service role; RLS tetap berlaku.

| Body JSON | Efek |
| --- | --- |
| `{ action: "save_products", products: [...] }` | Array wajib tidak kosong; tiap item wajib memiliki `id` dan `title` string tidak kosong setelah dicek trim. Upsert ke `products`: ID asli, seluruh objek sebagai `data`, dan `sort_order = Math.trunc(Number(product.sortOrder) || 0)`. Ini tidak menghapus produk lain. |
| `{ action: "delete_product", id: "..." }` | Menghapus baris ID itu. Tidak memeriksa apakah baris pernah ada dan tidak menghapus Storage. |
| `{ action: "save_settings", id: "homepage" atau "footer", settings: {...} }` | Upsert objek settings; field `email` dibuang saat footer disimpan. Bukan partial merge database: payload menjadi objek settings yang baru. |

Respons sukses `200 { success: true }`. Tidak ada bearer/invalid session `401`, role tidak sesuai `403`, payload action/shape tidak sesuai `400`, database gagal atau exception `500`. JSON rusak masuk catch umum `500`, bukan `400`. Route ini belum memberi batas ukuran body eksplisit atau validasi seluruh field produk/harga/URL; jangan menganggap JSONB produk sudah dibersihkan oleh server. Seluruh `products.data` bisa dibaca publik lewat RLS. Tidak ada action mutation FAQ di endpoint ini.

Login dashboard memakai `authenticateAdmin(email,password)` → `signInWithPassword` → `getAdminUser`. User Auth tanpa role dikeluarkan lagi. Pembuatan role tidak tersedia di UI/API; tambah UUID user ke `admin_users` melalui SQL Editor sesuai `supabase/README.md`.

## 4. Pembayaran Lynk dan idempotensi

Sumber: `app/api/webhook/lynk/route.js`, `lib/lynk-webhook.mjs`, `supabase/lynk-orders.sql`.

### `POST /api/webhook/lynk`

Runtime Node.js. Tidak perlu sesi admin. Route harus memiliki URL Supabase + key server; helper memerlukan merchant key. Header yang dibaca `X-Lynk-Signature` (case-insensitive oleh API Headers).

Bentuk payload minimal yang dipakai:

```json
{
  "event": "payment.received",
  "data": {
    "message_action": "SUCCESS",
    "message_code": "0",
    "message_id": "id-pesan",
    "message_data": {
      "refId": "id-transaksi",
      "createdAt": "teks-timestamp-asal",
      "customer": { "email": "pembeli@example.com" },
      "items": [{ "uuid": "id-item-lynk", "title": "Produk", "price": 15000, "qty": 1 }],
      "totals": { "grandTotal": 12000, "totalPrice": 15000 }
    }
  }
}
```

Signature adalah SHA-256 string gabungan **tanpa separator** `${grandTotal}${refId}${message_id}${merchantKey}`, dibandingkan `timingSafeEqual`; bukan HMAC atas seluruh raw body. Signature wajib hex 64 karakter; `grandTotal` harus number finite; ref/pesan wajib string nonkosong. Pertahankan formula ini saat refactor integrasi. Secara implementasi, email dan item tidak termasuk string hash; jangan mendeskripsikannya sebagai autentikasi setiap byte payload.

Body dibaca streaming dengan batas **1.048.576 byte**. Urutan pemeriksaan: konfigurasi → parse body → signature → event → data pembayaran → simpan. Event lain hanya diabaikan **setelah** signature valid.

Validasi transaksi:

- `message_action === "SUCCESS"`, `message_code === "0"` (string).
- Email trim harus lolos pola sederhana dan panjang sumber maksimal 320; disimpan lowercase/trim. Ini bukan normalisasi alias Gmail atau verifikasi email.
- Ref ID dan message ID maksimal 256 karakter.
- Item 1–200; title string nonkosong, price number finite tidak negatif, qty safe integer minimal 1.
- Item yang disimpan hanya title (maksimal 500), uuid (string maksimal 256, atau `null`), price, qty. UUID tidak wajib; transaksi tanpa UUID bisa tersimpan tetapi item tidak bisa mendapat mapping unduhan.
- Totals hanya angka finite dari `affiliate`, `convenienceFee`, `discount`, `grandTotal`, `totalAddon`, `totalItem`, `totalPrice`, `totalShipping`. Nilai tertentu dapat negatif.
- **`grandTotal` adalah penerimaan bersih penjual, bukan total yang dibayar pelanggan.** Jangan gunakan field itu untuk label total pembayaran pembeli.
- `lynk_created_at` disimpan sebagai teks sumber maksimal 64 karena timestamp Lynk tidak selalu memiliki zona waktu. UI pembelian memakai `received_at` dari database dan menampilkannya WIB.
- Nama/alamat/telepon pelanggan, pertanyaan tambahan, dan raw payload tidak disimpan.

Database memakai `upsert(..., { onConflict: "ref_id", ignoreDuplicates: true })`. Pengiriman ulang tidak menimpa transaksi pertama, email pemilik, atau itemnya. Koreksi transaksi yang sudah ada juga tidak otomatis mengubah baris melalui retry webhook. `ref_id` primary key adalah batas idempotensi; `message_id` tidak punya unique constraint.

| Status | Arti |
| --- | --- |
| `200 { received: true }` | Transaksi berhasil disimpan, atau ref sudah ada sehingga insert diabaikan. |
| `200 { received: true, ignored: true }` | Event selain `payment.received` dengan signature valid. |
| `400` | JSON/body rusak atau data pembayaran tidak valid. |
| `401` | Signature salah/tidak ada/struktur field signature tidak valid. |
| `413` | Body melewati 1 MiB. |
| `500` | Simpan transaksi gagal; tidak diakui sebagai sukses. |
| `503` | Env Supabase server atau merchant key tidak tersedia. |

Log penolakan hanya diagnostik struktur boolean/tipe; tidak mencetak key, signature, atau customer. Client Supabase khusus route webhook belum menggunakan wrapper timeout 10 detik milik `serviceSupabase()`.

## 5. Unduhan dan akses pembelian

### `POST /api/purchases`

Sumber: route, `lib/purchase-lookup.mjs`, `lib/product-downloads.mjs`. Publik, tanpa bearer/login. Body `{ "email": "pembeli@example.com", "page": 0 }`. Page berbasis nol, default 0, wajib safe integer 0–10000; string angka tidak diterima. Email trim/lowercase, pola sederhana, maksimal 320 karakter. JSON dibaca sebagai teks lalu diperiksa panjang **2.048 karakter**, bukan pembatas streaming byte.

Handler meminta 11 order untuk halaman 10 order sehingga bisa menentukan `hasNext`. Query route selalu `customer_email = email_normalized` dan `payment_status = "paid"`, urut `received_at` turun lalu `ref_id` turun. Mapping hanya diambil untuk UUID unik dari **10 order yang ditampilkan**, lalu `.in(lynk_item_id, ids)` dan `active = true`. Client service role hanya berada di server.

```json
{
  "orders": [{
    "ref_id": "id-transaksi",
    "received_at": "timestamp-database",
    "items": [{
      "title": "Judul mapping atau judul item asal",
      "qty": 1,
      "description": "Keterangan mapping aktif atau string kosong",
      "drive_url": "https://drive.google.com/file/d/contoh/view"
    }]
  }],
  "hasNext": false
}
```

Jika tidak cocok/belum dipetakan/nonaktif/URL mapping tidak valid, `drive_url: null`, description kosong, title item asal tetap ada. Tidak pernah menebak dari judul produk, slug katalog, atau kode pendek checkout. URL diterima hanya HTTPS host tepat `drive.google.com`, tanpa port/credentials/whitespace, panjang maksimal 2.048 dan pathname lebih panjang dari `/`. Validasi URL tidak membuktikan file tersedia atau izin berbagi Drive benar.

Hasil tidak membocorkan customer_email, totals, price, atau UUID item. Respons `Cache-Control: private, no-store` dan `Referrer-Policy: no-referrer`. Sukses termasuk email tak ditemukan: `200 { orders: [], hasNext: false }`; input salah `400`; database/mapping error `503` dengan pesan umum. Kegagalan database tidak disamarkan sebagai pembelian kosong.

UI `app/akun/account.js` menyimpan email/hasil hanya di state selama halaman terbuka, tidak memasukkan ke URL atau localStorage, membatalkan request lama, dan membuka Drive dengan `noopener noreferrer`. `app/akun/page.js` mengarahkan ke `/` saat accountEnabled tidak true. **Toggle ini mengatur visibilitas halaman/navigasi/chat; API `/api/purchases` sendiri tidak memeriksa toggle dan tetap dapat dipanggil.** Endpoint saat ini tidak memiliki rate limiter, OTP, maupun pemeriksaan origin seperti chat. Jangan mengira menyembunyikan navigasi menonaktifkan pencarian API.

### `GET /api/admin/downloads`

Otorisasi token + user + role admin/owner. Jika salah/tidak ada menghasilkan `401` untuk semua kasus otorisasi. Query paralel:

- Mapping unduhan memakai client publik + token admin (RLS).
- `items` dari **1.000 transaksi terbaru** memakai service role, urut `received_at` turun.

Setiap UUID item menjadi kandidat satu kali (judul dari kemunculan terbaru); mapping tersimpan menimpa kandidat UUID sama dan tetap muncul walau transaksinya tidak ada dalam 1.000 terbaru. Hasil diurut judul, `200 { downloads: [...] }`. Kegagalan query/config `503`, dengan pesan untuk memeriksa migrasi dan key server. Semua respons `private, no-store`.

### `POST /api/admin/downloads`

Body satu objek lengkap `{ lynk_item_id, title, description, drive_url, active }`. Tidak ada `action` atau nested object. ID string nonkosong, maksimal 256; title string nonkosong maksimal 500; description wajib string maksimal 3.000 (boleh kosong); active wajib boolean; URL harus lolos `isDriveUrl`. ID, title, description di-trim saat disimpan; `drive_url` tidak di-trim sehingga whitespace ditolak. Body teks maksimal 8.192 karakter setelah dibaca penuh. Upsert satu baris berdasarkan ID. Sukses `200 { success: true }`, input/ukuran/JSON salah `400`, otorisasi `401`, simpan/exception `503`. Tidak tersedia endpoint DELETE; nonaktifkan mapping dengan `active: false` bila perlu.

Link Drive perlu disalin manual sekali per UUID produk Lynk. Mengubah link di dashboard Lynk tidak menyinkronkan `product_downloads`. UUID lama yang tidak muncul di 1.000 transaksi dapat ditambahkan manual dari item transaksi.

## 6. Chat AI, privasi konteks, dan fallback

Sumber: `app/api/chat/route.js`, `lib/chat*.mjs`, `CHAT_SETUP.md`. Endpoint `POST /api/chat`, runtime Node.js, `maxDuration = 90` untuk hosting yang mendukungnya. Publik tanpa sesi login. Body `{ messages: [{ role: "user", content: "Pertanyaan" }, ...] }`.

- Jumlah pesan ganjil 1–19, urut user/assistant bergantian dan selalu berakhir user. Role system dari browser ditolak.
- Setiap content string, tidak kosong setelah trim, panjang sumber maksimal 4.000 karakter.
- Body streaming maksimal 100.000 byte, JSON rusak `400`, terlalu besar `413`.
- Header Origin jika ada harus sama dengan `new URL(request.url).origin`; `Sec-Fetch-Site: cross-site` ditolak `403`. Request tanpa kedua header tetap boleh, jadi ini bukan autentikasi API.
- Limiter lokal **bersama semua pengunjung per proses**: 20 request/menit dan maksimal 3 aktif bersamaan; `429` bila penuh. Slot dilepas juga saat error. Validasi dilakukan sebelum limiter; kegagalan config/context/provider setelah acquire tetap menghitung kuota lokal. Banyak instance hosting tidak berbagi counter; limiter total perlu di gateway/shared store bila dibutuhkan.
- Katalog/FAQ memakai cache `getStorefront()` dan panduan dari `lib/guides.js`. Kegagalan load konteks menghasilkan error; bukan mengirim AI tanpa konteks.

Whitelist konteks model: 40 produk teratas berdasarkan kecocokan kata pesan user tiga terakhir pada title/category; flag `catalogPartial` bila katalog lebih besar. Setiap produk hanya title/category/os/versions/description/compatibility/price/specs publik dengan batas panjang; maksimal 6 specs. Maksimal 25 FAQ aktif (question/answer saja), 20 panduan (4 section masing-masing), kontak WhatsApp. Tidak mengirim order, email pelanggan, link unduhan, key, field admin sembarang, footer.email, atau FAQ nonaktif.

Instruksi model Bahasa Indonesia: fakta toko hanya dari referensi, maks 3 rekomendasi, cek kebutuhan/OS, arah pembelian katalog → checkout, ikuti metode checkout dan sarankan QRIS tanpa mengarang biaya, tidak mengaku memeriksa status pesanan. Akun Saya hanya direkomendasikan bila toggle true; kalau tidak ke WhatsApp. Pertanyaan umum/teknologi boleh dijawab dengan pengetahuan umum. Instruksi sumber/riwayat diperlakukan sebagai data, bukan aturan baru.

Provider dipanggil ke `${QWEN_BASE_URL}/chat/completions` dengan bearer server, `enable_thinking: false`, `max_tokens: 1200`, system instruction + riwayat. Tidak ada streaming token ke browser. Timeout fetch provider 60 detik, digabung abort request; abort/timeout menjadi `504`. Endpoint default/model adalah nilai yang terlihat di source; ketersediaan, harga, akses key, dan kuota provider perlu dicek pada akun SumoPod jika ada masalah.

Respons sukses `200 { content }`, `Cache-Control: no-store`. `401/403` provider dipetakan `503`; `429` provider tetap `429` dan Retry-After numerik valid dapat dimasukkan ke pesan; error provider umum `502`; konfigurasi hilang/endpoint/model salah `503`; internal/load konteks error `502`. Detail error/kredensial provider tidak dikirim kembali.

`finalChatContent()` hanya membaca `choices[0].message.content`, tidak field reasoning terpisah. Blok lengkap `<think>`, `<thinking>`, `<analysis>` dibuang. Output kosong, >4.000 karakter, `finish_reason: "length"`, tag tidak lengkap, atau pola analisis yang dikenali ditolak `502` agar UI fallback. Filter berbasis pola bukan jaminan mendeteksi semua reasoning, dan jawaban sah yang memakai pola serupa dapat ditolak.

Di browser, `chatRequestMessages()` mengambil 18 pesan riwayat terakhir + user baru, memotong content; riwayat harus dijaga dalam pasangan utuh oleh UI. Greeting dan kegagalan tidak masuk riwayat AI. FAQ exact question/keyword dicari oleh `findChatFaq`, tombol FAQ tidak memakai provider. Saat AI gagal UI menyediakan FAQ/pertanyaan populer/WhatsApp, dan jika tidak ada FAQ cocok pertanyaan bisa dikembalikan ke input. Riwayat hanya hidup selama halaman terbuka.

## 7. Blog dan artikel SEO

Artikel disimpan per baris `blog_posts`, bukan di field JSONB katalog. Public loader membaca published true, urut `published_at` turun lalu slug naik. `lib/blog-data.mjs` selalu query ulang: impor langsung terlihat pada request baru. Halaman artikel memanggil `connection()` dan merender `ReactMarkdown` + `remark-gfm` di server; tidak memasang plugin raw HTML. Metadata, `BlogPosting`, breadcrumb, sitemap hanya memakai artikel terbit. Indeks memakai pagination 9 artikel via `?page=` (helper `lib/blog-pagination.mjs`).

Fallback loader publik yang memang tersedia:

- Tabel belum ada (`42P01`/`PGRST205` atau pesan yang sesuai): daftar kosong.
- Kolom `views`/`views_updated_at` belum ada: ulangi query tanpa Views, hasil Views default 0.
- Error database lain: throw pesan umum, tidak kembali ke seed lokal.

API admin tidak memakai fallback ini; kolom/migrasi belum sesuai menghasilkan pesan `500`. `blog-posts.sql` terbaru sebenarnya sudah membuat/menambah kolom Views; `blog-views.sql` tetap migrasi upgrade terpisah dan aman diulang untuk database lama.

### Kontrak `GET/POST/DELETE /api/admin/blog`

Semua membutuhkan bearer yang valid dan role admin/owner, serta selalu `Cache-Control: private, no-store`. Tidak ada token/sesi salah `401`, role kurang `403`, error tidak tertangani `500`.

| Metode | Request dan efek | Respons khusus |
| --- | --- | --- |
| GET | Tanpa body; daftar seluruh draft dan published, urut `updated_at` turun. | `200 { posts: [...] }`; query/migrasi gagal `500`. |
| POST | `{ action: "save", isNew: boolean, post: {...} }`; validasi/normalisasi lalu upsert berdasarkan slug. | `200 { post }`; JSON/action/field salah `400`; isNew dan slug sudah ada `409`; edit slug tidak ditemukan `404`; baca/simpan gagal `500`. |
| DELETE | Query `?slug=slug-artikel`; pola lowercase/angka/hubung. | `200 { success: true }`; slug salah `400`, artikel hilang `404`, DB error `500`. |

Field `post`: `slug`, `title`, `excerpt`, `content`, `category`, `author`, `authorUrl`, `coverImageUrl`, `published`, `views`. Batas: judul 1–180, slug 1–120, excerpt 1–320, Markdown 1–100.000, kategori 1–80, penulis 1–120, authorUrl maksimal 500; published boolean. Category default `Tips Software`, author default `Aplikasi.id`. Slug kosong dibentuk dari judul, `&` → `dan`, lowercase ASCII/angka/hubung, aksen dibersihkan. URL author/gambar hanya HTTP(S) atau path lokal `/...` yang bukan protocol-relative `//...`. Views default 0; string digit/nonnegative safe integer diterima, pecahan/negatif tidak.

UI mengunci slug setelah pembuatan agar tautan stabil. API memilih baris target berdasarkan slug yang dikirim, tanpa operasi rename lintas slug. `published_at` dipertahankan saat tetap terbit; draft menyimpan `null`, sehingga unpublish lalu publish ulang mendapatkan waktu terbit baru. `updated_at` selalu sekarang. `views_updated_at` berubah bila angka Views berubah, atau diinisialisasi saat angka >0 dan belum punya timestamp. Views diisi manual dari Google Analytics, tidak ditambah per kunjungan dan tidak disinkronkan otomatis; nilai 0 tidak ditampilkan publik.

Artikel seed: `lib/blog-seed.json` berisi 10 artikel, `lib/blog-seed-additions.mjs` menambah 20; `lib/blog-seed.mjs` menyatukan array baris Markdown dan menghasilkan `supabase/blog-seed.sql`. Seed SQL 30 artikel terbit, `published_at`/`updated_at = now()` saat impor, `ON CONFLICT (slug) DO NOTHING`. Mengubah seed lalu menjalankannya ulang tidak memperbarui artikel yang sudah ada. Gunakan dashboard/API/SQL update yang disengaja untuk isi lama. Test seed mengharuskan SQL persis sama dengan generator, jadi regenerasikan SQL bila sumber seed diubah.

Produk terkait 30 artikel dikendalikan `lib/blog-product-links.mjs`, dirender `app/blog/related-products.js`, bukan ditanam ulang ke isi database. Nama mengikuti katalog terbaru, ID yang hilang dibuang, panduan lanjutan hanya ditautkan bila terbit dan bukan artikel sendiri. Katalog gagal hanya menghilangkan blok opsional ini, artikel tetap dapat dibaca. Tambahkan pemetaan bila membuat artikel baru; mapping tidak otomatis dibuat dari judul.

## 8. Gambar katalog dan Storage

`lib/catalog-images.json` saat audit punya **16 mapping** berisi `src` dan `originalHash`. `applyCatalogImage()` hash SHA-256 JSON string `[imageUrl || "", catalogImageUrl || ""]`; hanya jika hash masih persis sama dengan hash awal, kedua field diganti `src`. Ini menjaga edit baru dari admin agar tidak ditimpa mapping gambar optimasi. Jika gambar tampak berbeda dari data lama, cek mapping sebelum mengubah database.

`getStorefront()` menyembunyikan base64 panjang dari HTML awal dengan mengubah `imageUrl`/`catalogImageUrl` data URI ke `/api/product-image/<id>/<field>?v=<hash16>`. Route membaca **field asli dalam products.data**, tidak menerapkan mapping gambar lagi. Param URL di Next ini di-`await`; jangan mengembalikan pola sinkron lama saat mengedit route.

### `GET /api/product-image/[id]/[field]`

Publik, field dibatasi `imageUrl` atau `catalogImageUrl`. Hanya data URI `image/png`, `image/jpeg`, `image/webp`, `image/gif` base64 yang didukung. Mengembalikan bytes gambar dengan Content-Type sesuai, `X-Content-Type-Options: nosniff`, `Cache-Control: public, max-age=60, s-maxage=60`. Field lain/baris atau URI tidak sesuai `404`; query/exception `503`. Param `v` digunakan untuk URL versi oleh loader, tetapi tidak diverifikasi atau dipakai route memilih versi lama; route selalu membaca field database saat ini.

Upload baru memakai `uploadProductImage(file,getClient)` dari browser:

1. Tipe MIME PNG/JPEG/WebP/GIF dan ukuran 1 byte–5 MiB diperiksa sebelum akses Supabase; SVG tidak didukung.
2. Sesi Auth wajib tersedia. Policy Storage menentukan apakah user benar admin/owner.
3. Upload ke bucket `product-images`, path `<auth.user.id>/<randomUUID>.<extension>`, `upsert:false`, content type asli, `cacheControl:"31536000"`.
4. Return public URL setelah upload sukses; URL baru disimpan ke produk ketika admin menekan simpan/tambah produk.

Bucket hilang diberi pesan untuk menjalankan `supabase/product-images.sql`; upload gagal tidak menghasilkan URL sukses. Upload tidak otomatis rollback saat batal menyimpan produk. Hapus produk tidak membersihkan Storage. SQL saat ini memberi **INSERT** admin ke folder UUID sendiri, tidak menambahkan policy update/delete/list objek; jangan mengira helper sudah mendukung penggantian in-place atau cleanup. Bucket publik berarti URL gambar memang boleh dibaca umum, bukan tempat file unduhan berbayar.

## 9. Skema Supabase, grants, dan urutan migrasi

Jalankan SQL lewat project Supabase yang benar sesuai `supabase/README.md`. Runtime/build tidak menjalankan migrasi otomatis. SQL kecil memakai transaction dan `IF NOT EXISTS`/drop-create policy agar dapat dijalankan ulang; ini bukan alat rollback atau bukti policy production sama dengan source.

| File | Skema dan policy utama |
| --- | --- |
| `supabase/schema.sql` | `admin_users(id uuid → auth.users ON DELETE CASCADE, role admin/owner)`; `products(id text PK,data jsonb object,sort_order integer)`; `site_settings(id homepage/footer,data jsonb object)`; `chat_faq(id,data jsonb object,active,sort_order)`. Indeks urutan produk dan active/urutan FAQ. Semua RLS aktif. |
| `supabase/lynk-orders.sql` | `lynk_orders(ref_id PK,message_id,customer_email normalized,items jsonb array,totals jsonb object,payment_status hanya paid,lynk_created_at text,received_at timestamptz default now)`. Indeks email/date/ref. Anon tidak mendapat hak; authenticated hanya SELECT dengan policy email terverifikasi; hanya service role bisa menulis. |
| `supabase/product-downloads.sql` | `product_downloads(lynk_item_id PK,title,drive_url,active,description)`; batas ID 1–256/title 1–500/description 3.000, regex URL Drive HTTPS. SELECT/INSERT/UPDATE/DELETE authenticated diberi grant namun dibatasi policy role admin/owner; anon tidak diberi grant; service role semua akses. |
| `supabase/product-images.sql` | Bucket publik `product-images`, limit 5.242.880 byte, MIME empat format; policy INSERT authenticated hanya admin/owner dalam folder UUID sendiri. |
| `supabase/blog-posts.sql` | `blog_posts(slug PK,title,excerpt,content,category,author,author_url,cover_image_url,published,views,views_updated_at,published_at,updated_at)`; indeks status/tanggal. Publik SELECT hanya published; admin/owner SELECT semua dan write. Aman upgrade kolom author_url/Views bila belum ada. |
| `supabase/blog-views.sql` | Tambah kolom Views untuk database blog lama, bigint >=0 dan timestamp nullable. |
| `supabase/import-data.sql` | Snapshot impor 14 produk + 2 settings + 3 FAQ saat audit; ID yang ada tidak ditimpa (`ON CONFLICT DO NOTHING`). Bukan isi katalog production terkini. |
| `supabase/blog-seed.sql` | Generated seed 30 artikel, tidak menimpa slug lama. Tidak mencakup histori revisi atau Views manual production. |

Detail policy dasar `schema.sql`: `admin_users` hanya boleh SELECT role milik `auth.uid()`, tidak ada policy penulisan role. Produk/settings boleh SELECT anon/authenticated; FAQ publik hanya active, admin mendapat akses lebih lewat policy admin. INSERT/UPDATE/DELETE data umum butuh authenticated dengan baris role admin/owner. RLS dan grant adalah lapisan berbeda; jangan hanya memeriksa UI atau bearer route.

`verified_customer_email()` di migrasi orders adalah SQL `SECURITY DEFINER`, `search_path=''`, membaca `auth.users` dengan uid sesi, email sudah dikonfirmasi, serta bukan anonymous. Authenticated mendapat execute, anon/public tidak. Policy read orders ini masih ada walau UI pembeli kini memakai pencarian email tanpa Auth. Jadi ada dua jalur akses: SELECT langsung authenticated sesuai email terverifikasi, dan API publik server yang sengaja menggunakan input email. Admin Auth tidak otomatis dapat membaca semua orders melalui RLS ini; itulah sebabnya daftar transaksi kandidat admin menggunakan service role.

Urutan setup praktis: `schema.sql` → buat user di Supabase Auth dan role owner melalui SQL → impor katalog bila project kosong → `lynk-orders.sql` → `product-downloads.sql`; jalankan `product-images.sql` untuk upload; `blog-posts.sql` → `blog-views.sql` bila diperlukan → `blog-seed.sql` bila memang ingin menambahkan artikel seed. Siapkan env lokal/hosting, verifikasi di browser/admin, lalu cek pembayaran nyata dan mapping setelah deployment. Jangan menjalankan import pada production dengan asumsi ia memperbarui semua data lama.

## 10. Test dan batas cakupan

Unit test memakai `node:test` dan `node:assert/strict`, mayoritas dependency database/provider tiruan. Perintah proyek `npm test` menjalankan `node --test tests/*.test.mjs`. File RLS berakhiran `.mjs` tanpa `.test` sehingga **tidak ikut `npm test`**.

| Test | Yang benar-benar diperiksa |
| --- | --- |
| `tests/lynk-webhook.test.mjs` | Normalisasi/minimalisasi payload, signature salah/tamper amount, body rusak/terlalu besar, event diabaikan, transaksi invalid, DB gagal, konfigurasi hilang. |
| `tests/purchase-lookup.test.mjs` | Email normalize, scope ID, page offset/11→10, no-store, input invalid, email kosong hasil, DB gagal tanpa detail rahasia. |
| `tests/product-downloads.test.mjs` | Allowlist URL Drive, ID persis bukan judul, mapping lain/nonaktif/unsafe ditolak, output email/totals tidak dikirim, judul/keterangan mapping. |
| `tests/account-feature.test.mjs` | Default tersembunyi, hanya boolean true mengaktifkan. Tidak menguji guard API. |
| `tests/chat.test.mjs` | Default/config Qwen, format request/provider, thinking off, validasi dialog/body/origin, error provider/timeouts/context, whitelist privat, pembelian/toggle account, limiter, history, FAQ, filter thinking/output terpotong. |
| `tests/chat-widget.test.mjs` | Klik di dalam/luar container. |
| `tests/product-image-upload.test.mjs` | Empat MIME, bytes/5 MiB boundary, path acak, sesi wajib, storage/bucket/network error. Menggunakan mock, bukan RLS Storage nyata. |
| `tests/blog.test.mjs` | Slug/validasi field & URL & Views, mapping row, JSON-LD, waktu baca. |
| `tests/blog-data.test.mjs` | Query ulang (tidak cache), fallback views lama, fallback tabel belum ada. |
| `tests/blog-seed.test.mjs` | 30 slug unik/artikel terbit substansial/link katalog/sumber, SQL persis generator dan rerun tidak menimpa. |
| `tests/blog-product-links.test.mjs` | 30 pemetaan, 1–3 produk, ID/nama terbaru, panduan terbit, produk hilang, slug tidak dipetakan, error katalog tidak mematikan artikel. |
| `tests/blog-pagination.test.mjs` | 9 artikel/halaman, parsing page, URL crawlable, page numbers. |
| `tests/lynk-orders-rls.mjs` | PGlite database terisolasi: migrasi bisa dua kali, service insert, duplikat mempertahankan owner, isolasi email A/B, email unverified/anonymous ditolak, customer write ditolak, auth.users privat, anon denied. |
| `tests/product-downloads-rls.mjs` | PGlite: migrasi dua kali, owner insert/update description/active, batas description SQL, customer tidak dapat baca/tulis mapping, anon denied, service dapat baca. |

RLS scripts memakai PGlite lokal, bukan production. Jika belum terpasang, petunjuk README memasang package di `/tmp/aplikasid-db-check`, lalu:

```sh
PGLITE_MODULE=/tmp/aplikasid-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/lynk-orders-rls.mjs
PGLITE_MODULE=/tmp/aplikasid-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/product-downloads-rls.mjs
```

Unit test helper tidak membuktikan route admin authorization end-to-end, revalidasi cache nyata, bucket Storage production, ketepatan env/merchant key, delivery webhook, permission Drive, atau jawaban AI nyata. Tidak ada unit test khusus runtime route katalog/admin blog/admin downloads/product-image atau `applyCatalogImage` pada daftar tests saat audit. Untuk fitur baru ikuti `AGENTS.md`: tambahkan unit test relevan, jalankan dan laporkan hasil; untuk integrasi lakukan verifikasi layanan yang memang tersedia tanpa mengubah data pelanggan sembarangan.

## 11. Diagnosis dan catatan yang mudah keliru

| Gejala | Telusuri lebih dulu |
| --- | --- |
| Katalog tidak termuat | Env publik Supabase, project/schema/grant/RLS, tiga query loader; satu query FAQ/settings yang gagal juga menggagalkan seluruh katalog. Tidak ada fallback katalog lokal. |
| Edit admin tidak terlihat | Pastikan lewat `/api/catalog`, token/role valid, mutation sukses dan tag storefront direvalidasi. Edit langsung SQL mengikuti 60 detik. |
| Admin bisa login Auth tetapi ditolak | UUID user belum ada di `admin_users`, role bukan admin/owner, atau sesi kadaluwarsa. Jangan menaruh role dalam metadata user sebagai pengganti policy saat ini. |
| Webhook 401 | Header signature, tipe angka grandTotal, ref/message ID, merchant key cocok, formula concat. Log struktur membantu tanpa membuka data pelanggan. |
| Webhook 503/500 | Bedakan konfigurasi env/key vs insert DB/migrasi. Jangan mengakui sukses sebelum save. |
| Pembelian belum muncul | Email checkout normalisasi, pembayaran yang benar-benar diterima webhook, ref paid, env key server/migrasi, transaksi lama belum diimpor. |
| Produk muncul tetapi tombol Drive tidak ada | UUID item harus persis mapping aktif; URL Drive lolos allowlist. Judul sama tidak cukup, webhook tidak membawa file URL. |
| Link Drive terbuka tetapi akses ditolak | Atur izin berbagi file/folder di Drive; backend hanya memvalidasi URL, tidak memberi hak Google Drive. |
| Produk tidak muncul di pilihan mapping admin | Batas 1.000 transaksi terbaru; mapping lama tetap muncul, UUID lain bisa diketik manual. |
| Chat 503 | Qwen key/model/baseURL hosting, akses model di akun SumoPod; `403 key_model_access_denied` provider berarti key belum berizin. Tidak ada fallback model/provider lain. |
| Chat 429 | Bisa limiter per proses bersama semua visitor atau rate limit provider; multiple instance tidak berbagi counter. |
| Jawaban chat menjadi FAQ fallback | AI error/timeout/hasil kosong/hasil terpotong/flag reasoning; filter memang menolak output itu. FAQ lokal tetap bisa dipakai tanpa provider. |
| Blog kosong padahal seed ada di Git | Seed tidak dipakai loader sebagai fallback; tabel/data harus dimigrasikan/diimpor ke project aktif, published harus true. |
| Admin blog gagal setelah fitur Views | Jalankan migrasi; loader publik punya fallback kolom sedangkan API admin butuh kolom lengkap. |
| Upload gambar gagal atau file menumpuk | Cek bucket/policy/sesi/ukuran; file orphan setelah batal simpan/hapus produk belum punya cleanup otomatis. |

Dokumen lama/operasional yang perlu diverifikasi, bukan langsung diganti tanpa konteks:

- `supabase/README.md` menulis URL webhook **`https://www.aplikasid.my.id/api/webhook/lynk`**, tetapi canonical source/`.env.example` memakai **`https://www.aplikasid.com`**. Bisa saja redirect/domain lama memang dipakai; repository tidak membuktikan domain dan URL yang terdaftar di Lynk sekarang. Periksa hosting + konfigurasi merchant sebelum mengubah.
- `PROJECT_OVERVIEW.md` mengatakan akun aktif saat accountEnabled; implementasi benar untuk halaman, bukan penutupan endpoint API. Saat membuat requirement keamanan, sebut perbedaan ini dengan jelas.
- Panduan database masih menjelaskan policy Auth pelanggan yang nyata ada di SQL, sedangkan akses `/akun` sekarang email-only. Jangan mengganti alur UI menjadi Supabase Auth hanya karena melihat fungsi `verified_customer_email`.
- `blog-posts.sql` terbaru sudah menyertakan kolom Views; README masih menyarankan `blog-views.sql` untuk upgrade. Keduanya idempotent dan tetap berguna untuk database lama.
- Snapshot import hanya 14 produk, sedangkan homepage bisa memiliki angka pemasaran lain dan production dapat berubah. Jangan memakai angka snapshot sebagai total katalog aktif atau menimpa data aktif dengan snapshot.
- `lib/catalog-images.json` dapat membuat gambar teroptimasi tampak tidak sama dengan field database lama; hash sengaja menjaga edit terbaru. File Storage publik dan mapping hash bukan tempat menyimpan download berbayar.

## 12. Cakupan pembacaan audit ini

Dibaca penuh: `AGENTS.md`, `PROJECT_OVERVIEW.md`, `CHAT_SETUP.md`, `supabase/README.md`; seluruh tujuh route di `app/api/`; helper backend/client yang tercantum di bagian 2; `lib/blog.mjs`, `lib/blog-data.mjs`, `lib/blog-product-links.mjs`, `lib/blog-seed.mjs`; enam SQL schema/migrasi kecil; seluruh file test di tabel bagian 10. Juga ditelusuri `app/akun/page.js`, `app/akun/account.js`, `app/blog/[slug]/page.js`, `app/blog/related-products.js`, referensi admin/sitemap, `.env.example` (contoh konfigurasi), serta `package.json`.

Dataset besar diperiksa struktur/jumlah dan mekanisme pemuatnya: `lib/catalog-images.json` 16 mapping, `lib/blog-seed.json` 10 artikel + tambahan 20, `supabase/blog-seed.sql` 30 artikel generated, `supabase/import-data.sql` 14 produk/2 settings/3 FAQ. Tidak menyalin isi artikel/katalog ke dokumen agar tidak menjadi duplikat data yang cepat basi. Nilai `.env.local`, transaksi production, isi dashboard provider, dan setting hosting tidak diperiksa dalam audit ini.
