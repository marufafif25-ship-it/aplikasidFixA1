import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const gridStart = stylesheet.indexOf("\t.products-grid{");
const mobileStart = stylesheet.lastIndexOf("@media(max-width:560px){", gridStart);
const mobileEnd = stylesheet.indexOf("\n}", gridStart);
const mobileRules = mobileStart < 0 || mobileEnd < 0 ? "" : stylesheet.slice(mobileStart, mobileEnd);

function declarations(selector) {
  const rule = mobileRules.split(`${selector}{`)[1]?.split("}")[0];
  assert.ok(rule, `mobile styles for ${selector} should be defined`);
  return Object.fromEntries(rule.split(";").filter(Boolean).map((declaration) => declaration.split(":")));
}

test("mobile product titles show every line, including in Safari", () => {
  const title = declarations(".card-body h3");

  assert.equal(title.display, "block");
  assert.equal(title["line-clamp"], "unset");
  assert.equal(title["-webkit-line-clamp"], "unset");
  assert.equal(title.overflow, "visible");
  assert.equal(title["white-space"], "normal");
});

test("mobile product titles wrap long words and retain their full height", () => {
  const title = declarations(".card-body h3");

  assert.equal(title["overflow-wrap"], "anywhere");
  assert.equal(title["min-width"], "0");
  assert.equal(title["flex-shrink"], "0");
  assert.equal(title.height, undefined);
  assert.equal(title["max-height"], undefined);
});

test("mobile cards keep two flexible columns and align prices and buttons below titles", () => {
  const grid = declarations(".products-grid");
  const metadata = declarations(".product-meta");

  assert.equal(grid["grid-template-columns"], "repeat(2,minmax(0,1fr))");
  assert.equal(grid["grid-auto-rows"], undefined);
  assert.equal(metadata["margin-top"], "auto");
  assert.match(stylesheet, /\.product-card\{display:flex;flex-direction:column;height:100%\}/);
  assert.match(stylesheet, /\.card-body\{display:flex;flex:1;flex-direction:column\}/);
});
