import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { CliConfig } from "../types.js";
import { ApiClient } from "./api.js";
import { API_KEY_URL, DOCS_URL } from "./constants.js";
import { CliError } from "./errors.js";
import { openUrl } from "./open.js";
import { printInfo, printWarning } from "./output.js";

export function validateApiKeyFormat(apiKey: string): void {
  if (!apiKey.startsWith("atypica_")) {
    throw new CliError("Invalid API key format. Expected a key starting with `atypica_`.");
  }
}

export async function promptForApiKey(config: CliConfig): Promise<string> {
  const rl = createInterface({ input, output });

  try {
    printInfo("No API key configured.");
    printInfo(`Generate one at: ${API_KEY_URL}`);
    printInfo(`API docs: ${DOCS_URL}`);
    printInfo("");

    const openChoice = (
      await rl.question("Open API key page in your browser now? [Y/n/docs] ")
    ).trim().toLowerCase();

    if (openChoice === "" || openChoice === "y" || openChoice === "yes") {
      await openUrl(API_KEY_URL).catch(() => {
        printWarning(`Could not open browser automatically. Visit ${API_KEY_URL}`);
      });
    } else if (openChoice === "docs") {
      await openUrl(DOCS_URL).catch(() => {
        printWarning(`Could not open browser automatically. Visit ${DOCS_URL}`);
      });
    }

    const apiKey = (await rl.question("Paste your Personal API Key: ")).trim();
    validateApiKeyFormat(apiKey);

    const client = new ApiClient({
      apiKey,
      baseUrl: config.baseUrl ?? "",
    });
    await client.validateApiKey();
    return apiKey;
  } finally {
    rl.close();
  }
}

export function requireApiKey(config: CliConfig): string {
  if (!config.apiKey) {
    throw new CliError(
      "Missing API key. Run `atypica auth login` or set `ATYPICA_API_KEY` before calling Pulse commands.",
      2,
    );
  }

  validateApiKeyFormat(config.apiKey);
  return config.apiKey;
}
