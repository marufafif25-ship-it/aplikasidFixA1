import test from "node:test";
import assert from "node:assert/strict";
import { createPurchaseLookup } from "../lib/purchase-lookup.mjs";

const request = (body) => new Request("https://example.com/api/purchases", { method: "POST", body: JSON.stringify(body) });
test("email-only lookup normalizes email, scopes products, paginates and disables caching", async () => {
  const handler = createPurchaseLookup({
    findOrders: async (email, offset, limit) => {
      assert.equal(email, "buyer@example.com"); assert.equal(offset, 10); assert.equal(limit, 11);
      return Array.from({ length: 11 }, (_, i) => ({ ref_id: `order-${i}`, received_at: "2026-09-30", items: [{ uuid: "bought", title: "Product", qty: 1 }] }));
    },
    findDownloads: async (ids) => {
      assert.deepEqual(ids, ["bought"]);
      return [{ lynk_item_id: "bought", active: true, drive_url: "https://drive.google.com/file/d/example/view" }];
    },
  });
  const response = await handler(request({ email: " Buyer@Example.com ", page: 1 }));
  assert.equal(response.status, 200); assert.match(response.headers.get("cache-control"), /no-store/);
  const body = await response.json();
  assert.equal(body.orders.length, 10); assert.equal(body.hasNext, true);
  assert.equal(body.orders[0].items[0].drive_url, "https://drive.google.com/file/d/example/view");
});

test("invalid input cannot query orders", async () => {
  const handler = createPurchaseLookup({ findOrders: () => { assert.fail("must not query"); } });
  for (const input of [null, {}, { email: "x" }, { email: "a@example.com", page: -1 }, { email: "a@example.com", page: 0.5 }, { email: "a@example.com", page: "1" }]) {
    assert.equal((await handler(request(input))).status, 400);
  }
  assert.equal((await handler(new Request("https://example.com", { method: "POST", body: "{" }))).status, 400);
});

test("unmatched email returns empty results without fetching downloads", async () => {
  const handler = createPurchaseLookup({ findOrders: async () => [], findDownloads: () => assert.fail("must not query") });
  assert.deepEqual(await (await handler(request({ email: "missing@example.com" }))).json(), { orders: [], hasNext: false });
});

test("database failures do not look like missing purchases or expose internals", async () => {
  const handler = createPurchaseLookup({ findOrders: async () => { throw new Error("secret database detail"); } });
  const response = await handler(request({ email: "buyer@example.com" }));
  assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /secret/);
});
