import { NextResponse, type NextRequest } from "next/server";
import { getAllPosts, getPost } from "@/lib/content";

export const revalidate = 0;

/**
 * Permanent Instagram bio link. Redirects to the newest published story with
 * campaign tracking attached, so the profile link never has to be edited again.
 *
 *   /instagram                     → newest story
 *   /instagram?s=<slug>            → pin a specific story
 *   /instagram?utm_campaign=weekend → override the campaign name
 */
export function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const pinned = searchParams.get("s");
  const post = pinned ? getPost(pinned) : getAllPosts()[0];

  if (!post || post.draft) {
    return NextResponse.redirect(new URL("/", origin), 302);
  }

  const target = new URL(`/news/${post.slug}`, origin);

  // Keep any extra campaign parameters, but never let `s` leak through.
  for (const [key, value] of searchParams) {
    if (key !== "s" && key !== "utm_source" && key !== "utm_medium" && key !== "utm_campaign") {
      target.searchParams.set(key, value);
    }
  }

  target.searchParams.set("utm_source", "instagram");
  target.searchParams.set("utm_medium", "social");
  target.searchParams.set("utm_campaign", searchParams.get("utm_campaign") || "bio");

  const response = NextResponse.redirect(target, 302);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
