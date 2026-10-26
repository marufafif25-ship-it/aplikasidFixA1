import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getProductPurchaseDetails, normalizeProductPurchaseFields } from "../lib/product-purchase-info.mjs";
import { loadJsx } from "./helpers/load-jsx.mjs";

const PurchaseDetails = loadJsx(new URL("../app/product-purchase-details.js", import.meta.url)).default;
const render = (product) => renderToStaticMarkup(React.createElement(PurchaseDetails, { product, whatsapp: "https://wa.me/6287775977413" }));

test("purchase details retain only explicit public product terms", () => {
  const details = getProductPurchaseDetails({
    licenseType: "  Retail  ", licenseDuration: "12 bulan", deviceLimit: "1 perangkat",
    activationMethod: "Aktivasi melalui aplikasi", deliveryInfo: "Panduan PDF", warrantyInfo: "Bantuan instalasi 1 tahun",
    licenseKey: "PRIVATE_KEY", downloadUrl: "PRIVATE_DOWNLOAD"
  });
  assert.equal(details.length, 6);
  assert.equal(details[0].value, "Retail");
  assert.doesNotMatch(JSON.stringify(details), /PRIVATE|licenseKey|downloadUrl/);
});

test("older products and malformed optional fields do not invent license terms", () => {
  assert.deepEqual(getProductPurchaseDetails(), []);
  assert.deepEqual(getProductPurchaseDetails({ specs: ["Full version", "Garansi 5 tahun"], licenseType: false, deviceLimit: 5, activationMethod: {} }), []);
  const fields = normalizeProductPurchaseFields({ licenseType: "  Langganan  ", licenseDuration: null });
  assert.equal(fields.licenseType, "Langganan");
  assert.equal(fields.licenseDuration, "");
  assert.equal(fields.deviceLimit, "");
});

test("products with missing terms offer a product-specific question and explain digital delivery", () => {
  const html = render({ title: "Premiere Pro" });
  assert.match(html, /Konfirmasi jenis lisensi, masa berlaku, jumlah perangkat, metode aktivasi kepada CS/);
  assert.match(html, /Pengiriman digital/);
  assert.match(html, /email pesanan dari Lynk/);
  assert.match(html, /wa.me\/6287775977413\?text=/);
  assert.match(html, /Premiere\+Pro/);
  assert.match(html, /href="\/garansi"/);
  assert.doesNotMatch(html, /<dl|Retail|Lifetime|Seumur hidup/);
});

test("complete product terms render as text, replace delivery fallback, and omit the missing-terms notice", () => {
  const html = render({ title: "Office", licenseType: "Retail <edisi>", licenseDuration: "12 bulan", deviceLimit: "1 perangkat", activationMethod: "Melalui aplikasi", deliveryInfo: "Akun & panduan", warrantyInfo: "Bantuan instalasi" });
  assert.match(html, /Retail &lt;edisi&gt;/);
  assert.match(html, /Akun &amp; panduan/);
  assert.match(html, /1 perangkat/);
  assert.doesNotMatch(html, /Konfirmasi jenis lisensi|Pengiriman digital/);
});
