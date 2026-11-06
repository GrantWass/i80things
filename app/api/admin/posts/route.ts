import { NextResponse } from "next/server";
import matter from "gray-matter";
import { isAuthed } from "@/lib/auth";
import { getPost } from "@/lib/content";
import { readRepoFile, writeRepoFile } from "@/lib/github";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { slugify } from "@/lib/utils";
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

function sanitizeImages(input: unknown, title: string): { src: string; alt: string; credit?: string; creditUrl?: string; license?: string; licenseUrl?: string; instagram?: boolean }[] {
  if (!Array.isArray(input)) return [];
  return (input as ImageInput[])
    .filter((image) => typeof image?.src === "string" && image.src.trim())
    .filter((image) => {
      const src = image.src!.trim();
      return src.startsWith("/images/") || src.startsWith("https://");
    })
    .slice(0, 10)
    .map((image) => {
      const src = image.src!.trim();
      const alt = (image.alt ?? "").trim() || title;
      const caption = (image.caption ?? "").trim();
      const credit = (image.credit ?? "").trim();
      const creditUrl = (image.creditUrl ?? "").trim();
      const license = (image.license ?? "").trim();
      const licenseUrl = (image.licenseUrl ?? "").trim();
      const socialSrc = (image.socialSrc ?? "").trim();
      return {
        src,
        alt,
        ...(caption ? { caption } : {}),
        ...(credit ? { credit } : {}),
        ...(creditUrl ? { creditUrl } : {}),
        ...(license ? { license } : {}),
        ...(licenseUrl ? { licenseUrl } : {}),
        ...(socialSrc ? { socialSrc } : {}),
        instagram: Boolean(image.instagram),
      };
    });
}

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

  const title = input.title?.trim();
  const dek = input.dek?.trim();
  const body = input.body?.trim();

  if (!title || title.length < 8) {
    return NextResponse.json({ error: "A headline of at least 8 characters is required." }, { status: 400 });
  }
  if (!dek) {
    return NextResponse.json({ error: "A dek is required." }, { status: 400 });
  }
  if (!body || body.length < 200) {
    return NextResponse.json({ error: "The story body must be at least 200 characters." }, { status: 400 });
  }

  const validCities = new Set(["statewide", ...places.map((p) => p.slug)]);
  const city = input.city && validCities.has(input.city) ? input.city : "statewide";
  const validTopics = new Set(topics.map((t) => t.slug));
  const selectedTopics = (input.topics ?? []).filter((t) => validTopics.has(t));
  const tags = (input.tags ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const summary = (input.summary ?? "")
    .split("\n")
    .map((s) => s.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
  const sources = (input.sources ?? [])
    .filter((s) => s.name?.trim() && /^https?:\/\//.test(s.url ?? ""))
    .slice(0, 12);

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;
  while (getPost(slug) || (await readRepoFile(`content/posts/${slug}.mdx`))) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
    if (suffix > 20) break;
  }

  const publishedDate = input.date ? new Date(input.date) : new Date();
  if (Number.isNaN(publishedDate.getTime())) {
    return NextResponse.json({ error: "Invalid publication date." }, { status: 400 });
  }

  const frontmatter: Record<string, unknown> = {
    title,
    dek,
    date: publishedDate.toISOString(),
    author: "corridor-desk",
    city,
    topics: selectedTopics,
    tags,
    summary,
    sources,
    featured: Boolean(input.featured),
    draft: Boolean(input.draft),
  };

  if (input.images !== undefined) {
    const images = sanitizeImages(input.images, title);
    if (images.length) {
      frontmatter.images = images;
      const cover = images[0];
      frontmatter.image = cover.src;
      frontmatter.imageAlt = cover.alt;
      if (cover.credit) frontmatter.imageCredit = cover.credit;
      if (cover.creditUrl) frontmatter.imageCreditUrl = cover.creditUrl;
      if (cover.license) frontmatter.imageLicense = cover.license;
      if (cover.licenseUrl) frontmatter.imageLicenseUrl = cover.licenseUrl;
    }
  } else if (input.image) {
    frontmatter.image = input.image;
    frontmatter.imageAlt = input.imageAlt || title;
    if (input.imageCredit) frontmatter.imageCredit = input.imageCredit;
    if (input.imageCreditUrl) frontmatter.imageCreditUrl = input.imageCreditUrl;
  }
  if (input.instagramCaption) {
    frontmatter.instagramCaption = input.instagramCaption;
  }

  const file = matter.stringify(`${body}\n`, frontmatter);

  try {
    await writeRepoFile(
      `content/posts/${slug}.mdx`,
      file,
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
