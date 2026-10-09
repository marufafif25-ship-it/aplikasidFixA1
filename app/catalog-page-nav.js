import Image from "next/image";
import Link from "next/link";

export default function CatalogPageNav() {
  return <header className="navbar-wrapper">
    <div className="container navbar">
      <Link className="brand-logo catalog-brand-link" href="/" aria-label="Aplikasi.id beranda">
        <span className="logo-icon"><Image src="/assets/logos/aplikasid-hitamputih.png" alt="" width={42} height={42} /></span>
        <span className="logo-text"><strong>Aplikasi.id</strong><small>LICENSED SOFTWARE</small></span>
      </Link>
      <nav className="nav-menu" aria-label="Navigasi utama">
        <Link className="nav-link" href="/">Beranda</Link>
        <Link className="nav-link" href="/kategori">Kategori</Link>
        <Link className="nav-link" href="/panduan">Panduan</Link>
      </nav>
      <Link className="catalog-nav-cta" href="/#produk">Lihat katalog <span aria-hidden="true">→</span></Link>
    </div>
  </header>;
}
