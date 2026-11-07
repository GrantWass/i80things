#!/usr/bin/env node
/**
 * Read the Nebraska 511 event map without a browser.
 *
 *   npm run 511
 *   npm run --silent 511 -- --json
 *   npm run 511 -- --all          (every route, not just I-80)
 *   npm run 511 -- --max=100
 *
 * The query, decode, filter, classification and sort live in
 * `lib/corridor-511.mjs` (shared with the site's
 * `lib/road-conditions.ts`). This script keeps only argument parsing,
 * the text output, and the exit codes.
 *
 * IMPORTANT: this uses the same undocumented GraphQL endpoint as the public
 * 511 web app. It is not a supported API and can change without notice. Use it
 * once or twice a day, attribute NDOT/Nebraska 511, verify anything you publish
 * with the agency, and do not redistribute bulk data. For a production feed,
 * request access to the official CARS/NDOT XML feed.
 */
import { fetchCorridorEvents } from "../lib/corridor-511.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const allRoutes = args.includes("--all");

function parseMax(argv) {
  const equals = argv.find((a) => a.startsWith("--max="));
  if (equals) return Number(equals.split("=")[1]);
  const flag = argv.indexOf("--max");
  if (flag >= 0 && argv[flag + 1] !== undefined) return Number(argv[flag + 1]);
  return 40;
}

const max = parseMax(args);

let fetchedAt;
let totalStatewideEvents;
let events;
try {
  const result = await fetchCorridorEvents({
    max,
    allRoutes,
    timeoutMs: 25000,
  });
  fetchedAt = result.fetchedAt;
  totalStatewideEvents = result.totalStatewideEvents;
  events = result.events;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const result = {
  source: "Nebraska 511 (unofficial GraphQL, undocumented)",
  fetchedAt,
  totalStatewideEvents,
  returned: events.length,
  disclaimer:
    "Internal endpoint used by 511.nebraska.gov. Unsupported and may change. Verify with NDOT/NSP before publishing. Do not redistribute bulk data.",
  events,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(`\nNEBRASKA 511 — I-80 EVENTS (${events.length}) — ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT\n`);
console.log(`Statewide events in feed: ${totalStatewideEvents}. Unofficial endpoint — confirm with NDOT/NSP before publishing.\n`);

for (const event of events) {
  console.log(`[${event.category.toUpperCase()}] ${event.title}`);
  if (event.lastUpdated) {
    console.log(`  updated ${event.lastUpdated.slice(0, 16).replace("T", " ")} UTC · ${event.agency ?? "511"}`);
  }
  if (event.description) {
    console.log(`  ${event.description.slice(0, 300)}`);
  }
  console.log(`  ${event.url}`);
  console.log("");
}

if (!events.length) {
  console.log("No I-80-specific events returned. Try --all to inspect every route.\n");
}

console.log(`NOTES
- This is an internal 511 endpoint, not a supported public API.
- Use it for monitoring only; confirm closures/crashes with NDOT or NSP.
- For production, request the official CARS/NDOT XML feed.
`);
