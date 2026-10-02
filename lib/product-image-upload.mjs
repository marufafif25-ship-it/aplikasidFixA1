const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

export async function uploadProductImage(file, getClient) {
  const extension = extensions[file.type];
  if (!extension) throw new Error("Gunakan gambar PNG, JPG, WebP, atau GIF.");
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar harus antara 1 byte dan 5 MB.");
  const client = getClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) throw new Error("Silakan login kembali sebelum upload gambar.");
  const storage = client.storage.from("product-images");
  const path = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) {
    if (/bucket.*not found/i.test(error.message)) throw new Error("Storage gambar belum disiapkan. Jalankan supabase/product-images.sql di SQL Editor Supabase.");
    throw new Error(`Upload gambar gagal: ${error.message}`);
  }
  return storage.getPublicUrl(path).data.publicUrl;
}
