import { ApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/auth.js";
import { resolveConfig } from "../lib/config.js";
import { CliError } from "../lib/errors.js";
import { renderPulseCategories, renderPulseDetail, renderPulseList } from "../lib/pulse.js";
import { CliContext } from "../types.js";

function parseFlags(args: string[]): Map<string, string | boolean> {
  const flags = new Map<string, string | boolean>();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      flags.set(key, inlineValue);
      continue;
    }

    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      flags.set(key, true);
      continue;
    }

    flags.set(key, next);
    index += 1;
  }

  return flags;
}

function stringFlag(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function runPulseCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, ...rest] = args;
  const config = resolveConfig();
  const apiKey = requireApiKey(config);
  const client = new ApiClient({
    apiKey,
    baseUrl: config.baseUrl ?? "",
  });

  if (subcommand === "list") {
    const flags = parseFlags(rest);
    const params = new URLSearchParams();

    ["category", "locale", "limit", "page"].forEach((key) => {
      const value = stringFlag(flags, key);
      if (value) params.set(key, value);
    });

    const orderBy = stringFlag(flags, "order-by");
    if (orderBy) params.set("orderBy", orderBy);

    const response = await client.getPulseList(params);
    renderPulseList(response.data, context.json);
    return;
  }

  if (subcommand === "categories") {
    const flags = parseFlags(rest);
    const params = new URLSearchParams();
    const locale = stringFlag(flags, "locale");
    if (locale) params.set("locale", locale);

    const response = await client.getPulseCategories(params);
    renderPulseCategories(response.data, context.json);
    return;
  }

  if (subcommand === "get") {
    const [id] = rest.filter((arg) => !arg.startsWith("--"));
    if (!id) {
      throw new CliError("Usage: atypica pulse get <id>");
    }

    const response = await client.getPulse(id);
    renderPulseDetail(response.data, context.json);
    return;
  }

  throw new CliError(
    "Usage: atypica pulse <list|categories|get>. Example: atypica pulse list --limit 5 --locale en-US",
  );
}
