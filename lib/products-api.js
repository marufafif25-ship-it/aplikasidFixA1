import { applyCatalogImage } from "./catalog-images";
import { getSupabase } from "./supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function fetchProducts() {
  const rows = unwrap(await getSupabase().from("products").select("id,data").order("sort_order"));
  return Promise.all(rows.map(({ id, data }) => applyCatalogImage({ ...data, id })));
}

async function mutateCatalog(payload) {
  const { data: { session }, error } = await getSupabase().auth.getSession();
  if (error || !session) throw new Error("Silakan login kembali.");
  const response = await fetch("/api/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Gagal menyimpan data.");
  return result;
}

export const saveProducts = (products) => mutateCatalog({ action: "save_products", products });
export const saveProduct = (product) => saveProducts([product]);
export const deleteProduct = (id) => mutateCatalog({ action: "delete_product", id });

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

const saveSettings = (id, settings) => mutateCatalog({ action: "save_settings", id, settings });

export const fetchHomepageSettings = () => fetchSettings("homepage");
export const saveHomepageSettings = (settings) => saveSettings("homepage", settings);
export const fetchFooterSettings = () => fetchSettings("footer");
export const saveFooterSettings = (settings) => saveSettings("footer", settings);

export async function fetchChatFaq() {
  const rows = unwrap(await getSupabase().from("chat_faq").select("id,data").eq("active", true).order("sort_order"));
  return rows.map(({ id, data }) => ({ ...data, id, active: true }));
}
