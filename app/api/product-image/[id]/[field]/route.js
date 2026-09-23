import { serverSupabase } from "../../../../../lib/storefront-server";

export async function GET(request, { params }) {
  const { id, field } = await params;
  if (!["imageUrl", "catalogImageUrl"].includes(field)) return new Response(null, { status: 404 });
  try {
    const { data, error } = await serverSupabase().from("products").select("data").eq("id", id).maybeSingle();
    if (error) return new Response(null, { status: 503 });
    const match = data?.data[field]?.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) return new Response(null, { status: 404 });
    return new Response(Buffer.from(match[2], "base64"), { headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "X-Content-Type-Options": "nosniff"
    } });
  } catch { return new Response(null, { status: 503 }); }
}
