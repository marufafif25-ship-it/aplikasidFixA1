import { unstable_cache } from "next/cache";
import { serverSupabase } from "./storefront-server";
import { blogPostFromRow } from "./blog.mjs";

function isMissingBlogTable(error) {
  const message = String(error?.message || "");
  return ["42P01", "PGRST205"].includes(error?.code)
    || (/blog_posts/i.test(message) && /(schema cache|does not exist|not found)/i.test(message));
}

const getCachedPublishedBlogPosts = unstable_cache(async () => {
  const { data, error } = await serverSupabase()
    .from("blog_posts")
    .select("slug,title,excerpt,content,category,author,author_url,cover_image_url,published,published_at,updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("slug", { ascending: true });
  if (error && isMissingBlogTable(error)) return [];
  if (error) throw new Error("Artikel blog belum dapat dimuat.");
  return data.map(blogPostFromRow);
}, ["published-blog-posts-v1"], { revalidate: 300, tags: ["blog-posts"] });

export const getPublishedBlogPosts = () => getCachedPublishedBlogPosts();

export async function getPublishedBlogPost(slug) {
  return (await getPublishedBlogPosts()).find((post) => post.slug === slug) || null;
}
