#!/usr/bin/env node
/**
 * Generate an Instagram caption + image URL for a story.
 *
 *   npm run social -- --slug i-80-mile-markers-nebraska-explained
 *   npm run social -- --slug ... --json
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith("--slug="));
const slug = slugArg
  ? slugArg.split("=")[1]
  : args[args.indexOf("--slug") + 1];
const asJson = args.includes("--json");

if (!slug || slug.startsWith("--")) {
  console.error("Usage: npm run social -- --slug <post-slug> [--json]");
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
if (!fs.existsSync(file)) {
  console.error(`No post found at ${file}`);
  process.exit(1);
}

const { data } = matter(fs.readFileSync(file, "utf8"));
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://i80things.com").replace(/\/$/, "");
const cityLabel = data.city && data.city !== "statewide"
  ? data.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  : "I-80, Nebraska";
const hooks = {
  crashes: "Heads up, I-80 drivers.",
  "road-conditions": "Planning an I-80 drive? Start here.",
  weather: "Before you drive I-80 today.",
  "state-patrol": "From the Nebraska State Patrol.",
  travel: "Nebraska I-80 road-trip note.",
  community: "Along the corridor.",
  business: "What's moving on I-80.",
  explainers: "I-80, explained.",
};
const hook = hooks[(data.topics ?? [])[0]] ?? "Nebraska I-80 news.";
const hashtags = ["#Nebraska", "#I80", "#NebraskaNews"];
if (data.city && data.city !== "statewide") {
  hashtags.push(`#${data.city.replace(/-/g, "")}`);
}
if ((data.tags ?? []).includes("weather")) hashtags.push("#NebraskaWeather");

const caption = data.instagramCaption || [
  hook,
  "",
  data.title,
  "",
  data.dek,
  "",
  `📍 ${cityLabel}`,
  "",
  "Full story → link in bio.",
  "",
  hashtags.slice(0, 5).join(" "),
].join("\n").slice(0, 2200);

const fmImages = Array.isArray(data.images) ? data.images : [];
const gallery = fmImages
  .filter((image) => typeof image?.src === "string" && image.src.trim())
  .map((image, index) => ({
    src: image.src.trim(),
    alt: (image.alt || data.imageAlt || data.title || "").trim(),
    credit: image.credit || data.imageCredit || null,
    index: index + 1,
    instagram: image.instagram ?? index === 0,
  }));
if (!gallery.length && data.image) {
  gallery.push({
    src: data.image,
    alt: (data.imageAlt || data.title || "").trim(),
    credit: data.imageCredit || null,
    index: 1,
    instagram: true,
  });
}
const flagged = gallery.filter((image) => image.instagram);
const selected = flagged.length ? flagged : gallery.slice(0, 1);
const imageUrls = selected.map(
  (image) => `${siteUrl}/api/social/${slug}?image=${image.index}`,
);
const imagesMeta = selected.map((image) => ({
  index: image.index,
  alt: image.alt,
  credit: image.credit,
}));
const imageUrl = imageUrls[0] ?? `${siteUrl}/api/social/${slug}`;

if (asJson) {
  console.log(JSON.stringify({
    slug,
    caption,
    imageUrl,
    imageUrls,
    images: imagesMeta,
    bioLink: `${siteUrl}/news/${slug}`,
  }, null, 2));
} else {
  console.log(`\nIMAGE${imageUrls.length > 1 ? "S" : ""} (1080×1350 JPEG)`);
  for (const url of imageUrls) console.log(url);
  console.log("");
  console.log(`BIO LINK (paste before posting)\n${siteUrl}/news/${slug}\n`);
  console.log(`CAPTION (${caption.length}/2200)\n${caption}\n`);
}
