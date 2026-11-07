import { getPost } from "@/lib/content";
import { instagramCaption, selectedInstagramImages } from "@/lib/utils";
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

  const selected = selectedInstagramImages(post);
  const imageUrls = selected.map(
    ({ index }) => `${site.url}/api/social/${post.slug}?image=${index + 1}`,
  );
  const images = selected.map(({ image, index }) => ({
    index: index + 1,
    alt: image.alt,
    caption: image.caption ?? null,
    credit: image.credit ?? null,
  }));

  return Response.json({
    slug: post.slug,
    title: post.title,
    caption: instagramCaption(post),
    imageUrl: imageUrls[0] ?? `${site.url}/api/social/${post.slug}`,
    imageUrls,
    images,
    articleUrl: `${site.url}/news/${post.slug}`,
    bioUrl: `${site.url}/instagram`,
    pinnedBioUrl: `${site.url}/instagram?s=${post.slug}`,
    publishedAt: post.date,
  });
}
