import { blogPostFromRow } from "./blog.mjs";

function isMissingBlogTable(error) {
  const message = String(error?.message || "");
  return ["42P01", "PGRST205"].includes(error?.code)
    || (/blog_posts/i.test(message) && /(schema cache|does not exist|not found)/i.test(message));
}

export async function loadPublishedBlogPosts(createClient) {
  const { data, error } = await createClient()
    .from("blog_posts")
    .select("slug,title,excerpt,content,category,author,author_url,cover_image_url,published,published_at,updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("slug", { ascending: true });
  if (error && isMissingBlogTable(error)) return [];
  if (error) throw new Error("Artikel blog belum dapat dimuat.");
  return data.map(blogPostFromRow);
}
