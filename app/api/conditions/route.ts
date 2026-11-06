import { getCorridorAlerts } from "@/lib/nws";
import { getRoadConditions } from "@/lib/road-conditions";
import { site } from "@/lib/site";

export const revalidate = 300;

export async function GET() {
  const [roads, alerts] = await Promise.all([
    getRoadConditions(),
    getCorridorAlerts(),
  ]);

  return Response.json(
    {
      name: "I-80 Things corridor conditions",
      site: site.url,
      updated: roads.fetchedAt ?? new Date().toISOString(),
      sources: {
        roadEvents: "Nebraska 511 (unofficial GraphQL endpoint)",
        weatherAlerts: "NOAA / National Weather Service api.weather.gov",
      },
      disclaimer:
        "Unofficial monitoring aid. Verify closures and crashes with NDOT, Nebraska 511 or the State Patrol before publishing or driving.",
      roadEvents: roads.events,
      roadEventsError: roads.error,
      totalStatewideEvents: roads.totalStatewideEvents,
      weatherAlerts: alerts,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
