import { createPurchaseLookup } from "../../../lib/purchase-lookup.mjs";
import { serviceSupabase } from "../../../lib/supabase-service";

export const runtime = "nodejs";

// Email-only lookup is an intentional store policy; it is not identity verification.
export const POST = createPurchaseLookup({
  findOrders: async (email, offset, limit) => {
    const { data, error } = await serviceSupabase().from("lynk_orders")
      .select("ref_id,items,received_at").eq("customer_email", email).eq("payment_status", "paid")
      .order("received_at", { ascending: false }).order("ref_id", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },
  findDownloads: async (ids) => {
    const { data, error } = await serviceSupabase().from("product_downloads")
      .select("lynk_item_id,title,description,drive_url,active").in("lynk_item_id", ids).eq("active", true);
    if (error) throw error;
    return data;
  },
});
