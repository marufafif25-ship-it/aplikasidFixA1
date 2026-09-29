import Link from "next/link";
import GuideIcon from "./guide-icon";

export default function GuideSupport() {
  return <section className="guide-support" aria-labelledby="support-title">
    <span className="guide-support-icon"><GuideIcon name="chat" /></span>
    <div><h2 id="support-title">Masih perlu dibantu?</h2><p>Ceritakan kendalamu. Tim CS siap membantu menemukan langkah selanjutnya.</p></div>
    <div className="guide-support-actions"><Link className="guide-button" href="/?chat=1#bantuan">Hubungi CS <GuideIcon name="arrow" /></Link><Link className="guide-text-link" href="/#produk">Lihat katalog <span aria-hidden="true">↗</span></Link></div>
  </section>;
}
