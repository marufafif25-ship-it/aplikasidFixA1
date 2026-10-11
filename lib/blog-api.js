import { getSupabase } from "./supabase";

async function requestAdminBlog(path = "/api/admin/blog", { method = "GET", body } = {}) {
  const { data: { session }, error } = await getSupabase().auth.getSession();
  if (error || !session) throw new Error("Silakan login kembali.");

  const response = await fetch(path, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Gagal memproses artikel.");
  return result;
}

export async function fetchAdminBlogPosts() {
  const { posts } = await requestAdminBlog();
  return posts;
}

export async function saveAdminBlogPost(post, isNew) {
  const { post: savedPost } = await requestAdminBlog("/api/admin/blog", {
    method: "POST",
    body: { action: "save", post, isNew }
  });
  return savedPost;
}

export async function deleteAdminBlogPost(slug) {
  const query = new URLSearchParams({ slug });
  await requestAdminBlog(`/api/admin/blog?${query}`, { method: "DELETE" });
}
