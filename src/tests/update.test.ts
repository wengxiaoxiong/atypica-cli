import test from "node:test";
import assert from "node:assert/strict";
import { compareVersions, detectPackageManager, shouldCheckForUpdates } from "../lib/update.js";

test("compareVersions detects newer releases", () => {
  assert.equal(compareVersions("0.1.0", "0.1.1"), -1);
  assert.equal(compareVersions("0.1.1", "0.1.0"), 1);
  assert.equal(compareVersions("0.1.0", "0.1.0"), 0);
});

test("detectPackageManager supports pnpm", () => {
  const info = detectPackageManager("pnpm/10.24.0 node/v22.15.1 darwin arm64");
  assert.equal(info.name, "pnpm");
  assert.match(info.installCommand, /pnpm add -g/);
});

test("shouldCheckForUpdates skips fresh timestamps", () => {
  assert.equal(
    shouldCheckForUpdates({
      updateCheck: true,
      lastUpdateCheckAt: new Date().toISOString(),
    }),
    false,
  );
});
