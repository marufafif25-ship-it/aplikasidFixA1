import test from "node:test";
import assert from "node:assert/strict";
import { attachDownloads, isDriveUrl } from "../lib/product-downloads.mjs";

test("only valid Google Drive HTTPS links are accepted", () => {
  assert.equal(isDriveUrl("https://drive.google.com/drive/folders/example?usp=sharing"), true);
  for (const value of ["javascript:alert(1)", "https://drive.google.com.evil.test/file", "https://drive.google.com@evil.test/file", "http://drive.google.com/file", "https://user@drive.google.com/file", "https://drive.google.com/", null]) {
    assert.equal(isDriveUrl(value), false);
  }
});

test("downloads match purchased item IDs, never titles or another product", () => {
  const result = attachDownloads([{ ref_id: "order-a", received_at: "2026-09-30", customer_email: "private@example.com", totals: {}, items: [
    { uuid: "bought", title: "Software", qty: 1 },
    { uuid: "unmapped", title: "Software", qty: 1 },
    { uuid: "disabled", title: "Old product", qty: 1 },
    { uuid: "unsafe", title: "Invalid link", qty: 1 },
  ] }], [
    { lynk_item_id: "bought", title: "SPSS Windows", description: "Baca panduan instalasi.\nPilih versi Windows.", active: true, drive_url: "https://drive.google.com/file/d/bought/view" },
    { lynk_item_id: "other", active: true, drive_url: "https://drive.google.com/file/d/other/view" },
    { lynk_item_id: "disabled", description: "Do not disclose inactive instructions", active: false, drive_url: "https://drive.google.com/file/d/disabled/view" },
    { lynk_item_id: "unsafe", active: true, drive_url: "https://example.com/file" },
  ]);
  assert.deepEqual(result[0].items.map((item) => item.drive_url), ["https://drive.google.com/file/d/bought/view", null, null, null]);
  assert.equal("customer_email" in result[0], false);
  assert.equal("totals" in result[0], false);
  assert.equal(result[0].items[0].title, "SPSS Windows");
  assert.equal(result[0].items[0].description, "Baca panduan instalasi.\nPilih versi Windows.");
  assert.equal(result[0].items[1].title, "Software");
  assert.equal(result[0].items[1].description, "");
  assert.equal(result[0].items[2].description, "");
});
