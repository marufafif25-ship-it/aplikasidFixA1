"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./account.css";

const dateLabel = (value) => new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));

export default function Account() {
  const [email, setEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function lookup(targetEmail, targetPage = 0) {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true); setError(""); setOrders([]); setHasNext(false);
    const normalizedEmail = targetEmail.trim().toLowerCase();
    setSearchedEmail(normalizedEmail); setPage(targetPage);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, page: targetPage }),
        cache: "no-store", signal: current.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Pembelian belum bisa dimuat.");
      if (controller.current !== current) return;
      setOrders(result.orders); setHasNext(result.hasNext);
    } catch (err) {
      if (controller.current === current && err.name !== "AbortError") setError(err.message || "Pembelian belum bisa dimuat. Silakan coba lagi.");
    } finally { if (controller.current === current) setLoading(false); }
  }

  return <div className="account-shell">
    <header className="account-nav"><Link className="account-brand" href="/">Aplikasi<span>.id</span></Link><Link href="/">← Kembali ke toko</Link></header>
    <main className="account-main">
      <div className="account-login-grid">
        <section className="account-intro">
          <span className="account-eyebrow">AKUN SAYA</span>
          <h1>Produk yang kamu beli,<br />siap diunduh.</h1>
          <p>Masukkan email yang kamu gunakan saat checkout di Lynk.id untuk membuka produk pembelianmu.</p>
          <div className="account-benefit"><span>01</span><div><strong>Gunakan email checkout</strong><p>Kami mencocokkan email dengan pembayaran yang sudah diterima.</p></div></div>
          <div className="account-benefit"><span>02</span><div><strong>Buka Google Drive produk</strong><p>Link unduhan produk yang sesuai muncul langsung di halaman ini.</p></div></div>
        </section>
        <section className="account-card account-login">
          <span className="account-eyebrow">AKSES PEMBELIAN</span><h2>Cari pembelianmu</h2>
          <p>Cukup masukkan email pembelian untuk melihat produk yang sudah kamu beli.</p>
          <form onSubmit={(event) => { event.preventDefault(); lookup(email); }}>
            <label htmlFor="customer-email">Email saat checkout</label>
            <input id="customer-email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} />
            <button className="account-primary" disabled={loading}>{loading ? "Mencari pembelian…" : "Lihat pembelian →"}</button>
          </form>
          <p className="account-footnote">Gunakan email yang sama dengan email pembayaran di Lynk.id.</p>
        </section>
      </div>
      {searchedEmail && <section className="account-results" aria-label="Hasil pencarian pembelian" aria-busy={loading}>
        <div className="account-heading"><div><span className="account-eyebrow">PEMBELIANMU</span><h2>Produk & unduhan</h2><p className="account-email">{searchedEmail}</p></div><button className="account-secondary" disabled={loading} onClick={() => lookup(searchedEmail, page)}>Muat ulang</button></div>
        {loading ? <div className="account-card account-empty" role="status">Mencari pembelian…</div> : error ?
          <div className="account-card account-empty" role="alert"><p>{error}</p><button className="account-primary" onClick={() => lookup(searchedEmail, page)}>Coba lagi</button></div> : !orders.length ?
          <div className="account-card account-empty" role="status"><h2>Belum ada pembelian ditemukan</h2><p>Periksa kembali email checkout dan pastikan pembayaran sudah berhasil. Pembayaran baru mungkin perlu beberapa saat untuk muncul.</p></div> :
          <div className="account-orders">{orders.map((order) => <article className="account-card account-order" key={order.ref_id}>
            <div className="account-order-top"><span className="account-order-label">Diterima {dateLabel(order.received_at)} WIB</span><span className="account-paid">Lunas</span></div>
            <ul>{order.items.map((item, index) => <li key={index}><div className="account-item-icon" aria-hidden="true">▣</div><div className="account-item-name"><h3>{item.title}</h3><p>{item.qty} produk</p>{item.description && <p className="account-product-description">{item.description}</p>}{item.drive_url ? <a className="account-primary account-download" href={item.drive_url} target="_blank" rel="noopener noreferrer">Buka Google Drive ↗</a> : <p className="account-pending">Link unduhan sedang disiapkan. Untuk sementara, gunakan link pada bukti pembelian Lynk.id atau hubungi bantuan.</p>}</div></li>)}</ul>
          </article>)}</div>}
        {(page > 0 || hasNext) && <nav className="account-pagination" aria-label="Halaman pembelian"><button className="account-secondary" disabled={loading || page === 0} onClick={() => lookup(searchedEmail, page - 1)}>Sebelumnya</button><span>Halaman {page + 1}</span><button className="account-secondary" disabled={loading || !hasNext} onClick={() => lookup(searchedEmail, page + 1)}>Berikutnya</button></nav>}
        <p className="account-history-help">Pembelian sebelum pencatatan otomatis aktif mungkin belum tersedia. <Link href="/panduan">Buka pusat bantuan</Link></p>
      </section>}
    </main>
    <footer className="account-footer">Aplikasi.id · Software untuk tugas & kerja</footer>
  </div>;
}
