import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("root layout loads and configures the Google Analytics measurement ID", async () => {
  const layout = await readFile(new URL("../app/layout.js", import.meta.url), "utf8");

  assert.match(layout, /const GA_MEASUREMENT_ID = "G-RDXXT1B7K2"/);
  assert.match(
    layout,
    /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=\$\{GA_MEASUREMENT_ID\}/
  );
  assert.match(layout, /strategy="afterInteractive"/);
  assert.match(layout, /gtag\('config', '\$\{GA_MEASUREMENT_ID\}'\)/);
});
