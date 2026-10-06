import test from "node:test";
import assert from "node:assert/strict";
import { isOutsideChat } from "../lib/chat-widget.mjs";

test("outside click detection closes only when the target is outside the chat widget", () => {
  const inside = { contains: (target) => target === "panel" || target === "close-button" };
  assert.equal(isOutsideChat(inside, "panel"), false);
  assert.equal(isOutsideChat(inside, "close-button"), false);
  assert.equal(isOutsideChat(inside, "page"), true);
  assert.equal(isOutsideChat(null, "page"), false);
});
