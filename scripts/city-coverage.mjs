#!/usr/bin/env node
/**
 * Show which corridor city hubs have local coverage.
 *
 *   npm run cities:coverage
 *   npm run --silent cities:coverage -- --json
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const asJson = process.argv.includes("--json");
const postsDir = path.join(process.cwd(), "content", "posts");
const placesSource = fs.readFileSync(
  path.join(process.cwd(), "data", "places.ts"),
  "utf8",
);
const placeBlocks = [
  ...placesSource.matchAll(
    /\{\s*slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?mileMarker:\s*"([^"]+)"/g,
  ),
].map((match) => ({ slug: match[1], name: match[2], mileMarker: match[3] }));
const counts = new Map();

for (const file of fs.readdirSync(postsDir).filter((f) => /\.mdx?$/.test(f))) {
  const { data } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
  if (!data.city || data.city === "statewide") continue;
  counts.set(data.city, (counts.get(data.city) ?? 0) + 1);
}

const rows = placeBlocks.map((place) => ({
  slug: place.slug,
  name: place.name,
  mileMarker: place.mileMarker,
  count: counts.get(place.slug) ?? 0,
}));
const empty = rows.filter((row) => row.count === 0);

if (asJson) {
  console.log(JSON.stringify({ rows, empty }, null, 2));
  process.exit(0);
}

console.log("\nCITY HUB COVERAGE\n");
for (const row of rows) {
  console.log(
    `${row.count === 0 ? "EMPTY" : String(row.count).padStart(5)}  ${row.name.padEnd(14)} MM ${row.mileMarker}`,
  );
}
console.log(`\n${empty.length} empty: ${empty.map((row) => row.name).join(", ") || "none"}\n`);
