import { getPost } from "@/lib/content";
import { instagramCaption } from "@/lib/utils";
import { site } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    slug: post.slug,
    title: post.title,
    caption: instagramCaption(post),
    imageUrl: `${site.url}/api/social/${post.slug}`,
    articleUrl: `${site.url}/news/${post.slug}`,
    publishedAt: post.date,
  });
}
