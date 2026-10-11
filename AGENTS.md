<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Testing

Setiap fitur baru wajib disertai unit test. Jalankan unit test yang relevan sebelum menyelesaikan pekerjaan dan laporkan hasilnya.

## Panduan Proyek

- Baca `PROJECT_OVERVIEW.md` untuk peta arsitektur, alur data, dan catatan operasional sebelum melanjutkan pekerjaan lintas fitur.
- Aplikasid adalah storefront berbasis Next.js App Router. Route dan halaman berada di `app/`, logika bersama berada di `lib/`, dan aset statis berada di `assets/`.
- Ikuti pola JavaScript dan gaya UI yang sudah ada. Teks antarmuka menggunakan bahasa Indonesia.
- Untuk perubahan yang memakai Next.js, baca dokumentasi lokal yang relevan di `node_modules/next/dist/docs/` terlebih dahulu karena versi Next.js proyek ini dapat berubah.
- Simpan integrasi dan akses rahasia di sisi server. Jangan mengekspos service role key, token, atau rahasia lain ke kode client; perbarui `.env.example` bila menambah variabel lingkungan.
- Tambahkan unit test di `tests/` dengan pola Node.js test runner yang sudah dipakai. Jalankan `npm test` untuk seluruh unit test atau pilih file test yang relevan.
