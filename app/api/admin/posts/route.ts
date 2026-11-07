import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getPost } from "@/lib/content";
import { writeStory } from "@/lib/story.mjs";
import { readRepoFile, writeRepoFile } from "@/lib/github";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { site } from "@/lib/site";

type ImageInput = {
  src?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  socialSrc?: string;
  instagram?: boolean;
};

type Body = {
  title?: string;
  dek?: string;
  body?: string;
  city?: string;
  topics?: string[];
  tags?: string;
  summary?: string;
  sources?: { name: string; url: string }[];
  date?: string;
  images?: ImageInput[];
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
  featured?: boolean;
  draft?: boolean;
  instagramCaption?: string;
};

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: Body;
  try {
    input = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = input.title?.trim() ?? "";

  const validCities = new Set(["statewide", ...places.map((p) => p.slug)]);
  const validTopics = new Set(topics.map((t) => t.slug));
  const result = await writeStory(input, {
    validCities: [...validCities],
    validTopics: [...validTopics],
    slugExists: async (slug: string) =>
      Boolean(getPost(slug) || (await readRepoFile(`content/posts/${slug}.mdx`))),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.errors[0] ?? "Invalid post." },
      { status: 400 },
    );
  }

  const slug = result.path
    .replace(/^content\/posts\//, "")
    .replace(/\.mdx$/, "");

  try {
    await writeRepoFile(
      result.path,
      result.content,
      `post: ${title}`,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not publish the post." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    slug,
    url: `${site.url}/news/${slug}`,
    adminUrl: `${site.url}/admin`,
    socialImage: `${site.url}/api/social/${slug}`,
    caption: `${site.url}/api/social/${slug}/caption`,
  });
}
