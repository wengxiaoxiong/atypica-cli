import { inspect } from "node:util";
import { CliContext } from "../types.js";

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function printJson(value: unknown): void {
  process.stdout.write(`${stringify(value)}\n`);
}

export function printInfo(message: string): void {
  process.stdout.write(`${message}\n`);
}

export function printWarning(message: string): void {
  process.stderr.write(`Warning: ${message}\n`);
}

export function printError(error: unknown, context?: CliContext): void {
  if (context?.json) {
    const message = error instanceof Error ? error.message : String(error);
    printJson({ success: false, message });
    return;
  }

  if (error instanceof Error) {
    process.stderr.write(`${error.message}\n`);
    return;
  }

  process.stderr.write(`${inspect(error)}\n`);
}

export function formatValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

export function printTable(headers: string[], rows: string[][]): void {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => (row[index] ?? "").length)),
  );

  const renderRow = (row: string[]) =>
    row.map((cell, index) => (cell ?? "").padEnd(widths[index], " ")).join("  ");

  printInfo(renderRow(headers));
  printInfo(widths.map((width) => "-".repeat(width)).join("  "));

  for (const row of rows) {
    printInfo(renderRow(row));
  }
}
