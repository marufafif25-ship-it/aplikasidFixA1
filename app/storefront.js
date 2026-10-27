"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon, BadgeCheckIcon, HeadsetIcon, LightningIcon, DownloadIcon } from "./icons";
import { getCheckoutUrl } from "../lib/checkout";
import { isAccountFeatureEnabled } from "../lib/account-feature.mjs";
import { productCategories, getProductPath, isProductInCategory } from "../lib/catalog-seo.mjs";
import { trackProductEvent } from "../lib/commerce-analytics.mjs";
import { getProductPlatform, getProductSearchText } from "../lib/product-presentation.mjs";
import ChatWidget from "./chat-widget";
import StoreInformationLinks from "./store-information-links";

const defaultHeroSettings = {
  title: "Software & Game",
  titleLineTwo: "untuk Kerja hingga Hiburan",
  description: "Temukan software dan game untuk mengerjakan tugas, mengolah data, membuat desain, dan menikmati hiburan digital.",
  primaryLabel: "Mulai Belanja",
  primaryTarget: "produk",
  secondaryLabel: "Cek Pesanan",
  secondaryTarget: "bantuan",
  trustOne: "Full Version",
  trustTwo: "Aktivasi Cepat",
  trustThree: "Support Pelanggan"
};
const defaultFooterSettings = {
  brand: "Aplikasi.id",
  description: "Pusat software terpercaya untuk kebutuhan kerja dan bisnis.",
  copyright: "© 2026. Semua hak dilindungi.",
  whatsapp: "",
  tiktok: ""
};
const normalizeFaqItems = (items) => items.map((item, index) => ({
  id: item.id || `faq-${index}`,
  question: item.question || item.Question || "",
  answer: item.answer || item.Answer || "",
  keywords: item.keywords || item.Keywords || "",
  active: item.active,
  sortOrder: item.sortOrder
})).filter((item) => item.question && item.answer);

const formatRp = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
function CategoryQuickIcon({ category }) {
  const icons = {
    Office: <><path d="M7 3.75h7l4.25 4.25v12.25H7z" /><path d="M14 3.75V8h4.25M10 12h5m-5 3.5h5" /></>,
    Design: <><path d="m4.5 16.5-.8 4.3 4.3-.8L19 9l-4-4z" /><path d="m13.5 6.5 4 4M5 17l3 3" /></>,
    Engineering: <><path d="m12 3.5 8 4.25v8.5L12 20.5l-8-4.25v-8.5z" /><path d="m4.4 7.8 7.6 4.1 7.6-4.1M12 12v8.2" /></>,
    Utility: <><path d="M14.7 6.3a5 5 0 0 0-6.6 6.6l-4.8 4.8a2 2 0 1 0 2.8 2.8l4.8-4.8a5 5 0 0 0 6.6-6.6l-3 3-3-3z" /></>,
    Game: <><path d="M7 9h10a4 4 0 0 1 3.8 5.2l-1 3a2 2 0 0 1-3.4.8L14 16h-4l-2.4 2a2 2 0 0 1-3.4-.8l-1-3A4 4 0 0 1 7 9Z" /><path d="M7.5 12v3m-1.5-1.5h3" /><circle cx="15.5" cy="12.5" r=".7" fill="currentColor" stroke="none" /><circle cx="17.5" cy="14.5" r=".7" fill="currentColor" stroke="none" /></>
  };

  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{icons[category]}</svg>;
}
const orderProducts = (items) => [...items].sort((a, b) => {
  const aOrder = a.sortOrder === "" || a.sortOrder === null || a.sortOrder === undefined ? Number.MAX_SAFE_INTEGER : Number(a.sortOrder);
  const bOrder = b.sortOrder === "" || b.sortOrder === null || b.sortOrder === undefined ? Number.MAX_SAFE_INTEGER : Number(b.sortOrder);
  return (Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER) - (Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER);
});
const normalizeFooterSettings = ({ email, ...settings }) => ({ ...defaultFooterSettings, ...settings, tiktok: settings.tiktok || settings.instagram || "" });
export default function Storefront({ initialData }) {
  const productList = initialData.products;
  const [catalogPage, setCatalogPage] = useState(1);
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [notice, setNotice] = useState("");
  const heroSettings = { ...defaultHeroSettings, ...initialData.homepage };
  const accountEnabled = isAccountFeatureEnabled(initialData.homepage);
  const footerSettings = normalizeFooterSettings(initialData.footer);
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("chat") === "1") setChatOpen(true);
  }, []);
  const faqItems = normalizeFaqItems(initialData.faq);
  const filteredProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const result = productList.filter((product) => {
      const matchesQuery = !normalized || getProductSearchText(product).includes(normalized);
      return matchesQuery && (category === "all" || isProductInCategory(product, category));
    });
    if (sort === "popular") return [...result].sort((a, b) => b.sales - a.sales);
    if (sort === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...result].sort((a, b) => b.price - a.price);
    return sort === "newest" ? orderProducts(result) : result;
  }, [category, productList, query, sort]);

  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(catalogPage, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + pageSize);
  const pageNumbers = Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount]))
    .filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);

  useEffect(() => { setCatalogPage(1); }, [query, category, sort]);
  useEffect(() => { setCatalogPage((page) => Math.min(page, pageCount)); }, [pageCount]);

  const changeCatalogPage = (page) => {
    setCatalogPage(Math.max(1, Math.min(page, pageCount)));
    const heading = document.getElementById("catalog-heading");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  };

  const buyProduct = (product) => {
    const checkoutUrl = getCheckoutUrl(product.buyUrl);
    if (!checkoutUrl) {
      setNotice("Link pembelian produk ini belum tersedia. Silakan hubungi CS melalui WhatsApp.");
      return;
    }
    trackProductEvent("begin_checkout", product);
    window.location.assign(checkoutUrl);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <>
      <header className="navbar-wrapper">
        <div className="container navbar">
          <button className="brand-logo" onClick={() => scrollTo("home")} aria-label="Kembali ke beranda">
            <span className="logo-icon"><Image src="/assets/logos/aplikasid-hitamputih.png" alt="Aplikasi.id" width={42} height={42} /></span>
            <span className="logo-text"><strong>Aplikasi.id</strong><small>LICENSED SOFTWARE</small></span>
          </button>
          <nav className="nav-menu" aria-label="Navigasi utama">
            <button className="nav-link active" onClick={() => scrollTo("home")}>Beranda</button>
            <button className="nav-link" onClick={() => scrollTo("produk")}>Produk</button>
            <Link className="nav-link" style={{ textDecoration: "none" }} href="/blog">Blog</Link>
            <Link className="nav-link" style={{ textDecoration: "none" }} href="/panduan">Panduan</Link>
            <button className="nav-link" onClick={() => scrollTo("garansi")}>Garansi</button>
          </nav>
          <div className="nav-actions">
            {accountEnabled && <a className="customer-account-link" href="/akun">Akun Saya</a>}
            <button type="button" className="action-btn" onClick={() => { scrollTo("produk"); searchRef.current?.focus({ preventScroll: true }); }} aria-label="Cari produk"><SearchIcon /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="container">
            <div className="hero-banner">
              <div className="hero-content">
                <span className="hero-badge">▱ &nbsp; {productList.length.toLocaleString("id-ID")} Produk Aktif</span>
                <h1>{heroSettings.title}<br />{heroSettings.titleLineTwo}</h1>
                <p>{heroSettings.description}</p>
                <div className="hero-cta"><button className="btn-primary" onClick={() => scrollTo(heroSettings.primaryTarget || "produk")}>{heroSettings.primaryLabel} <span>→</span></button></div>
                <div className="trust-badges"><span><BadgeCheckIcon />{heroSettings.trustOne}</span><span><LightningIcon />{heroSettings.trustTwo}</span><span><HeadsetIcon />{heroSettings.trustThree}</span></div>
              </div>
              <div className="category-quick-grid">
                <svg className="category-orbit-track" viewBox="0 0 460 360" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <defs><linearGradient id="category-orbit-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#bfdbfe" stopOpacity=".58" /><stop offset="38%" stopColor="#93c5fd" stopOpacity=".48" /><stop offset="72%" stopColor="#a5d8ff" stopOpacity=".46" /><stop offset="100%" stopColor="#bfdbfe" stopOpacity=".58" /></linearGradient></defs>
                  <path className="category-orbit-line" d="M 42 173 C 26 91 98 31 204 30 C 318 28 417 77 416 151 C 414 230 340 304 239 324 C 134 344 45 300 34 230 C 25 172 82 126 158 120 C 234 114 307 141 346 191" />
                  <circle className="category-orbit-spark" cx="42" cy="173" r="2.6" /><circle className="category-orbit-spark" cx="416" cy="151" r="2.6" /><circle className="category-orbit-spark" cx="239" cy="324" r="2.6" />
                </svg>
                {[
                  ["Office", "Windows · Office"],
                  ["Design", "Adobe · Corel"],
                  ["Engineering", "AutoCAD · SketchUp"],
                  ["Utility", "IDM · Recovery"],
                  ["Game", "Game PC · Digital"]
                ].map(([name, description]) => <button className="quick-cat-card" key={name} onClick={() => { setCategory(name); scrollTo("produk"); }}><span className={`quick-cat-icon tone-${name.toLowerCase()}`}><CategoryQuickIcon category={name} /></span><span className="quick-cat-copy"><b>{name}</b><small>{description}</small></span></button>)}
              </div>
            </div>
          </div>
        </section>

        <section className="toolbar-section" id="produk">
          <div className="container toolbar-card">
            <label className="search-box"><span><SearchIcon /></span><input ref={searchRef} aria-label="Cari aplikasi atau game" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari software atau game..." /></label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Pilih kategori"><option value="all">Semua Kategori</option>{productCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Urutkan produk"><option value="newest">Terbaru</option><option value="popular">Terpopuler</option><option value="price-low">Harga Termurah</option><option value="price-high">Harga Tertinggi</option></select>
          </div>
        </section>

        <section className="products-section">
          <div className="container"><div className="section-header"><h2 id="catalog-heading" tabIndex={-1}>Katalog Produk Digital <small>{filteredProducts.length} Produk</small></h2></div><div className="products-grid">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onBuy={buyProduct} />)}
          </div>
            {filteredProducts.length === 0 && <p className="empty-state">Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.</p>}
            <div className="catalog-pagination">
              <p role="status">{filteredProducts.length ? `Menampilkan ${pageStart + 1}–${Math.min(pageStart + pageSize, filteredProducts.length)} dari ${filteredProducts.length} produk` : "Menampilkan 0 produk"}</p>
              {pageCount > 1 && <nav aria-label="Halaman katalog" className="catalog-page-controls">
                <button type="button" disabled={currentPage === 1} onClick={() => changeCatalogPage(currentPage - 1)} aria-label="Halaman sebelumnya">← <span>Sebelumnya</span></button>
                {pageNumbers.map((page, index) => <span className="catalog-page-item" key={page}>
                  {index > 0 && page - pageNumbers[index - 1] > 1 && <span className="catalog-page-gap" aria-hidden="true">…</span>}
                  <button type="button" aria-label={`Halaman ${page}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => changeCatalogPage(page)}>{page}</button>
                </span>)}
                <button type="button" disabled={currentPage === pageCount} onClick={() => changeCatalogPage(currentPage + 1)} aria-label="Halaman berikutnya"><span>Berikutnya</span> →</button>
              </nav>}
            </div>
          </div>
        </section>

        <section className="info-section" id="garansi"><div className="container info-grid"><InfoCard icon={<LightningIcon />} title="Aktivasi Cepat" text="Pesanan diproses dengan cepat dan panduan instalasi tersedia untuk setiap software." /><InfoCard icon={<BadgeCheckIcon />} title="Garansi 5 Tahun" text="Garansi selama 5 tahun untuk bantuan instalasi dan penggantian link unduhan jika bermasalah." /><InfoCard icon={<DownloadIcon />} title="Direct Google Drive" text="Akses download kencang, aman, dan dilengkapi panduan langkah demi langkah." /></div></section>
        <section className="help-section" id="bantuan"><div className="container"><h2>Butuh bantuan memilih software?</h2><p>Tim kami siap membantu menemukan paket yang sesuai kebutuhan kerja dan perangkat Anda.</p><div className="store-help-actions"><Link className="btn-primary" href="/panduan">Buka Pusat Bantuan →</Link><button className="store-help-contact" onClick={() => setChatOpen(true)}>Hubungi CS ↗</button></div></div></section>
      </main>

      <footer className="footer"><div className="container"><div className="footer-brand"><strong>{footerSettings.brand}</strong><small>{footerSettings.description}</small></div><div className="footer-links"><Link href="/kategori">Kategori software</Link><Link href="/kategori/statistik-riset">Statistik &amp; Riset</Link><StoreInformationLinks />{footerSettings.whatsapp && <a href={footerSettings.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>}{footerSettings.tiktok && <a href={footerSettings.tiktok} target="_blank" rel="noreferrer">TikTok</a>}<span>{footerSettings.copyright}</span></div></div></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
      <ChatWidget open={chatOpen} setOpen={setChatOpen} faqItems={faqItems} whatsapp={footerSettings.whatsapp} />
    </>
  );
}

// Local assets and the public Supabase image route use Next.js resizing/WebP.
// External URLs retain compatibility without allowing arbitrary image proxy hosts.
function CatalogImage(props) {
  const local = props.src?.startsWith("/assets/") || props.src?.startsWith("/api/product-image/");
  return <Image {...props} unoptimized={!local} loading="lazy" decoding="async" />;
}

function ProductCard({ product, onBuy }) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const platform = getProductPlatform(product);
  return <article className="product-card">
    <div className={`card-artwork${product.catalogImageUrl ? " card-artwork-catalog" : ""}`}>
      {product.catalogImageUrl ? <CatalogImage className="card-catalog-image" src={product.catalogImageUrl} alt={`Katalog ${product.title}`} fill sizes="(max-width: 900px) 50vw, (max-width: 1100px) 25vw, 250px" /> : <>
        <span className="thumbnail-watermark">PERMANEN! · Garansi</span>
        <div className="artwork-logo-box" style={{ background: product.color }}><CatalogImage src={product.imageUrl} alt="" width={62} height={62} sizes="62px" /></div>
        <strong>{product.title.split("(")[0]}</strong><small>{product.versions.slice(0, 35)}...</small><span className="drive-badge-pill">Drive Direct</span>
      </>}
    </div>
    <div className="card-body">
      <div className="card-specs-pills">{product.specs.slice(0, 2).map((spec) => <span key={spec}>{spec}</span>)}</div>
      <h3><Link href={getProductPath(product)}>{product.title}</Link></h3>
      {platform && <span className="product-platform">{platform}</span>}
      <div className="product-meta"><span>★ {product.rating}</span><i>·</i><span>{product.sales} terjual</span></div>
      <div className="pricing-wrapper"><del>{formatRp(product.originalPrice)}</del><b>{formatRp(product.price)}</b><em>-{discount}%</em></div>
      <Link className="btn-card-detail" href={getProductPath(product)}>Lihat Detail <span aria-hidden="true">→</span></Link>
      <button className="btn-card-buy" onClick={() => onBuy(product)}>Beli Sekarang</button>
    </div>
  </article>;
}

function InfoCard({ icon, title, text }) { return <article className="info-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>; }
