import assert from "node:assert/strict";
import test from "node:test";
import { extractTwitterSourceUrls, renderPulseList } from "../lib/pulse.js";
import { PulseListResponse } from "../types.js";

function captureStdout(run: () => void): string {
  const chunks: string[] = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
    return true;
  }) as typeof process.stdout.write;

  try {
    run();
    return chunks.join("");
  } finally {
    process.stdout.write = originalWrite;
  }
}

test("extractTwitterSourceUrls deduplicates x/twitter URLs", () => {
  const urls = extractTwitterSourceUrls([
    {
      url: "https://x.com/user/status/123",
      content: "Primary source",
    },
    {
      payload: {
        source: "https://twitter.com/other/status/456",
        repeated: "https://x.com/user/status/123/",
      },
    },
  ]);

  assert.deepEqual(urls, ["https://x.com/user/status/123", "https://twitter.com/other/status/456"]);
});

test("renderPulseList JSON mode keeps pagination shape", () => {
  const response: PulseListResponse = {
    success: true,
    data: [
      {
        id: 1,
        title: "Sample title",
        content: "Detailed content",
        category: "AI Tech",
        locale: "en-US",
        heatScore: 100,
        heatDelta: 5,
        createdAt: "2026-04-12T00:00:00.000Z",
      },
    ],
    pagination: {
      page: 2,
      pageSize: 10,
      total: 25,
    },
  };

  const output = captureStdout(() => {
    renderPulseList(response, { json: true });
  });
  const parsed = JSON.parse(output) as PulseListResponse;
  assert.equal(parsed.pagination.page, 2);
  assert.equal(parsed.pagination.total, 25);
  assert.equal(parsed.data[0]?.id, 1);
});
