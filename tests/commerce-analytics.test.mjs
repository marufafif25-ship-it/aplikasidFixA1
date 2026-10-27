import test from "node:test";
import assert from "node:assert/strict";
import { trackProductEvent, trackWhatsAppClick } from "../lib/commerce-analytics.mjs";

const product = { id: "app-office", title: "Microsoft Office", category: "Office", price: "17000", buyUrl: "https://checkout.test/?email=private", email: "private@example.com", access_token: "secret" };

test("product events report catalog items and IDR values without customer or checkout data", () => {
  const events = [];
  const target = { gtag: (...args) => events.push(args) };
  for (const name of ["view_item", "begin_checkout"]) assert.equal(trackProductEvent(name, product, target), true);
  assert.equal(events.length, 2);
  assert.deepEqual(events[1], ["event", "begin_checkout", {
    currency: "IDR", value: 17000,
    items: [{ item_id: "app-office", item_name: "Microsoft Office", item_category: "Office", quantity: 1, price: 17000 }],
    transport_type: "beacon"
  }]);
  assert.doesNotMatch(JSON.stringify(events), /private|secret|checkout\.test|access_token/);
});

test("checkout clicks cannot report a purchase and missing prices cannot report invented revenue", () => {
  const events = [];
  const target = { gtag: (...args) => events.push(args) };
  assert.equal(trackProductEvent("purchase", product, target), false);
  assert.equal(trackProductEvent("view_item", {}, target), false);
  for (const price of [undefined, null, "", " ", "unknown", -1, Infinity, false, true, []]) {
    trackProductEvent("view_item", { ...product, price }, target);
    assert.equal("value" in events.at(-1)[2], false);
    assert.equal("price" in events.at(-1)[2].items[0], false);
  }
});

test("WhatsApp clicks exclude phone numbers and prefilled messages", () => {
  const events = [];
  const target = { gtag: (...args) => events.push(args) };
  assert.equal(trackWhatsAppClick("https://wa.me/628123456?text=private", target), true);
  assert.deepEqual(events[0], ["event", "contact_click", { contact_method: "whatsapp", transport_type: "beacon" }]);
  for (const href of ["https://wa.me.example.com/", "javascript:alert(1)", "http://wa.me/123", "/panduan", "https://example.com"]) {
    assert.equal(trackWhatsAppClick(href, target), false);
  }
  assert.equal(events.length, 1);
});

test("unavailable or failing analytics never prevents storefront interactions", () => {
  assert.equal(trackProductEvent("view_item", product, {}), false);
  assert.equal(trackProductEvent("view_item", product, { gtag() { throw new Error("blocked"); } }), false);
  assert.equal(trackWhatsAppClick("https://wa.me/123", {}), false);
});
