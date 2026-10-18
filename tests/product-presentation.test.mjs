import test from "node:test";
import assert from "node:assert/strict";
import { getProductPlatform, getProductSearchText } from "../lib/product-presentation.mjs";

test("product platform labels consistently spell out Windows and macOS", () => {
  assert.equal(getProductPlatform({ os: " Win & Mac " }), "Windows & macOS");
  assert.equal(getProductPlatform({ os: "WIN" }), "Windows");
  assert.equal(getProductPlatform({ os: "Mac" }), "macOS");
  assert.equal(getProductPlatform({ os: "Windows 11 & macOS 14" }), "Windows 11 & macOS 14");
  assert.equal(getProductPlatform({ os: "Linux" }), "Linux");
});

test("missing platform information does not invent compatibility", () => {
  for (const product of [undefined, {}, { os: null }, { os: 11 }, { os: "  " }]) {
    assert.equal(getProductPlatform(product), "");
  }
});

test("concise product titles remain searchable by platform, versions, purpose, and contents", () => {
  const searchText = getProductSearchText({
    title: "Adobe InDesign",
    os: "Win",
    versions: "2025, 2024, CS6",
    category: "Design",
    description: "Tata letak buku dan majalah",
    specs: ["Penggunaan offline", "Panduan instalasi"]
  });

  for (const query of ["adobe indesign", "windows", "cs6", "design", "majalah", "offline", "panduan instalasi"]) {
    assert.ok(searchText.includes(query), `product should match ${query}`);
  }
});

test("product search handles incomplete records and excludes unrelated fields", () => {
  assert.equal(getProductSearchText(), "");
  assert.equal(getProductSearchText({ title: "Office", specs: null }), "office");
  const searchText = getProductSearchText({ title: "Office", specs: [null, 123, "Word"], buyUrl: "PRIVATE_CHECKOUT", apiKey: "PRIVATE_KEY" });
  assert.ok(searchText.includes("word"));
  assert.doesNotMatch(searchText, /private|123|null/);
});
