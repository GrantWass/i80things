import { site } from "@/lib/site";
import type { Post, PostImage } from "@/lib/types";
import { getPlace, placeName } from "@/data/places";

export function formatDate(
  input: string | Date,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: site.timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatDateShort(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: site.timeZone,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: site.timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function isoDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toISOString();
}

export function readingTime(body: string): number {
  const words = body
    .replace(/[#>*_`\[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function truncate(input: string, length = 160): string {
  if (input.length <= length) return input;
  return `${input.slice(0, length).replace(/\s+\S*$/, "")}…`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function postImages(
  post: Pick<
    Post,
    "images" | "image" | "imageAlt" | "imageCredit" | "imageCreditUrl"
  >,
): PostImage[] {
  if (post.images?.length) return post.images;
  if (post.image) {
    return [
      {
        src: post.image,
        alt: post.imageAlt || "",
        credit: post.imageCredit,
        creditUrl: post.imageCreditUrl,
        instagram: true,
      },
    ];
  }
  return [];
}

export function selectedInstagramImages(post: Pick<Post, "images" | "image" | "imageAlt" | "imageCredit" | "imageCreditUrl">): {
  image: PostImage;
  index: number;
}[] {
  const all = postImages(post);
  const selected = all
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image.instagram);
  return selected.length
    ? selected
    : all.slice(0, 1).map((image, index) => ({ image, index }));
}

export function postImagePath(post: {
  images?: PostImage[];
  image?: string;
  title: string;
  city: string;
}): string {
  const cover = post.images?.[0]?.src ?? post.image;
  if (cover) return cover;
  const kicker = getPlace(post.city)
    ? `${placeName(post.city)} · I-80`
    : "I-80 Nebraska";
  return `/api/og?title=${encodeURIComponent(post.title)}&kicker=${encodeURIComponent(kicker)}`;
}

const captionHooks: Record<string, string> = {
  crashes: "Heads up, I-80 drivers.",
  "road-conditions": "Planning an I-80 drive? Start here.",
  weather: "Before you drive I-80 today.",
  "state-patrol": "From the Nebraska State Patrol.",
  travel: "Nebraska I-80 road-trip note.",
  community: "Along the corridor.",
  business: "What's moving on I-80.",
  explainers: "I-80, explained.",
};

export function instagramCaption(post: {
  title: string;
  dek: string;
  city: string;
  slug: string;
  topics?: string[];
  tags?: string[];
  instagramCaption?: string;
}): string {
  if (post.instagramCaption) return post.instagramCaption;
  const place = getPlace(post.city);
  const hook = captionHooks[post.topics?.[0] ?? ""] ?? "Nebraska I-80 news.";
  const tags = ["#Nebraska", "#I80", "#NebraskaNews"];
  if (place) tags.push(`#${place.name.replace(/[^a-zA-Z]/g, "")}`);
  if (post.tags?.includes("weather")) tags.push("#NebraskaWeather");
  if (post.tags?.includes("crashes")) tags.push("#TrafficAlert");
  const lines = [
    hook,
    "",
    post.title,
    "",
    post.dek,
    "",
    place ? `📍 ${place.name}, Nebraska (I-80 ${place.mileMarker})` : "📍 I-80, Nebraska",
    "",
    "Full story → link in bio.",
    "",
    tags.slice(0, 5).join(" "),
  ];
  return lines.join("\n").slice(0, 2200);
}
