import { site } from "@/lib/site";
import { absoluteUrl, postImagePath } from "@/lib/utils";

export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { getAllPosts } = await import("@/lib/content");
  const posts = getAllPosts();
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = posts.filter((post) => new Date(post.date).getTime() >= cutoff);

  const urls = recent
    .map(
      (post) => `  <url>
    <loc>${site.url}/news/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(site.name)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.date).toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      <news:keywords>${escapeXml(post.tags.join(", "))}</news:keywords>
    </news:news>
${(post.images.length ? post.images : [{ src: postImagePath(post), alt: post.title }])
      .map(
        (image) => `    <image:image>
      <image:loc>${escapeXml(absoluteUrl(image.src))}</image:loc>
    </image:image>`,
      )
      .join("\n")}
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
