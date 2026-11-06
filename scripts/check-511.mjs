#!/usr/bin/env node
/**
 * Read the Nebraska 511 event map without a browser.
 *
 *   npm run 511
 *   npm run --silent 511 -- --json
 *   npm run 511 -- --all          (every route, not just I-80)
 *   npm run 511 -- --max=100
 *
 * IMPORTANT: this uses the same undocumented GraphQL endpoint as the public
 * 511 web app. It is not a supported API and can change without notice. Use it
 * once or twice a day, attribute NDOT/Nebraska 511, verify anything you publish
 * with the agency, and do not redistribute bulk data. For a production feed,
 * request access to the official CARS/NDOT XML feed.
 */
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const allRoutes = args.includes("--all");
const maxArg = args.find((a) => a.startsWith("--max="));
const max = maxArg ? Number(maxArg.split("=")[1]) : 40;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const endpoint = "https://511.nebraska.gov/api/graphql";

const layers = [
  "weatherWarningsAreaEvents",
  "winterDriving",
  "roadReports",
  "roadClosures",
  "truckersReports",
  "metroTrafficMap",
  "wazeReports",
  "ROAD_CONDITIONS",
  "constructionReports",
  "floodReports",
];

const query = `query Dashboard($layerSlugs: [String!]!, $maxPriority: Int) {
  dashboardQuery {
    collections(layerSlugs: $layerSlugs, maxPriority: $maxPriority) {
      uri
      title
      __typename
      ... on Event {
        description
        priority
        agencyAttribution { agencyName agencyURL }
        lastUpdated { timestamp timezone }
        beginTime { timestamp timezone }
        location { primaryLinearReference secondaryLinearReference }
      }
    }
  }
}`;

function decode(value = "") {
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

function classify(event) {
  const text = `${event.title} ${event.description}`.toLowerCase();
  if (/road closed|closed to traffic|closed due/.test(text)) return "closure";
  if (/crash|collision|incident|disabled vehicle/.test(text)) return "incident";
  if (/construction|maintenance|utility work|bridge work|road work/.test(text)) return "construction";
  if (/winter|snow|ice|seasonal roadway/.test(text)) return "conditions";
  return "other";
}

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "User-Agent": UA,
    "Content-Type": "application/json",
    Referer: "https://511.nebraska.gov/",
    Origin: "https://511.nebraska.gov",
    Accept: "application/json",
  },
  body: JSON.stringify({
    query,
    variables: { layerSlugs: layers, maxPriority: null },
  }),
  signal: AbortSignal.timeout(25000),
});

if (!res.ok) {
  console.error(`Nebraska 511 returned HTTP ${res.status}. The internal endpoint may have changed.`);
  process.exit(1);
}

const data = await res.json();
if (data.errors) {
  console.error("Nebraska 511 GraphQL error:", data.errors);
  process.exit(1);
}

const collections = data.data?.dashboardQuery?.collections ?? [];
const totalEvents = collections.filter((e) => e.__typename === "Event").length;

const events = collections
  .filter((event) => event.__typename === "Event")
  .map((event) => {
    const description = decode(event.description);
    return {
      id: event.uri,
      title: event.title,
      category: classify(event),
      description,
      priority: event.priority,
      agency: event.agencyAttribution?.agencyName ?? null,
      agencyUrl: event.agencyAttribution?.agencyURL ?? null,
      lastUpdated: event.lastUpdated?.timestamp
        ? new Date(event.lastUpdated.timestamp).toISOString()
        : null,
      beginTime: event.beginTime?.timestamp
        ? new Date(event.beginTime.timestamp).toISOString()
        : null,
      url: `https://511.nebraska.gov/${event.uri}`,
      location: event.location ?? null,
    };
  })
  .filter((event) => {
    if (allRoutes) return true;
    return /(^|\b)I[- ]?80\b/i.test(event.title);
  })
  .filter((event) => {
    // Drop the statewide "generally clear" seasonal banner from the default view.
    if (event.category === "conditions" && /generally clear/i.test(event.description)) {
      return false;
    }
    return true;
  })
  .sort((a, b) => {
    const order = { closure: 0, incident: 1, construction: 2, conditions: 3, other: 4 };
    return order[a.category] - order[b.category] || (b.lastUpdated ?? "").localeCompare(a.lastUpdated ?? "");
  })
  .slice(0, max);

const result = {
  source: "Nebraska 511 (unofficial GraphQL, undocumented)",
  fetchedAt: new Date().toISOString(),
  totalStatewideEvents: totalEvents,
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
console.log(`Statewide events in feed: ${totalEvents}. Unofficial endpoint — confirm with NDOT/NSP before publishing.\n`);

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
