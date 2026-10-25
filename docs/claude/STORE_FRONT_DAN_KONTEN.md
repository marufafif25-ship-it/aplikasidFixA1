# Storefront, katalog, Blog, dan Pusat Panduan

Peta source yang diperiksa pada 22 Oktober 2026. Dokumen ini menjelaskan perilaku repository lokal; jumlah produk, artikel, pengaturan, harga, dan tautan checkout production tetap mengikuti Supabase yang terhubung. Mulai dari `AGENTS.md` dan `PROJECT_OVERVIEW.md`, lalu buka source yang disebut di bawah sebelum mengubah fitur.

## 1. Titik masuk dan batas server/client

| File | Peran dan hubungan penting |
| --- | --- |
| `app/page.js` | Server Component beranda; `await connection()` lalu `getStorefront()`, meneruskan hasil sebagai `initialData` ke `Storefront`. Metadata beranda berada di file ini. |
| `app/storefront.js` | Client Component beranda: hero, filter/pencarian/urutan, pagination, kartu produk, modal, footer, dan pembuka widget chat. `ProductCard`, `ProductModal`, `CatalogImage`, dan `InfoCard` masih fungsi lokal di file ini. |
| `lib/storefront-server.js` | Loader Supabase bersama untuk beranda/kategori/produk/panduan. Cache Next 60 detik, tag `storefront`; pengambilan DB memakai `cache: "no-store"` dan timeout 10 detik. `POST /api/catalog` menginvalidasi tag tersebut. |
| `app/catalog-page-nav.js` | Navigasi bersama halaman kategori, produk, dan Blog. Logo ke `/`, menu Beranda/Blog/Panduan, CTA ke `/#produk`. Tidak identik dengan navigasi beranda. |
| `app/catalog-product-card.js` | Kartu server untuk landing kategori dan produk terkait, berbeda dengan kartu interaktif beranda. Seluruh kartu menaut ke detail produk. |
| `app/globals.css` | Token warna, font, storefront, admin, chat, modal, skeleton, pagination, dan sejumlah style lama. Banyak selector ditimpa lagi di bagian bawah; urutan cascade penting. |
| `app/catalog-pages.css` | Kategori, detail produk, kartu SEO, indeks/artikel Blog, pagination Blog, dan blok produk terkait Blog. Diimpor global dari `app/layout.js`. |
| `app/icons.js` | Ikon SVG bersama (pencarian, tutup, badge, headset, petir, unduhan), dekoratif dengan `aria-hidden`. |
| `app/loading.js` | Loading boundary: status memuat dan 12 skeleton kartu. |
| `app/error.js` | Client error boundary: pesan katalog belum dapat dimuat dan tombol `reset()`. Bukan fallback katalog statis. |

`getStorefront()` membaca `products(id,data,sort_order)`, seluruh `site_settings`, dan hanya `chat_faq.active = true`. Produk diurutkan DB berdasarkan `sort_order`, lalu `id`. Data `id` dan `sortOrder` dari kolom tabel mengungguli nilai di JSONB. Loader menerapkan helper gambar, mengganti data URL base64 lama menjadi `/api/product-image/{id}/{field}?v={hash}`, menghapus `footer.email`, dan mengembalikan `{ products, homepage, footer, faq }`. Error pada salah satu dari tiga query membuat loader melempar error, bukan memakai katalog contoh.

`lib/products.js` berisi **10 produk contoh/lama**, judul lama yang panjang, harga, versi, rating, dan aset. File ini tidak diimpor oleh storefront Next aktif dan produknya bahkan tidak berisi `buyUrl`. Mengeditnya tidak memperbarui katalog Supabase. Cari seluruh pemakaian sebelum menggunakannya untuk migrasi atau fallback baru.

Dokumentasi Next lokal yang relevan: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` menjelaskan bahwa `params` dan `searchParams` berupa Promise; source sudah memakai `await`. `.../04-functions/connection.md` menjelaskan bahwa `connection()` menunggu request dan menghentikan prerendering di titik itu. Ia tidak menghapus cache `getStorefront()` yang terpisah. Sebelum menulis kode Next lain, baca juga guide lokal untuk API yang diubah; dependency proyek memakai `next: latest`.

## 2. Kontrak data produk dan tampilan beranda

Field yang dipakai UI publik:

| Field | Pemakaian |
| --- | --- |
| `id` | Identitas stabil, React key, URL `/produk/{id}`, dan pemetaan Blog. Judul boleh berubah tanpa mengganti URL. |
| `title` | Nama ringkas di kartu, modal, detail, metadata default. |
| `category` | Nilai teknis Inggris yang harus sama persis dengan konfigurasi kategori, misalnya `Design`, bukan label `Desain & Grafis`. |
| `os` | Platform; kartu dan modal beranda melalui `getProductPlatform()`, detail produk menampilkan nilai `os` mentah. |
| `versions` | Pilihan versi sebagai string; tampil pada modal/detail dan fallback artwork. |
| `description` | Penjelasan kegunaan editorial, tampil di modal bila tidak kosong serta menjadi deskripsi SEO utama. |
| `compatibility` | Syarat perangkat, batas paket, dan catatan sebelum membeli. Tampil di modal dan detail produk. |
| `specs` | Array string fitur. Dua pertama menjadi pill kartu; semua ditampilkan di modal/detail. |
| `price`, `originalPrice` | Harga rupiah; beranda juga menghitung persentase diskon. |
| `sales`, `rating` | Nilai tampilan katalog; `sales` juga digunakan untuk urutan Terpopuler. Bukan agregasi transaksi langsung. |
| `imageUrl`, `catalogImageUrl`, `color` | Logo, gambar katalog penuh, dan latar logo fallback. |
| `buyUrl` | Checkout yang dikonfigurasi admin. Tidak dibuat otomatis dari ID atau judul. |
| `sortOrder` | Urutan manual; label UI `Terbaru` menggunakan ini, bukan tanggal pembuatan. |
| `seoTitle`, `seoDescription` | Override metadata halaman produk; tidak mengganti judul/deskripsi terlihat. |

Pola editorial yang perlu dipertahankan: nama produk ringkas; sistem operasi terpisah; kegunaan di `description`, versi di `versions`, batas dan persyaratan di `compatibility`, fitur/isi di `specs`. Jangan memindahkan semua informasi kembali ke judul hanya agar pencarian cocok.

`lib/product-presentation.mjs`:

- `getProductPlatform()` melakukan trim lalu mengganti kata `Win` menjadi `Windows` dan `Mac` menjadi `macOS`, tanpa mengarang platform untuk nilai kosong/tidak valid.
- `getProductSearchText()` menyatukan judul, kategori, platform normal, versi, deskripsi, dan string pada specs; hasil huruf kecil. `buyUrl`, secret, dan field lain tidak ikut. **`compatibility` tidak termasuk pencarian saat ini.**

Perilaku `Storefront` yang mudah terlewat:

- Pencarian memakai seluruh frasa `query.toLowerCase().trim()` sebagai substring, bukan setiap kata secara terpisah. Filter kategori memakai persamaan nilai persis. Tidak ada sinkronisasi filter/pagination ke query URL.
- Urutan `popular` menurun menurut `sales`; harga naik/turun menurut `price`; `newest` menurut angka `sortOrder` naik. Kosong/null/undefined/angka tak valid ditempatkan di akhir. Penamaan Terbaru tidak berarti waktu terbaru.
- Pagination beranda 12 produk/halaman, pageCount minimal 1, dan halaman dikembalikan ke 1 setiap pencarian/kategori/urutan berubah. Kontrol menampilkan awal, akhir, serta tetangga halaman aktif dengan elipsis.
- Ganti halaman memfokuskan `#catalog-heading` tanpa menggeser fokus awal, lalu scroll ke heading; mode reduced motion memakai scroll `instant`.
- Judul kartu menaut ke detail SEO, tombol `Lihat Detail` membuka modal lokal, tombol beli langsung checkout. Modal tidak mengganti URL.
- `homepage` menimpa default hero. Default title `Software & Game`, baris kedua `untuk Kerja hingga Hiburan`; CTA utama melakukan scroll ke `primaryTarget` (default `produk`). Field default `secondaryLabel`/`secondaryTarget` masih ada tetapi tidak dirender sebagai CTA hero kedua.
- Hero badge menghitung `initialData.products.length`, bukan kolom status produk. Query publik tidak memfilter field aktif produk. Status FAQ berbeda: FAQ memang difilter aktif di server.
- Hero quick category hanya **5 tombol**: Office, Design, Engineering, Utility, Game. Video tetap ada di dropdown dan landing kategori. Tombol hero memfilter katalog lokal, bukan menaut ke landing kategori.
- `homepage.accountEnabled` diperiksa dengan helper bersama `lib/account-feature.mjs`; jangan menampilkan tautan Akun Saya tanpa mempertahankan flag. Panduan juga memakainya.
- Footer memakai default jika field tidak diisi, membuang `email`, dan memetakan `instagram` lama ke `tiktok` hanya jika `tiktok` kosong. Label publiknya tetap TikTok; fallback ini bukan integrasi Instagram baru.
- `/?chat=1#bantuan` membuka chat saat mount lewat `window.location.search`; ini target bantuan yang dipakai produk/panduan.
- Blok Garansi pada beranda berisi copy hardcode `Garansi 5 Tahun`, bantuan instalasi, serta penggantian link unduhan. Copy ini tidak berasal dari setting footer atau halaman panduan; cek konsistensi klaim jika diminta mengubah kebijakan toko.

Modal menggunakan native `<dialog>` dan `showModal()`. `useLayoutEffect` menyimpan pembuka dan scroll, memasang body fixed dengan offset viewport, membuka dialog, dan memfokuskan heading tanpa scroll. Cleanup mengembalikan semua nilai style body sebelumnya, posisi scroll, serta fokus pembuka jika masih terpasang. Escape melalui `onCancel`, tombol tutup, atau klik backdrop bisa menutup. Klik backdrop harus dimulai dan berakhir di luar bounding rectangle dialog sehingga drag dari isi ke luar tidak menutup secara tak sengaja. Pertahankan ini saat memisahkan komponen atau mengganti modal.

Asumsi data beranda lebih ketat daripada helper: `ProductCard` memanggil `title.split`, `versions.slice`, dan `specs.slice`; modal memanggil `specs.map`. Jangan menganggap record Supabase yang sembarang/incomplete aman hanya karena helper SEO mengizinkan beberapa field kosong. Persentase diskon beranda juga langsung membagi `originalPrice`; validasi angka perlu diperhatikan bila kontrak produk berubah.

## 3. Checkout, gambar, dan CSS yang perlu dijaga

`lib/checkout.js::getCheckoutUrl()` hanya mengembalikan URL absolut HTTP(S) yang valid, sudah di-trim, tanpa username/password; yang lain menghasilkan `null`. **Validator ini tidak membatasi hostname ke Lynk.id.** Tujuan bisnis checkout Lynk mengikuti data `buyUrl`, bukan allowlist di helper.

- Beli dari beranda/modal memakai `window.location.assign()` (tab sama).
- URL tidak valid pada beranda menutup modal, lalu menampilkan notice `Link pembelian produk ini belum tersedia. Silakan hubungi CS melalui WhatsApp.`. Notice saat ini tidak mempunyai timer hilang otomatis.
- Beli dari `/produk/[id]` memakai `<a target="_blank" rel="noreferrer">` (tab baru). Jika URL tidak valid, CTA menuju `/?chat=1#bantuan`.

Gambar lokal `/assets/` dan route `/api/product-image/` memakai optimasi `next/image` (WebP sesuai `next.config.mjs`). URL eksternal sengaja `unoptimized` untuk kompatibilitas tanpa membuka arbitrary image proxy hosts. Kartu kategori/detail punya fallback `/assets/logos/aplikasid.png`; fallback artwork beranda tetap mengandalkan `product.imageUrl`. Gambar katalog beranda memakai `fill` dan `object-fit: cover`; kartu SEO/detail memakai ukuran eksplisit dan `contain`. Jangan menyamakan crop kedua tampilan tanpa mengecek hasilnya.

`app/globals.css` bersifat global dan memiliki style admin, chat, serta sisa selector cart/invoice lama. Kehadiran `.cart-list` atau `.invoice-result` tidak berarti ada alur cart/invoice aktif di Next storefront. Aturan akhir file sering mengungguli aturan awal.

Perilaku layout yang sudah dilindungi test:

- Desktop beranda 4 kolom produk; maksimal 900px menjadi 2 kolom. Mobile maksimal 560px tetap **2 kolom `minmax(0,1fr)`**, artwork persegi, card/body `min-width:0`.
- Mobile menampilkan **seluruh judul produk**, termasuk Safari: `display:block`, clamp normal/WebKit di-unset, `overflow:visible`, `overflow-wrap:anywhere`, `flex-shrink:0`. Metadata menggunakan `margin-top:auto` agar harga dan tombol sejajar per baris.
- Hero desktop memakai kartu kategori absolute di sekitar lintasan orbit; maksimal 560px direset ke position relative/inset auto/transform none, 2 kolom, kartu kelima full-width. Jangan menghapus reset mobile saat merapikan selector duplikat.
- Toolbar akhir memakai grid: pencarian fleksibel + select 210px + 190px, di bawah 760px pencarian selebar baris dan dua dropdown, di bawah 380px satu kolom.
- Kontrol pencarian/tutup modal terakhir memakai kotak SVG terpusat dengan target 44px; jangan kembali memakai glyph yang sejajarnya bergantung pada font.
- `app/catalog-pages.css` mempunyai breakpoint sendiri: kartu SEO 3 kolom → 2 di bawah 900px → 1 di bawah 620px. Jadi katalog kategori/detail/Blog memang berbeda dengan dua kolom beranda mobile.

## 4. Landing kategori dan detail produk

Konfigurasi utama berada di `lib/catalog-seo.mjs::productCategories`:

| `category` produk | Slug URL | Label publik |
| --- | --- | --- |
| `Design` | `desain-grafis` | Desain & Grafis |
| `Engineering` | `engineering-3d` | Engineering & 3D |
| `Game` | `game` | Game |
| `Video` | `video-editing` | Video & Animasi |
| `Office` | `office-produktivitas` | Office & Produktivitas |
| `Utility` | `system-utility` | System & Utility |

Setiap kategori memiliki judul, title SEO, deskripsi, intro, useCases untuk fallback deskripsi produk, dan checklist sebelum memilih. Kategori tidak dibaca dari tabel kategori. Penambahan nilai harus diperiksa di dropdown, hero bila diperlukan, landing, sitemap, admin, dan test jumlah kategori.

- `app/kategori/page.js`: mengambil katalog untuk menghitung produk per kategori, menampilkan seluruh 6 kategori walaupun kosong, dan metadata canonical `/kategori`.
- `app/kategori/[slug]/page.js`: `generateStaticParams()` berasal dari konfigurasi dan `dynamicParams = false`; slug di luar daftar tidak dibuka. Isi produk tetap dimuat saat request melalui `connection()`. Filter persis `product.category === category.value`, tanpa pagination. Menyediakan breadcrumb JSON-LD, copy/checklist kategori, empty state, dan tautan panduan.
- `app/produk/[id]/page.js`: mencari dengan `String(product.id) === id` dari loader bersama, metadata `noindex` jika hilang dan `notFound()` pada render. URL tidak diturunkan dari title. Produk terkait maksimum 4 produk pertama dari kategori yang sama, menghindari diri sendiri; bukan rekomendasi berdasarkan penjualan. Kategori tak dikenal tidak menghasilkan related products.
- `getCategoryPath()` menerima object kategori/value/slug; kategori tak dikenal menuju `/kategori`. `getProductPath()` meng-encode ID dan fallback `/` jika ID tidak ada.
- Halaman produk memuat deskripsi, harga, checkout, versi, OS, compatibility, spesifikasi, panduan `/panduan/memilih-versi-software`, kategori, dan produk terkait. Bila versi/OS/compatibility kosong, ada copy agar pembeli konfirmasi ke CS; jangan mengarang spesifikasi minimum.

Aturan helper SEO produk:

- `getProductDescription()` memilih `description.trim()` terlebih dahulu. Tanpa editorial, ia membangun paragraf dari nama, useCases kategori, versi, OS mentah, dan paling banyak 3 specs. Field `compatibility` tidak dimasukkan ke paragraf fallback; bagian kompatibilitas halaman menampilkannya terpisah.
- `getProductMetaTitle()` memilih `seoTitle || title`, menambah `| Aplikasi.id` kecuali nama sudah mengandung `aplikasi.id`.
- Meta description memakai `seoDescription` atau deskripsi utama, menormalkan whitespace, dan memotong pada batas kata hingga maksimal 160 karakter dengan elipsis.
- JSON-LD Product menyertakan nama/deskripsi/SKU/URL/kategori, image HTTP(S), dan Offer IDR bila harga finite serta tidak negatif. **Tidak ada aggregateRating/review buatan**, tidak ada klaim availability atau validUntil otomatis.
- Breadcrumb/JSON-LD menggunakan `lib/seo.mjs::serializeJsonLd()` yang meng-escape `<`, U+2028, U+2029. Jangan langsung menyisipkan `JSON.stringify()` konten editor ke script HTML.

`SITE_URL` dari `NEXT_PUBLIC_SITE_URL` atau default `https://www.aplikasid.com` menjadi origin metadata, JSON-LD, dan sitemap. `app/layout.js` menetapkan `metadataBase`, bahasa `id`, metadata bawaan, dan schema Organization/WebSite. `app/sitemap.js` mengambil seluruh produk yang dikembalikan loader, konfigurasi kategori, slug panduan, dan artikel terbit. Tidak semua URL memakai mekanisme pembangkitan static yang sama; jangan menambah `generateStaticParams()` untuk produk atau Blog tanpa memikirkan data Supabase terbaru.

## 5. Blog: data, editor, rendering, dan fallback

| File | Peran |
| --- | --- |
| `lib/blog.mjs` | Slug, normalisasi/validasi post, mapping DB ke object publik, reading time, JSON-LD Blog/BlogPosting. |
| `lib/blog-data.mjs` | Query post terbit, urutan dan fallback schema lama, dependency injection untuk test. |
| `lib/blog-server.js` | Adapter memakai `serverSupabase`; `getPublishedBlogPost()` mengambil daftar terbit lalu `.find(slug)`. |
| `lib/blog-api.js` | Wrapper browser ke `/api/admin/blog`; mengambil session Supabase, bearer access token, fetch no-store, dan meneruskan pesan error API. |
| `lib/blog-pagination.mjs` | Ukuran halaman 9, normalisasi query, pemotongan list, path canonical, nomor halaman/elipsis. |
| `app/blog/page.js` | Indeks server, metadata per halaman, kartu, empty state, breadcrumb dan schema Blog. |
| `app/blog/blog-pagination.js` | Link URL yang bisa di-crawl, `rel=prev/next`, aria-current, status rentang. |
| `app/blog/[slug]/page.js` | Artikel server, metadata OG article, JSON-LD, ReactMarkdown + remarkGfm, produk terkait opsional, dan 3 artikel lainnya. |
| `app/blog/related-products.js` | Render blok tautan produk editorial dari helper, di dalam Suspense dengan fallback null. |
| `lib/blog-product-links.mjs` | Pemetaan 30 slug artikel ke ID produk live dan panduan lanjutan yang sudah terbit. |

Schema object aplikasi adalah `{ slug, title, excerpt, content, category, author, authorUrl, coverImageUrl, published, views, publishedAt, updatedAt, viewsUpdatedAt }`. DB memakai snake_case untuk `author_url`, `cover_image_url`, dan timestamp.

`normalizeBlogPost()` memaksa:

- Judul wajib maksimal 180 karakter; slug maksimal 120, huruf kecil/angka/tanda hubung. Slug explicit tetap diproses `slugifyBlogTitle()` (diakritik dihapus, `&` menjadi `dan`, tanda lain menjadi strip), bukan ditolak hanya karena huruf besar.
- Ringkasan wajib maksimal 320; isi wajib maksimal 100.000; author default Aplikasi.id dan maksimal 120; category default Tips Software dan maksimal 80.
- Cover dan link bio penulis opsional, harus HTTP(S) atau path lokal `/...` yang bukan `//...`; link bio maksimal 500 karakter.
- `published` harus boolean asli; `views` default 0 dan harus safe integer tidak negatif (string digit diterima, pecahan/negatif ditolak).

Query publik selalu `.eq("published", true)`, `published_at` menurun lalu slug naik. **Blog tidak memakai cache Next/storefront**: setiap pemanggilan membuat query baru agar impor langsung muncul. Missing kolom `views`/`views_updated_at` mencoba ulang dengan kolom dasar; post lama mendapat views 0. Tabel `blog_posts` belum ada menghasilkan list kosong. Error lain melempar `Artikel blog belum dapat dimuat.`. Record tidak valid juga bisa membuat mapping seluruh list gagal; normalisasi adalah kontrak, bukan pembersih semua data liar.

Indeks Blog memakai `/blog` untuk halaman 1 dan `/blog?page=N` setelahnya, metadata canonical per halaman. Query tidak valid/nonpositif menjadi 1; jika requested page valid melebihi halaman tersedia, helper meng-clamp tetapi halaman memanggil `notFound()` agar URL kosong tidak dianggap halaman terakhir. Daftar kosong tetap mempunyai satu halaman dengan empty state `Artikel sedang disiapkan`.

Artikel hanya tampil jika terbit dan cocok slug. ReactMarkdown/remarkGfm merender Markdown/GFM di server; tidak ada `rehype-raw` yang mengizinkan HTML mentah editor. Tanggal diformat `id-ID`, `Asia/Jakarta`. Reading time minimal 1, `ceil(jumlah kata / 200)`. Tanggal diperbarui hanya tampil bila timestamp setelah publishedAt. Views **dimasukkan manual dari Google Analytics melalui admin**, bukan counter otomatis saat halaman dibuka; nol disembunyikan. Cover opsional menggunakan `<img>` biasa, bukan next/image. Tiga artikel lainnya adalah tiga post terbit terbaru selain artikel ini, tanpa filter kategori.

JSON-LD BlogPosting berisi URL/headline/excerpt/gambar/tanggal/kategori/bahasa; author `Aplikasi.id` dianggap Organization, nama lain Person. Publisher mengacu `SITE_URL/#organization`. Metadata artikel dan schema memakai data post yang sama; pertahankan hubungan itu jika menambah field.

## 6. Artikel seed dan tautan produk editorial

Source seed **bukan fallback otomatis runtime**:

- `lib/blog-seed.json`: 10 artikel awal, content berupa array baris Markdown.
- `lib/blog-seed-additions.mjs`: 20 artikel tambahan, content berupa template string Markdown.
- `lib/blog-seed.mjs`: menggabungkan menjadi `BLOG_SEED_POSTS`, mengubah array menjadi string newline, memetakan field DB, dan merender SQL.
- `scripts/generate-blog-seed-sql.mjs`: `node scripts/generate-blog-seed-sql.mjs` menulis ulang `supabase/blog-seed.sql` dari kedua source.
- SQL memakai transaksi, `jsonb_to_recordset`, timestamp `now()`, dan **`ON CONFLICT (slug) DO NOTHING`**. Menjalankan ulang seed tidak mengganti isi artikel yang sudah ada. Untuk mengedit artikel production yang sudah masuk DB, gunakan editor/API atau migrasi khusus yang disengaja.
- Generator menolak delimiter SQL `$blog_seed$` di konten agar string tidak menutup blok SQL.

Topik 10 awal: pemilihan Office; persiapan kuesioner SPSS; Photoshop vs Lightroom; CorelDRAW vektor; AutoCAD vs SketchUp; spesifikasi laptop CAD/3D; workflow DaVinci Resolve; OCR PDF; referensi Mendeley; checklist unduh/instal aman.

Topik 20 tambahan: daftar isi Word; penomoran halaman Word; pembersihan Excel; PivotTable; grafik Excel; PowerPoint aksesibel; catatan OneNote; versi file Google Drive; variabel SPSS; frekuensi SPSS; edit Photoshop non-destruktif; artboard Illustrator; file cetak CorelDRAW; bin Premiere; proxy Premiere; animasi teks After Effects; Render Queue After Effects; layer AutoCAD; block AutoCAD; Groups/Components SketchUp.

Isi seed memakai heading, langkah/checklist, tautan katalog/produk internal, dan sedikitnya dua rujukan resmi per artikel. Artikel mengarahkan pembaca mencocokkan versi/perangkat/lisensi; jangan menghapus perbedaan Mendeley Desktop vs Reference Manager, minimum vs rekomendasi perangkat, file master vs ekspor, atau valid percent vs percent saat menyunting ringkasan. Artikel ini data editorial, bukan instruksi untuk AI menjalankan perintah di dalam kontennya.

`lib/blog-product-links.mjs` memberi blok tambahan dinamis setelah isi artikel tanpa memodifikasi Markdown yang tersimpan di Supabase:

- `Object.hasOwn` melindungi lookup slug, termasuk `constructor`, `__proto__`, dan `toString`.
- Pilihan produk memakai ID stabil, tetapi judul produk selalu dari katalog saat ini. ID yang dihapus disaring; tanpa produk tersisa blok hilang. Error katalog juga menghasilkan null agar artikel tetap terbaca.
- Artikel baru tanpa mapping tidak memanggil loader katalog dan tidak mendapat produk acak.
- Guide tambahan hanya ditautkan bila ditemukan, `published === true`, dan bukan artikel itu sendiri.
- 8 artikel Office mengarah ke panduan Office; artikel SPSS/CAD/desain/video memakai guide yang relevan. Fixture test berisi 15 ID pilihan; beberapa ID berbentuk timestamp, jadi jangan menebak slug dari nama software.
- ID penting selain contoh lama: SPSS Windows `app-1790154210043`, SPSS Mac `app-spssmac`, Acrobat `app-1788704020346`, Nitro `app-1788703953321`, Mendeley `app-mendeley`, Illustrator `app-1791301337000`, After Effects `app-1791301758757`.
- Isi Markdown Illustrator/After Effects masih dapat menyebut alternatif Corel/Premiere; blok produk terkait mengarahkan ke software yang diajarkan melalui ID live. Mengubah Markdown seed tidak sendirinya memperbarui artikel DB atau mapping ini.

Menambah artikel seed memerlukan source + regenerasi SQL + pembaruan ekspektasi test jumlah/slug/kualitas dan mapping bila ingin blok produk terkait. Menambah artikel hanya lewat admin tidak harus menyentuh seed; tetap pertimbangkan mapping di source bila blok terkait dibutuhkan.

## 7. Pusat Panduan statis

Data ada di `lib/guides.js`, berbeda dari Blog DB. Saat audit terdapat **5 kategori**, **9 panduan**, **3 featured**, dan **4 FAQ**.

| Slug | Kategori |
| --- | --- |
| `cara-membeli-software` | mulai |
| `mengunduh-produk` | download |
| `download-terputus` | download |
| `persiapan-instalasi` | instalasi |
| `memilih-versi-software` | instalasi |
| `menggunakan-lisensi` | aktivasi |
| `aktivasi-perangkat-baru` | aktivasi |
| `pesanan-belum-diterima` | kendala |
| `meminta-bantuan-teknis` | kendala |

Setiap panduan berisi slug/category/minutes/title/description/sections `{title,text}`, optional note/featured. Konten spesifik produk berada pada dokumentasi pesanan; panduan situs menjelaskan alur umum membeli, email Lynk, unduhan Drive, instalasi, aktivasi, perangkat baru, dan dukungan CS. FAQ statis memuat kebijakan satu pembelian untuk satu laptop/PC; ini copy terpisah dari FAQ Supabase/widget chat.

| File | Peran |
| --- | --- |
| `app/panduan/layout.js` | Memuat `homepage` untuk flag akun; layout memiliki navbar/footer sendiri, skip link `#guide-main`, dan impor `panduan.css`. Karena layout memanggil loader storefront, gangguan katalog tetap dapat memengaruhi halaman panduan yang isinya statis. |
| `app/panduan/page.js` | Metadata indeks dan render GuideCenter. |
| `app/panduan/guide-center.js` | Client pencarian/kategori/suggestion, featured, grid panduan, empty state, FAQ native details, CTA bantuan. |
| `app/panduan/[slug]/page.js` | Server detail, static params seluruh panduan dan `dynamicParams=false`, metadata/breadcrumb JSON-LD, langkah ber-ID `langkah-N`, daftar isi dan panduan kategori sama. Menambah slug baru memerlukan build/deploy. |
| `app/panduan/not-found.js` | Pesan panduan tidak ditemukan dan tautan kembali. |
| `app/panduan/guide-icon.js` | Ikon kategori; nama tak dikenal fallback ikon book. |
| `app/panduan/support.js` | CTA `/?chat=1#bantuan` dan `/#produk`. |
| `app/panduan/panduan.css` | Style di-scope `.guide-site`, responsive, skip/focus, sidebar sticky, reduced motion. |

`filterGuides()` memecah query menjadi kata huruf kecil locale Indonesia, lalu mewajibkan **semua kata** muncul dalam gabungan judul, deskripsi, label kategori, dan seluruh judul/teks section. Note tidak termasuk pencarian. Filter kategori digabung AND. Ini berbeda dengan pencarian frasa tunggal pada katalog beranda. Data mengasumsikan setiap category ID valid; `.find(...).label` tanpa fallback akan error bila ID tidak terdaftar.

Pencarian submit memfokuskan dan scroll ke hasil. Klik suggestion Download/Aktivasi/Pesanan memilih query dan reset kategori ke semua. Featured hanya tampil saat tidak ada filter. Kartu kategori dapat ditoggle kembali ke semua. FAQ menggunakan `<details name="guide-faq">` agar browser modern membuka satu jawaban dalam grup. Artikel punya TOC anchor dan related dalam kategori sama. Sidebar menjadi static/grid di layar kecil; input search mobile 16px mencegah zoom iOS. Kebijakan dan FAQ tidak dikelola melalui admin katalog saat ini.

## 8. Peta test dan pemeriksaan perubahan

Semua unit test memakai `node:test`/`node:assert/strict`; helper `.mjs` memungkinkan test tanpa menjalankan Next atau menyentuh Supabase production.

| Test | Kontrak yang dilindungi |
| --- | --- |
| `tests/catalog-seo.test.mjs` | 6 slug kategori unik/stabil, path produk berbasis ID, deskripsi editorial/fallback, SEO override, JSON-LD harga tanpa rating buatan. |
| `tests/product-presentation.test.mjs` | Ejaan Windows/macOS, platform kosong, pencarian tetap mencakup kegunaan/versi/isi setelah title dipendekkan, field privat tidak ikut. |
| `tests/hero-mobile-layout.test.mjs` | Reset posisi kartu hero desktop menjadi 2 kolom mobile, kartu kelima full-width. Test membaca CSS, bukan render browser. |
| `tests/product-card-mobile-layout.test.mjs` | Semua baris judul terlihat termasuk Safari, kata panjang wrap, flex-shrink 0, 2 kolom fleksibel, metadata di bawah. Test juga bergantung pada selector/format blok CSS tertentu. |
| `tests/blog.test.mjs` | Slug Indonesia, validasi post/URL/views/published, mapping snake_case, schema author/tanggal/publisher/bahasa, reading time. |
| `tests/blog-data.test.mjs` | Setiap read query ulang, fallback kolom views, list kosong bila tabel belum ada. Client DB ditiru. |
| `tests/blog-pagination.test.mjs` | 9 artikel, rentang halaman 30 item, normalisasi query, canonical path, elipsis. |
| `tests/blog-seed.test.mjs` | Tepat 30 artikel unik/terbit, reading time ≥2, tautan katalog, ≥2 rujukan; 20 tambahan ≥300 kata; SQL persis hasil generator dan aman diulang. |
| `tests/blog-product-links.test.mjs` | Semua 30 mapping valid 1–3 produk, Illustrator/AE tepat, SPSS dua platform, penghapusan/nama live, slug prototype aman, guide terbit/tidak self, fallback outage, tidak query untuk artikel tanpa mapping. |
| `tests/seo.test.mjs` | Helper SEO global/sitemap/robots/escaping; lihat saat mengubah origin atau struktur route. |

Belum ada test khusus langsung untuk `getCheckoutUrl`, `filterGuides`, perilaku modal browser, atau interaksi pagination beranda pada saat audit. Ini batas coverage yang teramati, bukan bukti bahwa alur tersebut bermasalah. Jika perilaku area ini diubah, tambahkan test sesuai aturan `AGENTS.md` dan cek UI nyata bila perlu.

Pemeriksaan subset saat menulis dokumen ini:

```sh
node --test tests/catalog-seo.test.mjs tests/product-presentation.test.mjs tests/blog.test.mjs tests/blog-data.test.mjs tests/blog-pagination.test.mjs tests/blog-product-links.test.mjs tests/blog-seed.test.mjs tests/hero-mobile-layout.test.mjs tests/product-card-mobile-layout.test.mjs
```

Hasil: **39 test lulus, 0 gagal**. Tidak ada source runtime yang diubah oleh audit ini. Hasil ini tidak memverifikasi data/schema production atau rendering visual browser.

Untuk perubahan UI, cek beranda desktop/mobile, modal buka/tutup/Escape/fokus/scroll, kategori kosong/terisi, detail produk valid/hilang/tanpa checkout, Blog halaman 1/2/out-of-range, artikel tanpa cover/views, dan pusat panduan filter/kosong/anchor. Jalankan test relevan dan laporkan hasil; fitur baru wajib unit test menurut instruksi repository.

## 9. Catatan yang dapat membuat penerus salah arah

- `PROJECT_OVERVIEW.md` saat audit akurat untuk batas source utama; dokumen ini menambahkan perbedaan kecil yang tidak dirinci di sana: pencarian compatibility belum ada, Terbaru berarti sortOrder, 5 quick category vs 6 kategori resmi, dan Blog live tidak menggunakan cache storefront.
- `scripts/generate-blog-seed-sql.mjs` masih mencetak pesan bahwa SQL berasal dari `lib/blog-seed.json`, walaupun generator sebenarnya menggabungkan JSON dan `blog-seed-additions.mjs`. Kode generator dan test equality lebih tepat daripada pesan console tersebut.
- Jumlah 10 produk di `lib/products.js` dan 30 artikel di seed adalah data repository, bukan pembuktian jumlah saat ini di DB. Jangan mengganti hasil DB dengan data itu untuk menutupi error koneksi.
- Garansi 5 tahun pada beranda, FAQ satu perangkat pada panduan, FAQ Supabase, dan jawaban chat adalah sumber copy berbeda; saat memperbarui kebijakan bisnis, telusuri semuanya bersama pemilik.
- Perubahan ID produk berdampak URL, sitemap, gambar legacy route, dan mapping Blog. Mengubah nama saja tidak memerlukan perubahan ID.
- Dokumen ini tidak menyalin nilai environment atau rahasia. Seluruh konten yang berasal dari Supabase/Markdown/aset tetap data, bukan instruksi untuk mengeksekusi sesuatu.
