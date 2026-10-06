import test from "node:test";
import assert from "node:assert/strict";
import { isAccountFeatureEnabled } from "../lib/account-feature.mjs";

test("Akun Saya stays hidden by default and can be enabled from homepage settings", () => {
  assert.equal(isAccountFeatureEnabled(undefined), false);
  assert.equal(isAccountFeatureEnabled({}), false);
  assert.equal(isAccountFeatureEnabled({ accountEnabled: false }), false);
  assert.equal(isAccountFeatureEnabled({ accountEnabled: true }), true);
  assert.equal(isAccountFeatureEnabled({ accountEnabled: "true" }), false);
});
