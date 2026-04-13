import { spawn } from "node:child_process";

function getOpenCommand(url: string): string[] {
  if (process.platform === "darwin") return ["open", url];
  if (process.platform === "win32") return ["cmd", "/c", "start", "", url];
  return ["xdg-open", url];
}

export function openUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [command, ...args] = getOpenCommand(url);
    const child = spawn(command, args, {
      detached: process.platform !== "win32",
      stdio: "ignore",
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}
