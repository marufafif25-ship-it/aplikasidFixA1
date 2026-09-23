import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export function serverSupabase(token) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      fetch: (url, options) => fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(10000) })
    }
  });
}

export const getStorefront = unstable_cache(async () => {
  const client = serverSupabase();
  const results = await Promise.all([
    client.from("products").select("id,data,sort_order").order("sort_order").order("id"),
    client.from("site_settings").select("id,data"),
    client.from("chat_faq").select("id,data,sort_order").eq("active", true).order("sort_order")
  ]);
  for (const result of results) if (result.error) throw new Error("Katalog Supabase belum dapat dimuat.");
  const [products, settings, faq] = results.map((result) => result.data);
  return {
    products: products.map(({ id, data, sort_order }) => ({ ...data, id, sortOrder: sort_order })),
    homepage: settings.find((row) => row.id === "homepage")?.data || {},
    footer: settings.find((row) => row.id === "footer")?.data || {},
    faq: faq.map(({ id, data, sort_order }) => ({ ...data, id, active: true, sortOrder: sort_order }))
  };
}, ["storefront-v1"], { revalidate: 60, tags: ["storefront"] });
