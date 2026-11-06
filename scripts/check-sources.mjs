#!/usr/bin/env node
/**
 * Pull every verified RSS feed and NWS alert for the corridor, then print
 * candidate stories from the last N hours.
 *
 *   npm run sources
 *   npm run sources -- --hours=24
 *   npm run sources -- --json
 *   npm run sources -- --category=news
 *   npm run sources -- --no-cache
 *
 * Successful feed contents are cached in .cache/source-sweep.json so a
 * rate-limited or temporarily broken feed still contributes its last known
 * items (flagged as stale) instead of disappearing.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const noCache = args.includes("--no-cache");
const hoursArg = args.find((a) => a.startsWith("--hours="));
const hours = hoursArg ? Number(hoursArg.split("=")[1]) : 36;
const categoryArg = args.find((a) => a.startsWith("--category="));
const category = categoryArg ? categoryArg.split("=")[1] : null;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const corridorZones = ["NEC055", "NEC109", "NEC079", "NEC019", "NEC111", "NEC033"];
const keywords = [
  "i-80", "i80", "interstate 80", "omaha", "lincoln", "gretna", "ashland",
  "seward", "milford", "york", "aurora", "grand island", "hastings", "kearney",
  "lexington", "cozad", "gothenburg", "north platte", "ogallala", "sidney",
  "kimball", "chappell", "paxton", "nebraska", "ndot", "state patrol", "crash",
  "collision", "closure", "closed", "construction", "snow", "ice", "winter storm",
  "blizzard", "wind", "fatal", "pursuit", "highway", "interstate", "rest area",
  "truck", "semi", "amtrak", "plow",
];

const cachePath = path.join(process.cwd(), ".cache", "source-sweep.json");
let cache = {};
if (!noCache) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  } catch {
    cache = {};
  }
}

const sources = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "sources.json"), "utf8"),
).filter((s) => s.feedUrl && (!category || s.category === category));

function decode(value) {
  let text = value;
  for (let pass = 0; pass < 3; pass += 1) {
    text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
    text = text.replace(/<[^>]+>/g, " ");
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  }
  return text.replace(/\s+/g, " ").trim();
}

function first(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decode(match[1]) : "";
}

function linkOf(xml) {
  const plain = xml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (plain && /^https?:/.test(decode(plain[1]))) return decode(plain[1]);
  const href = xml.match(/<link[^>]*href=["']([^"']+)["']/i);
  return href ? href[1] : "";
}

function parseFeed(xml, source) {
  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  return blocks.slice(0, 12).map((block) => {
    const title = first(block, "title");
    const rawDate =
      first(block, "pubDate") ||
      first(block, "published") ||
      first(block, "updated") ||
      first(block, "dc:date");
    const date = rawDate ? new Date(rawDate) : null;
    const description = first(block, "description") || first(block, "summary");
    return {
      source: source.name,
      sourceId: source.id,
      city: source.city ?? null,
      category: source.category,
      title,
      url: linkOf(block),
      date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
      description: description.slice(0, 280),
    };
  });
}

async function fetchFeed(source, attempt = 1) {
  try {
    const res = await fetch(source.feedUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        From: "hello@i80things.com",
      },
      signal: AbortSignal.timeout(18000),
    });

    if (res.status === 429 && attempt <= 2) {
      await new Promise((resolve) => setTimeout(resolve, 4000 * attempt));
      return fetchFeed(source, attempt + 1);
    }

    if (!res.ok) {
      const cached = cache[source.feedUrl];
      if (cached?.items?.length) {
        return {
          source: source.name,
          items: cached.items,
          stale: true,
          error: `HTTP ${res.status} — using cache from ${cached.fetchedAt.slice(0, 10)}`,
        };
      }
      return { source: source.name, error: `HTTP ${res.status}`, items: [], stale: false };
    }

    const xml = await res.text();
    const items = parseFeed(xml, source);
    if (items.length) {
      cache[source.feedUrl] = { fetchedAt: new Date().toISOString(), items };
    }
    return { source: source.name, items, stale: false };
  } catch (error) {
    const cached = cache[source.feedUrl];
    if (cached?.items?.length) {
      return {
        source: source.name,
        items: cached.items,
        stale: true,
        error: `${error.message} — using cache from ${cached.fetchedAt.slice(0, 10)}`,
      };
    }
    return { source: source.name, error: error.message, items: [], stale: false };
  }
}

async function fetchAlerts() {
  try {
    const res = await fetch(
      `https://api.weather.gov/alerts/active?zone=${corridorZones.join(",")}`,
      {
        headers: {
          "User-Agent": "I80Things/1.0 (+https://i80things.com; hello@i80things.com)",
          Accept: "application/geo+json",
        },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).map((f) => ({
      event: f.properties?.event,
      headline: f.properties?.headline,
      severity: f.properties?.severity,
      area: f.properties?.areaDesc,
      ends: f.properties?.ends,
      url: "https://www.weather.gov/",
    }));
  } catch {
    return [];
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      // Stagger requests so shared feed infrastructure does not rate-limit us.
      await new Promise((resolve) => setTimeout(resolve, 1100));
      results[index] = await mapper(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

const results = await mapWithConcurrency(sources, 1, (source) => fetchFeed(source));
const alerts = await fetchAlerts();
const cutoff = Date.now() - hours * 3600 * 1000;

let items = results.flatMap((r) => r.items);
const failures = results.filter((r) => r.error);
const stale = results.filter((r) => r.stale);

items = items
  .filter((item) => item.title && item.url)
  .filter((item) => !item.date || new Date(item.date).getTime() >= cutoff)
  .filter((item) => {
    const haystack = `${item.title} ${item.description}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });

const seen = new Set();
items = items.filter((item) => {
  const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

items.sort((a, b) => {
  if (!a.date) return 1;
  if (!b.date) return -1;
  return new Date(b.date) - new Date(a.date);
});

const top = items.slice(0, 60);

try {
  if (!noCache) {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(cache));
  }
} catch {
  /* caching is best-effort */
}

if (asJson) {
  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    hours,
    alerts,
    items: top,
    failures,
    stale,
  }, null, 2));
  process.exit(0);
}

console.log(`\nI-80 CORRIDOR SOURCE SWEEP — last ${hours}h — ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT\n`);

if (alerts.length) {
  console.log("ACTIVE NWS ALERTS");
  for (const alert of alerts) {
    console.log(`  [${alert.severity}] ${alert.event} — ${alert.area}${alert.ends ? ` (until ${alert.ends})` : ""}`);
    console.log(`  ${alert.headline}`);
  }
  console.log("");
}

console.log(`CANDIDATE STORIES (${top.length})`);
for (const item of top) {
  console.log(`\n${item.date ? item.date.slice(0, 16).replace("T", " ") : "undated"}  ${item.source}`);
  console.log(`  ${item.title}`);
  console.log(`  ${item.url}`);
  if (item.description) console.log(`  ${item.description}`);
}

if (failures.length) {
  console.log(`\nFEED ISSUES (${failures.length})`);
  for (const failure of failures) console.log(`  ${failure.source}: ${failure.error}`);
  if (stale.length) {
    console.log(`\n  ${stale.length} feed(s) served from cache. Run again later or check the URL manually.`);
  }
}

console.log(`
NEXT STEPS
1. Pick one story with a primary source, not just an aggregator.
2. Run: npm run log   → make sure we have not already published it.
3. Open the original article AND the agency release. Confirm location, time, status.
4. Write original context for the corridor. Link out. Never copy the body.
5. npm run new -- --title "..." --city kearney --topics crashes,road-conditions
`);
