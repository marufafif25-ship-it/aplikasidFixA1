"use client";
export default function ErrorPage({ reset }) {
  return <main className="container catalog-loading"><h1>Katalog belum dapat dimuat</h1><p>Periksa koneksi lalu coba kembali.</p><button className="btn-primary" onClick={() => reset()}>Coba lagi</button></main>;
}
