import { revalidateTag } from "next/cache";
import { serverSupabase } from "../../../lib/storefront-server";

export async function POST(request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return Response.json({ error: "Login diperlukan." }, { status: 401 });
  try {
    const client = serverSupabase(token);
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Sesi tidak valid." }, { status: 401 });
    const { data: admin, error: roleError } = await client.from("admin_users").select("role").eq("id", user.id).maybeSingle();
    if (roleError || !["admin", "owner"].includes(admin?.role)) return Response.json({ error: "Akses admin diperlukan." }, { status: 403 });
    const payload = await request.json();
    let result;
    if (payload.action === "save_products" && Array.isArray(payload.products) && payload.products.length && payload.products.every((p) => typeof p.id === "string" && p.id.trim() && typeof p.title === "string" && p.title.trim())) {
      result = await client.from("products").upsert(payload.products.map((product) => ({ id: product.id, data: product, sort_order: Math.trunc(Number(product.sortOrder) || 0) })));
    } else if (payload.action === "delete_product" && typeof payload.id === "string" && payload.id) {
      result = await client.from("products").delete().eq("id", payload.id);
    } else if (payload.action === "save_settings" && ["homepage", "footer"].includes(payload.id) && payload.settings && typeof payload.settings === "object" && !Array.isArray(payload.settings)) {
      result = await client.from("site_settings").upsert({ id: payload.id, data: payload.settings });
    } else {
      return Response.json({ error: "Data tidak valid." }, { status: 400 });
    }
    if (result.error) return Response.json({ error: "Gagal menyimpan ke Supabase." }, { status: 500 });
    revalidateTag("storefront", { expire: 0 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Permintaan gagal. Silakan coba lagi." }, { status: 500 });
  }
}
