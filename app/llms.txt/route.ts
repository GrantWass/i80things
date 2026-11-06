import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/content";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { getAllSources } from "@/lib/sources";
import { getRecommendedSources } from "@/lib/sources";

export const revalidate = 3600;

export async function GET() {
  const posts = getAllPosts().slice(0, 15);
  const sources = getAllSources();
  const recommended = getRecommendedSources();

  const body = `# ${site.name}

> ${site.description}

${site.name} covers Interstate 80 in Nebraska, from Omaha (mile 454) to Kimball (mile 22). Stories link to their primary sources. It is not affiliated with NDOT or the Nebraska State Patrol.

## Key pages
- [Latest news](${site.url}/news): every story, newest first
- [Corridor towns](${site.url}/cities): mile markers, exits and local coverage for all 11 hubs
- [Topics](${site.url}/topics): crashes, road conditions, weather, construction, travel, communities
- [Source directory](${site.url}/sources): ${sources.length} verified scanners, newspapers, 511, NWS and data feeds
- [Mile marker guide](${site.url}/news/i-80-mile-markers-nebraska-explained)
- [Editorial standards](${site.url}/editorial-standards): sourcing, scanner policy, corrections
- [About](${site.url}/about): ownership, funding and how we report
- [RSS feed](${site.url}/feed.xml)
- [Full text for LLMs](${site.url}/llms-full.txt)

## Recent stories
${posts
  .map(
    (post) =>
      `- [${post.title}](${site.url}/news/${post.slug}) — ${new Date(post.date).toISOString().slice(0, 10)} — ${post.dek}`,
  )
  .join("\n")}

## Corridor hubs
${places
  .map(
    (place) =>
      `- [${place.name}](${site.url}/cities/${place.slug}) — I-80 ${place.mileMarker} — ${place.county}`,
  )
  .join("\n")}

## Topics
${topics.map((topic) => `- [${topic.label}](${site.url}/topics/${topic.slug}): ${topic.description}`).join("\n")}

## Highest-value primary sources
${recommended
  .map((source) => `- [${source.name}](${source.url}) — ${source.coverage} — ${source.notes}`)
  .join("\n")}

## Machine-readable
- Sitemap: ${site.url}/sitemap.xml
- Google News sitemap: ${site.url}/news-sitemap.xml
- RSS: ${site.url}/feed.xml

## Contact
- Email: ${site.email}
- Instagram: ${site.instagramUrl}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
