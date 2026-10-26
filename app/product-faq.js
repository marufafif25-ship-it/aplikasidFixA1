import Link from "next/link";
import { getProductFaq } from "../lib/product-faq.mjs";

export default function ProductFaq({ product }) {
  const items = getProductFaq(product);
  if (!items.length) return null;

  return <section className="product-detail-features product-faq" aria-labelledby="product-faq-heading">
    <span className="catalog-page-eyebrow">SEBELUM ANDA MEMILIH</span>
    <h2 id="product-faq-heading">Pertanyaan tentang {product.title || "produk ini"}</h2>
    <div className="product-faq-list">{items.map(({ id, question, answer }, index) => <details key={id} open={index === 0}>
      <summary>{question}<span aria-hidden="true">+</span></summary>
      <p>{answer}</p>
    </details>)}</div>
    <p className="product-faq-contact">Ada kebutuhan atau ketentuan yang belum terjawab? <Link href="/kontak">Tanyakan kepada CS sebelum membeli →</Link></p>
  </section>;
}
