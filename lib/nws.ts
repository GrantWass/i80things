import { places } from "@/data/places";
import { site } from "@/lib/site";

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
    id?: string;
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

export type CorridorForecast = {
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  windSpeed: string;
  windDirection: string;
  isDaytime: boolean;
};

type NwsForecastPeriod = {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  shortForecast?: string;
  windSpeed?: string;
  windDirection?: string;
  isDaytime?: boolean;
};

const SEVERITY_RANK: Record<string, number> = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
  Unknown: 4,
};

function normalizeSeverity(value: string | undefined): string {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Active NWS alerts for every town in the corridor.
 *
 * The old implementation watched six counties by zone, which could show
 * "no alerts" while a warning was active in Keith, Dawson, Seward, York or
 * Kimball. Point queries cover each town directly. They are cached for five
 * minutes and fail closed to an empty list so the homepage still renders.
 */
export async function getCorridorAlerts(): Promise<CorridorAlert[]> {
  const results = await Promise.allSettled(
    places.map(async (place) => {
      const url = `https://api.weather.gov/alerts/active?point=${place.lat},${place.lon}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": `I80Things/1.0 (+${site.url}; ${site.email})`,
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return [] as NwsFeature[];
      const data = (await res.json()) as { features?: NwsFeature[] };
      return data.features ?? [];
    }),
  );

  const byId = new Map<string, CorridorAlert>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const feature of result.value) {
      const p = feature.properties;
      if (!p?.event) continue;

      const id =
        feature.id ?? p.id ?? p["@id"] ?? `${p.event}:${p.areaDesc ?? "corridor"}`;
      const severity = normalizeSeverity(p.severity);
      const areaDesc = p.areaDesc?.trim() || "I-80 corridor";

      const existing = byId.get(id);
      if (existing) {
        // The same alert can be returned for several points. Keep one card,
        // but make sure a multi-county area description is not lost.
        if (
          areaDesc &&
          !existing.areaDesc.includes(areaDesc) &&
          !areaDesc.includes(existing.areaDesc)
        ) {
          existing.areaDesc = `${existing.areaDesc}; ${areaDesc}`;
        }
        continue;
      }

      byId.set(id, {
        id,
        event: p.event,
        headline: p.headline ?? p.event,
        severity,
        areaDesc,
        onset: p.onset,
        ends: p.ends ?? p.expires,
        url: "https://www.weather.gov/",
      });
    }
  }

  return [...byId.values()]
    .sort(
      (a, b) =>
        (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9) ||
        (a.onset ?? "").localeCompare(b.onset ?? ""),
    )
    .slice(0, 8);
}

/**
 * The next few NWS forecast periods for a town. The point lookup is stable
 * (cached for a day); the forecast itself refreshes every 15 minutes. Any
 * failure returns an empty list so a city page never depends on the weather
 * API being up.
 */
export async function getPointForecast(
  lat: number,
  lon: number,
): Promise<CorridorForecast[]> {
  const headers = {
    Accept: "application/geo+json",
    "User-Agent": `I80Things/1.0 (+${site.url}; ${site.email})`,
  };

  try {
    const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(12000),
    });
    if (!pointRes.ok) return [];
    const point = (await pointRes.json()) as {
      properties?: { forecast?: string };
    };
    const forecastUrl = point.properties?.forecast;
    if (!forecastUrl) return [];

    const forecastRes = await fetch(forecastUrl, {
      headers,
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(12000),
    });
    if (!forecastRes.ok) return [];
    const forecast = (await forecastRes.json()) as {
      properties?: { periods?: NwsForecastPeriod[] };
    };

    return (forecast.properties?.periods ?? [])
      .slice(0, 4)
      .map((period) => ({
        name: period.name ?? "Forecast",
        temperature: period.temperature ?? 0,
        temperatureUnit: period.temperatureUnit ?? "F",
        shortForecast: period.shortForecast ?? "",
        windSpeed: period.windSpeed ?? "",
        windDirection: period.windDirection ?? "",
        isDaytime: Boolean(period.isDaytime),
      }));
  } catch {
    return [];
  }
}
