import test from "node:test";
import assert from "node:assert/strict";
import { validateApiKeyFormat } from "../lib/auth.js";

test("validateApiKeyFormat accepts atypica-prefixed keys", () => {
  assert.doesNotThrow(() => validateApiKeyFormat("atypica_123"));
});

test("validateApiKeyFormat rejects invalid keys", () => {
  assert.throws(() => validateApiKeyFormat("wrong_123"));
});
