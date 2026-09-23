import images from "./catalog-images.json";

// Replace only the original image pair. Subsequent admin edits take precedence.
export async function applyCatalogImage(product) {
  const replacement = images[product.id];
  if (!replacement) return product;
  const source = JSON.stringify([product.imageUrl || "", product.catalogImageUrl || ""]);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== replacement.originalHash) return product;
  return { ...product, imageUrl: replacement.src, catalogImageUrl: replacement.src };
}
