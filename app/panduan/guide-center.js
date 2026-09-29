"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "../icons";
import { guides, guideCategories, guideFaqs, filterGuides } from "../../lib/guides";
import GuideIcon from "./guide-icon";
import GuideSupport from "./support";

export default function GuideCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const results = filterGuides(query, category);
  const filtered = query.trim() || category !== "all";
  const reset = () => { setQuery(""); setCategory("all"); };

  return <main id="guide-main">
    <section className="guide-hero">
      <div className="guide-container">
        <span className="guide-eyebrow guide-hero-badge"><GuideIcon name="book" /> PUSAT BANTUAN APLIKASI.ID</span>
        <h1>Ada yang bisa <span>kami bantu?</span></h1>
        <p>Dari download pertama sampai software siap digunakan.<br />Temukan panduan yang kamu butuhkan di sini.</p>
        <form className="guide-search" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("guide-results")?.scrollIntoView({ behavior: "smooth" }); document.getElementById("guide-results")?.focus({ preventScroll: true }); }}>
          <SearchIcon /><input type="search" aria-label="Cari panduan" placeholder="Cari download, instalasi, aktivasi..." value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" className="guide-clear" aria-label="Hapus pencarian" onClick={() => setQuery("")}><CloseIcon /></button>}
          <button type="submit" className="guide-search-submit">Cari <span aria-hidden="true">→</span></button>
        </form>
        <div className="guide-suggestions"><span>Sering dicari:</span>{["Download", "Aktivasi", "Pesanan"].map((word) => <button type="button" key={word} onClick={() => { setQuery(word); setCategory("all"); }}>{word}</button>)}</div>
      </div>
    </section>

    <div className="guide-container guide-content">
      <section aria-labelledby="guide-categories-title">
        <div className="guide-section-heading"><div><span className="guide-eyebrow">MULAI DARI SINI</span><h2 id="guide-categories-title">Bantuan sesuai kebutuhanmu</h2></div><span className="guide-heading-note">Pilih topik untuk menemukan jawabannya</span></div>
        <div className="guide-categories">{guideCategories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} className={`guide-category${category === item.id ? " is-selected" : ""}`} onClick={() => setCategory(category === item.id ? "all" : item.id)}><span className={`guide-category-icon tone-${item.id}`}><GuideIcon name={item.icon} /></span><strong>{item.label}</strong><small>{item.description}</small><span className="guide-category-count">{guides.filter((guide) => guide.category === item.id).length} artikel <span aria-hidden="true">↗</span></span></button>)}</div>
      </section>

      {!filtered && <section className="guide-section" aria-labelledby="guide-featured-title"><div className="guide-section-heading"><div><span className="guide-eyebrow">BACA PILIHAN KAMI</span><h2 id="guide-featured-title">Panduan untuk langkah pertama</h2></div><span className="guide-heading-note">Baru di Aplikasi.id? Mulai di sini.</span></div><div className="guide-featured">{guides.filter((guide) => guide.featured).map((guide, index) => <Link className="guide-featured-card" key={guide.slug} href={`/panduan/${guide.slug}`}><span className="guide-featured-top"><span>0{index + 1}</span><GuideIcon name={guideCategories.find((item) => item.id === guide.category).icon} /></span><h3>{guide.title}</h3><p>{guide.description}</p><span className="guide-read">Baca panduan <GuideIcon name="arrow" /></span></Link>)}</div></section>}

      <section className="guide-section" aria-labelledby="guide-results"><div className="guide-section-heading"><div><span className="guide-eyebrow">TEMUKAN JAWABANNYA</span><h2 id="guide-results" tabIndex={-1}>{filtered ? "Hasil pencarian panduan" : "Jelajahi semua panduan"}</h2></div><span className="guide-result-count" role="status" aria-live="polite">{results.length} artikel tersedia</span></div>
        <div className="guide-filter-row"><button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>Semua topik</button>{guideCategories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
        {results.length ? <div className="guide-articles">{results.map((guide) => <Link className="guide-article-card" key={guide.slug} href={`/panduan/${guide.slug}`}><div className="guide-article-meta"><span>{guideCategories.find((item) => item.id === guide.category).label}</span><small>{guide.minutes} menit baca</small></div><h3>{guide.title}</h3><p>{guide.description}</p><span className="guide-read">Baca panduan <GuideIcon name="arrow" /></span></Link>)}</div> : <div className="guide-empty"><GuideIcon name="compass" /><h3>Belum ada panduan yang cocok</h3><p>Coba kata kunci yang lebih singkat atau pilih topik lain.</p><button type="button" className="guide-button" onClick={reset}>Tampilkan semua panduan</button></div>}
      </section>

      <section className="guide-faq" aria-labelledby="guide-faq-title"><div><span className="guide-eyebrow">MUNGKIN INI JAWABANNYA</span><h2 id="guide-faq-title">Pertanyaan yang<br />sering ditanyakan</h2><p>Jawaban singkat untuk hal-hal yang ingin kamu ketahui.</p><Link href="/?chat=1#bantuan" className="guide-text-link">Tanya langsung ke CS <span aria-hidden="true">↗</span></Link></div><div className="guide-faq-list">{guideFaqs.map((faq) => <details name="guide-faq" key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>
      <GuideSupport />
    </div>
  </main>;
}
