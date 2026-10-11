import test from "node:test";
import assert from "node:assert/strict";
import {
  BLOG_PAGE_SIZE,
  getBlogPageNumbers,
  getBlogPagePath,
  normalizeBlogPage,
  paginateBlogPosts
} from "../lib/blog-pagination.mjs";

const posts = Array.from({ length: 30 }, (_, index) => ({ slug: `artikel-${index + 1}` }));

test("blog index shows nine articles per page and reports the visible range", () => {
  assert.equal(BLOG_PAGE_SIZE, 9);
  const first = paginateBlogPosts(posts, "1");
  const second = paginateBlogPosts(posts, "2");
  const last = paginateBlogPosts(posts, "4");

  assert.deepEqual([first.page, first.pageCount, first.firstItem, first.lastItem], [1, 4, 1, 9]);
  assert.equal(first.posts.length, 9);
  assert.deepEqual([second.firstItem, second.lastItem, second.posts[0].slug], [10, 18, "artikel-10"]);
  assert.deepEqual([last.firstItem, last.lastItem, last.posts.length], [28, 30, 3]);
});

test("blog page parameters are safe and page links have crawlable URLs", () => {
  assert.equal(normalizeBlogPage("3"), 3);
  assert.equal(normalizeBlogPage(["2", "4"]), 2);
  assert.equal(normalizeBlogPage("0"), 1);
  assert.equal(normalizeBlogPage("invalid"), 1);
  assert.equal(getBlogPagePath(1), "/blog");
  assert.equal(getBlogPagePath(3), "/blog?page=3");
});

test("long blog pagination shows nearby pages with gaps", () => {
  assert.deepEqual(getBlogPageNumbers(5, 12), [1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
  assert.deepEqual(getBlogPageNumbers(2, 4), [1, 2, 3, 4]);
});
