# Peta semua file proyek

Snapshot **22 Oktober 2026**. Inventaris awal Git berisi **236 file**; tabel di bawah mencakup semuanya beserta dokumen serah terima baru. Gunakan pencarian nama file untuk melompat ke bagian terkait. Baca [HANDOFF_CLAUDE.md](../../HANDOFF_CLAUDE.md) terlebih dahulu; detail perilaku dijelaskan di tiga panduan per bagian.

## Batas pembacaan dan sumber kebenaran

- Source aplikasi, helper, test, konfigurasi, instruksi, seluruh script dan source legacy ditelusuri per bagian. Dataset besar (CSV/JSON/SQL seed) diperiksa struktur/jumlah, isi editorial dan hubungan generator/pemakainya; data tersebut tidak disalin ulang ke panduan.
- File gambar dipetakan nama/lokasi dan kesamaan hash; dua screenshot referensi juga dilihat. Ini bukan audit visual setiap piksel gambar atau setiap frame video. Output video tidak diperlukan untuk memahami runtime storefront.
- `.env.local` diperiksa hanya nama variabel dan ada/tidaknya nilai; nilai tidak ditampilkan/disalin. CSV auth lama tidak dibuka. Production, isi dashboard layanan, dan percakapan lama tidak diasumsikan diketahui.
- `node_modules/` adalah dependency terpasang; `.next/` dan `.git/` berisi hasil build/riwayat. Direktori tersebut bukan seluruhnya dibaca atau dimasukkan ke panduan. Docs Next lokal relevan dibaca sesuai instruksi repo.
- Data aktif berasal dari Supabase. Berkas CSV/seed dan `lib/products.js` bukan salinan otomatis data production.

## Jumlah awal file terdaftar Git

| Area | Jumlah file |
| --- | --- |
| `.vscode` | 1 |
| `SpreadsheetYangLama` | 4 |
| `[root]` | 13 |
| `app` | 46 |
| `assets` | 54 |
| `lib` | 33 |
| `public` | 43 |
| `referensi` | 3 |
| `scripts` | 8 |
| `supabase` | 9 |
| `tests` | 22 |

## File root

| File | Tanggung jawab |
| --- | --- |
| `.env.example` | Template nama env runtime dan alias lama; bukan key production. |
| `.gitignore` | Abaikan env privat, dependency, build, output iklan dan CSV auth. |
| `AGENTS.md` | Instruksi bersama, docs Next lokal, dan kewajiban unit test. |
| `CHAT_SETUP.md` | Konfigurasi GPT-4o mini/SumoPod, fallback FAQ dan batas chat. |
| `CLAUDE.md` | Pintu masuk Claude Code; impor AGENTS dan ringkasan aturan penting. |
| `HANDOFF_CLAUDE.md` | Ringkasan mandiri untuk serah terima, urutan membaca dan prompt siap salin. |
| `PROJECT_OVERVIEW.md` | Peta arsitektur/alur data lintas fitur. |
| `app.js` | Storefront JavaScript lama, pesanan/localStorage dan pembayaran simulasi. |
| `index.html` | Entry prototipe statis lama; bukan runtime Next. |
| `next.config.mjs` | Optimasi gambar WebP dan localPatterns yang diizinkan. |
| `package-lock.json` | Lock dependency transitif; gunakan npm ci untuk reproduksi. |
| `package.json` | Script npm dan dependency langsung aplikasi. |
| `server.py` | Preview HTTP root proyek lama port 8080; tidak untuk hosting Next. |
| `styles.css` | Style prototipe statis lama. |

## Konfigurasi editor

| File | Tanggung jawab |
| --- | --- |
| `.vscode/settings.json` | Port Live Server prototipe (5501), tidak mengatur Next. |

## Aplikasi dan route Next

| File | Tanggung jawab |
| --- | --- |
| `app/adminn/download-editor.js` | Editor pemetaan UUID item Lynk ke nama/keterangan/Drive/status. |
| `app/adminn/layout.js` | Metadata noindex untuk dashboard. |
| `app/adminn/order-editor.js` | Dialog susun urutan produk, drag/panah/dropdown, bulk save. |
| `app/adminn/page.js` | Dashboard login, editor produk/hero/footer/toggle akun/Blog dan editor tambahan. |
| `app/akun/account.css` | CSS pencarian pembelian dan kartu hasil. |
| `app/akun/account.js` | Pencarian email checkout, hasil/pagination/abort dan link Drive. |
| `app/akun/page.js` | Server guard visibilitas akun dari homepage.accountEnabled. |
| `app/api/admin/blog/route.js` | GET/POST/DELETE admin/owner: artikel draf/terbit dan Views manual. |
| `app/api/admin/downloads/route.js` | GET kandidat item + mapping; POST upsert pemetaan dengan token admin. |
| `app/api/catalog/route.js` | POST admin/owner: upsert/hapus produk, simpan settings, invalidate storefront. |
| `app/api/chat/route.js` | POST Node: adapter handler chat, konteks storefront/panduan dan limiter lokal. |
| `app/api/product-image/[id]/[field]/route.js` | GET gambar base64 lama products.data, whitelist dua field dan respons bytes. |
| `app/api/purchases/route.js` | POST publik email/page; inject query paid orders dan active downloads memakai key server. |
| `app/api/webhook/lynk/route.js` | POST Node: konfigurasi merchant/server key dan insert idempotent ke orders. |
| `app/blog/[slug]/page.js` | Artikel terbit, Markdown server, BlogPosting, produk terkait dan artikel lain. |
| `app/blog/blog-pagination.js` | Link pagination yang dapat di-crawl dan keterangan rentang artikel. |
| `app/blog/page.js` | Indeks Blog terbit, query page, canonical dan sembilan kartu per halaman. |
| `app/blog/related-products.js` | Blok opsional produk/panduan Blog dari mapping editorial. |
| `app/catalog-page-nav.js` | Navbar halaman katalog kategori/produk dan Blog. |
| `app/catalog-pages.css` | CSS halaman kategori/detail produk/Blog dan kartu server. |
| `app/catalog-product-card.js` | Kartu server yang menaut halaman detail produk. |
| `app/chat-widget.js` | UI chat: riwayat memori, FAQ, request/cancel, Markdown, fallback WhatsApp. |
| `app/error.js` | Client error boundary dan tombol reset, tanpa katalog fallback. |
| `app/globals.css` | CSS global storefront/admin/chat, aturan responsive dan overrides bertingkat. |
| `app/icons.js` | Ikon SVG bersama. |
| `app/kategori/[slug]/page.js` | Landing kategori allowlist slug, metadata, JSON-LD dan produk cocok. |
| `app/kategori/page.js` | Indeks enam kategori dan jumlah produk dari katalog aktif. |
| `app/layout.js` | Layout global, CSS, metadata, schema brand, GA dan bootstrap Meta Pixel. |
| `app/loading.js` | Loading boundary dengan skeleton katalog. |
| `app/login/page.js` | Redirect ke /akun; tidak mengautentikasi pembeli. |
| `app/meta-pixel-page-views.js` | PageView setelah perubahan pathname, melewati mount pertama. |
| `app/opengraph-image.js` | PNG OG generated memakai helper seo-image. |
| `app/page.js` | Server beranda; connection, metadata, loader initialData. |
| `app/panduan/[slug]/page.js` | Panduan statis detail, TOC langkah, breadcrumb dan panduan kategori sama. |
| `app/panduan/guide-center.js` | Client pencarian/category/featured/FAQ pusat panduan. |
| `app/panduan/guide-icon.js` | Ikon kategori panduan dengan fallback book. |
| `app/panduan/layout.js` | Shell/navbar/footer panduan, account flag dan stylesheet panduan. |
| `app/panduan/not-found.js` | Fallback panduan tidak ditemukan. |
| `app/panduan/page.js` | Indeks Pusat Panduan dan metadata. |
| `app/panduan/panduan.css` | Style scoped panduan, responsive dan aksesibilitas. |
| `app/panduan/support.js` | CTA bantuan menuju chat dan katalog. |
| `app/produk/[id]/page.js` | Detail produk berdasarkan ID stabil, checkout dan maksimal empat produk terkait. |
| `app/robots.js` | Metadata robots.txt dan tautan sitemap. |
| `app/sitemap.js` | Sitemap server katalog, kategori, panduan dan artikel terbit. |
| `app/storefront.js` | Client beranda: hero, filter/sort/search, 12 per halaman, modal, checkout, footer, chat. |
| `app/twitter-image.js` | PNG Twitter generated memakai helper seo-image. |

## Helper dan data bersama

| File | Tanggung jawab |
| --- | --- |
| `lib/account-feature.mjs` | Fitur akun aktif hanya jika accountEnabled boolean true. |
| `lib/admin-scroll.mjs` | Scroll editor dengan reduced-motion dan penanganan elemen hilang. |
| `lib/blog-api.js` | Adapter browser API admin Blog dengan token sesi/no-store. |
| `lib/blog-data.mjs` | Loader terbit no-store, fallback schema views/tabel lama dan dependency injection. |
| `lib/blog-pagination.mjs` | Page size 9, parsing/clamp query, rentang dan nomor pagination. |
| `lib/blog-product-links.mjs` | Mapping 30 slug ke ID produk live dan panduan terbit, fallback opsional. |
| `lib/blog-seed-additions.mjs` | Source dua puluh artikel tambahan Markdown. |
| `lib/blog-seed.json` | Source sepuluh artikel awal; Markdown berupa array baris. |
| `lib/blog-seed.mjs` | Gabung 30 artikel, normalisasi dan generator SQL idempotent. |
| `lib/blog-server.js` | Adapter Supabase loader Blog publik dan lookup slug. |
| `lib/blog.mjs` | Validasi/normalisasi artikel dan Views, slug, mapping row, reading time, schema Blog. |
| `lib/catalog-images.js` | Terapkan gambar optimasi hanya jika hash data lama cocok dengan mapping. |
| `lib/catalog-images.json` | 16 mapping ID/hash gambar lama ke aset WebP; bukan katalog production. |
| `lib/catalog-seo.mjs` | Enam kategori, path berbasis ID, copy SEO produk, metadata dan Product JSON-LD. |
| `lib/chat-client.mjs` | Pangkas riwayat menjadi giliran utuh dan cari fallback FAQ. |
| `lib/chat-widget.mjs` | Deteksi klik di luar container widget. |
| `lib/chat.mjs` | Konfigurasi/instruksi/konteks publik/provider/filter jawaban/limiter/handler chat. |
| `lib/checkout.js` | Validasi buyUrl absolut HTTP(S), tanpa host allowlist Lynk. |
| `lib/guides.js` | Lima kategori/sembilan panduan statis, featured, FAQ dan fungsi filter. |
| `lib/lynk-webhook.mjs` | Signature SHA-256 concat, batas streaming, whitelist transaksi dan handler injectable. |
| `lib/meta-pixel.mjs` | ID pixel publik dan helper deduplikasi PageView saat navigasi. |
| `lib/product-downloads.mjs` | Allowlist URL Drive dan join mapping aktif berdasarkan UUID item persis. |
| `lib/product-image-upload.js` | Adapter browser upload gambar menggunakan getSupabase. |
| `lib/product-image-upload.mjs` | Validasi MIME/5 MiB/sesi, UUID path, upload original dan public URL Storage. |
| `lib/product-presentation.mjs` | Ejaan platform Windows/macOS dan teks pencarian title/category/os/versions/description/specs. |
| `lib/products-api.js` | Adapter browser login/role/produk/settings/FAQ dan mutasi katalog bertoken. |
| `lib/products.js` | Sepuluh produk contoh/lama, tidak diimpor sebagai katalog runtime aktif. |
| `lib/purchase-lookup.mjs` | Handler email-only: validasi, 10 per halaman, ID scope, respons private/no-store. |
| `lib/seo-image.jsx` | Template gambar sosial ImageResponse 1200x630. |
| `lib/seo.mjs` | Origin canonical, metadata sitemap/robots, schema brand/breadcrumb, escape JSON-LD. |
| `lib/storefront-server.js` | Client Supabase server + loader tiga query, gambar hash, cache 60 detik/tag storefront. |
| `lib/supabase-service.js` | Client server-only secret/service role dengan timeout dan no-store. |
| `lib/supabase.js` | Singleton client publik browser untuk Auth dan query dengan RLS. |

## SQL dan operasi database

| File | Tanggung jawab |
| --- | --- |
| `supabase/README.md` | Setup manual Supabase/Auth/migrasi/webhook/Storage/Blog dan pengujian terisolasi. |
| `supabase/blog-posts.sql` | Tabel artikel/status/author/Views/timestamp, indeks dan RLS publik/admin. |
| `supabase/blog-seed.sql` | Generated insert 30 artikel, ON CONFLICT slug DO NOTHING; bukan loader runtime. |
| `supabase/blog-views.sql` | Upgrade kolom Views manual dan views_updated_at pada tabel blog lama. |
| `supabase/import-data.sql` | Snapshot impor 14 produk, dua settings, tiga FAQ; konflik ID tidak ditimpa. |
| `supabase/lynk-orders.sql` | Tabel transaksi, idempotensi ref_id, verified email function dan RLS/grants. |
| `supabase/product-downloads.sql` | Mapping UUID Lynk -> Drive privat, validasi SQL dan izin admin/server. |
| `supabase/product-images.sql` | Bucket publik gambar 5 MiB/empat MIME dan insert admin pada folder UUID sendiri. |
| `supabase/schema.sql` | Skema katalog/settings/FAQ/admin, indeks, grants dan RLS dasar. |

## Unit test dan test RLS

| File | Tanggung jawab |
| --- | --- |
| `tests/account-feature.test.mjs` | Unit test node:test: Default tersembunyi dan boolean true saja untuk fitur akun. |
| `tests/admin-scroll.test.mjs` | Unit test node:test: Scroll editor, reduced motion dan target hilang. |
| `tests/blog-data.test.mjs` | Unit test node:test: Query ulang, fallback kolom Views dan tabel Blog belum ada. |
| `tests/blog-pagination.test.mjs` | Unit test node:test: Sembilan per halaman, parsing/page URL, range dan elipsis. |
| `tests/blog-product-links.test.mjs` | Unit test node:test: Pemetaan 30 artikel, ID live, produk hilang, guide terbit dan katalog gagal. |
| `tests/blog-seed.test.mjs` | Unit test node:test: Jumlah/kualitas/slug 30 artikel dan equality SQL generated tanpa overwrite. |
| `tests/blog.test.mjs` | Unit test node:test: Validasi artikel/Views/URL, slug, row mapping, JSON-LD dan reading time. |
| `tests/catalog-seo.test.mjs` | Unit test node:test: Kategori/ID URL, editorial SEO, description dan Product schema harga tanpa rating buatan. |
| `tests/chat-widget.test.mjs` | Unit test node:test: Klik di luar widget tanpa menutup klik internal. |
| `tests/chat.test.mjs` | Unit test node:test: Provider Qwen, konteks/validasi/batas/origin/limiter/filter/fallback/history. |
| `tests/google-analytics.test.mjs` | Unit test node:test: Config ID Google Analytics ada pada source layout. |
| `tests/hero-mobile-layout.test.mjs` | Unit test node:test: Reset positioning kategori hero ke grid mobile, pemeriksaan CSS. |
| `tests/lynk-orders-rls.mjs` | Test PGlite terpisah: RLS orders, migrasi ulang, duplicate owner, service/anon/auth isolation. |
| `tests/lynk-webhook.test.mjs` | Unit test node:test: Signature/payload/size/error dan konfigurasi, tanpa jaringan produksi. |
| `tests/meta-pixel.test.mjs` | Unit test node:test: Init PageView dan navigasi pathname tanpa duplikasi. |
| `tests/product-card-mobile-layout.test.mjs` | Unit test node:test: Judul utuh/Safari/wrap/dua kolom dan alignment mobile, pemeriksaan CSS. |
| `tests/product-downloads-rls.mjs` | Test PGlite terpisah: RLS mapping, admin/customer/service isolation dan batas description. |
| `tests/product-downloads.test.mjs` | Unit test node:test: URL Drive yang diizinkan dan pemetaan item UUID persis tanpa bocor field. |
| `tests/product-image-upload.test.mjs` | Unit test node:test: MIME/ukuran/sesi/path unik/URL, Storage error dan network error. |
| `tests/product-presentation.test.mjs` | Unit test node:test: Normalisasi platform dan pencarian metadata produk tanpa field lain. |
| `tests/purchase-lookup.test.mjs` | Unit test node:test: Normalisasi email/scope mapping/pagination/no-store/error tanpa data privat. |
| `tests/seo.test.mjs` | Unit test node:test: Canonical, sitemap/robots, schema brand/breadcrumb dan escape JSON-LD. |

## Script pendukung

| File | Tanggung jawab |
| --- | --- |
| `scripts/attach-meta-ad-audio.swift` | Gabungkan video/audio macOS dan menimpa file output. |
| `scripts/encode-meta-ad.swift` | Encoder H.264 AVFoundation macOS dari frame; menimpa output video. |
| `scripts/export-sheet.mjs` | GET empat resource Apps Script lama; menimpa import-data.sql, tidak menjalankan SQL. |
| `scripts/generate-blog-seed-sql.mjs` | Menulis ulang SQL seed dari JSON + additions. |
| `scripts/import-local-csv.py` | Baca empat CSV publik, validasi/ekstrak gambar dan menimpa import SQL. |
| `scripts/mix-meta-ad-audio.py` | Mix WAV narasi/musik sintetis 15 detik dan tulis WAV output. |
| `scripts/render-deadline-reels.mjs` | Render frame reels alternatif, memakai dan menghapus folder /tmp yang sama. |
| `scripts/render-meta-ad.mjs` | Render 450 frame iklan via sharp; hapus folder frame /tmp tetap. |

## CSV sumber migrasi

| File | Tanggung jawab |
| --- | --- |
| `SpreadsheetYangLama/AplikasiID Products - chat_faq.csv` | Tiga FAQ lama untuk migrasi, bukan FAQ runtime aktif. |
| `SpreadsheetYangLama/AplikasiID Products - footer.csv` | Enam key/value footer lama; email dibuang importer. |
| `SpreadsheetYangLama/AplikasiID Products - homepage_settings.csv` | Sebelas key/value hero lama; importer trim key. |
| `SpreadsheetYangLama/AplikasiID Products - products.csv` | Snapshot 14 produk/15 kolom lama, satu gambar data URI; bukan katalog terkini. |

## Referensi lama

| File | Tanggung jawab |
| --- | --- |
| `referensi/google-apps-script-products-auth.js` | Backend spreadsheet lama; auth plaintext dan mutasi tidak memakai gerbang sesi. |
| `referensi/image.png` | Screenshot referensi visual Arkasoft: kartu katalog/nav navy-biru; bukan brand/runtime toko. |
| `referensi/image1.png` | Screenshot referensi visual Arkasoft: hero/search/kategori dan katalog. |

## Aset sumber/arsip

| File | Tanggung jawab |
| --- | --- |
| `assets/KatalogSketchup.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/KatalogSketchup.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/SPssWin.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/SpssMac.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogAdobeAcrobat.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogAutocad.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogCorel.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogDavinci.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogIdm.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogLightroom.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogMendeley.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogMicrosoft.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogNitro.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogPhotoshop.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogPremiere.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogRecoverit.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/katalogSmartpls.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/VersiWebp/spssmacrevisi.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogAcrobat.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogAnates.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogAutocad.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogCorel.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogDavinci.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogEviews.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogIdm.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogLightroom.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogMendeley.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogMicrosoft.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogNitro.webp` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogNvivo.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogPhotoshop.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogPremiere.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogRecoverit.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogSmartpls.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogSpssMac.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogSpssWin.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogStataMac.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogStataWin.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/katalogVisio.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/aplikasid-hitamputih.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/aplikasid.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/autocad.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/coreldraw.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/davinci.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/favicon1.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/idm.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/internet_download_manager.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/microsoft-office.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/photoshop.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/sketchpp.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/sketchup.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/logos/wondershare-revocer-it.png` | Aset sumber/arsip logo/brand. Tidak otomatis dilayani dari root oleh Next. |
| `assets/untukFavicon.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |
| `assets/untukFaviconfix.png` | Aset sumber/arsip gambar katalog/favicon. Tidak otomatis dilayani dari root oleh Next. |

## Aset yang disajikan Next

| File | Tanggung jawab |
| --- | --- |
| `public/assets/KatalogSketchup.png` | Aset runtime statis: URL `/assets/KatalogSketchup.png`. |
| `public/assets/VersiWebp/KatalogSketchup.webp` | Aset runtime statis: URL `/assets/VersiWebp/KatalogSketchup.webp`. |
| `public/assets/VersiWebp/SPssWin.webp` | Aset runtime statis: URL `/assets/VersiWebp/SPssWin.webp`. |
| `public/assets/VersiWebp/SpssMac.webp` | Aset runtime statis: URL `/assets/VersiWebp/SpssMac.webp`. |
| `public/assets/VersiWebp/katalogAdobeAcrobat.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogAdobeAcrobat.webp`. |
| `public/assets/VersiWebp/katalogAutocad.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogAutocad.webp`. |
| `public/assets/VersiWebp/katalogCorel.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogCorel.webp`. |
| `public/assets/VersiWebp/katalogDavinci.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogDavinci.webp`. |
| `public/assets/VersiWebp/katalogIdm.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogIdm.webp`. |
| `public/assets/VersiWebp/katalogLightroom.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogLightroom.webp`. |
| `public/assets/VersiWebp/katalogMendeley.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogMendeley.webp`. |
| `public/assets/VersiWebp/katalogMicrosoft.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogMicrosoft.webp`. |
| `public/assets/VersiWebp/katalogNitro.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogNitro.webp`. |
| `public/assets/VersiWebp/katalogPhotoshop.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogPhotoshop.webp`. |
| `public/assets/VersiWebp/katalogPremiere.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogPremiere.webp`. |
| `public/assets/VersiWebp/katalogRecoverit.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogRecoverit.webp`. |
| `public/assets/VersiWebp/katalogSmartpls.webp` | Aset runtime statis: URL `/assets/VersiWebp/katalogSmartpls.webp`. |
| `public/assets/imported/b4e28f92e3a2ec80689a.png` | Aset runtime statis: URL `/assets/imported/b4e28f92e3a2ec80689a.png`. |
| `public/assets/katalogAutocad.png` | Aset runtime statis: URL `/assets/katalogAutocad.png`. |
| `public/assets/katalogCorel.png` | Aset runtime statis: URL `/assets/katalogCorel.png`. |
| `public/assets/katalogDavinci.png` | Aset runtime statis: URL `/assets/katalogDavinci.png`. |
| `public/assets/katalogIdm.png` | Aset runtime statis: URL `/assets/katalogIdm.png`. |
| `public/assets/katalogLightroom.png` | Aset runtime statis: URL `/assets/katalogLightroom.png`. |
| `public/assets/katalogMicrosoft.png` | Aset runtime statis: URL `/assets/katalogMicrosoft.png`. |
| `public/assets/katalogPhotoshop.png` | Aset runtime statis: URL `/assets/katalogPhotoshop.png`. |
| `public/assets/katalogPremiere.png` | Aset runtime statis: URL `/assets/katalogPremiere.png`. |
| `public/assets/katalogRecoverit.png` | Aset runtime statis: URL `/assets/katalogRecoverit.png`. |
| `public/assets/logos/aplikasid-hitamputih.png` | Aset runtime statis: URL `/assets/logos/aplikasid-hitamputih.png`. |
| `public/assets/logos/aplikasid.png` | Aset runtime statis: URL `/assets/logos/aplikasid.png`. |
| `public/assets/logos/autocad.png` | Aset runtime statis: URL `/assets/logos/autocad.png`. |
| `public/assets/logos/coreldraw.png` | Aset runtime statis: URL `/assets/logos/coreldraw.png`. |
| `public/assets/logos/davinci.png` | Aset runtime statis: URL `/assets/logos/davinci.png`. |
| `public/assets/logos/favicon1.png` | Aset runtime statis: URL `/assets/logos/favicon1.png`. |
| `public/assets/logos/idm.png` | Aset runtime statis: URL `/assets/logos/idm.png`. |
| `public/assets/logos/internet_download_manager.png` | Aset runtime statis: URL `/assets/logos/internet_download_manager.png`. |
| `public/assets/logos/microsoft-office.png` | Aset runtime statis: URL `/assets/logos/microsoft-office.png`. |
| `public/assets/logos/photoshop.png` | Aset runtime statis: URL `/assets/logos/photoshop.png`. |
| `public/assets/logos/sketchpp.png` | Aset runtime statis: URL `/assets/logos/sketchpp.png`. |
| `public/assets/logos/sketchup.png` | Aset runtime statis: URL `/assets/logos/sketchup.png`. |
| `public/assets/logos/wondershare-revocer-it.png` | Aset runtime statis: URL `/assets/logos/wondershare-revocer-it.png`. |
| `public/google6bdd09b63391827f.html` | File verifikasi domain Google Search Console; bukan halaman aplikasi. |
| `public/untukFavicon.png` | Aset runtime statis: URL `/untukFavicon.png`. |
| `public/untukFaviconfix.png` | Aset runtime statis: URL `/untukFaviconfix.png`. |

## Dokumen serah terima

| File | Tanggung jawab |
| --- | --- |
| `docs/claude/ADMIN_DAN_OPERASIONAL.md` | Panduan dashboard/akun, tracking/SEO, legacy, aset, script dan dependency. |
| `docs/claude/BACKEND_DAN_DATA.md` | Panduan rinci tujuh API, schema/RLS, integrasi, cache, kontrak dan diagnosis. |
| `docs/claude/KONFIGURASI_DAN_STATUS.md` | Env tanpa nilai rahasia, setup, hasil test/build/RLS dan batas verifikasi. |
| `docs/claude/PETA_FILE.md` | Inventaris file source/aset serta batas cakupan audit ini. |
| `docs/claude/STORE_FRONT_DAN_KONTEN.md` | Panduan rinci UI publik, CSS, kontrak produk, SEO, Blog, panduan dan test. |

## File lokal di luar Git

Nama berikut hanya inventaris; bukan permintaan untuk mempublikasikan atau menjalankannya.

| Lokasi | Peran |
| --- | --- |
| `.env.local` | Konfigurasi privat yang sudah ada pada laptop asli. Status nama key ada di KONFIGURASI_DAN_STATUS.md. |
| `SpreadsheetYangLama/AplikasiID Products - auth.csv` | Arsip kredensial spreadsheet lama; diabaikan Git, tidak diimpor ke Supabase, tidak dibuka. |
| `.DS_Store`, `assets/.DS_Store` | Metadata Finder macOS, bukan source. |
| `output/` | Sebelas file hasil kerja iklan lokal pada snapshot; tidak otomatis dipublikasikan situs. |
| `node_modules/`, `.next/`, `.git/` | Dependency, hasil build/cache, dan metadata Git; dapat berubah saat perintah dijalankan. |

File `output/` yang terinventaris:

- `output/aplikasid-deadline-opening-stock.jpg`
- `output/aplikasid-deadline-opening.png`
- `output/aplikasid-deadline-stock-pexels-original.jpg`
- `output/aplikasid-meta-ad-15s-voiceover-musik.mp4`
- `output/aplikasid-meta-ad-15s.mp4`
- `output/aplikasid-reels-deadline-elevenlabs.mp4`
- `output/aplikasid-reels-deadline-final.mp4`
- `output/aplikasid-reels-deadline-url-clear-silent.mp4`
- `output/aplikasid-reels-deadline-url-clear.mp4`
- `output/aplikasid-reels-deadline-v2.mp4`
- `output/copy-iklan-meta.txt`

`copy-iklan-meta.txt` memuat hook/caption/CTA/narasi dan catatan produksi iklan 15 detik 1080 × 1920, narasi ElevenLabs serta sumber stok Pexels. Ini catatan produksi lokal, bukan verifikasi lisensi/aset eksternal saat ini. MP4/JPG/PNG di direktori tersebut merupakan bahan/hasil render dan tidak menjadi entry aplikasi.

## Cara menelusuri tugas tanpa membaca ulang seluruh repo

```sh
rg --files app lib tests supabase scripts
rg -n "namaFungsi|namaField" app lib tests
git status --short
```

Untuk mencari rahasia/config, periksa nama pemakai `process.env` di source. Hindari pencarian nilai key di seluruh folder yang akan mencetak isi env, CSV auth, atau data pelanggan. Saat mengganti aset, periksa path `public/` dan hash mapping; kapitalisasi nama file harus dipertahankan untuk deployment Linux.
