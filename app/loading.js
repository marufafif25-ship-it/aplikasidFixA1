export default function Loading() {
  return <main className="container catalog-loading" aria-busy="true" aria-label="Memuat katalog"><p role="status">Memuat katalog aplikasi…</p><div className="products-grid">{Array.from({ length: 12 }, (_, i) => <div key={i} className="catalog-skeleton" aria-hidden="true" />)}</div></main>;
}
