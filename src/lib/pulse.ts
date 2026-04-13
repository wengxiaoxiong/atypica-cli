import { PulseDetail, PulseListItem } from "../types.js";
import { formatValue, printInfo, printJson, printTable } from "./output.js";

export function renderPulseList(items: PulseListItem[], json: boolean): void {
  if (json) {
    printJson(items);
    return;
  }

  if (items.length === 0) {
    printInfo("No pulses found.");
    return;
  }

  printTable(
    ["ID", "Category", "Locale", "Heat", "Delta", "Title"],
    items.map((item) => [
      String(item.id),
      item.category,
      item.locale,
      formatValue(item.heatScore),
      formatValue(item.heatDelta),
      item.title,
    ]),
  );
}

export function renderPulseCategories(items: string[], json: boolean): void {
  if (json) {
    printJson(items);
    return;
  }

  if (items.length === 0) {
    printInfo("No categories found.");
    return;
  }

  for (const item of items) {
    printInfo(item);
  }
}

export function renderPulseDetail(item: PulseDetail, json: boolean): void {
  if (json) {
    printJson(item);
    return;
  }

  printInfo(`ID: ${item.id}`);
  printInfo(`Title: ${item.title}`);
  printInfo(`Category: ${item.category}`);
  printInfo(`Locale: ${item.locale}`);
  printInfo(`Heat Score: ${formatValue(item.heatScore)}`);
  printInfo(`Heat Delta: ${formatValue(item.heatDelta)}`);
  printInfo(`Created At: ${item.createdAt}`);
  printInfo("");
  printInfo(item.content);

  if (item.posts.length > 0) {
    printInfo("");
    printInfo(`Posts (${item.posts.length}):`);

    item.posts.forEach((post, index) => {
      const content = typeof post.content === "string" ? post.content : JSON.stringify(post);
      printInfo(`${index + 1}. ${content}`);
    });
  }
}
