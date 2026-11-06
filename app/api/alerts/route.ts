import { getCorridorAlerts } from "@/lib/nws";
import { site } from "@/lib/site";

export const revalidate = 300;

export async function GET() {
  const alerts = await getCorridorAlerts();
  return Response.json(
    {
      name: "I-80 Things corridor weather alerts",
      source: "NOAA / National Weather Service api.weather.gov",
      zones: ["NEC055", "NEC109", "NEC079", "NEC019", "NEC111", "NEC033"],
      updated: new Date().toISOString(),
      count: alerts.length,
      alerts,
      forecast: "https://www.weather.gov/",
      site: site.url,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
