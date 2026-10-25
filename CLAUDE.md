@AGENTS.md

# Konteks kerja Claude — Aplikasid

Proyek ini adalah sumber penghasilan pemilik. Utamakan kelanjutan fitur dan kestabilan toko, perubahan terarah, serta penjelasan bahasa Indonesia. Ikuti pola kode/UI yang sudah ada. Jangan mengubah aturan pembelian atau akses pelanggan tanpa permintaan pemilik.

## Mulai dari sini

1. Baca [HANDOFF_CLAUDE.md](HANDOFF_CLAUDE.md): ringkasan mandiri, urutan membaca, dan cara melanjutkan dengan konteks terbatas.
2. Baca [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) sebelum pekerjaan lintas fitur.
3. Baca bagian yang terkait tugas; tidak perlu memasukkan seluruh source sekaligus ke konteks:
   - [Storefront dan konten](docs/claude/STORE_FRONT_DAN_KONTEN.md).
   - [Backend dan data](docs/claude/BACKEND_DAN_DATA.md).
   - [Admin dan operasional](docs/claude/ADMIN_DAN_OPERASIONAL.md).
   - [Konfigurasi dan status pemeriksaan](docs/claude/KONFIGURASI_DAN_STATUS.md).
   - [Peta semua file proyek](docs/claude/PETA_FILE.md).
4. Baca implementasi dan test terkait sebelum mengedit. Dokumen serah terima adalah snapshot 22 Oktober 2026; source terbaru dan hasil pemeriksaan langsung menentukan perilaku sebenarnya.

## Fakta yang harus dipertahankan

- Runtime utama: Next.js App Router di `app/`, helper `lib/`, Supabase. `index.html`, `app.js`, `styles.css`, dan `server.py` di root adalah aplikasi lama. `lib/products.js` adalah data lama, bukan fallback katalog aktif.
- Route admin memang `/adminn`. Login admin memakai Supabase Auth dan role `admin_users`; jangan buat login spreadsheet baru.
- Produk, homepage/footer, FAQ, artikel, transaksi, dan pemetaan unduhan aktif berada di Supabase. CSV/SQL seed tidak otomatis mencerminkan production.
- `products.id` menentukan URL detail; `items[].uuid` Lynk menentukan pemetaan unduhan. Kedua ID tersebut berbeda konsep. Jangan mencocokkan berdasarkan judul atau menebak dari URL checkout.
- Pembayaran menggunakan URL `buyUrl` ke checkout eksternal (alur toko: Lynk). Webhook menyimpan pembayaran; aplikasi tidak memproses pembayaran sendiri.
- `/akun` menggunakan email checkout saja, tanpa OTP/password pembeli. Toggle `homepage.accountEnabled === true` hanya mengatur tampilan/halaman/chat; API pencarian pembelian tidak dinonaktifkan oleh toggle itu.
- Judul produk dibuat singkat; platform, versi, deskripsi, dan batasan paket tetap terpisah. Pencarian mencakup judul/kategori/platform/versi/deskripsi/specs; `compatibility` belum termasuk. Judul kartu mobile harus tampil utuh.
- Katalog di-cache 60 detik dengan tag `storefront`; mutasi katalog via API menginvalidasi cache. Blog publik dibaca ulang tanpa cache database supaya impor langsung terlihat.
- Aset URL `/assets/...` dilayani dari `public/assets/`. Mengganti file di root `assets/` saja belum mengganti aset yang disajikan Next.js.
- Rahasia tetap di server dan `.env.local`/environment hosting. Claude yang berjalan di folder lokal yang sama bisa memakai env yang sudah ada saat diperlukan, tanpa menyalin nilainya ke dokumentasi, kode client, commit, atau log.

## Pemeriksaan perubahan

- Setiap fitur baru wajib disertai unit test di `tests/`, memakai `node:test`. Jalankan test relevan; gunakan `npm test` untuk seluruh suite.
- Untuk perubahan Next.js, baca panduan relevan di `node_modules/next/dist/docs/` lebih dahulu. Lock saat serah terima: Next 16.4.0, React 19.2.8. Jangan menganggap API dari ingatan cocok.
- `npm run build` untuk pemeriksaan produksi lokal. Build berhasil belum memverifikasi integrasi hosting.
- `npm run lint` saat snapshot masih rusak karena berisi `next lint`; jangan melaporkannya lulus. Perbaikan lint adalah pekerjaan tersendiri bila diperlukan.
- Periksa `git status` dan jangan menimpa perubahan pemilik. Jangan otomatis mengimpor SQL, mengubah data produksi, deploy, push, atau mengirim pesan ke pelanggan hanya karena membaca panduan ini.
- Setelah tugas selesai, laporkan perubahan, hasil test, dan batas verifikasi. Perbarui dokumen terkait jika alur/data berubah.
