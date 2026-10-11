import { revalidateTag } from "next/cache";
import { blogPostFromRow, normalizeBlogPost } from "../../../../lib/blog.mjs";
import { serverSupabase } from "../../../../lib/storefront-server";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

async function getAdminClient(request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return { response: Response.json({ error: "Login diperlukan." }, { status: 401, headers: PRIVATE_HEADERS }) };

  const client = serverSupabase(token);
  const { data: { user }, error: authError } = await client.auth.getUser(token);
  if (authError || !user) return { response: Response.json({ error: "Sesi tidak valid." }, { status: 401, headers: PRIVATE_HEADERS }) };

  const { data: admin, error: roleError } = await client.from("admin_users").select("role").eq("id", user.id).maybeSingle();
  if (roleError || !["admin", "owner"].includes(admin?.role)) {
    return { response: Response.json({ error: "Akses admin diperlukan." }, { status: 403, headers: PRIVATE_HEADERS }) };
  }
  return { client };
}

export async function GET(request) {
  try {
    const { client, response } = await getAdminClient(request);
    if (response) return response;
    const { data, error } = await client.from("blog_posts").select("slug,title,excerpt,content,category,author,author_url,cover_image_url,published,published_at,updated_at").order("updated_at", { ascending: false });
    if (error) return Response.json({ error: "Artikel blog belum dapat dimuat. Pastikan migrasi blog sudah diterapkan." }, { status: 500, headers: PRIVATE_HEADERS });
    return Response.json({ posts: data.map(blogPostFromRow) }, { headers: PRIVATE_HEADERS });
  } catch {
    return Response.json({ error: "Permintaan gagal. Silakan coba lagi." }, { status: 500, headers: PRIVATE_HEADERS });
  }
}

export async function POST(request) {
  try {
    const { client, response } = await getAdminClient(request);
    if (response) return response;

    let payload;
    try { payload = await request.json(); } catch { return Response.json({ error: "Data artikel tidak valid." }, { status: 400, headers: PRIVATE_HEADERS }); }
    if (payload.action !== "save" || typeof payload.isNew !== "boolean") {
      return Response.json({ error: "Permintaan artikel tidak valid." }, { status: 400, headers: PRIVATE_HEADERS });
    }

    let post;
    try { post = normalizeBlogPost(payload.post); } catch (error) {
      return Response.json({ error: error.message }, { status: 400, headers: PRIVATE_HEADERS });
    }

    const { data: existing, error: existingError } = await client.from("blog_posts").select("slug,published_at").eq("slug", post.slug).maybeSingle();
    if (existingError) return Response.json({ error: "Artikel blog belum dapat dimuat. Pastikan migrasi blog sudah diterapkan." }, { status: 500, headers: PRIVATE_HEADERS });
    if (payload.isNew && existing) return Response.json({ error: "URL artikel sudah dipakai. Pilih URL lain." }, { status: 409, headers: PRIVATE_HEADERS });
    if (!payload.isNew && !existing) return Response.json({ error: "Artikel tidak ditemukan. Muat ulang daftar artikel." }, { status: 404, headers: PRIVATE_HEADERS });

    const now = new Date().toISOString();
    const row = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author,
      author_url: post.authorUrl || null,
      cover_image_url: post.coverImageUrl || null,
      published: post.published,
      published_at: post.published ? existing?.published_at || now : null,
      updated_at: now
    };
    const { data, error } = await client.from("blog_posts").upsert(row).select("slug,title,excerpt,content,category,author,author_url,cover_image_url,published,published_at,updated_at").single();
    if (error) return Response.json({ error: "Gagal menyimpan artikel ke Supabase." }, { status: 500, headers: PRIVATE_HEADERS });

    revalidateTag("blog-posts", { expire: 0 });
    return Response.json({ post: blogPostFromRow(data) }, { headers: PRIVATE_HEADERS });
  } catch {
    return Response.json({ error: "Permintaan gagal. Silakan coba lagi." }, { status: 500, headers: PRIVATE_HEADERS });
  }
}

export async function DELETE(request) {
  try {
    const { client, response } = await getAdminClient(request);
    if (response) return response;
    const slug = new URL(request.url).searchParams.get("slug") || "";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "URL artikel tidak valid." }, { status: 400, headers: PRIVATE_HEADERS });

    const { data, error } = await client.from("blog_posts").delete().eq("slug", slug).select("slug").maybeSingle();
    if (error) return Response.json({ error: "Gagal menghapus artikel." }, { status: 500, headers: PRIVATE_HEADERS });
    if (!data) return Response.json({ error: "Artikel tidak ditemukan." }, { status: 404, headers: PRIVATE_HEADERS });
    revalidateTag("blog-posts", { expire: 0 });
    return Response.json({ success: true }, { headers: PRIVATE_HEADERS });
  } catch {
    return Response.json({ error: "Permintaan gagal. Silakan coba lagi." }, { status: 500, headers: PRIVATE_HEADERS });
  }
}
