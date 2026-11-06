import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { absoluteUrl, postImagePath, postImages } from "@/lib/utils";

export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20) || 20, 100);
  const city = url.searchParams.get("city");
  const topic = url.searchParams.get("topic");
  const since = url.searchParams.get("since");

  let posts = getAllPosts();
  if (city) posts = posts.filter((post) => post.city === city);
  if (topic) {
    posts = posts.filter(
      (post) => post.topics.includes(topic) || post.tags.includes(topic),
    );
  }
  if (since) {
    const cutoff = new Date(since).getTime();
    if (!Number.isNaN(cutoff)) {
      posts = posts.filter((post) => new Date(post.date).getTime() >= cutoff);
    }
  }

  return Response.json(
    {
      name: site.name,
      count: posts.length,
      returned: Math.min(limit, posts.length),
      posts: posts.slice(0, limit).map((post) => ({
        slug: post.slug,
        title: post.title,
        dek: post.dek,
        date: post.date,
        updated: post.updated ?? null,
        city: post.city,
        topics: post.topics,
        tags: post.tags,
        summary: post.summary,
        sources: post.sources,
        draft: Boolean(post.draft),
        url: `${site.url}/news/${post.slug}`,
        image: `${site.url}${postImagePath(post)}`,
        images: postImages(post).map((img) => ({
          src: absoluteUrl(img.src),
          alt: img.alt,
          caption: img.caption ?? null,
          credit: img.credit ?? null,
          creditUrl: img.creditUrl ?? null,
          socialSrc: img.socialSrc ? absoluteUrl(img.socialSrc) : null,
          instagram: Boolean(img.instagram),
        })),
        socialImage: `${site.url}/api/social/${post.slug}`,
        instagramCaptionUrl: `${site.url}/api/social/${post.slug}/caption`,
      })),
      feed: `${site.url}/feed.xml`,
      sitemap: `${site.url}/sitemap.xml`,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
