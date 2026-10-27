import test from "node:test";
import assert from "node:assert/strict";
import { getProductBuyingGuide, selectPublishedReading } from "../lib/product-buying-guides.mjs";
import { BLOG_SEED_POSTS } from "../lib/blog-seed.mjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadJsx } from "./helpers/load-jsx.mjs";

const ProductPurchaseDetails = loadJsx(new URL("../app/product-purchase-details.js", import.meta.url)).default;
const ProductFaq = loadJsx(new URL("../app/product-faq.js", import.meta.url)).default;
const { ProductCheckoutLink } = loadJsx(new URL("../app/commerce-analytics.js", import.meta.url));
const product = { id: "app-office", title: "Office", category: "Office", price: 17000, versions: "2024", os: "Windows", specs: ["Word"], licenseType: "Langganan", licenseDuration: "12 bulan", buyUrl: "https://lynk.id/checkout" };
const ProductDetailPage = loadJsx(new URL("../app/produk/[id]/page.js", import.meta.url), {
  "next/server": { connection: async () => {} },
  "next/navigation": { notFound() { throw new Error("not found"); } },
  "../../catalog-page-nav": () => null,
  "../../catalog-product-card": () => null,
  "../../product-purchase-details": ProductPurchaseDetails,
  "../../product-faq": ProductFaq,
  "../../store-information-links": () => null,
  "../../catalog-reading-links": () => null,
  "../../commerce-analytics": { ProductViewAnalytics: () => null, ProductCheckoutLink },
  "../../../lib/storefront-server": { getStorefront: async () => ({ products: [product], footer: {} }) }
}).default;

test("five priority products have distinct selection advice and links to existing editorial content", () => {
  const headings = new Set();
  for (const id of ["app-1790154210043", "app-spssmac", "app-office", "app-autocad", "app-photoshop"]) {
    const guide = getProductBuyingGuide(id);
    assert.ok(guide.purpose);
    assert.ok(guide.checklist.length >= 3);
    assert.ok(guide.checklist.some((item) => /lisensi|aktivasi/.test(item)));
    headings.add(guide.heading);
    for (const slug of guide.articleSlugs) assert.ok(BLOG_SEED_POSTS.some((post) => post.slug === slug), slug);
  }
  assert.equal(headings.size, 5);
  for (const id of ["unknown", "constructor", "__proto__", undefined]) assert.equal(getProductBuyingGuide(id), null);
});

test("reading links exclude draft, deleted, and unverified article records", () => {
  const posts = [
    { slug: "public", title: "Published article", published: true },
    { slug: "draft", title: "Draft article", published: false },
    { slug: "unknown-status", title: "Unknown status" }
  ];
  assert.deepEqual(selectPublishedReading(["draft", "deleted", "public", "unknown-status"], posts), [{ slug: "public", title: "Published article" }]);
  assert.deepEqual(selectPublishedReading(["public"], []), []);
});

test("priority product advice renders beside current purchase terms, FAQs, and the checkout link", async () => {
  const page = await ProductDetailPage({ params: Promise.resolve({ id: "app-office" }) });
  const html = renderToStaticMarkup(page);
  assert.match(html, /Memilih Office untuk kuliah dan pekerjaan/);
  assert.match(html, /product-buying-guide-heading/);
  assert.match(html, /Lisensi, aktivasi, dan isi pembelian/);
  assert.match(html, /Langganan/);
  assert.match(html, /12 bulan/);
  assert.match(html, /product-faq-heading/);
  assert.match(html, /href="https:\/\/lynk.id\/checkout" target="_blank"/);
  assert.match(html, /Beli produk ini/);
});

test("missing product pages still use the not-found response", async () => {
  await assert.rejects(ProductDetailPage({ params: Promise.resolve({ id: "missing" }) }), /not found/);
});
