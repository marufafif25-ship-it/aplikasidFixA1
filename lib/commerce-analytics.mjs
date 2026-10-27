function sendEvent(name, parameters, target) {
  if (typeof target?.gtag !== "function") return false;
  try {
    target.gtag("event", name, { ...parameters, transport_type: "beacon" });
    return true;
  } catch {
    // Analytics must never prevent browsing or checkout.
    return false;
  }
}

export function trackProductEvent(name, product, target = globalThis.window) {
  if (!["view_item", "begin_checkout"].includes(name) || !product?.id || !product?.title) return false;
  // Send only public catalog fields, never the record, checkout URL, or customer data.
  const item = { item_id: String(product.id), item_name: product.title, quantity: 1 };
  if (typeof product.category === "string") item.item_category = product.category;
  const hasPrice = ["number", "string"].includes(typeof product.price) && String(product.price).trim() !== "";
  const price = Number(product.price);
  const validPrice = hasPrice && Number.isFinite(price) && price >= 0;
  if (validPrice) item.price = price;
  return sendEvent(name, { currency: "IDR", ...(validPrice ? { value: price } : {}), items: [item] }, target);
}

export function trackWhatsAppClick(href, target = globalThis.window) {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || !["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) return false;
  } catch { return false; }
  // Do not send phone numbers or prefilled messages in the URL to Analytics.
  return sendEvent("contact_click", { contact_method: "whatsapp" }, target);
}
