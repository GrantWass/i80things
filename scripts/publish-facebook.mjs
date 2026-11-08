#!/usr/bin/env node
/**
 * Publish a story to the I-80 Things Facebook Page via the Meta Graph API.
 * Defaults to a dry run. Add --publish to actually post.
 *
 *   npm run social:facebook -- --slug <slug>
 *   npm run social:facebook -- --slug <slug> --publish
 *
 * Requires:
 *   FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, IG_GRAPH_VERSION (optional)
 *   The token must carry pages_manage_posts. A Page token generated for the
 *   Instagram unified-login config usually does not, and Meta rejects the post
 *   with "(#200) The permission(s) pages_manage_posts are not available".
 *   NEXT_PUBLIC_SITE_URL must be a public HTTPS URL.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const slug = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const shouldPublish = args.includes("--publish");

// Local runs do not inherit Vercel env; pick up .env.local (gitignored).
try {
  process.loadEnvFile?.(".env.local");
} catch {
  /* no local env file */
}

if (!slug) {
  console.error("Usage: npm run social:facebook -- --slug <slug> [--publish]");
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
if (!fs.existsSync(file)) {
  console.error(`No post at ${file}`);
  process.exit(1);
}

const { data } = matter(fs.readFileSync(file, "utf8"));
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const pageId = process.env.FB_PAGE_ID;
// The same Page token can serve both: Instagram's unified-login token is
// already a Page token, it just lacks the Page publishing scope.
const token = process.env.FB_PAGE_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
const version = process.env.IG_GRAPH_VERSION || "v27.0";

if (!siteUrl || !siteUrl.startsWith("https://")) {
  console.error("Set NEXT_PUBLIC_SITE_URL to the public HTTPS deployment before publishing.");
  process.exit(1);
}
if (data.draft) {
  console.error("Refusing to post a draft.");
  process.exit(1);
}
if (!pageId || !token) {
  console.error("Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN. See docs/META-SETUP.md.");
  process.exit(1);
}

const fmImages = Array.isArray(data.images) ? data.images : [];
const gallery = fmImages.filter(
  (image) => typeof image?.src === "string" && image.src.trim(),
);
const firstIndex = gallery.findIndex((image) => image.instagram !== false);
// Facebook fits the 4:5 Instagram card into a wider feed frame and pads the
// sides, so the Page gets a 1.91:1 render that spans the full post width.
// With no gallery image the route renders a branded card, but only without
// the `image` param — `?image=1` 404s when there is nothing to index.
const imageUrl = gallery.length
  ? `${siteUrl}/api/social/${slug}?image=${(firstIndex === -1 ? 0 : firstIndex) + 1}&format=facebook`
  : `${siteUrl}/api/social/${slug}?format=facebook`;

const hooks = {
  crashes: "Heads up, I-80 drivers.",
  "road-conditions": "Before you drive I-80.",
  weather: "Before you drive I-80 today.",
  "state-patrol": "From the Nebraska State Patrol.",
  travel: "Nebraska I-80 road-trip note.",
  community: "Along the corridor.",
  business: "What's moving on I-80.",
  explainers: "I-80, explained.",
};
const hook = hooks[(data.topics ?? [])[0]] ?? "Nebraska I-80 news.";
const summary = (Array.isArray(data.summary)
  ? data.summary
  : String(data.summary || "").split("\n")
)
  .map((line) => String(line).replace(/\s+/g, " ").trim())
  .filter(Boolean);
const firstFact = summary[0] || "";
const hashtags = ["#Nebraska", "#I80"];
if (data.city && data.city !== "statewide") {
  hashtags.push(`#${String(data.city).replace(/-/g, "")}`);
}
const storyUrl = `${siteUrl}/news/${slug}?utm_source=facebook&utm_medium=page&utm_campaign=daily`;
const caption = (data.facebookCaption || [
  hook,
  "",
  data.title,
  "",
  data.dek,
  "",
  firstFact,
  "",
  `Full story: ${storyUrl}`,
  "",
  hashtags.join(" "),
]
  .filter((part, index, all) => part !== "" || all[index - 1] !== "")
  .join("\n")
  .trim()).slice(0, 63206);

if (!shouldPublish) {
  console.log("DRY RUN — add --publish to post.");
  console.log(`Page: ${pageId}`);
  console.log(`Image: ${imageUrl}`);
  console.log(`Link: ${storyUrl}`);
  console.log(`Caption:\n${caption}`);
  process.exit(0);
}

const graph = `https://graph.facebook.com/${version}`;

/**
 * A system-user or user token cannot call the new Pages experience endpoints
 * directly; exchange it for the Page's own token first. A Page token is
 * returned unchanged.
 */
async function resolvePageToken() {
  const res = await fetch(
    `${graph}/${pageId}?fields=access_token&access_token=${encodeURIComponent(token)}`,
  );
  const json = await res.json();
  if (json.error || !json.access_token) return token;
  return json.access_token;
}

try {
  const pageToken = await resolvePageToken();
  console.log("Publishing photo to the Page…");
  const res = await fetch(`${graph}/${pageId}/photos`, {
    method: "POST",
    body: new URLSearchParams({
      url: imageUrl,
      caption,
      access_token: pageToken,
    }),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    const message = json.error?.message ?? JSON.stringify(json);
    if (message.includes("pages_manage_posts")) {
      throw new Error(
        `${message}\n\nRegenerate the token with pages_manage_posts (Meta app → API setup → Edit permissions) and update FB_PAGE_ACCESS_TOKEN in .env.local.`,
      );
    }
    throw new Error(`Meta API ${res.status}: ${message}`);
  }
  console.log(`Published post ID: ${json.post_id ?? json.id}`);
  console.log(`Open https://www.facebook.com/${pageId} to confirm.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
