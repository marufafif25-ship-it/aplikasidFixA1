import { serverSupabase } from "../../../../lib/storefront-server";
import { serviceSupabase } from "../../../../lib/supabase-service";
import { isDriveUrl } from "../../../../lib/product-downloads.mjs";

const headers = { "Cache-Control": "private, no-store" };
const reply = (body, status = 200) => Response.json(body, { status, headers });

async function authorize(request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  const client = serverSupabase(token);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;
  const { data: admin } = await client.from("admin_users").select("role").eq("id", user.id).maybeSingle();
  return ["admin", "owner"].includes(admin?.role) ? client : null;
}

export async function GET(request) {
  try {
    const client = await authorize(request);
    if (!client) return reply({ error: "Akses admin diperlukan." }, 401);
    const [{ data: downloads, error }, { data: orders, error: orderError }] = await Promise.all([
      client.from("product_downloads").select("lynk_item_id,title,description,drive_url,active").order("title"),
      serviceSupabase().from("lynk_orders").select("items").order("received_at", { ascending: false }).limit(1000),
    ]);
    if (error || orderError) throw new Error();
    const candidates = new Map();
    for (const order of orders) for (const item of order.items) {
      if (item.uuid && !candidates.has(item.uuid)) candidates.set(item.uuid, { lynk_item_id: item.uuid, title: item.title, description: "", drive_url: "", active: true });
    }
    for (const row of downloads) candidates.set(row.lynk_item_id, row);
    return reply({ downloads: [...candidates.values()].sort((a, b) => a.title.localeCompare(b.title)) });
  } catch { return reply({ error: "Pengaturan unduhan belum bisa dimuat. Periksa migrasi product-downloads.sql dan key server Supabase." }, 503); }
}

export async function POST(request) {
  try {
    const client = await authorize(request);
    if (!client) return reply({ error: "Akses admin diperlukan." }, 401);
    const body = await request.text();
    if (body.length > 8192) return reply({ error: "Data terlalu besar." }, 400);
    let row;
    try { row = JSON.parse(body); } catch { return reply({ error: "Data tidak valid." }, 400); }
    if (typeof row?.lynk_item_id !== "string" || !row.lynk_item_id.trim() || row.lynk_item_id.length > 256
      || typeof row.title !== "string" || !row.title.trim() || row.title.length > 500
      || typeof row.description !== "string" || row.description.length > 3000
      || !isDriveUrl(row.drive_url) || typeof row.active !== "boolean") return reply({ error: "Isi ID produk, nama, dan URL Google Drive HTTPS yang valid." }, 400);
    const { error } = await client.from("product_downloads").upsert({ lynk_item_id: row.lynk_item_id.trim(), title: row.title.trim(), description: row.description.trim(), drive_url: row.drive_url, active: row.active });
    if (error) throw error;
    return reply({ success: true });
  } catch { return reply({ error: "Link unduhan gagal disimpan." }, 503); }
}
