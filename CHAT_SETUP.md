# Chat CS AI

Chat CS mengirim pesan ke `POST /api/chat`. Server menambahkan katalog publik,
FAQ aktif dari Supabase, dan panduan toko sebagai konteks. Jumlah pertanyaan
dalam percakapan tidak dibatasi. Riwayat yang dikirim ke AI memakai 9 pasang
pesan terakhir agar percakapan panjang tetap dapat dilanjutkan; percakapan hanya
disimpan selama halaman terbuka.

## Aktivasi

1. Buat API key di [SumoPod](https://ai.sumopod.com) dengan akses ke model
   `gpt-4o-mini`.
2. Tambahkan konfigurasi berikut ke `.env.local` atau environment server hosting:

   ```dotenv
   SUMOPOD_API_KEY=isi_key_anda
   SUMOPOD_MODEL=gpt-4o-mini
   SUMOPOD_BASE_URL=https://ai.sumopod.com/v1
   ```

3. Pastikan variabel Supabase pada `.env.example` sudah diisi agar konteks toko
   dapat dimuat. Restart `npm run dev`, atau build dan deploy ulang di hosting.
4. Buka `/?chat=1`, tanyakan kebutuhan software, lalu kirim pertanyaan lanjutan.

API key hanya dibaca di server; jangan gunakan awalan `NEXT_PUBLIC_` dan jangan
commit `.env.local`. Hosting perlu diisi `SUMOPOD_API_KEY` secara terpisah.
Model dan endpoint di atas digunakan sebagai default jika variabelnya kosong.
Chatbot memakai GPT-4o mini melalui endpoint OpenAI-compatible SumoPod.
Variabel lama `QWEN_API_KEY`, `QWEN_MODEL`, dan `QWEN_BASE_URL` masih diterima
sebagai fallback; variabel `SUMOPOD_*` diutamakan. Saat migrasi, isi ketiga
variabel `SUMOPOD_*` di hosting agar model dan key lama tidak terpakai.
FAQ tetap tersedia saat AI gagal merespons. Ketersediaan, biaya, dan kuota
mengikuti akun SumoPod. Error `403 key_model_access_denied` menunjukkan key
belum diizinkan memakai model yang dipilih.

Untuk pertanyaan pembelian atau memilih/mengganti model produk, chatbot
mengarahkan pelanggan ke katalog dan halaman checkout. Ikuti instruksi di
checkout; QRIS disarankan karena biaya adminnya paling murah.

Fitur **Akun Saya** dapat dinyalakan atau disembunyikan dari dashboard, pada
bagian **Visibilitas Akun Saya**. Saat disembunyikan, tautan tidak ditampilkan,
halaman `/akun` kembali ke beranda, dan chatbot mengarahkan pertanyaan status
pembelian ke CS WhatsApp.

## Saat AI tidak tersedia

UI menampilkan pesan kegagalan, mencari jawaban FAQ yang cocok, dan tetap
menyediakan pertanyaan populer serta tautan WhatsApp dari pengaturan footer.
Tombol FAQ tidak memanggil provider AI. Jika tidak ada FAQ yang cocok, pertanyaan
dikembalikan ke kolom pesan untuk dicoba ulang. Error tidak masuk riwayat AI.

Permintaan GPT-4o mini tidak mengirim parameter khusus Qwen. Parameter
`enable_thinking: false` hanya dikirim jika model Qwen dipilih secara eksplisit. Backend hanya membaca konten
jawaban, menghapus blok thinking bertanda, serta menolak respons terpotong atau
pola analisis yang dikenali agar UI memakai FAQ cadangan. Filter pola ini bukan
jaminan deteksi semua bentuk analisis dari setiap model.

Backend membatasi pesan menjadi 4.000 karakter dan 19 pesan per permintaan,
ukuran body 100 KB, serta waktu total permintaan provider 60 detik, termasuk
percobaan ulang. Aplikasi tidak membatasi jumlah permintaan per menit atau chat
bersamaan. Endpoint ini publik, tidak memakai login.

Jika provider mengembalikan HTTP 429 atau kode error 429, backend mencoba ulang
otomatis maksimal dua kali untuk jeda hingga 10 detik. Header `Retry-After`
diikuti jika tersedia; jika tidak valid atau tidak tersedia, jedanya 1 lalu
2 detik. Jeda yang lebih panjang langsung ditampilkan sebagai error. Pembatalan
permintaan juga membatalkan penantian. Batas dari akun atau layanan SumoPod tetap
berlaku dan tidak dapat dihapus dari kode aplikasi.

## Verifikasi

```sh
node --test tests/*.test.mjs
npm run build
```

Tes memakai provider tiruan untuk memeriksa respons, validasi, riwayat,
chat bersamaan, percobaan ulang, dan kegagalan tanpa menghabiskan kuota. Verifikasi jawaban AI nyata
memerlukan API key yang aktif.
