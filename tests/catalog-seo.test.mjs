import test from "node:test";
import assert from "node:assert/strict";
import {
  createProductStructuredData,
  getCategoryBySlug,
  getCategoryByValue,
  getCategoryPath,
  getProductDescription,
  getProductMetaDescription,
  getProductMetaTitle,
  getProductPath,
  isProductInCategory,
  productCategories
} from "../lib/catalog-seo.mjs";

const product = {
  id: "app-autocad",
  title: "AutoCAD (WIN & MAC)",
  category: "Engineering",
  os: "Windows 11 dan macOS 14",
  versions: "2024 - 2025 - 2026",
  price: 15000,
  originalPrice: 30000,
  specs: ["Gambar teknik", "DWG", "Pemodelan 2D/3D"]
};

test("category landing pages have stable, unique routes and copy", () => {
  assert.equal(productCategories.length, 7);
  assert.equal(new Set(productCategories.map(({ slug }) => slug)).size, 7);
  assert.equal(getCategoryBySlug("engineering-3d").value, "Engineering");
  assert.equal(getCategoryByValue("Video").slug, "video-editing");
  assert.equal(getCategoryPath("Engineering"), "/kategori/engineering-3d");
  assert.equal(getCategoryBySlug("game").value, "Game");
  assert.equal(getCategoryPath("Game"), "/kategori/game");
  assert.match(getCategoryByValue("Game").description, /game PC/);
});

test("research collection includes existing statistics products without moving Office records", () => {
  const spss = { id: "app-1790154210043", category: "Office" };
  assert.equal(getCategoryPath("Research"), "/kategori/statistik-riset");
  assert.equal(isProductInCategory(spss, "Research"), true);
  assert.equal(isProductInCategory(spss, "Office"), true);
  assert.equal(isProductInCategory({ id: "app-mendeley", category: "Utility" }, "Research"), true);
  assert.equal(isProductInCategory({ id: "app-office", category: "Office" }, "Research"), false);
  assert.equal(isProductInCategory({ category: "Research", id: "new-research-product" }, "Research"), true);
  assert.equal(isProductInCategory(spss, "unknown"), false);
  assert.equal(isProductInCategory(null, "Research"), false);
});

test("product URLs use stable product IDs, independent of display title", () => {
  assert.equal(getProductPath(product), "/produk/app-autocad");
  assert.equal(getProductPath({ ...product, title: "AutoCAD Pro 2027" }), "/produk/app-autocad");
});

test("product description includes the actual product, versions, compatibility, and features", () => {
  const description = getProductDescription(product);
  assert.match(description, /AutoCAD/);
  assert.match(description, /2024 - 2025 - 2026/);
  assert.match(description, /Windows 11 dan macOS 14/);
  assert.match(description, /Gambar teknik, DWG, Pemodelan 2D\/3D/);
  assert.equal(getProductDescription({ ...product, description: "Deskripsi editorial unik." }), "Deskripsi editorial unik.");
});

test("SEO title and summary use product-specific editorial fields when available", () => {
  assert.equal(getProductMetaTitle(product), "AutoCAD (WIN & MAC) | Aplikasi.id");
  assert.match(getProductMetaDescription(product), /AutoCAD/);
  const custom = { ...product, seoTitle: "AutoCAD Teknik", seoDescription: "Deskripsi khusus untuk pencarian." };
  assert.equal(getProductMetaTitle(custom), "AutoCAD Teknik | Aplikasi.id");
  assert.equal(getProductMetaDescription(custom), "Deskripsi khusus untuk pencarian.");
  assert.equal(getProductMetaDescription({ ...product, description: "Ringkasan pilihan editor.", seoDescription: "Ringkasan pilihan editor." }), "Ringkasan pilihan editor.");
});

test("generated summaries keep complete platform and version information instead of copied truncation", () => {
  const spss = { title: "IBM SPSS Statistics untuk Windows", os: "Windows", category: "Office", versions: "21, 23, 25, 26, 27", description: "Software statistik untuk skripsi. ".repeat(12) };
  const legacy = spss.description.trim().slice(0, 157).replace(/\s+\S*$/, "") + "…";
  const summary = getProductMetaDescription({ ...spss, seoDescription: legacy });
  assert.match(summary, /21, 23, 25, 26, 27/);
  assert.match(summary, /harga, kompatibilitas, dan lisensi/);
  assert.ok(summary.length <= 160);
  assert.ok(summary.endsWith("."));
  assert.equal((summary.match(/Windows/g) || []).length, 1);

  const longVersions = { ...product, title: "AutoCAD", os: "Windows & macOS", versions: "2015 - 2016 - 2017 - 2018 - 2019 - 2020 - 2021 - 2022 - 2023 - 2024 - 2025 - 2026" };
  const compact = getProductMetaDescription(longVersions);
  assert.match(compact, /Windows & macOS/);
  assert.match(compact, /pilihan versi, harga/);
  assert.ok(compact.length <= 160 && compact.endsWith("."));
  assert.equal(getProductMetaDescription({ ...spss, seoDescription: "Ringkasan khusus yang dipilih editor…" }), "Ringkasan khusus yang dipilih editor…");
});

test("product structured data matches visible price and avoids fabricated ratings", () => {
  const data = createProductStructuredData({
    product,
    description: getProductDescription(product),
    canonicalUrl: "https://www.aplikasid.com/produk/app-autocad",
    siteUrl: "https://www.aplikasid.com",
    imageUrl: "/assets/katalogAutocad.png"
  });
  assert.equal(data["@type"], "Product");
  assert.equal(data.offers.price, 15000);
  assert.equal(data.offers.priceCurrency, "IDR");
  assert.equal(data.image, "https://www.aplikasid.com/assets/katalogAutocad.png");
  assert.equal("aggregateRating" in data, false);
});

test("missing prices do not create misleading free product offers", () => {
  for (const price of [null, undefined, "", "  ", "unknown", -1, Infinity, false, true, []]) {
    const data = createProductStructuredData({ product: { ...product, price }, siteUrl: "https://www.aplikasid.com" });
    assert.equal("offers" in data, false, `invalid price: ${price}`);
  }
  const free = createProductStructuredData({ product: { ...product, price: 0 }, siteUrl: "https://www.aplikasid.com" });
  assert.equal(free.offers.price, 0);
});
