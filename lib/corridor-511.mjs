/**
 * Shared Nebraska 511 adapter for the I-80 corridor.
 *
 * Plain ESM (no TypeScript) so both the Next.js pages (via
 * `lib/road-conditions.ts`) and the desk scripts (via
 * `scripts/check-511.mjs`) can import it. This module owns everything
 * that must stay identical between the reader and the desk:
 *
 * - the GraphQL query text (layers, priority)
 * - the per-event decode
 * - the I-80 title filter and the "generally clear" drop
 * - classification and the category sort
 *
 * Site-specific behaviour (the 5-minute cache/revalidate, the error
 * surface, the page cap) lives in `lib/road-conditions.ts`. Desk
 * behaviour (argument parsing, text output, exit codes) lives in
 * `scripts/check-511.mjs`.
 *
 * Policy choices (shared by both runtimes):
 * - default max is 40 events (the desk's value); the pages pass
 *   `max: 12` explicitly to keep rendering exactly what they render today.
 * - attachment tails are stripped from descriptions
 *   (`cleanDescription`): 511 descriptions often end with
 *   "More Info: <filename>" attachment tails that the event card's
 *   511 link already covers.
 */

/**
 * @typedef {"closure" | "incident" | "construction" | "conditions" | "other"} Corridor511Category
 */

/**
 * @typedef {object} Corridor511RawEvent
 * @property {string} [__typename]
 * @property {string} [uri]
 * @property {string} [title]
 * @property {string} [description]
 * @property {number | null} [priority]
 * @property {{ agencyName?: string, agencyURL?: string } | null} [agencyAttribution]
 * @property {{ timestamp?: string } | null} [lastUpdated]
 * @property {{ timestamp?: string } | null} [beginTime]
 * @property {{ primaryLinearReference?: string, secondaryLinearReference?: string } | null} [location]
 */

/**
 * @typedef {object} Corridor511Event
 * @property {string} id
 * @property {string} title
 * @property {Corridor511Category} category
 * @property {string} description
 * @property {number | null} priority
 * @property {string | null} agency
 * @property {string | null} agencyUrl
 * @property {string | null} lastUpdated
 * @property {string | null} beginTime
 * @property {string} url
 * @property {{ primaryLinearReference?: string, secondaryLinearReference?: string } | null} location
 */

/**
 * @typedef {object} FetchLikeResponse
 * @property {boolean} ok
 * @property {number} [status]
 * @property {() => Promise<any>} json
 */

/**
 * @typedef {(url: string, init?: any) => Promise<FetchLikeResponse>} FetchImpl
 */

/**
 * @typedef {object} FetchCorridorEventsOptions
 * @property {number} [max]
 * @property {boolean} [allRoutes]
 * @property {FetchImpl} [fetchImpl]
 * @property {number} [timeoutMs]
 * @property {Record<string, any>} [fetchInit]
 */

/**
 * @typedef {object} FetchCorridorEventsResult
 * @property {string} fetchedAt
 * @property {number} totalStatewideEvents
 * @property {Corridor511Event[]} events
 */

export const ENDPOINT = "https://511.nebraska.gov/api/graphql";

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export const LAYERS = [
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

export const QUERY = `query Dashboard($layerSlugs: [String!]!, $maxPriority: Int) {
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

/** @type {Record<Corridor511Category, number>} */
export const CATEGORY_ORDER = {
  closure: 0,
  incident: 1,
  construction: 2,
  conditions: 3,
  other: 4,
};

/**
 * Strip CDATA, tags and entities. Runs three passes because 511 nests
 * encoded markup inside encoded markup.
 *
 * @param {string} [value]
 * @returns {string}
 */
export function decodeText(value = "") {
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

/**
 * Cut the attachment tail ("More Info: <filename> | Screenshot ....png")
 * that 511 appends to descriptions. The event card already links to 511.
 *
 * @param {string} value
 * @returns {string}
 */
export function cleanDescription(value) {
  const cut = value.search(/\bMore Info:/i);
  const text = cut >= 0 ? value.slice(0, cut) : value;
  return text
    .replace(/\bScreenshot\s+\d{4}-\d{2}-\d{2}\s+\d{6}(?:\s+\d+)?\.png/gi, "")
    .replace(/\bScreenshot\s+\S+\.png/gi, "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {{ title?: string | null, description?: string | null }} event
 * @returns {Corridor511Category}
 */
export function classifyEvent(event) {
  const text = `${event.title ?? ""} ${event.description ?? ""}`.toLowerCase();
  if (/road closed|closed to traffic|closed due/.test(text)) return "closure";
  if (/crash|collision|incident|disabled vehicle/.test(text)) return "incident";
  if (/construction|maintenance|utility work|bridge work|road work/.test(text)) {
    return "construction";
  }
  if (/winter|snow|ice|seasonal roadway/.test(text)) return "conditions";
  return "other";
}

/**
 * Decode one raw GraphQL event into the shared shape.
 *
 * @param {Corridor511RawEvent} event
 * @returns {Corridor511Event}
 */
export function decodeEvent(event) {
  const category = classifyEvent(event);
  return {
    id: event.uri ?? `${event.title ?? "event"}:${event.beginTime?.timestamp ?? ""}`,
    title: decodeText(event.title ?? "I-80 event"),
    category,
    description: cleanDescription(decodeText(event.description ?? "")),
    priority: event.priority ?? null,
    agency: event.agencyAttribution?.agencyName ?? null,
    agencyUrl: event.agencyAttribution?.agencyURL ?? null,
    lastUpdated: event.lastUpdated?.timestamp
      ? new Date(event.lastUpdated.timestamp).toISOString()
      : null,
    beginTime: event.beginTime?.timestamp
      ? new Date(event.beginTime.timestamp).toISOString()
      : null,
    url: `https://511.nebraska.gov/${event.uri ?? ""}`,
    location: event.location ?? null,
  };
}

/**
 * Corridor filter: keep I-80 events. `[- ]?` covers "I-80", "I 80" and
 * bare "I80"; the trailing `\b` rejects "I-180"/"I-680".
 *
 * @param {Corridor511Event} event
 * @returns {boolean}
 */
export function isCorridorEvent(event) {
  return /(^|\b)I[- ]?80\b/i.test(event.title);
}

/**
 * Drop the statewide "generally clear" seasonal banner from the default view.
 *
 * @param {Corridor511Event} event
 * @returns {boolean}
 */
export function isGenerallyClearBanner(event) {
  return event.category === "conditions" && /generally clear/i.test(event.description);
}

/**
 * Sort a copy: closures first, then by category rank, then newest first.
 *
 * @param {Corridor511Event[]} events
 * @returns {Corridor511Event[]}
 */
export function sortEvents(events) {
  return [...events].sort(
    (a, b) =>
      CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] ||
      (b.lastUpdated ?? "").localeCompare(a.lastUpdated ?? ""),
  );
}

/**
 * Fetch, decode, filter, sort and cap the corridor events.
 *
 * @param {FetchCorridorEventsOptions} [options]
 * @returns {Promise<FetchCorridorEventsResult>}
 * @throws {Error} on HTTP or GraphQL errors; callers map to their own surface.
 */
export async function fetchCorridorEvents({
  max = 40,
  allRoutes = false,
  fetchImpl = fetch,
  timeoutMs = 20000,
  fetchInit = {},
} = {}) {
  const { signal: initSignal, ...restInit } = fetchInit;
  const res = await fetchImpl(ENDPOINT, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
      Referer: "https://511.nebraska.gov/",
      Origin: "https://511.nebraska.gov",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { layerSlugs: LAYERS, maxPriority: null },
    }),
    ...restInit,
    signal: initSignal ?? AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(
      `Nebraska 511 returned HTTP ${res.status}. The internal endpoint may have changed.`,
    );
  }

  const data = await res.json();
  if (data.errors) {
    const detail =
      typeof data.errors === "string" ? data.errors : JSON.stringify(data.errors);
    throw new Error(`Nebraska 511 GraphQL error: ${detail}`);
  }

  /** @type {Corridor511RawEvent[]} */
  const collections = data.data?.dashboardQuery?.collections ?? [];
  const totalStatewideEvents = collections.filter(
    (event) => event.__typename === "Event",
  ).length;

  const events = sortEvents(
    collections
      .filter((event) => event.__typename === "Event")
      .map(decodeEvent)
      .filter((event) => allRoutes || isCorridorEvent(event))
      .filter((event) => !isGenerallyClearBanner(event)),
  ).slice(0, max);

  return {
    fetchedAt: new Date().toISOString(),
    totalStatewideEvents,
    events,
  };
}
