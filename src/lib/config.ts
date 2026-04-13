import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { CliConfig } from "../types.js";
import { DEFAULT_BASE_URL } from "./constants.js";

function getConfigDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) return join(xdg, "atypica");
  return join(homedir(), ".config", "atypica");
}

export function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

export function getDefaultConfig(): CliConfig {
  return {
    baseUrl: DEFAULT_BASE_URL,
    updateCheck: true,
  };
}

export function loadConfig(): CliConfig {
  const path = getConfigPath();
  if (!existsSync(path)) {
    return getDefaultConfig();
  }

  try {
    const content = readFileSync(path, "utf8");
    const parsed = JSON.parse(content) as CliConfig;
    return {
      ...getDefaultConfig(),
      ...parsed,
    };
  } catch {
    return getDefaultConfig();
  }
}

export function saveConfig(config: CliConfig): void {
  const path = getConfigPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  if (process.platform !== "win32") {
    chmodSync(path, 0o600);
  }
}

export function clearConfig(): void {
  saveConfig(getDefaultConfig());
}

export function resolveConfig(): CliConfig {
  const fileConfig = loadConfig();

  return {
    ...fileConfig,
    apiKey: process.env.ATYPICA_API_KEY || fileConfig.apiKey,
    baseUrl: process.env.ATYPICA_BASE_URL || fileConfig.baseUrl || DEFAULT_BASE_URL,
    updateCheck:
      process.env.ATYPICA_UPDATE_CHECK === "0"
        ? false
        : fileConfig.updateCheck ?? getDefaultConfig().updateCheck,
  };
}
