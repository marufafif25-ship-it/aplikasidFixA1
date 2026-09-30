import { attachDownloads } from "./product-downloads.mjs";

export const PURCHASE_PAGE_SIZE = 10;
const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
export function createPurchaseLookup({ findOrders, findDownloads }) {
  return async function POST(request) {
    let input;
    try {
      const body = await request.text();
      if (body.length > 2048) throw new Error();
      input = JSON.parse(body);
    } catch { return Response.json({ error: "Permintaan tidak valid." }, { status: 400, headers }); }
    const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
    const page = input?.page ?? 0;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320
      || !Number.isSafeInteger(page) || page < 0 || page > 10000) {
      return Response.json({ error: "Masukkan email checkout yang valid." }, { status: 400, headers });
    }
    try {
      const rows = await findOrders(email, page * PURCHASE_PAGE_SIZE, PURCHASE_PAGE_SIZE + 1);
      const orders = rows.slice(0, PURCHASE_PAGE_SIZE);
      const ids = [...new Set(orders.flatMap((order) => order.items.map((item) => item.uuid)).filter(Boolean))];
      const downloads = ids.length ? await findDownloads(ids) : [];
      return Response.json({ orders: attachDownloads(orders, downloads), hasNext: rows.length > PURCHASE_PAGE_SIZE }, { headers });
    } catch {
      return Response.json({ error: "Pembelian belum bisa dimuat. Silakan coba lagi nanti." }, { status: 503, headers });
    }
  };
}
