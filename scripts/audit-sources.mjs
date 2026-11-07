#!/usr/bin/env node
/**
 * Summarize feed health and check that every scanner link still resolves.
 *
 *   npm run sources:audit
 *
 * Feed health comes from `data/source-health.json` (written by the source
 * sweep). Scanner checks are HTTP reachability only; listening still requires
 * a Broadcastify account and a working browser session.
 */
import fs from "node:fs";
import path from "node:path";

const UA = "I80Things/1.0 (+https://i80things.com; hello@i80things.com)";
const sources = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "sources.json"), "utf8"),
);
const health = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "source-health.json"), "utf8"),
);
const feeds = Object.values(health.feeds ?? {});
const scanners = sources.filter((source) => source.category === "scanner");

const feedCounts = feeds.reduce(
  (counts, feed) => {
    counts[feed.status] = (counts[feed.status] ?? 0) + 1;
    return counts;
  },
  {},
);
const fallback = feeds.filter((feed) =>
  String(feed.error ?? "").includes("Google News discovery"),
);

console.log(`\nSOURCE AUDIT — feeds checked ${health.generatedAt ?? "unknown"}\n`);
console.log(
  `  ${feeds.length} feeds · ${feedCounts.ok ?? 0} ok · ${feedCounts.stale ?? 0} stale · ${feedCounts.error ?? 0} error`,
);
if (fallback.length) {
  console.log(`\n  ${fallback.length} using Google News discovery fallback:`);
  for (const feed of fallback) console.log(`    - ${feed.name}`);
}
for (const feed of feeds.filter((item) => item.status !== "ok")) {
  console.log(
    `  ! ${feed.name}: ${feed.status}${feed.httpStatus ? ` (HTTP ${feed.httpStatus})` : ""}${feed.error ? ` — ${feed.error}` : ""}`,
  );
}

console.log(`\n  ${scanners.length} scanner links\n`);
let unreachable = 0;
for (const source of scanners) {
  try {
    const response = await fetch(source.url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(12000),
    });
    const ok = response.status >= 200 && response.status < 400;
    if (!ok) unreachable += 1;
    console.log(`  ${ok ? "OK" : "!!"} ${response.status}  ${source.name}`);
  } catch (error) {
    unreachable += 1;
    console.log(`  !! ERR  ${source.name} — ${error.message}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.log(
  `\nSummary: ${feeds.length - (feedCounts.error ?? 0)} feeds usable, ${scanners.length - unreachable}/${scanners.length} scanner links reachable.`,
);
console.log(
  "Scanner audio is not tested here; Broadcastify may require an account.\n",
);

if ((feedCounts.error ?? 0) > 0 || unreachable > 0) process.exitCode = 1;
