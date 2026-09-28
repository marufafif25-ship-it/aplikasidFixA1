"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import "./account.css";

const PAGE_SIZE = 10;
const rupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const dateLabel = (value) => new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));

export default function Account() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [authError, setAuthError] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const requestId = useRef(0);
  const sessionIdentity = useRef(null);

  useEffect(() => {
    let active = true;
    let subscription;
    try {
      const supabase = getSupabase();
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const query = new URLSearchParams(window.location.search);
      if (hash.has("error") || query.has("error")) {
        setAuthError("Tautan masuk tidak valid atau sudah kedaluwarsa. Minta tautan baru.");
        window.history.replaceState(null, "", "/akun");
      }
      const applySession = (session) => {
        if (!active) return;
        const identity = session?.user ? `${session.user.id}:${session.user.email}` : null;
        setInitializing(false);
        if (sessionIdentity.current === identity) return;
        sessionIdentity.current = identity;
        requestId.current += 1;
        setOrders([]); setOrderError(""); setPage(0); setHasNext(false); setLoading(Boolean(session));
        setUser(session?.user || null);
      };
      // Supabase resolves the email link before emitting INITIAL_SESSION.
      subscription = supabase.auth.onAuthStateChange((_event, session) => applySession(session)).data.subscription;
    } catch {
      setAuthError("Layanan akun belum tersedia. Silakan coba lagi nanti.");
      setInitializing(false);
    }
    return () => { active = false; requestId.current += 1; subscription?.unsubscribe(); };
  }, []);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const id = ++requestId.current;
    setLoading(true); setOrderError(""); setOrders([]);
    try {
      const { data, error } = await getSupabase().from("lynk_orders")
        .select("ref_id,items,payment_status,received_at")
        .order("received_at", { ascending: false }).order("ref_id", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      if (error) throw error;
      if (id !== requestId.current) return;
      setOrders((data || []).slice(0, PAGE_SIZE));
      setHasNext((data || []).length > PAGE_SIZE);
    } catch {
      if (id === requestId.current) setOrderError("Riwayat belum bisa dimuat. Silakan coba lagi.");
    } finally { if (id === requestId.current) setLoading(false); }
  }, [user, page]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function signIn(event) {
    event.preventDefault(); setSending(true); setAuthError(""); setNotice("");
    try {
      const { error } = await getSupabase().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/akun`, shouldCreateUser: true },
      });
      if (error) throw error;
      setNotice("Tautan masuk sudah diminta. Periksa inbox dan folder spam email kamu, lalu klik tautannya.");
    } catch { setAuthError("Tautan belum bisa dikirim. Periksa email kamu atau coba beberapa saat lagi."); }
    finally { setSending(false); }
  }

  async function signOut() {
    setAuthError(""); setSending(true);
    try {
      const { error } = await getSupabase().auth.signOut({ scope: "local" });
      if (error) throw error;
      setNotice("");
    } catch { setAuthError("Belum berhasil keluar. Silakan coba lagi."); }
    finally { setSending(false); }
  }

  return <div className="account-shell">
    <header className="account-nav">
      <Link className="account-brand" href="/">Aplikasi<span>.id</span></Link>
      <Link href="/">← Kembali ke toko</Link>
    </header>
    <main className="account-main">
      {initializing ? <div className="account-card account-empty" role="status">Memuat akun kamu…</div> : !user ?
        <div className="account-login-grid">
          <section className="account-intro">
            <span className="account-eyebrow">AKUN PELANGGAN</span>
            <h1>Semua pembelianmu,<br />di satu tempat.</h1>
            <p>Masuk untuk melihat riwayat software yang sudah kamu beli melalui Lynk.id.</p>
            <div className="account-benefit"><span>01</span><div><strong>Pakai email saat checkout</strong><p>Riwayat pembelian terhubung dengan email yang kamu gunakan di Lynk.id.</p></div></div>
            <div className="account-benefit"><span>02</span><div><strong>Masuk lewat tautan email</strong><p>Tanpa perlu mengingat kata sandi. Buka tautan yang dikirim ke email kamu.</p></div></div>
          </section>
          <section className="account-card account-login">
            <span className="account-eyebrow">SELAMAT DATANG</span>
            <h2>Masuk ke akun</h2>
            <p>Belum punya akun? Akun dibuat otomatis saat kamu pertama kali masuk melalui email.</p>
            <form onSubmit={signIn}>
              <label htmlFor="customer-email">Email pembelian</label>
              <input id="customer-email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} disabled={sending} />
              <button className="account-primary" disabled={sending}>{sending ? "Mengirim tautan…" : "Kirim tautan masuk →"}</button>
            </form>
            {notice && <p className="account-success" role="status">{notice}</p>}
            {authError && <p className="account-error" role="alert">{authError}</p>}
            <p className="account-footnote">Gunakan email yang sama persis dengan email saat pembayaran di Lynk.id.</p>
          </section>
        </div> : <>
          <section className="account-heading">
            <div><span className="account-eyebrow">AKUN SAYA</span><h1>Riwayat pembelian</h1><p className="account-email">{user.email}</p></div>
            <button className="account-secondary" onClick={signOut} disabled={sending}>Keluar</button>
          </section>
          {authError && <p className="account-error" role="alert">{authError}</p>}
          <div className="account-history-note"><p>Pembayaran yang sudah diterima dari Lynk.id akan muncul di sini. Gunakan email akun ini saat checkout.</p><button className="account-secondary" disabled={loading} onClick={loadOrders}>Muat ulang</button></div>
          {loading ? <div className="account-card account-empty" role="status">Memuat riwayat pembelian…</div> : orderError ? <div className="account-card account-empty" role="alert"><p>{orderError}</p><button className="account-primary" onClick={loadOrders}>Coba lagi</button></div> : !orders.length ?
            <div className="account-card account-empty"><span className="account-empty-icon" aria-hidden="true">▤</span><h2>Belum ada pembelian tercatat</h2><p>Riwayat muncul setelah notifikasi pembayaran diterima. Jika sudah membeli, pastikan email checkout sama dengan email akun ini.</p><Link className="account-primary" href="/">Lihat produk</Link></div> :
            <div className="account-orders">{orders.map((order) => <article className="account-card account-order" key={order.ref_id}>
              <div className="account-order-top"><div><span className="account-order-label">Diterima {dateLabel(order.received_at)} WIB</span><p className="account-reference">Ref. {order.ref_id}</p></div><span className="account-paid">Lunas</span></div>
              <ul>{order.items.map((item, index) => <li key={`${item.uuid || "item"}-${index}`}><div className="account-item-icon" aria-hidden="true">▣</div><div className="account-item-name"><h2>{item.title}</h2><p>{item.qty} × {rupiah(item.price)}</p></div><strong>{rupiah(item.qty * item.price)}</strong></li>)}</ul>
              <p className="account-footnote">Harga item belum termasuk add-on, diskon, atau biaya lainnya. Rincian pembayaran dan akses produk mengikuti email dari Lynk.id.</p>
            </article>)}</div>}
          {(page > 0 || hasNext) && <nav className="account-pagination" aria-label="Halaman riwayat"><button className="account-secondary" disabled={loading || page === 0} onClick={() => setPage((value) => value - 1)}>Sebelumnya</button><span>Halaman {page + 1}</span><button className="account-secondary" disabled={loading || !hasNext} onClick={() => setPage((value) => value + 1)}>Berikutnya</button></nav>}
          <p className="account-history-help">Pembelian sebelum integrasi aktif belum tentu tersedia di riwayat. Simpan email bukti pembelian dari Lynk.id.</p>
        </>}
    </main>
    <footer className="account-footer">Aplikasi.id · Software untuk tugas & kerja</footer>
  </div>;
}
