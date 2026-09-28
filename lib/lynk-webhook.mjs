import { createHash, timingSafeEqual } from "node:crypto";

export function validSignature(payload, signature, merchantKey) {
  const message = payload?.data;
  const detail = message?.message_data;
  const amount = detail?.totals?.grandTotal;
  if (!merchantKey || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)
    || typeof detail?.refId !== "string" || !detail.refId
    || typeof message?.message_id !== "string" || !message.message_id
    || typeof amount !== "number" || !Number.isFinite(amount)) return false;
  const expected = createHash("sha256")
    .update(`${amount}${detail.refId}${message.message_id}${merchantKey}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function purchaseFromPayload(payload) {
  const message = payload?.data;
  const detail = message?.message_data;
  const email = detail?.customer?.email;
  if (message?.message_action !== "SUCCESS" || message?.message_code !== "0"
    || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || email.length > 320 || detail.refId.length > 256 || message.message_id.length > 256
    || !Array.isArray(detail.items) || !detail.items.length || detail.items.length > 200) {
    throw new Error("Invalid payment payload");
  }
  const items = detail.items.map((item) => {
    if (!item || typeof item.title !== "string" || !item.title.trim()
      || typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0
      || !Number.isSafeInteger(item.qty) || item.qty < 1) throw new Error("Invalid item");
    return { title: item.title.slice(0, 500), uuid: typeof item.uuid === "string" ? item.uuid.slice(0, 256) : null,
      price: item.price, qty: item.qty };
  });
  return {
    ref_id: detail.refId,
    message_id: message.message_id,
    customer_email: email.trim().toLowerCase(),
    items,
    // grandTotal is seller net proceeds, not the customer's payment total.
    totals: Object.fromEntries(Object.entries(detail.totals)
      .filter(([key, value]) => ["affiliate", "convenienceFee", "discount", "grandTotal", "totalAddon", "totalItem", "totalPrice", "totalShipping"].includes(key)
        && typeof value === "number" && Number.isFinite(value))),
    payment_status: "paid",
    // Preserve the source timestamp verbatim: Lynk's example has no timezone.
    lynk_created_at: typeof detail.createdAt === "string" ? detail.createdAt.slice(0, 64) : null,
  };
}

async function readPayload(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty body");
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1_048_576) { await reader.cancel(); throw new RangeError("Payload too large"); }
    chunks.push(Buffer.from(value));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createWebhookHandler({ merchantKey, savePurchase }) {
  return async function POST(request) {
    if (!merchantKey) return Response.json({ error: "Webhook belum dikonfigurasi." }, { status: 503 });
    let payload;
    try { payload = await readPayload(request); }
    catch (error) { return Response.json({ error: "Payload tidak valid." }, { status: error instanceof RangeError ? 413 : 400 }); }
    if (!validSignature(payload, request.headers.get("x-lynk-signature"), merchantKey)) {
      return Response.json({ error: "Signature tidak valid." }, { status: 401 });
    }
    if (payload.event !== "payment.received") return Response.json({ received: true, ignored: true });
    let purchase;
    try { purchase = purchaseFromPayload(payload); }
    catch { return Response.json({ error: "Data transaksi tidak valid." }, { status: 400 }); }
    try {
      await savePurchase(purchase);
      return Response.json({ received: true });
    } catch {
      return Response.json({ error: "Transaksi belum tersimpan." }, { status: 500 });
    }
  };
}
