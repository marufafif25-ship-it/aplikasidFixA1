import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as accountFeature from "../lib/account-feature.mjs";
import * as catalogSeo from "../lib/catalog-seo.mjs";
import * as productPresentation from "../lib/product-presentation.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");
const source = await readFile(new URL("../app/storefront.js", import.meta.url), "utf8");
const { code } = transformSync(source, {
  filename: "storefront.jsx",
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" }
});
const dependencies = {
  "next/image": ({ fill, unoptimized, priority, ...props }) => React.createElement("img", props),
  "next/link": ({ children, ...props }) => React.createElement("a", props, children),
  "./icons": new Proxy({}, { get: () => () => null }),
  "./chat-widget": () => null,
  "../lib/checkout": { getCheckoutUrl: () => "https://lynk.id/checkout" },
  "../lib/account-feature.mjs": accountFeature,
  "../lib/catalog-seo.mjs": catalogSeo,
  "../lib/product-presentation.mjs": productPresentation
};
const exports = {};
runInNewContext(code, {
  exports,
  require: (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name)
});
const Storefront = exports.default;

function renderCatalog(products) {
  return renderToStaticMarkup(React.createElement(Storefront, {
    initialData: { products, homepage: {}, footer: {}, faq: [] }
  }));
}

const premiere = {
  id: "app-premiere",
  title: "Adobe Premiere Pro",
  category: "Video",
  imageUrl: "/assets/premiere.png",
  os: "Win & Mac",
  versions: "2025, 2026",
  specs: ["Editing video"],
  price: 15000,
  originalPrice: 30000,
  sales: 10,
  rating: 5
};

test("Lihat Detail opens the full product page as a same-tab link instead of a popup", () => {
  const html = renderCatalog([premiere]);
  const detailLink = html.match(/<a\b[^>]*class="btn-card-detail"[^>]*>[\s\S]*?<\/a>/)?.[0];

  assert.ok(detailLink, "product details must be a navigable link");
  assert.match(detailLink, /href="\/produk\/app-premiere"/);
  assert.match(detailLink, /Lihat Detail/);
  assert.doesNotMatch(detailLink, /target=/);
  assert.doesNotMatch(html, /<button[^>]*class="btn-card-detail"|<dialog/);
  assert.match(html, /<button class="btn-card-buy">Beli Sekarang<\/button>/);
});

test("each detail link uses its own stable product ID, including encoded IDs", () => {
  const html = renderCatalog([
    { ...premiere, title: "Nama Premiere yang diperbarui" },
    { ...premiere, id: "paket video/2026", title: "Paket Video" }
  ]);
  const hrefs = [...html.matchAll(/<a\b[^>]*class="btn-card-detail"[^>]*href="([^"]+)"/g)]
    .map((match) => match[1]);

  assert.deepEqual(hrefs, ["/produk/app-premiere", "/produk/paket%20video%2F2026"]);
});
