import { blogPostFromRow } from "./blog.mjs";

const BLOG_COLUMNS = "slug,title,excerpt,content,category,author,author_url,cover_image_url,published,published_at,updated_at";
const BLOG_COLUMNS_WITH_VIEWS = `${BLOG_COLUMNS},views,views_updated_at`;

function isMissingBlogTable(error) {
  const message = String(error?.message || "");
  return ["42P01", "PGRST205"].includes(error?.code)
    || (/blog_posts/i.test(message) && /(schema cache|does not exist|not found)/i.test(message));
}

function isMissingBlogViewsColumns(error) {
  const message = String(error?.message || "");
  return ["42703", "PGRST204"].includes(error?.code)
    && /views/i.test(message)
    || /views(_updated_at)?/i.test(message) && /(schema cache|does not exist|not found|column)/i.test(message);
}

function queryPublishedPosts(client, columns) {
  return client
    .from("blog_posts")
    .select(columns)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("slug", { ascending: true });
}

export async function loadPublishedBlogPosts(createClient) {
  const client = createClient();
  let { data, error } = await queryPublishedPosts(client, BLOG_COLUMNS_WITH_VIEWS);
  if (error && isMissingBlogViewsColumns(error)) {
    ({ data, error } = await queryPublishedPosts(client, BLOG_COLUMNS));
  }
  if (error && isMissingBlogTable(error)) return [];
  if (error) throw new Error("Artikel blog belum dapat dimuat.");
  return data.map(blogPostFromRow);
}
