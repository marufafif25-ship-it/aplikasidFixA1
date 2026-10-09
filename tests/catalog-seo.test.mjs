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
  assert.equal(productCategories.length, 5);
  assert.equal(new Set(productCategories.map(({ slug }) => slug)).size, 5);
  assert.equal(getCategoryBySlug("engineering-3d").value, "Engineering");
  assert.equal(getCategoryByValue("Video").slug, "video-editing");
  assert.equal(getCategoryPath("Engineering"), "/kategori/engineering-3d");
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
