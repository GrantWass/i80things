import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/content";
import { places } from "@/data/places";
import { getAllSources } from "@/lib/sources";

export const revalidate = 3600;

export async function GET() {
  const posts = getAllPosts();

  const parts = [
    `# ${site.name} — full text`,
    "",
    `> ${site.description}`,
    "",
    `Canonical: ${site.url}`,
    `Updated: ${new Date().toISOString()}`,
    `Contact: ${site.email}`,
    "",
    "## About this publication",
    "",
    "I-80 Things is an independent, ad-supported news desk covering Interstate 80 in Nebraska from Omaha (mile 454) to Kimball (mile 22). Every story is verified against a primary source and links to it. We do not republish other outlets' work. Scanner traffic is treated as a tip, never as confirmation. AI tools assist with monitoring and drafting; a human editor verifies and approves every story.",
    "",
    "## Corridor geography",
    "",
    ...places.map(
      (place) =>
        `- **${place.name}** (${place.county}) — I-80 ${place.mileMarker}, ${place.exit}. ${place.blurb}`,
    ),
    "",
    "## Source directory",
    "",
    ...getAllSources().map(
      (source) =>
        `- **${source.name}** (${source.category}, ${source.reliability}, ${source.access}) — ${source.url} — ${source.coverage}. ${source.notes}`,
    ),
    "",
    "## Stories",
    "",
  ];

  for (const post of posts) {
    parts.push(
      `### ${post.title}`,
      "",
      `URL: ${site.url}/news/${post.slug}`,
      `Published: ${new Date(post.date).toISOString()}`,
      `City: ${post.city}`,
      `Topics: ${post.topics.join(", ")}`,
      `Dek: ${post.dek}`,
      "",
      post.summary.length ? `Key facts:\n${post.summary.map((s) => `- ${s}`).join("\n")}` : "",
      "",
      post.body.trim(),
      "",
      post.sources.length
        ? `Sources:\n${post.sources.map((s) => `- ${s.name}: ${s.url}`).join("\n")}`
        : "",
      "",
      "---",
      "",
    );
  }

  return new Response(parts.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
