import Link from "next/link";

export default function GuideNotFound() {
  return <main id="guide-main" className="guide-container guide-empty"><h1>Panduan belum ditemukan</h1><p>Tautan ini mungkin tidak tepat. Cari artikel lain di pusat bantuan.</p><Link className="guide-button" href="/panduan">Buka pusat bantuan</Link></main>;
}
