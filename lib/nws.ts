import { site } from "@/lib/site";

const CORRIDOR_ZONES = [
  "NEC055", // Douglas
  "NEC109", // Lancaster
  "NEC079", // Hall
  "NEC019", // Buffalo
  "NEC111", // Lincoln County
  "NEC033", // Cheyenne
];

export type CorridorAlert = {
  id: string;
  event: string;
  headline: string;
  severity: string;
  areaDesc: string;
  onset?: string;
  ends?: string;
  url?: string;
};

type NwsFeature = {
  id?: string;
  properties?: {
    event?: string;
    headline?: string;
    severity?: string;
    areaDesc?: string;
    onset?: string;
    ends?: string;
    expires?: string;
    "@id"?: string;
  };
};

export async function getCorridorAlerts(): Promise<CorridorAlert[]> {
  const url = `https://api.weather.gov/alerts/active?zone=${CORRIDOR_ZONES.join(",")}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/geo+json",
        "User-Agent": `I80Things/1.0 (+${site.url}; ${site.email})`,
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: NwsFeature[] };
    const seen = new Set<string>();
    return (data.features ?? [])
      .map((f) => f.properties ?? {})
      .filter((p) => p.event && !seen.has(p.event) && seen.add(p.event!))
      .map((p) => ({
        id: p["@id"] ?? p.headline ?? p.event ?? "alert",
        event: p.event ?? "Weather alert",
        headline: p.headline ?? p.event ?? "Weather alert",
        severity: p.severity ?? "Unknown",
        areaDesc: p.areaDesc ?? "I-80 corridor",
        onset: p.onset,
        ends: p.ends ?? p.expires,
        url: "https://www.weather.gov/",
      }))
      .slice(0, 5);
  } catch {
    return [];
  }
}
