import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("resolveConfig prefers env values over saved config", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "atypica-cli-config-"));
  process.env.XDG_CONFIG_HOME = tempDir;
  process.env.ATYPICA_API_KEY = "atypica_env_key";
  process.env.ATYPICA_BASE_URL = "https://example.com/api";

  const { saveConfig, resolveConfig } = await import("../lib/config.js");
  saveConfig({
    apiKey: "atypica_file_key",
    baseUrl: "https://file.example/api",
    updateCheck: false,
  });

  const config = resolveConfig();
  assert.equal(config.apiKey, "atypica_env_key");
  assert.equal(config.baseUrl, "https://example.com/api");
  assert.equal(config.updateCheck, false);

  delete process.env.XDG_CONFIG_HOME;
  delete process.env.ATYPICA_API_KEY;
  delete process.env.ATYPICA_BASE_URL;
  rmSync(tempDir, { recursive: true, force: true });
});
