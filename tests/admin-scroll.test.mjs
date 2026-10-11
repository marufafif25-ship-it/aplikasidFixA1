import test from "node:test";
import assert from "node:assert/strict";
import { scrollAdminEditorIntoView } from "../lib/admin-scroll.mjs";

test("admin editor scrolls into view when a product is selected for editing", () => {
  let options;
  const editor = { scrollIntoView(value) { options = value; } };

  assert.equal(scrollAdminEditorIntoView(editor), true);
  assert.deepEqual(options, { behavior: "smooth", block: "start" });
});

test("admin editor respects reduced motion and ignores missing elements", () => {
  let options;
  const editor = { scrollIntoView(value) { options = value; } };

  assert.equal(scrollAdminEditorIntoView(editor, { prefersReducedMotion: true }), true);
  assert.deepEqual(options, { behavior: "instant", block: "start" });
  assert.equal(scrollAdminEditorIntoView(null), false);
});
