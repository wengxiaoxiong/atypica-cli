import { fetchLatestVersion, runSelfUpdate } from "../lib/update.js";
import { printInfo, printJson } from "../lib/output.js";
import { CliContext } from "../types.js";

export async function runSelfUpdateCommand(args: string[], context: CliContext): Promise<void> {
  const execute = args.includes("--yes");
  const latestVersion = await fetchLatestVersion();

  if (context.json) {
    printJson({
      success: true,
      latestVersion,
      execute,
    });
    if (execute) {
      await runSelfUpdate(true);
    }
    return;
  }

  printInfo(`Latest version: ${latestVersion}`);
  await runSelfUpdate(execute);
}
