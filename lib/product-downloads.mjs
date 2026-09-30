export function isDriveUrl(value) {
  if (typeof value !== "string" || value.length > 2048 || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "drive.google.com"
      && !url.port && !url.username && !url.password && url.pathname.length > 1;
  } catch { return false; }
}

// Match the exact Lynk item identifier; similar product names are not proof of purchase.
export function attachDownloads(orders, downloads) {
  const byId = new Map(downloads.filter((row) => row.active && isDriveUrl(row.drive_url))
    .map((row) => [row.lynk_item_id, row]));
  return orders.map((order) => ({
    ref_id: order.ref_id,
    received_at: order.received_at,
    items: order.items.map((item) => {
      const download = byId.get(item.uuid);
      return {
        title: download?.title || item.title,
        qty: item.qty,
        description: download?.description || "",
        drive_url: download?.drive_url || null,
      };
    }),
  }));
}
