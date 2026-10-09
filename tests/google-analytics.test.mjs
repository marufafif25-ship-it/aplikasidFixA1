import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("root layout loads and configures the Google Analytics measurement ID", async () => {
  const layout = await readFile(new URL("../app/layout.js", import.meta.url), "utf8");

  assert.match(layout, /const GA_MEASUREMENT_ID = "G-RDXXT1B7K2"/);
  const headStart = layout.indexOf("<head>");
  const headEnd = layout.indexOf("</head>", headStart);
  const googleAnalyticsHead = layout.slice(headStart, headEnd);

  assert.notEqual(headStart, -1);
  assert.notEqual(headEnd, -1);
  assert.match(googleAnalyticsHead, /googletagmanager\.com\/gtag\/js\?id=\$\{GA_MEASUREMENT_ID\}/);
  assert.match(googleAnalyticsHead, /window\.dataLayer = window\.dataLayer \|\| \[\]/);
  assert.match(googleAnalyticsHead, /gtag\('config', '\$\{GA_MEASUREMENT_ID\}'\)/);
});
