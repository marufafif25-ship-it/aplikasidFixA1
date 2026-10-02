import test from "node:test";
import assert from "node:assert/strict";
import { uploadProductImage } from "../lib/product-image-upload.mjs";

function mockClient({ session = { user: { id: "admin-id" } }, sessionError = null, uploadError = null } = {}) {
  const uploads = [];
  let urlReads = 0;
  const storage = {
    async upload(path, body, options) {
      uploads.push({ path, body, options });
      return { error: uploadError };
    },
    getPublicUrl(path) {
      urlReads++;
      return { data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/product-images/${path}` } };
    }
  };
  const client = {
    auth: { getSession: async () => ({ data: { session }, error: sessionError }) },
    storage: { from(bucket) { assert.equal(bucket, "product-images"); return storage; } }
  };
  return { getClient: () => client, uploads, get urlReads() { return urlReads; } };
}

test("supported images upload as original files and return public URLs", async () => {
  for (const [type, extension] of [["image/png", "png"], ["image/jpeg", "jpg"], ["image/webp", "webp"], ["image/gif", "gif"]]) {
    const mock = mockClient();
    const file = new File(["image bytes"], "original image", { type });
    const url = await uploadProductImage(file, mock.getClient);
    assert.equal(mock.uploads.length, 1);
    const upload = mock.uploads[0];
    assert.equal(upload.body, file);
    assert.match(upload.path, new RegExp(`^admin-id/[a-f0-9-]+\\.${extension}$`));
    assert.equal(upload.options.contentType, type);
    assert.equal(upload.options.upsert, false);
    assert.equal(url, `https://example.supabase.co/storage/v1/object/public/product-images/${upload.path}`);
  }
});

test("unsupported and empty or oversized files fail before accessing Supabase", async () => {
  const getClient = () => assert.fail("Invalid files must not access Supabase");
  for (const type of ["image/svg+xml", "text/plain", ""]) {
    await assert.rejects(uploadProductImage({ type, size: 1 }, getClient), /PNG, JPG/);
  }
  for (const size of [0, 5242881]) {
    await assert.rejects(uploadProductImage({ type: "image/png", size }, getClient), /5 MB/);
  }
});

test("5 MB boundary is accepted and repeated filenames get unique storage paths", async () => {
  const mock = mockClient();
  const file = new File([new Uint8Array(5242880)], "same.png", { type: "image/png" });
  await uploadProductImage(file, mock.getClient);
  await uploadProductImage(file, mock.getClient);
  assert.notEqual(mock.uploads[0].path, mock.uploads[1].path);
});

test("missing or invalid sessions never upload files", async () => {
  for (const config of [{ session: null }, { sessionError: new Error("expired") }]) {
    const mock = mockClient(config);
    await assert.rejects(uploadProductImage({ type: "image/png", size: 1 }, mock.getClient), /login kembali/);
    assert.equal(mock.uploads.length, 0);
  }
});

test("storage failures never return a success URL and explain missing bucket setup", async () => {
  for (const [message, expected] of [["Bucket not found", /product-images.sql/], ["row-level security violation", /Upload gambar gagal: row-level security violation/]]) {
    const mock = mockClient({ uploadError: { message } });
    await assert.rejects(uploadProductImage({ type: "image/png", size: 1 }, mock.getClient), expected);
    assert.equal(mock.urlReads, 0);
  }
});

test("network failures propagate without returning an image URL", async () => {
  const mock = mockClient();
  const client = mock.getClient();
  client.storage.from = () => ({ upload: async () => { throw new Error("Network offline"); } });
  await assert.rejects(uploadProductImage({ type: "image/png", size: 1 }, () => client), /Network offline/);
  assert.equal(mock.urlReads, 0);
});
