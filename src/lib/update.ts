import { spawn } from "node:child_process";
import { CliConfig, PackageManagerInfo } from "../types.js";
import { PACKAGE_NAME, UPDATE_CHECK_INTERVAL_MS } from "./constants.js";
import { loadConfig, saveConfig } from "./config.js";
import { printInfo, printWarning } from "./output.js";

export function detectPackageManager(userAgent = process.env.npm_config_user_agent): PackageManagerInfo {
  if (userAgent?.startsWith("pnpm/")) {
    return {
      name: "pnpm",
      installCommand: `pnpm add -g ${PACKAGE_NAME}@latest`,
      runCommand: ["pnpm", "add", "-g", `${PACKAGE_NAME}@latest`],
    };
  }

  if (userAgent?.startsWith("yarn/")) {
    return {
      name: "yarn",
      installCommand: `yarn global add ${PACKAGE_NAME}@latest`,
      runCommand: ["yarn", "global", "add", `${PACKAGE_NAME}@latest`],
    };
  }

  if (userAgent?.startsWith("bun/")) {
    return {
      name: "bun",
      installCommand: `bun add -g ${PACKAGE_NAME}@latest`,
      runCommand: ["bun", "add", "-g", `${PACKAGE_NAME}@latest`],
    };
  }

  if (userAgent?.startsWith("npm/")) {
    return {
      name: "npm",
      installCommand: `npm install -g ${PACKAGE_NAME}@latest`,
      runCommand: ["npm", "install", "-g", `${PACKAGE_NAME}@latest`],
    };
  }

  return {
    name: "unknown",
    installCommand: `npm install -g ${PACKAGE_NAME}@latest`,
  };
}

export function shouldCheckForUpdates(config: CliConfig): boolean {
  if (config.updateCheck === false) return false;
  if (!config.lastUpdateCheckAt) return true;
  const lastChecked = new Date(config.lastUpdateCheckAt).getTime();
  return Number.isNaN(lastChecked) || Date.now() - lastChecked >= UPDATE_CHECK_INTERVAL_MS;
}

export function compareVersions(current: string, latest: string): number {
  const normalize = (value: string) => value.replace(/^v/, "").split(".").map((part) => Number(part));
  const a = normalize(current);
  const b = normalize(latest);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
}

export async function fetchLatestVersion(packageName = PACKAGE_NAME): Promise<string> {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to check npm registry: ${response.status}`);
  }

  const payload = (await response.json()) as { version?: string };
  if (!payload.version) {
    throw new Error("npm registry response missing version");
  }

  return payload.version;
}

export async function maybeNotifyForUpdates(currentVersion: string, config: CliConfig): Promise<void> {
  if (!shouldCheckForUpdates(config)) return;

  try {
    const latestVersion = await fetchLatestVersion();
    const nextConfig = {
      ...loadConfig(),
      lastUpdateCheckAt: new Date().toISOString(),
    };
    saveConfig(nextConfig);

    if (compareVersions(currentVersion, latestVersion) < 0 && latestVersion !== config.skippedVersion) {
      const pkgManager = detectPackageManager();
      printWarning(
        `A newer version of atypica CLI is available (${currentVersion} -> ${latestVersion}). Run \`${pkgManager.installCommand}\` or \`atypica self-update\`.`,
      );
    }
  } catch {
    // Ignore update failures during normal command execution.
  }
}

export async function runSelfUpdate(execute: boolean): Promise<void> {
  const pkgManager = detectPackageManager();

  if (!execute || !pkgManager.runCommand) {
    printInfo(`Upgrade command: ${pkgManager.installCommand}`);
    return;
  }

  const [command, ...args] = pkgManager.runCommand;
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Self-update command exited with code ${code ?? "unknown"}`));
    });
  });
}
