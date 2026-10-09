import test from "node:test";
import assert from "node:assert/strict";
import {
  createBreadcrumbStructuredData,
  createRobots,
  createSitemap,
  createWebsiteStructuredData,
  resolveSiteUrl,
  serializeJsonLd
} from "../lib/seo.mjs";

test("site URL is normalized to the canonical origin", () => {
  assert.equal(resolveSiteUrl("https://www.aplikasid.com/shop/"), "https://www.aplikasid.com");
  assert.throws(() => resolveSiteUrl("javascript:alert(1)"), /HTTP atau HTTPS/);
});

test("sitemap includes the homepage, category index, and published guide routes", () => {
  const sitemap = createSitemap("https://www.aplikasid.com", ["cara-membeli-software", "mengunduh-produk"]);
  assert.deepEqual(sitemap.map(({ url }) => url), [
    "https://www.aplikasid.com/",
    "https://www.aplikasid.com/panduan",
    "https://www.aplikasid.com/kategori",
    "https://www.aplikasid.com/panduan/cara-membeli-software",
    "https://www.aplikasid.com/panduan/mengunduh-produk"
  ]);
  assert.equal(sitemap.some(({ url }) => url.includes("adminn") || url.includes("/api/")), false);
});

test("sitemap includes dynamic category and product routes", () => {
  const sitemap = createSitemap("https://www.aplikasid.com", [], ["app-autocad", "app-office"], ["engineering-3d"]);
  assert.deepEqual(sitemap.map(({ url }) => url), [
    "https://www.aplikasid.com/",
    "https://www.aplikasid.com/panduan",
    "https://www.aplikasid.com/kategori",
    "https://www.aplikasid.com/kategori/engineering-3d",
    "https://www.aplikasid.com/produk/app-autocad",
    "https://www.aplikasid.com/produk/app-office"
  ]);
});

test("robots exposes the sitemap and keeps API routes out of crawling", () => {
  assert.deepEqual(createRobots("https://www.aplikasid.com"), {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://www.aplikasid.com/sitemap.xml"
  });
});

test("website structured data identifies the canonical brand URLs", () => {
  const data = createWebsiteStructuredData("https://www.aplikasid.com");
  assert.deepEqual(data["@graph"].map((entry) => entry["@type"]), ["Organization", "WebSite"]);
  assert.equal(data["@graph"][0].url, "https://www.aplikasid.com");
  assert.equal(data["@graph"][1].publisher["@id"], "https://www.aplikasid.com/#organization");
});

test("breadcrumb structured data follows the visible page hierarchy", () => {
  const breadcrumb = createBreadcrumbStructuredData("https://www.aplikasid.com", [
    { name: "Beranda", path: "/" },
    { name: "Panduan", path: "/panduan" },
    { name: "Cara membeli", path: "/panduan/cara-membeli" }
  ]);
  assert.deepEqual(breadcrumb.itemListElement.map(({ name, item }) => [name, item]), [
    ["Beranda", "https://www.aplikasid.com/"],
    ["Panduan", "https://www.aplikasid.com/panduan"],
    ["Cara membeli", "https://www.aplikasid.com/panduan/cara-membeli"]
  ]);
});

test("JSON-LD serializer escapes characters that can break a script element", () => {
  const result = serializeJsonLd({ text: "</script>\u2028" });
  assert.equal(result.includes("</script>"), false);
  assert.equal(result.includes("\\u2028"), true);
});
