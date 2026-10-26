import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createStoreProfileStructuredData, getProductSupportUrl, getStoreProfile } from "../lib/store-profile.mjs";
import { createSitemap } from "../lib/seo.mjs";
import { loadJsx } from "./helpers/load-jsx.mjs";

const footer = {
  brand: "Aplikasi.id", operatorName: "aplikasi_id",
  whatsapp: "https://wa.me/6287775977413",
  tiktok: "https://www.tiktok.com/@aplikasi_id"
};

test("store profile uses the confirmed brand without inventing an address, hours, or refund promises", () => {
  const profile = getStoreProfile();
  assert.equal(profile.brand, "Aplikasi.id");
  assert.equal(profile.operatorName, "aplikasi_id");
  assert.equal(profile.location, "");
  assert.equal(profile.supportHours, "");
  assert.equal(profile.refundPolicy, "");
  assert.equal(profile.whatsapp, "");
});

test("profile keeps only public identity fields and valid official contact links", () => {
  const profile = getStoreProfile({ ...footer, location: "  Bandung  ", email: "PRIVATE_EMAIL", secret: "PRIVATE_KEY" });
  assert.equal(profile.location, "Bandung");
  assert.equal(profile.whatsapp, footer.whatsapp);
  assert.equal(profile.tiktok, footer.tiktok);
  assert.doesNotMatch(JSON.stringify(profile), /PRIVATE|email|secret/);
  for (const whatsapp of ["javascript:alert(1)", "https://wa.me.evil.example/123", "https://user:secret@wa.me/123", "http://wa.me/123"]) {
    assert.equal(getStoreProfile({ whatsapp }).whatsapp, "");
  }
});

test("product support link preserves the configured WhatsApp destination and encodes the product question", () => {
  const url = new URL(getProductSupportUrl(`${footer.whatsapp}?text=old`, "Office & Video / 2026"));
  assert.equal(url.origin + url.pathname, footer.whatsapp);
  assert.match(url.searchParams.get("text"), /Office & Video \/ 2026/);
  assert.equal(getProductSupportUrl("https://unrelated.example", "Office"), "/kontak");
});

test("organization data shares the site's identity and never adds fabricated business attributes", () => {
  const data = createStoreProfileStructuredData(footer, "https://www.aplikasid.com");
  assert.equal(data["@id"], "https://www.aplikasid.com/#organization");
  assert.equal(data.alternateName, "aplikasi_id");
  assert.equal(data.contactPoint.url, footer.whatsapp);
  assert.deepEqual(data.sameAs, [footer.tiktok]);
  assert.equal(data.address, undefined);
  assert.equal(data.openingHours, undefined);
  assert.equal(data.email, undefined);
});

test("store information pages are discoverable from public links and sitemap", () => {
  const Links = loadJsx(new URL("../app/store-information-links.js", import.meta.url)).default;
  const html = renderToStaticMarkup(React.createElement(Links));
  const sitemap = createSitemap("https://www.aplikasid.com", []);
  for (const path of ["/tentang", "/kontak", "/garansi"]) {
    assert.ok(html.includes(`href="${path}"`));
    assert.ok(sitemap.some(({ url }) => url === `https://www.aplikasid.com${path}`));
  }
});

async function renderInformationPage(route, data = footer) {
  const page = loadJsx(new URL(`../app/(informasi)/${route}/page.js`, import.meta.url), {
    "../../../lib/storefront-server": { getStorefront: async () => ({ footer: data }) }
  });
  return { html: renderToStaticMarkup(await page.default()), metadata: page.metadata };
}

test("about page displays the configured operator and editorial description with its canonical URL", async () => {
  const { html, metadata } = await renderInformationPage("tentang", { ...footer, aboutText: "Katalog untuk kebutuhan riset.", location: "Bandung" });
  assert.match(html, /aplikasi_id/);
  assert.match(html, /Katalog untuk kebutuhan riset\./);
  assert.match(html, /Bandung/);
  assert.equal(metadata.alternates.canonical, "/tentang");
});

test("contact page shows configured support channels and hides unknown service hours and location", async () => {
  const { html, metadata } = await renderInformationPage("kontak");
  assert.ok(html.includes(`href="${footer.whatsapp}"`));
  assert.ok(html.includes(`href="${footer.tiktok}"`));
  assert.doesNotMatch(html, /Jam layanan:|Lokasi operasional:/);
  assert.equal(metadata.alternates.canonical, "/kontak");
  const missing = await renderInformationPage("kontak", {});
  assert.match(missing.html, /href="\/\?chat=1#bantuan"/);
});

test("warranty page distinguishes support from license duration and displays only the configured refund policy", async () => {
  const { html } = await renderInformationPage("garansi");
  assert.match(html, /5 tahun/);
  assert.match(html, /tidak menjelaskan masa berlaku lisensi/);
  assert.match(html, /Konfirmasi ketentuan pengembalian dana kepada CS/);
  assert.doesNotMatch(html, /refund otomatis|uang kembali 100%/i);
  const custom = await renderInformationPage("garansi", { ...footer, refundPolicy: "Ketentuan khusus <produk> yang telah ditetapkan toko." });
  assert.match(custom.html, /Ketentuan khusus &lt;produk&gt;/);
  assert.doesNotMatch(custom.html, /Konfirmasi ketentuan pengembalian dana kepada CS/);
});
