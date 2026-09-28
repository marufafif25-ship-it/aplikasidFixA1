import { createClient } from "@supabase/supabase-js";
import { createWebhookHandler } from "../../../../lib/lynk-webhook.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ error: "Webhook belum dikonfigurasi." }, { status: 503 });
  return createWebhookHandler({
    merchantKey: process.env.LYNK_MERCHANT_KEY,
    savePurchase: async (purchase) => {
      const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      // A repeated delivery must never overwrite an existing purchase or its owner.
      const { error } = await client.from("lynk_orders").upsert(purchase, { onConflict: "ref_id", ignoreDuplicates: true });
      if (error) throw error;
    },
  })(request);
}
