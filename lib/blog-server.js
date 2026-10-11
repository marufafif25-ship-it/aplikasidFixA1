import { serverSupabase } from "./storefront-server";
import { loadPublishedBlogPosts } from "./blog-data.mjs";

export const getPublishedBlogPosts = () => loadPublishedBlogPosts(serverSupabase);

export async function getPublishedBlogPost(slug) {
  return (await getPublishedBlogPosts()).find((post) => post.slug === slug) || null;
}
