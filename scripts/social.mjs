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
const hashtags = ["#Nebraska", "#I80", "#NebraskaNews"];
if (data.city && data.city !== "statewide") {
  hashtags.push(`#${data.city.replace(/-/g, "")}`);
}
if ((data.tags ?? []).includes("weather")) hashtags.push("#NebraskaWeather");

const caption = data.instagramCaption || [
  data.title,
  "",
  data.dek,
  "",
  `📍 ${cityLabel}`,
  "",
  `Full story + sources: ${siteUrl}/news/${slug}`,
  "",
  hashtags.slice(0, 5).join(" "),
].join("\n").slice(0, 2200);

if (asJson) {
  console.log(JSON.stringify({
    slug,
    caption,
    imageUrl: `${siteUrl}/api/social/${slug}`,
    articleUrl: `${siteUrl}/news/${slug}`,
  }, null, 2));
} else {
  console.log(`\nIMAGE (1080×1350 JPEG)\n${siteUrl}/api/social/${slug}\n`);
  console.log(`ARTICLE\n${siteUrl}/news/${slug}\n`);
  console.log(`CAPTION (${caption.length}/2200)\n${caption}\n`);
}
