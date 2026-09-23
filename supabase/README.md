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

Jangan matikan endpoint lama sebelum data impor dan web baru diverifikasi. Data lokal/default tetap tampil saat koneksi gagal; tampilnya katalog saja bukan bukti koneksi berhasil. Build dapat dijalankan tanpa env, tetapi akses database membutuhkan konfigurasi yang benar.

Dokumentasi: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

## Impor dari folder SpreadsheetYangLama

Jalankan `python3 scripts/import-local-csv.py` untuk membuat `supabase/import-data.sql` dari CSV lokal. Jalankan SQL tersebut di SQL Editor project Supabase setelah `schema.sql`. Script memvalidasi ID unik dan angka, mengubah specs menjadi array, serta menyimpan gambar base64 sebagai aset di `public/assets/imported/`. Sertakan aset tersebut saat deploy. ID yang sudah ada tidak ditimpa. File auth.csv tidak dimasukkan ke tabel publik; buat akun melalui Supabase Auth sesuai langkah di atas.
