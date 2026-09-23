import { createClient } from "@supabase/supabase-js";

let client;
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Isi konfigurasi Supabase di .env.local terlebih dahulu.");
  if (!client) client = createClient(url, key);
  return client;
}
