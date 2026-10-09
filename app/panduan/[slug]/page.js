import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, guideCategories } from "../../../lib/guides";
import GuideSupport from "../support";
import { createBreadcrumbStructuredData, serializeJsonLd, SITE_URL } from "../../../lib/seo.mjs";

export const dynamicParams = false;

export function generateStaticParams() { return guides.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return { title: "Panduan tidak ditemukan | Aplikasi.id", robots: { index: false, follow: false } };

  const title = `${guide.title} | Aplikasi.id`;
  const canonical = `/panduan/${slug}`;
  return {
    title,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: "Aplikasi.id",
      locale: "id_ID",
      url: new URL(canonical, SITE_URL).toString(),
      title,
      description: guide.description,
      images: [{ url: "/opengraph-image", alt: "Aplikasi.id — software untuk kuliah, riset, desain, dan kerja" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: guide.description,
      images: [{ url: "/twitter-image", alt: "Aplikasi.id — software untuk kuliah, riset, desain, dan kerja" }]
    }
  };
}

export default async function GuideArticle({ params }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  const category = guideCategories.find((item) => item.id === guide.category);
  const related = guides.filter((item) => item.category === guide.category && item.slug !== slug);
  const breadcrumbData = createBreadcrumbStructuredData(SITE_URL, [
    { name: "Beranda", path: "/" },
    { name: "Panduan", path: "/panduan" },
    { name: guide.title, path: `/panduan/${slug}` }
  ]);

  return <main id="guide-main" className="guide-container guide-detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />
    <nav className="guide-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/panduan">Panduan</Link><span aria-hidden="true">/</span><span>{guide.title}</span></nav>
    <div className="guide-reading-layout"><article className="guide-reading">
      <header><span className="guide-eyebrow">{category.label} · {guide.minutes} MENIT BACA</span><h1>{guide.title}</h1><p>{guide.description}</p></header>
      <div className="guide-steps">{guide.sections.map((section, index) => <section id={`langkah-${index + 1}`} key={section.title}><span className="guide-step-number">0{index + 1}</span><div><h2>{section.title}</h2><p>{section.text}</p></div></section>)}</div>
      {guide.note && <aside className="guide-note"><strong>Catatan untukmu</strong><p>{guide.note}</p></aside>}
      <Link className="guide-text-link" href="/panduan">← Kembali ke semua panduan</Link>
    </article><aside className="guide-article-sidebar"><nav aria-label="Daftar isi"><span className="guide-eyebrow">DALAM PANDUAN INI</span>{guide.sections.map((section, index) => <a href={`#langkah-${index + 1}`} key={section.title}>{index + 1}. {section.title}</a>)}</nav>{related.length > 0 && <div><span className="guide-eyebrow">BACA JUGA</span>{related.map((item) => <Link key={item.slug} href={`/panduan/${item.slug}`}>{item.title} <span aria-hidden="true">↗</span></Link>)}</div>}<Link className="guide-button" href="/#produk">Lihat katalog software</Link></aside></div>
    <GuideSupport />
  </main>;
}
