import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { META_PIXEL_ID, shouldTrackMetaPageView } from "../lib/meta-pixel.mjs";

test("Meta Pixel tracks a route change but ignores the initial and repeated path", () => {
  assert.equal(shouldTrackMetaPageView(null, "/"), false);
  assert.equal(shouldTrackMetaPageView("/", "/produk"), true);
  assert.equal(shouldTrackMetaPageView("/", "/"), false);
  assert.equal(shouldTrackMetaPageView("/", null), false);
});

test("root layout initializes the Aplikasid Meta Pixel and sends the first PageView", async () => {
  const layout = await readFile(new URL("../app/layout.js", import.meta.url), "utf8");

  assert.equal(META_PIXEL_ID, "28299406323089200");
  assert.match(layout, /id="meta-pixel-init" strategy="beforeInteractive"/);
  assert.match(layout, /fbq\('init', '\$\{META_PIXEL_ID\}'\)/);
  assert.match(layout, /fbq\('track', 'PageView'\)/);
  assert.match(layout, /MetaPixelPageViews/);
});
