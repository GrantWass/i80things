#!/usr/bin/env node
/**
 * Publish a story to Instagram via the Meta Graph API.
 * Defaults to a dry run. Add --publish to actually post.
 *
 *   npm run social:instagram -- --slug <slug>
 *   npm run social:instagram -- --slug <slug> --publish
 *
 * Requires:
 *   IG_USER_ID, IG_ACCESS_TOKEN, IG_GRAPH_VERSION (optional)
 *   NEXT_PUBLIC_SITE_URL must be a public HTTPS URL.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const slug = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const shouldPublish = args.includes("--publish");

if (!slug) {
  console.error("Usage: npm run social:instagram -- --slug <slug> [--publish]");
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
if (!fs.existsSync(file)) {
  console.error(`No post at ${file}`);
  process.exit(1);
}

const { data } = matter(fs.readFileSync(file, "utf8"));
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const igUserId = process.env.IG_USER_ID;
const token = process.env.IG_ACCESS_TOKEN;
const version = process.env.IG_GRAPH_VERSION || "v21.0";

if (!siteUrl || !siteUrl.startsWith("https://")) {
  console.error("Set NEXT_PUBLIC_SITE_URL to the public HTTPS deployment before publishing.");
  process.exit(1);
}
if (data.draft) {
  console.error("Refusing to post a draft.");
  process.exit(1);
}
if (!igUserId || !token) {
  console.error("Set IG_USER_ID and IG_ACCESS_TOKEN. See the Setup tab for requirements.");
  process.exit(1);
}

const fmImages = Array.isArray(data.images) ? data.images : [];
const gallery = fmImages
  .filter((image) => typeof image?.src === "string" && image.src.trim())
  .map((image, index) => ({
    index: index + 1,
    instagram: image.instagram ?? index === 0,
  }));
if (!gallery.length && data.image) {
  gallery.push({ index: 1, instagram: true });
}
const flagged = gallery.filter((image) => image.instagram);
const selected = flagged.length ? flagged : gallery.slice(0, 1);
let imageUrls = selected.map(
  (image) => `${siteUrl}/api/social/${slug}?image=${image.index}`,
);
if (imageUrls.length > 10) {
  console.error(`Only the first 10 of ${imageUrls.length} Instagram images will be posted (Meta carousel limit).`);
  imageUrls = imageUrls.slice(0, 10);
}
const imageUrl = imageUrls[0] ?? `${siteUrl}/api/social/${slug}`;
const isCarousel = imageUrls.length > 1;
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
const caption = (data.instagramCaption || [
  hook,
  "",
  data.title,
  "",
  data.dek,
  "",
  "Full story → link in bio.",
  "",
  "#Nebraska #I80 #NebraskaNews",
].join("\n")).slice(0, 2200);

if (!shouldPublish) {
  console.log("DRY RUN — add --publish to post.");
  if (isCarousel) {
    console.log(`Images (${imageUrls.length}):`);
    for (const url of imageUrls) console.log(`  - ${url}`);
  } else {
    console.log(`Image: ${imageUrl}`);
  }
  console.log(`Bio link: ${siteUrl}/news/${slug}`);
  console.log(`Caption:\n${caption}`);
  process.exit(0);
}

const graph = `https://graph.facebook.com/${version}`;

async function graphPost(pathname, body) {
  const res = await fetch(`${graph}/${pathname}`, { method: "POST", body });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Meta API ${res.status}: ${JSON.stringify(json.error ?? json)}`);
  }
  return json;
}

try {
  if (!isCarousel) {
    console.log("Creating media container…");
    const container = await graphPost(
      `${igUserId}/media`,
      new URLSearchParams({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    );
    console.log(`Container: ${container.id}`);

    // Give Meta a moment to ingest the image, then publish.
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const published = await graphPost(
      `${igUserId}/media_publish`,
      new URLSearchParams({ creation_id: container.id, access_token: token }),
    );
    console.log(`Published media ID: ${published.id}`);
  } else {
    console.log(`Creating ${imageUrls.length} carousel item containers…`);
    const children = [];
    for (const url of imageUrls) {
      const item = await graphPost(
        `${igUserId}/media`,
        new URLSearchParams({
          image_url: url,
          is_carousel_item: "true",
          access_token: token,
        }),
      );
      console.log(`Item container: ${item.id} (${url})`);
      children.push(item.id);
    }
    console.log("Creating carousel container…");
    const carousel = await graphPost(
      `${igUserId}/media`,
      new URLSearchParams({
        media_type: "CAROUSEL",
        children: children.join(","),
        caption,
        access_token: token,
      }),
    );
    console.log(`Carousel container: ${carousel.id}`);

    // Give Meta a moment to ingest the images, then publish.
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const published = await graphPost(
      `${igUserId}/media_publish`,
      new URLSearchParams({ creation_id: carousel.id, access_token: token }),
    );
    console.log(`Published media ID: ${published.id}`);
  }
  console.log("Open Instagram to confirm the post and add it to a highlight if relevant.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
