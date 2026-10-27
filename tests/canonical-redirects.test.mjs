import test from "node:test";
import assert from "node:assert/strict";
import { unstable_getResponseFromNextConfig, getRedirectUrl } from "next/experimental/testing/server.js";
import { createCanonicalRedirects } from "../lib/canonical-redirects.mjs";
import nextConfig from "../next.config.mjs";

test("legacy public pages permanently redirect while retaining paths and query parameters", async () => {
  for (const host of ["aplikasid.my.id", "www.aplikasid.my.id", "aplikasid.com"]) {
    for (const path of ["/", "/produk/app-office", "/blog?page=2", "/kategori/statistik-riset?utm_source=google", "/robots.txt", "/sitemap.xml"]) {
      const response = await unstable_getResponseFromNextConfig({ url: `https://${host}${path}`, nextConfig });
      assert.equal(response.status, 308, `${host}${path}`);
      assert.equal(getRedirectUrl(response), `https://www.aplikasid.com${path}`);
    }
  }
});

test("API payment callbacks, sessions, static runtime, and Google verification stay on the original host", async () => {
  for (const path of ["/api", "/api/webhook/lynk", "/api/purchases", "/adminn", "/akun", "/login", "/_next/static/chunk.js", "/google6bdd09b63391827f.html"]) {
    const response = await unstable_getResponseFromNextConfig({ url: `https://www.aplikasid.my.id${path}`, nextConfig });
    assert.equal(getRedirectUrl(response), null, path);
  }
});

test("canonical, local, preview, and lookalike hosts never enter a redirect loop", async () => {
  for (const host of ["www.aplikasid.com", "localhost:3000", "preview.vercel.app", "www.aplikasid.my.id.example.com"]) {
    const response = await unstable_getResponseFromNextConfig({ url: `https://${host}/produk/app-office`, nextConfig });
    assert.equal(getRedirectUrl(response), null, host);
  }
  const alternateOrigin = createCanonicalRedirects("https://www.aplikasid.my.id");
  assert.equal(alternateOrigin.some((redirect) => redirect.has[0].value === "www\\.aplikasid\\.my\\.id"), false);
});
