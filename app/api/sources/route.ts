import { getAllSources, sourceCategories } from "@/lib/sources";
import type { SourceCategory } from "@/lib/types";

export const revalidate = 3600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") as SourceCategory | null;
  const recommended = url.searchParams.get("recommended") === "true";
  const rss = url.searchParams.get("rss") === "true";

  let sources = getAllSources();
  if (category && sourceCategories.some((c) => c.id === category)) {
    sources = sources.filter((source) => source.category === category);
  }
  if (recommended) sources = sources.filter((source) => source.recommended);
  if (rss) sources = sources.filter((source) => source.feedUrl);

  return Response.json(
    {
      name: "I-80 Things source directory",
      description:
        "Verified scanners, newspapers, official feeds and open data for the I-80 corridor in Nebraska. Verified November 2026.",
      count: sources.length,
      categories: sourceCategories,
      sources,
      license: "Free to use with attribution to I-80 Things. Respect each source's terms.",
      updated: "2026-11-05",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
