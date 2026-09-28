import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createWebhookHandler } from "../lib/lynk-webhook.mjs";

const merchantKey = "test-merchant-secret";
const fixture = () => ({ event: "payment.received", data: { message_action: "SUCCESS", message_code: "0", message_id: "event-1", message_data: {
  refId: "order-1", createdAt: "2025-04-10T14:30:45", customer: { email: " Buyer@Example.com ", name: "Buyer", phone: "081234" },
  items: [{ title: "Office", uuid: "product-1", price: 25000, qty: 1, questions: "private" }],
  totals: { grandTotal: 22000, totalPrice: 25000, convenienceFee: -3000 },
} } });
function request(payload, signature) {
  const { message_id, message_data: { refId, totals: { grandTotal } } } = payload.data;
  const valid = createHash("sha256").update(`${grandTotal}${refId}${message_id}${merchantKey}`).digest("hex");
  return new Request("https://example.com/api/webhook/lynk", { method: "POST", headers: { "x-lynk-signature": signature ?? valid }, body: JSON.stringify(payload) });
}

test("valid delivery normalizes owner email and stores only purchase fields", async () => {
  let stored;
  const handler = createWebhookHandler({ merchantKey, savePurchase: async (row) => { stored = row; } });
  assert.equal((await handler(request(fixture()))).status, 200);
  assert.equal(stored.customer_email, "buyer@example.com");
  assert.equal(stored.payment_status, "paid");
  assert.equal(stored.totals.grandTotal, 22000);
  assert.equal(stored.items[0].price, 25000);
  assert.equal(stored.items[0].questions, undefined);
  assert.equal(stored.lynk_created_at, "2025-04-10T14:30:45");
});

test("invalid, missing, malformed signatures and tampered amount never write", async () => {
  const handler = createWebhookHandler({ merchantKey, savePurchase: async () => assert.fail("must not write") });
  for (const signature of ["", "bad", "0".repeat(64), "z".repeat(64)]) {
    assert.equal((await handler(request(fixture(), signature))).status, 401);
  }
  const signed = request(fixture());
  const payload = fixture(); payload.data.message_data.totals.grandTotal = 1;
  assert.equal((await handler(request(payload, signed.headers.get("x-lynk-signature")))).status, 401);
});

test("malformed bodies and oversized requests are rejected", async () => {
  const handler = createWebhookHandler({ merchantKey, savePurchase: async () => assert.fail("must not write") });
  for (const body of ["{", "null", "[]"]) {
    const response = await handler(new Request("https://example.com", { method: "POST", body }));
    assert.ok([400, 401].includes(response.status));
  }
  assert.equal((await handler(new Request("https://example.com", { method: "POST", body: "x".repeat(1_048_577) }))).status, 413);
});

test("signed unsupported event is ignored without a write", async () => {
  const payload = fixture(); payload.event = "other";
  const handler = createWebhookHandler({ merchantKey, savePurchase: async () => assert.fail("must not write") });
  assert.deepEqual(await (await handler(request(payload))).json(), { received: true, ignored: true });
});

test("invalid customer, failed payment and invalid items are rejected", async () => {
  const handler = createWebhookHandler({ merchantKey, savePurchase: async () => assert.fail("must not write") });
  const mutations = [
    (p) => { p.data.message_data.customer.email = "invalid"; },
    (p) => { p.data.message_action = "FAILED"; },
    (p) => { p.data.message_data.items = []; },
    (p) => { p.data.message_data.items[0].qty = -1; },
    (p) => { p.data.message_data.items[0].price = "25,000"; },
  ];
  for (const mutate of mutations) { const payload = fixture(); mutate(payload); assert.equal((await handler(request(payload))).status, 400); }
});

test("database failure is not acknowledged as success", async () => {
  const handler = createWebhookHandler({ merchantKey, savePurchase: async () => { throw new Error("database down"); } });
  assert.equal((await handler(request(fixture()))).status, 500);
});

test("missing configuration fails closed", async () => {
  const handler = createWebhookHandler({ merchantKey: "", savePurchase: async () => assert.fail("must not write") });
  assert.equal((await handler(request(fixture()))).status, 503);
});
