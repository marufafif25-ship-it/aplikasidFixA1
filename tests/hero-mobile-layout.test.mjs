import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const mobileRuleStart = stylesheet.lastIndexOf("@media(max-width:560px){");
const mobileCategoryRule = mobileRuleStart < 0 ? "" : stylesheet.slice(mobileRuleStart);

test("hero category cards reset desktop positioning and form a compact mobile grid", () => {
  assert.ok(mobileCategoryRule, "mobile category styles should be defined");
  const rules = mobileCategoryRule;

  assert.match(rules, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(rules, /quick-cat-card:nth-of-type\(n\)\{[^}]*position:relative;[^}]*left:auto;[^}]*right:auto;[^}]*top:auto;[^}]*bottom:auto;[^}]*transform:none/);
  assert.match(rules, /quick-cat-card:nth-of-type\(5\)\{grid-column:1\/-1\}/);
});
