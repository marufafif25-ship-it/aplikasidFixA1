import Link from "next/link";
import { loadBlogProductLinks } from "../../lib/blog-product-links.mjs";
import { getStorefront } from "../../lib/storefront-server";

export default async function BlogRelatedProducts({ slug, posts }) {
  const links = await loadBlogProductLinks(slug, getStorefront, posts);
  if (!links) return null;

  return <section className="blog-product-links" aria-labelledby="blog-product-links-heading">
    <h2 id="blog-product-links-heading">Produk terkait</h2>
    <p>{links.intro}</p>
    {links.guide && <p className="blog-product-guide">Panduan lanjutan: <Link href={links.guide.href}>{links.guide.title}</Link></p>}
    <ul>
      {links.products.map((product) => <li key={product.id}>
        <Link href={product.href}>
          <span>{product.title}</span>
          <span className="blog-product-link-action">Lihat produk <span aria-hidden="true">→</span></span>
        </Link>
      </li>)}
    </ul>
  </section>;
}
