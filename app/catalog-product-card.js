import Image from "next/image";
import Link from "next/link";
import { getCategoryByValue, getProductDescription, getProductPath } from "../lib/catalog-seo.mjs";

const formatRp = (amount) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(Number(amount) || 0);

function CatalogImage({ product }) {
  const src = product.catalogImageUrl || product.imageUrl || "/assets/logos/aplikasid.png";
  const local = src.startsWith("/assets/") || src.startsWith("/api/product-image/");
  return <Image
    src={src}
    alt={product.title}
    width={240}
    height={180}
    unoptimized={!local}
    sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 320px"
  />;
}

export default function CatalogProductCard({ product }) {
  const category = getCategoryByValue(product.category);
  const description = getProductDescription(product);
  return <article className="seo-product-card">
    <Link className="seo-product-card-link" href={getProductPath(product)}>
      <div className="seo-product-card-image"><CatalogImage product={product} /></div>
      <div className="seo-product-card-body">
        <span className="catalog-page-eyebrow">{category?.label || product.category}</span>
        <h3>{product.title}</h3>
        <p>{description}</p>
        <div className="seo-product-card-footer">
          <strong>{formatRp(product.price)}</strong>
          <span>Lihat detail <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </Link>
  </article>;
}
