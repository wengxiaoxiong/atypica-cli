import test from "node:test";
import assert from "node:assert/strict";
import { ApiClient } from "../lib/api.js";
import { HttpError } from "../lib/errors.js";

test("ApiClient converts error payload into HttpError", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: false, message: "Unauthorized: Invalid API key" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });

  const client = new ApiClient({
    apiKey: "atypica_test",
    baseUrl: "https://example.com/api",
  });

  await assert.rejects(() => client.getPulse("1"), (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 401);
    assert.equal(error.message, "Unauthorized: Invalid API key");
    return true;
  });

  globalThis.fetch = originalFetch;
});
