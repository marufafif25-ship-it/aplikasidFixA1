import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getProductFaq } from "../lib/product-faq.mjs";
import { loadJsx } from "./helpers/load-jsx.mjs";

const ProductFaq = loadJsx(new URL("../app/product-faq.js", import.meta.url)).default;
const render = (product) => renderToStaticMarkup(React.createElement(ProductFaq, { product }));
const game = {
  title: "GTA: San Andreas — Versi Klasik", os: "Win", versions: "Versi klasik",
  compatibility: "Paket ini tidak dapat menyimpan progres permainan. Mouse tidak didukung.",
  specs: ["Kontrol keyboard atau joystick", "Panduan instalasi"]
};

test("product FAQs use the current product's name, versions, and normalized platform", () => {
  const items = getProductFaq(game);
  assert.ok(items.every(({ question }) => question.includes(game.title)));
  assert.match(items.find(({ id }) => id === "platform").answer, /Windows/);
  assert.doesNotMatch(items.find(({ id }) => id === "platform").answer, /macOS/);
  assert.ok(items.find(({ id }) => id === "versions").answer.includes(game.versions));
});

test("product-specific limitations remain explicit in FAQ answers", () => {
  const items = getProductFaq(game);
  assert.equal(items.find(({ id }) => id === "compatibility").answer, game.compatibility);
  assert.match(render(game), /tidak dapat menyimpan progres permainan/);
  assert.match(render(game), /Mouse tidak didukung/);
});

test("explicit purchase terms supply license, delivery, and warranty answers without adding promises", () => {
  const items = getProductFaq({ title: "Office", licenseType: "Langganan", licenseDuration: "12 bulan", deviceLimit: "1 perangkat", activationMethod: "Melalui aplikasi", deliveryInfo: "Panduan PDF", warrantyInfo: "Bantuan instalasi 1 tahun" });
  const licensing = items.find(({ id }) => id === "license").answer;
  for (const term of ["Langganan", "12 bulan", "1 perangkat", "Melalui aplikasi"]) assert.ok(licensing.includes(term));
  assert.equal(items.find(({ id }) => id === "delivery").answer, "Panduan PDF");
  assert.equal(items.find(({ id }) => id === "warranty").answer, "Bantuan instalasi 1 tahun");
  assert.doesNotMatch(licensing, /lifetime|seumur hidup|perangkat tanpa batas/i);
});

test("missing license details and broad specs never invent activation, duration, or warranty coverage", () => {
  const items = getProductFaq({ title: "Software", specs: ["Full Version", "Bergaransi"] });
  assert.deepEqual(items.map(({ id }) => id), ["features"]);
  const partial = getProductFaq({ title: "Office", licenseType: "Retail" });
  assert.match(partial[0].answer, /Jenis lisensi: Retail/);
  assert.match(partial[0].answer, /Konfirmasi ketentuan lisensi lain/);
  assert.doesNotMatch(partial[0].answer, /1 perangkat|seumur hidup/i);
});

test("FAQ generation filters malformed fields, deduplicates specs, and excludes private data", () => {
  const items = getProductFaq({ title: "Premiere", os: 123, versions: null, specs: [null, false, 5, "  Panduan  ", "Panduan"], licenseKey: "PRIVATE_KEY", downloadUrl: "PRIVATE_URL", internalNotes: "PRIVATE_NOTES" });
  assert.equal(items.length, 1);
  assert.equal(items[0].answer, "• Panduan");
  assert.doesNotMatch(JSON.stringify(items), /PRIVATE|123|false|null/);
  for (const product of [null, undefined, {}, { versions: 2026, compatibility: false, specs: {} }]) assert.deepEqual(getProductFaq(product), []);
});

test("updating catalog information immediately changes its derived FAQ", () => {
  const oldItems = getProductFaq({ title: "Premiere", versions: "2024", os: "Win" });
  const newItems = getProductFaq({ title: "Premiere", versions: "2026", os: "Win & Mac" });
  assert.match(oldItems.find(({ id }) => id === "versions").answer, /2024/);
  assert.match(newItems.find(({ id }) => id === "versions").answer, /2026/);
  assert.match(newItems.find(({ id }) => id === "platform").answer, /Windows & macOS/);
});

test("FAQ renders native accessible accordions, escapes catalog text, and hides absent content", () => {
  const html = render({ title: "Office <uji>", compatibility: "<script>alert(1)</script> & catatan", versions: "2026" });
  assert.match(html, /<details open="">/);
  assert.equal((html.match(/<summary>/g) || []).length, 2);
  assert.match(html, /Office &lt;uji&gt;/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; catatan/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /href="\/kontak"/);
  assert.equal(render({ title: "Belum lengkap" }), "");
});
