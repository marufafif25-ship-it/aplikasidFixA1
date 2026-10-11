import Link from "next/link";
import { getBlogPageNumbers, getBlogPagePath } from "../../lib/blog-pagination.mjs";

export default function BlogPagination({ page, pageCount, total, firstItem, lastItem }) {
  return <div className="blog-pagination-wrap">
    <p className="blog-pagination-summary" role="status" aria-live="polite">
      {total ? `Menampilkan ${firstItem}–${lastItem} dari ${total} artikel` : "Belum ada artikel"}
    </p>
    {pageCount > 1 && <nav className="blog-pagination" aria-label="Halaman artikel blog">
      {page > 1
        ? <Link className="blog-pagination-step" href={getBlogPagePath(page - 1)} rel="prev"><span aria-hidden="true">←</span> Sebelumnya</Link>
        : <span className="blog-pagination-step is-disabled" aria-disabled="true"><span aria-hidden="true">←</span> Sebelumnya</span>}
      <span className="blog-pagination-pages">
        {getBlogPageNumbers(page, pageCount).map((item, index) => item === "ellipsis"
          ? <span className="blog-pagination-ellipsis" aria-hidden="true" key={`ellipsis-${index}`}>…</span>
          : item === page
            ? <span className="blog-pagination-current" aria-current="page" aria-label={`Halaman ${item}`} key={item}>{item}</span>
            : <Link className="blog-pagination-number" href={getBlogPagePath(item)} aria-label={`Halaman ${item}`} key={item}>{item}</Link>)}
      </span>
      {page < pageCount
        ? <Link className="blog-pagination-step" href={getBlogPagePath(page + 1)} rel="next">Berikutnya <span aria-hidden="true">→</span></Link>
        : <span className="blog-pagination-step is-disabled" aria-disabled="true">Berikutnya <span aria-hidden="true">→</span></span>}
    </nav>}
  </div>;
}
