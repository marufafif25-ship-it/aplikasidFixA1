export function getProductPlatform(product) {
  if (typeof product?.os !== "string") return "";
  return product.os.trim().replace(/\bWin\b/gi, "Windows").replace(/\bMac\b/gi, "macOS");
}

export function getProductSearchText(product) {
  return [
    product?.title,
    product?.category,
    getProductPlatform(product),
    product?.versions,
    product?.description,
    ...(Array.isArray(product?.specs) ? product.specs : [])
  ].filter((value) => typeof value === "string" && value.trim()).join(" ").toLowerCase();
}
