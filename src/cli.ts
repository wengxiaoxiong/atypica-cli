#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runAuthCommand } from "./commands/auth.js";
import { runPulseCommand } from "./commands/pulse.js";
import { runSelfUpdateCommand } from "./commands/self-update.js";
import { resolveConfig } from "./lib/config.js";
import { CliError } from "./lib/errors.js";
import { maybeNotifyForUpdates } from "./lib/update.js";
import { printError, printInfo } from "./lib/output.js";
import { CliContext } from "./types.js";

async function readVersion(): Promise<string> {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(currentDir, "..", "package.json");
  const content = await readFile(pkgPath, "utf8");
  return (JSON.parse(content) as { version: string }).version;
}

function extractGlobalFlags(argv: string[]): { context: CliContext; args: string[] } {
  const args: string[] = [];
  let json = false;
  let updateCheck = true;

  for (const arg of argv) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--no-update-check") {
      updateCheck = false;
      continue;
    }

    args.push(arg);
  }

  return {
    context: { json, updateCheck },
    args,
  };
}

function printHelp(): void {
  printInfo("atypica CLI");
  printInfo("");
  printInfo("Usage:");
  printInfo("  atypica auth login");
  printInfo("  atypica auth status");
  printInfo("  atypica auth logout");
  printInfo("  atypica pulse list [--category ...] [--locale ...] [--limit ...] [--page ...] [--order-by ...]");
  printInfo("  atypica pulse categories [--locale ...]");
  printInfo("  atypica pulse get <id>");
  printInfo("  atypica self-update [--yes]");
  printInfo("");
  printInfo("Global flags:");
  printInfo("  --json");
  printInfo("  --no-update-check");
}

async function main(): Promise<void> {
  const version = await readVersion();
  const { context, args } = extractGlobalFlags(process.argv.slice(2));
  const [command, ...rest] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    printInfo(version);
    return;
  }

  const config = resolveConfig();
  if (context.updateCheck && config.updateCheck !== false) {
    void maybeNotifyForUpdates(version, config);
  }

  if (command === "auth") {
    await runAuthCommand(rest, context);
    return;
  }

  if (command === "pulse") {
    await runPulseCommand(rest, context);
    return;
  }

  if (command === "self-update") {
    await runSelfUpdateCommand(rest, context);
    return;
  }

  throw new CliError(`Unknown command: ${command}`);
}

main().catch((error) => {
  const { context } = extractGlobalFlags(process.argv.slice(2));
  printError(error, context);
  process.exit(error instanceof CliError ? error.code : 1);
});
