# Setup Supabase Aplikasi.id

1. Masuk ke https://supabase.com/dashboard dan buat project `aplikasid`. Pilih region dekat pengguna, simpan password database sendiri.
2. Buka SQL Editor → New query, salin seluruh `supabase/schema.sql`, lalu Run. Ini membuat tabel, indeks, dan RLS: publik hanya membaca; admin/owner dapat menulis.
3. Buka Connect, salin Project URL dan publishable key. Salin `.env.example` menjadi `.env.local`, lalu isi kedua nilainya. Jangan gunakan secret/service_role key di variabel NEXT_PUBLIC.
4. Buka Authentication → Users → Add user, buat akun admin dengan email/password dan konfirmasi email. Akun spreadsheet lama tidak ikut dipindah.
5. Salin UUID akun tersebut, lalu jalankan di SQL Editor:

```sql
insert into public.admin_users (id, role)
values ('GANTI_DENGAN_UUID_USER', 'owner')
on conflict (id) do update set role = excluded.role;
```

6. Ekspor data spreadsheet lama dari terminal (URL ada pada deployment Apps Script lama):

```sh
LEGACY_PRODUCTS_API_URL='https://script.google.com/macros/s/DEPLOYMENT_ID/exec' node scripts/export-sheet.mjs
```

   Periksa `supabase/import-data.sql`, lalu jalankan di SQL Editor setelah schema. Ekspor mencakup produk, homepage, footer, dan FAQ yang ditampilkan endpoint lama. FAQ nonaktif yang tidak diekspos endpoint perlu dipindahkan terpisah. Akun/password tidak diekspor. Impor tidak menimpa ID yang sudah ada; gunakan project kosong untuk migrasi awal.
7. Jalankan `npm run dev`, buka toko dan `/adminn`, login menggunakan email admin baru. Uji tambah/edit/hapus produk, urutan produk, homepage, footer, dan FAQ. Pastikan perubahan terlihat dari browser lain.
8. Isi environment variable yang sama di hosting, kemudian rebuild/deploy. Kode Next.js sekarang memakai Supabase; file statis lama `index.html`/`app.js` bukan aplikasi Next.js ini.

Jangan matikan endpoint lama sebelum data impor dan web baru diverifikasi. Halaman utama mengambil katalog dari Supabase di server; data contoh dan localStorage tidak digunakan sebagai sumber katalog. Cache server diperiksa ulang setelah 60 detik. Perubahan melalui admin memverifikasi token serta role, menyimpan dengan RLS, lalu menghapus cache agar permintaan berikutnya mengambil data terbaru. Perubahan langsung di dashboard Supabase mengikuti interval cache. Jika pengambilan gagal tanpa cache yang tersedia, halaman menampilkan tombol coba lagi. Build dapat dijalankan tanpa env, tetapi akses database membutuhkan konfigurasi yang benar.

Dokumentasi: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

## Impor dari folder SpreadsheetYangLama

Jalankan `python3 scripts/import-local-csv.py` untuk membuat `supabase/import-data.sql` dari CSV lokal. Jalankan SQL tersebut di SQL Editor project Supabase setelah `schema.sql`. Script memvalidasi ID unik dan angka, mengubah specs menjadi array, serta menyimpan gambar base64 sebagai aset di `public/assets/imported/`. Sertakan aset tersebut saat deploy. ID yang sudah ada tidak ditimpa. File auth.csv tidak dimasukkan ke tabel publik; buat akun melalui Supabase Auth sesuai langkah di atas.

## Akses pembelian dengan email checkout

`/akun` sekarang menampilkan produk dan tombol Google Drive setelah pembeli memasukkan email checkout. Tidak memakai Supabase Auth, password, OTP, atau pengiriman email. `/login` tetap mengarah ke `/akun`. Sesuai pilihan pemilik toko, pengetahuan atas email checkout cukup untuk membuka pembelian; ini bukan verifikasi identitas.

### Aktivasi

1. Jalankan `supabase/lynk-orders.sql` jika belum diterapkan, lalu `supabase/product-downloads.sql` di SQL Editor project yang sama.
2. Pastikan hosting memiliki `SUPABASE_SECRET_KEY` atau `SUPABASE_SERVICE_ROLE_KEY`, selain URL dan publishable key Supabase. Key server tetap privat, tanpa awalan `NEXT_PUBLIC_`. Endpoint webhook yang sudah aktif menggunakan key server yang sama. `.env.local` juga membutuhkan key server untuk mencoba data nyata secara lokal.
3. Buka `/adminn`, login dengan akun admin yang sudah ada, lalu bagian **Link Google Drive produk Lynk**. Pilih produk dari transaksi, isi nama/keterangan yang akan tampil ke pembeli, masukkan link Google Drive secara manual, dan simpan. Pengaturan cukup satu kali per ID produk, bukan per email pelanggan. Daftar pilihan menggabungkan 1.000 transaksi terbaru dengan pemetaan yang sudah disimpan; produk lain dapat ditambahkan manual memakai `items[].uuid` dari transaksi.
4. Deploy kode, buka `/akun`, lalu masukkan email checkout yang memiliki pembayaran tercatat. Uji link produk yang sudah dipetakan, produk belum dipetakan, email tidak ditemukan, dan pagination.

Nama, keterangan, dan link Drive disimpan dalam tabel `product_downloads`, terpisah dari katalog `products` yang bisa dibaca publik. Hanya admin dan server yang dapat membaca/menulis pemetaan langsung. API pembelian mencocokkan email secara persis setelah trim/lowercase, hanya membaca pembayaran `paid`, dan hanya mengembalikan link dengan `lynk_item_id` yang sama persis dengan `items[].uuid`. Nama produk dan kode pendek URL checkout tidak dipakai untuk menebak kecocokan.

Integrasi webhook saat ini menyimpan ID, nama, harga, dan jumlah item; tidak menyimpan link unduhan dari produk Lynk. Link perlu disalin sekali per ID produk ke pengaturan admin; perubahan link di Lynk perlu diperbarui di admin juga. Link yang belum dipetakan/nonaktif menampilkan pesan bahwa unduhan sedang disiapkan, dengan arahan ke bukti pembelian Lynk. Pembelian sebelum integrasi webhook aktif tidak otomatis diimpor.

API menggunakan POST dan `Cache-Control: private, no-store`. Email serta hasil pencarian tidak disimpan di URL atau localStorage. RLS tabel transaksi tetap aktif dan browser tidak mendapat akses baca anonim langsung ke tabel. Login admin tetap menggunakan Supabase Auth seperti sebelumnya.

### Webhook Lynk

`/api/webhook/lynk` menerima `payment.received`, memverifikasi `X-Lynk-Signature`, dan menyimpan satu transaksi per `refId`. Pengiriman ulang tidak menimpa transaksi sebelumnya. URL webhook: `https://www.aplikasid.my.id/api/webhook/lynk`; simpan merchant key sebagai `LYNK_MERCHANT_KEY` pada hosting. Perubahan akses pembelian tidak mengubah alur webhook.

Timestamp Lynk disimpan sebagai teks karena sumber tidak menyertakan zona waktu. UI menggunakan `received_at` dalam WIB. Data jawaban tambahan, alamat, nomor telepon, dan payload mentah tidak disimpan.

### Pengujian

```sh
node --test tests/*.test.mjs
npm run build
npm install --prefix /tmp/aplikasid-db-check --no-audit --no-fund @electric-sql/pglite
PGLITE_MODULE=/tmp/aplikasid-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/lynk-orders-rls.mjs
PGLITE_MODULE=/tmp/aplikasid-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/product-downloads-rls.mjs
```

Pengujian lokal memakai data buatan, tidak mengakses transaksi produksi. Uji juga dengan email checkout nyata setelah pemetaan link dan deployment selesai.
