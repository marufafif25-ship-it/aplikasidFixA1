export const BLOG_PAGE_SIZE = 9;

export function normalizeBlogPage(value) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function getBlogPagePath(value) {
  const page = normalizeBlogPage(value);
  return page === 1 ? "/blog" : `/blog?page=${page}`;
}

export function paginateBlogPosts(posts, requestedPage, pageSize = BLOG_PAGE_SIZE) {
  if (!Array.isArray(posts)) throw new TypeError("Daftar artikel harus berupa array.");
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new RangeError("Jumlah artikel per halaman harus lebih dari nol.");

  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
  const page = Math.min(normalizeBlogPage(requestedPage), pageCount);
  const startIndex = (page - 1) * pageSize;

  return {
    posts: posts.slice(startIndex, startIndex + pageSize),
    page,
    pageCount,
    total: posts.length,
    firstItem: posts.length ? startIndex + 1 : 0,
    lastItem: Math.min(startIndex + pageSize, posts.length)
  };
}

export function getBlogPageNumbers(currentPage, pageCount, maxVisible = 5) {
  if (pageCount <= maxVisible) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const pages = new Set([1, pageCount]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < pageCount) pages.add(page);
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  return sortedPages.flatMap((page, index) => {
    if (index === 0) return [page];
    return [
      ...(page - sortedPages[index - 1] > 1 ? ["ellipsis"] : []),
      page
    ];
  });
}
