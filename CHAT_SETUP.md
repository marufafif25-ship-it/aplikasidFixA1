# Chat CS AI

Chat CS mengirim pesan ke `POST /api/chat`. Server menambahkan katalog publik,
FAQ aktif dari Supabase, dan panduan toko sebagai konteks. Riwayat terbatas pada
9 pasang pesan terakhir; percakapan hanya disimpan selama halaman terbuka.

## Aktivasi

1. Buat API key di https://openrouter.ai/settings/keys.
2. Tambahkan konfigurasi berikut ke `.env.local` atau environment server hosting:

   ```dotenv
   OPENROUTER_API_KEY=isi_key_anda
   OPENROUTER_MODEL=openrouter/free
   ```

3. Pastikan variabel Supabase pada `.env.example` sudah diisi agar konteks toko
   dapat dimuat. Restart `npm run dev`, atau build dan deploy ulang di hosting.
4. Buka `/?chat=1`, tanyakan kebutuhan software, lalu kirim pertanyaan lanjutan.

API key hanya dibaca di server; jangan gunakan awalan `NEXT_PUBLIC_`.
`openrouter/free` memilih model gratis yang tersedia. Model tertentu boleh
digunakan jika ID-nya berakhiran `:free`; backend menolak model berbayar.
Lihat [dokumentasi router gratis](https://openrouter.ai/openrouter/free).
Ketersediaan dan kuota tetap mengikuti OpenRouter.

## Saat AI tidak tersedia

UI menampilkan pesan kegagalan, mencari jawaban FAQ yang cocok, dan tetap
menyediakan pertanyaan populer serta tautan WhatsApp dari pengaturan footer.
Tombol FAQ tidak memanggil provider AI. Jika tidak ada FAQ yang cocok, pertanyaan
dikembalikan ke kolom pesan untuk dicoba ulang. Error tidak masuk riwayat AI.

Permintaan AI menonaktifkan reasoning jika model mendukungnya dan meminta
OpenRouter mengecualikannya dari respons. Backend hanya membaca konten jawaban,
menghapus blok thinking bertanda, serta menolak respons terpotong atau pola
analisis yang dikenali agar UI memakai FAQ cadangan. Filter pola ini bukan
jaminan deteksi semua bentuk analisis dari setiap model.
Referensi: [kontrol reasoning OpenRouter](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens).

Backend membatasi pesan menjadi 4.000 karakter dan 19 pesan per permintaan,
ukuran body 100 KB, serta waktu permintaan provider 60 detik. Pembatas lokal
adalah 20 permintaan/menit dan 3 permintaan bersamaan per proses server;
deployment dengan beberapa instance memerlukan limiter bersama di gateway
untuk membatasi total trafik. Endpoint ini publik, tidak memakai login.

## Verifikasi

```sh
node --test tests/*.test.mjs
npm run build
```

Tes memakai provider tiruan untuk memeriksa respons, validasi, riwayat,
pembatasan, dan kegagalan tanpa menghabiskan kuota. Verifikasi jawaban AI nyata
memerlukan API key yang aktif.
