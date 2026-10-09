import GuideCenter from "./guide-center";

export const metadata = {
  title: "Panduan Instalasi & Aktivasi Software | Aplikasi.id",
  description: "Panduan membeli, mengunduh, memasang, dan mengaktifkan software. Temukan langkah praktis untuk pesanan dan kendala umum di Aplikasi.id.",
  alternates: { canonical: "/panduan" },
  openGraph: {
    type: "website",
    siteName: "Aplikasi.id",
    locale: "id_ID",
    url: "/panduan",
    title: "Panduan Instalasi & Aktivasi Software | Aplikasi.id",
    description: "Panduan membeli, mengunduh, memasang, dan mengaktifkan software. Temukan langkah praktis untuk pesanan dan kendala umum di Aplikasi.id.",
    images: [{ url: "/opengraph-image", alt: "Aplikasi.id — software untuk kuliah, riset, desain, dan kerja" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Panduan Instalasi & Aktivasi Software | Aplikasi.id",
    description: "Panduan membeli, mengunduh, memasang, dan mengaktifkan software. Temukan langkah praktis untuk pesanan dan kendala umum di Aplikasi.id.",
    images: [{ url: "/twitter-image", alt: "Aplikasi.id — software untuk kuliah, riset, desain, dan kerja" }]
  }
};

export default function GuidePage() {
  return <GuideCenter />;
}
