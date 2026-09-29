import Image from "next/image";
import Link from "next/link";
import "./panduan.css";

export default function GuideLayout({ children }) {
  return <div className="guide-site">
    <a className="guide-skip" href="#guide-main">Lewati ke konten</a>
    <header className="guide-nav">
      <div className="guide-container guide-nav-inner">
        <Link href="/" className="guide-brand" aria-label="Aplikasi.id — beranda">
          <Image src="/assets/logos/aplikasid-hitamputih.png" alt="" width={40} height={40} />
          <span><strong>Aplikasi.id</strong><small>LICENSED SOFTWARE</small></span>
        </Link>
        <nav aria-label="Navigasi utama">
          <Link href="/">Beranda</Link><Link href="/#produk">Produk</Link><Link href="/panduan" aria-current="page">Bantuan</Link><Link href="/#garansi">Garansi</Link>
        </nav>
        <Link className="guide-account" href="/akun">Akun Saya <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
    {children}
    <footer className="guide-footer guide-container">
      <div><strong>Aplikasi.id</strong><p>Software untuk kebutuhan kerja dan bisnismu.</p></div>
      <nav aria-label="Navigasi footer"><Link href="/#produk">Katalog software</Link><Link href="/panduan">Pusat bantuan</Link><Link href="/akun">Akun Saya</Link></nav>
      <small>© {new Date().getFullYear()} Aplikasi.id</small>
    </footer>
  </div>;
}
