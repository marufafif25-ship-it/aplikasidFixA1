import { getSupabase } from "./supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function fetchProducts() {
  const rows = unwrap(await getSupabase().from("products").select("id,data").order("sort_order"));
  return rows.map(({ id, data }) => ({ ...data, id }));
}

export async function saveProducts(products) {
  unwrap(await getSupabase().from("products").upsert(products.map((product) => ({
    id: product.id,
    data: product,
    sort_order: Number(product.sortOrder) || 0
  }))));
  return { success: true };
}

export async function saveProduct(product) {
  return saveProducts([product]);
}

export async function deleteProduct(id) {
  unwrap(await getSupabase().from("products").delete().eq("id", id));
  return { success: true };
}

export async function getAdminUser() {
  const client = getSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const role = unwrap(await client.from("admin_users").select("role").eq("id", user.id).maybeSingle());
  return role ? { login: user.email, role: role.role } : null;
}

export async function authenticateAdmin(email, password) {
  unwrap(await getSupabase().auth.signInWithPassword({ email, password }));
  const user = await getAdminUser();
  if (!user) {
    await signOutAdmin();
    return { success: false, message: "Akun ini belum memiliki akses admin." };
  }
  return { success: true, ...user };
}

export async function signOutAdmin() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

async function fetchSettings(id) {
  return unwrap(await getSupabase().from("site_settings").select("data").eq("id", id).maybeSingle())?.data || {};
}

async function saveSettings(id, settings) {
  unwrap(await getSupabase().from("site_settings").upsert({ id, data: settings }));
  return { success: true };
}

export const fetchHomepageSettings = () => fetchSettings("homepage");
export const saveHomepageSettings = (settings) => saveSettings("homepage", settings);
export const fetchFooterSettings = () => fetchSettings("footer");
export const saveFooterSettings = (settings) => saveSettings("footer", settings);

export async function fetchChatFaq() {
  const rows = unwrap(await getSupabase().from("chat_faq").select("id,data").eq("active", true).order("sort_order"));
  return rows.map(({ id, data }) => ({ ...data, id, active: true }));
}
