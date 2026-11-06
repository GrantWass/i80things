/**
 * Nebraska 511 event reader for the public conditions page.
 *
 * This is the same undocumented GraphQL endpoint used by the 511 web app. It
 * is not a supported API: it can change without notice and it can lag. The UI
 * must label it as a monitoring source and link drivers to 511.nebraska.gov.
 */
export type RoadConditionCategory =
  | "closure"
  | "incident"
  | "construction"
  | "conditions"
  | "other";

export type RoadConditionEvent = {
  id: string;
  title: string;
  category: RoadConditionCategory;
  description: string;
  priority: number | null;
  agency: string | null;
  agencyUrl: string | null;
  lastUpdated: string | null;
  beginTime: string | null;
  url: string;
  location: {
    primaryLinearReference?: string;
    secondaryLinearReference?: string;
  } | null;
};

export type RoadConditions = {
  events: RoadConditionEvent[];
  fetchedAt: string | null;
  totalStatewideEvents: number;
  error: boolean;
};

const ENDPOINT = "https://511.nebraska.gov/api/graphql";
const LAYERS = [
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

const QUERY = `query Dashboard($layerSlugs: [String!]!, $maxPriority: Int) {
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

type RawEvent = {
  __typename?: string;
  uri?: string;
  title?: string;
  description?: string;
  priority?: number | null;
  agencyAttribution?: { agencyName?: string; agencyURL?: string } | null;
  lastUpdated?: { timestamp?: string } | null;
  beginTime?: { timestamp?: string } | null;
  location?: {
    primaryLinearReference?: string;
    secondaryLinearReference?: string;
  } | null;
};

function decode(value = ""): string {
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

function cleanDescription(value: string): string {
  // 511 descriptions often end with attachment filenames, e.g.
  // "More Info: 20260731-D1-13472.pdf | Screenshot 2026-08-20 192045 44.png".
  // Cut the attachment tail; the event card already links to 511.
  const cut = value.search(/\bMore Info:/i);
  const text = cut >= 0 ? value.slice(0, cut) : value;
  return text
    .replace(/\bScreenshot\s+\d{4}-\d{2}-\d{2}\s+\d{6}(?:\s+\d+)?\.png/gi, "")
    .replace(/\bScreenshot\s+\S+\.png/gi, "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classify(event: RawEvent): RoadConditionCategory {
  const text = `${event.title ?? ""} ${event.description ?? ""}`.toLowerCase();
  if (/road closed|closed to traffic|closed due/.test(text)) return "closure";
  if (/crash|collision|incident|disabled vehicle/.test(text)) return "incident";
  if (/construction|maintenance|utility work|bridge work|road work/.test(text)) {
    return "construction";
  }
  if (/winter|snow|ice|seasonal roadway/.test(text)) return "conditions";
  return "other";
}

const SORT_ORDER: Record<RoadConditionCategory, number> = {
  closure: 0,
  incident: 1,
  construction: 2,
  conditions: 3,
  other: 4,
};

export async function getRoadConditions(): Promise<RoadConditions> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "Content-Type": "application/json",
        Referer: "https://511.nebraska.gov/",
        Origin: "https://511.nebraska.gov",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { layerSlugs: LAYERS, maxPriority: null },
      }),
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return { events: [], fetchedAt: null, totalStatewideEvents: 0, error: true };
    }

    const data = (await res.json()) as {
      errors?: unknown;
      data?: { dashboardQuery?: { collections?: RawEvent[] } };
    };
    if (data.errors) {
      return { events: [], fetchedAt: null, totalStatewideEvents: 0, error: true };
    }

    const collections = data.data?.dashboardQuery?.collections ?? [];
    const totalStatewideEvents = collections.filter(
      (event) => event.__typename === "Event",
    ).length;

    const events = collections
      .filter((event) => event.__typename === "Event")
      .map((event): RoadConditionEvent => {
        const category = classify(event);
        return {
          id: event.uri ?? `${event.title ?? "event"}:${event.beginTime?.timestamp ?? ""}`,
          title: decode(event.title ?? "I-80 event"),
          category,
          description: cleanDescription(decode(event.description ?? "")),
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
      })
      .filter((event) => /(^|\b)I[- ]?80\b/i.test(event.title))
      .filter(
        (event) =>
          !(
            event.category === "conditions" &&
            /generally clear/i.test(event.description)
          ),
      )
      .sort(
        (a, b) =>
          SORT_ORDER[a.category] - SORT_ORDER[b.category] ||
          (b.lastUpdated ?? "").localeCompare(a.lastUpdated ?? ""),
      )
      .slice(0, 12);

    return {
      events,
      fetchedAt: new Date().toISOString(),
      totalStatewideEvents,
      error: false,
    };
  } catch {
    return { events: [], fetchedAt: null, totalStatewideEvents: 0, error: true };
  }
}
