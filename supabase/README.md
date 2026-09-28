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

## Akun pelanggan dan webhook Lynk.id

Implementasi baru:
- `/akun`: login melalui tautan email Supabase dan riwayat pembelian, 10 transaksi per halaman. `/login` mengarah ke `/akun`.
- `/api/webhook/lynk`: menerima POST `payment.received`, memverifikasi `X-Lynk-Signature`, menyimpan pembayaran sukses.
- Transaksi dicocokkan ke email checkout, dinormalisasi huruf kecil. Tidak harus membuat akun sebelum membeli.
- RLS membaca email terverifikasi dari `auth.users` berdasarkan `auth.uid()`. Pengguna tidak bisa membaca transaksi email lain atau menulis transaksi melalui browser. Metadata profil tidak digunakan untuk menentukan pemilik.
- Satu baris per `refId`; pengiriman ulang diabaikan tanpa menimpa transaksi sebelumnya. Ini mencegah order ganda; tidak ada email/pengiriman produk tambahan dari webhook.

### Aktivasi

1. Jalankan `supabase/lynk-orders.sql` melalui SQL Editor project Supabase yang sama. Ini migrasi terpisah, bukan bagian dari `schema.sql`.
2. Di Supabase Authentication, aktifkan Email provider dan pendaftaran pengguna. Gunakan template Magic Link dengan `{{ .ConfirmationURL }}`. Login pertama otomatis membuat akun setelah verifikasi email.
3. Atur Site URL ke `https://www.aplikasid.my.id`. Tambahkan Redirect URL `https://www.aplikasid.my.id/akun`, serta `http://localhost:3000/akun` untuk pengujian lokal. Konfigurasikan SMTP produksi agar email login dapat dikirim ke pelanggan (layanan email bawaan Supabase memiliki pembatasan).
4. Tambahkan `SUPABASE_SECRET_KEY` (atau legacy `SUPABASE_SERVICE_ROLE_KEY`) ke environment hosting dan `.env.local` untuk pengujian. Jangan beri awalan `NEXT_PUBLIC_`, jangan commit secret.
5. Deploy, lalu simpan URL webhook `https://www.aplikasid.my.id/api/webhook/lynk` di dashboard Lynk.id. Menurut dokumentasi, merchant key muncul setelah URL disimpan.
6. Simpan merchant key di environment hosting sebagai `LYNK_MERCHANT_KEY`, lalu redeploy. Endpoint mengembalikan 503 sampai konfigurasi lengkap; jangan mulai transaksi uji sebelum siap.
7. Uji pembayaran dengan email sendiri. Buka `/akun`, minta tautan masuk dengan email yang sama, dan verifikasi bahwa transaksi muncul.

### Pemeriksaan sebelum produksi

- Jalankan `node --test tests/lynk-webhook.test.mjs` dan `npm run build`.
- Uji login, tautan kedaluwarsa, logout, dan email checkout yang berbeda.
- Dengan dua akun terverifikasi A dan B: buat pembelian A, lalu pastikan B tidak bisa membaca transaksi A, termasuk melalui query langsung ke tabel `lynk_orders`. Anonim tidak memiliki akses SELECT; pengguna biasa tidak memiliki INSERT/UPDATE/DELETE.
- Kirim ulang payload yang sama dua kali: tabel harus tetap satu baris untuk refId itu.
- Signature salah harus menghasilkan 401 dan tidak menulis data. Database gagal harus menghasilkan 500, bukan sukses.
- Jadwal/jumlah retry Lynk tidak dijelaskan dalam dokumentasi; pantau kegagalan dan lakukan rekonsiliasi jika ada notifikasi terlewat. Pembelian lama tidak otomatis diimpor.

Nominal `grandTotal` di dokumentasi Lynk adalah pendapatan bersih penjual. UI hanya menampilkan harga item dan jumlah, dengan catatan bahwa add-on, diskon, serta biaya lain ada di bukti pembayaran Lynk. Timestamp sumber disimpan sebagai teks karena contoh Lynk tidak memberi zona waktu; UI menampilkan waktu notifikasi diterima dalam WIB. Data jawaban tambahan, alamat, nomor telepon, dan payload mentah tidak disimpan. Produk unduhan tetap mengikuti email Lynk; webhook ini tidak menyediakan URL unduhan.

Referensi: https://documenter.getpostman.com/view/43601478/2sBXc8o3kn
Login email: https://supabase.com/docs/guides/auth/auth-email-passwordless

Pengujian RLS lokal terisolasi (PGlite/PostgreSQL, tidak mengakses database produksi):

```sh
npm install --prefix /tmp/aplikasid-db-check --no-audit --no-fund @electric-sql/pglite
PGLITE_MODULE=/tmp/aplikasid-db-check/node_modules/@electric-sql/pglite/dist/index.js node tests/lynk-orders-rls.mjs
```

Test ini memeriksa migrasi bisa diulang, pembatasan SELECT antar dua akun, penolakan email belum terverifikasi dan akun anonim, penolakan penulisan oleh pelanggan, serta duplikat yang tidak mengubah pemilik transaksi. Tetap uji proyek Supabase sebenarnya setelah migrasi diterapkan.
