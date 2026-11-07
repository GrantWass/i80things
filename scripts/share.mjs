#!/usr/bin/env node
/**
 * Build a share kit for a published story: per-platform copy, UTM links and
 * posting notes. Read-only — it posts nothing and needs no credentials.
 *
 *   npm run share -- --slug <post-slug>
 *   npm run share -- --slug <post-slug> --platform reddit
 *   npm run share -- --slug <post-slug> --json
 *
 * Platforms: x, threads, bluesky, facebook, group, reddit
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const inline = args.find((a) => a.startsWith(`--${name}=`));
  if (inline) return inline.split("=").slice(1).join("=");
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith("--")) {
    return args[index + 1];
  }
  return fallback;
};

const slug = flag("slug");
const asJson = args.includes("--json");
const only = (flag("platform") || "").toLowerCase();
const campaign = flag("campaign", "daily");

if (!slug || slug.startsWith("--")) {
  console.error(
    "Usage: npm run share -- --slug <post-slug> [--platform x|threads|bluesky|facebook|group|reddit] [--json]",
  );
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
if (!fs.existsSync(file)) {
  console.error(`No post found at ${file}`);
  process.exit(1);
}

// Local scripts do not inherit Vercel env; pick up .env.local when present.
try {
  process.loadEnvFile?.(".env.local");
} catch {
  /* no local env file */
}

const { data } = matter(fs.readFileSync(file, "utf8"));
const siteOverride = flag("site");
const siteUrl = (
  siteOverride ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://i80things.vercel.app"
).replace(/\/$/, "");
const usingFallbackSite = !siteOverride && !process.env.NEXT_PUBLIC_SITE_URL;

const title = String(data.title || "").replace(/\s+/g, " ").trim();
const dek = String(data.dek || "").replace(/\s+/g, " ").trim();
const bullets = (Array.isArray(data.summary)
  ? data.summary
  : String(data.summary || "").split("\n")
)
  .map((line) => String(line).replace(/\s+/g, " ").trim())
  .filter(Boolean);
const firstFact = bullets[0] || dek;
const secondFact = bullets[1] || "";

const cityLabel =
  data.city && data.city !== "statewide"
    ? data.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "I-80, Nebraska";

const topics = Array.isArray(data.topics) ? data.topics : [];

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
const hook = hooks[topics[0]] || "Nebraska I-80 news.";

// Evergreen guides also carry a weather tag, so only live warnings, crashes
// and active road conditions count as same-day.
// How hard to push depends on age, not on the topic: a road-conditions guide
// is a reference piece, a closure published this morning is news.
const published = data.date ? new Date(data.date) : null;
const ageHours = published ? (Date.now() - published.getTime()) / 36e5 : Infinity;
const liveTopic = ["crashes", "weather", "road-conditions"].includes(topics[0]);

function shareNote() {
  if (ageHours <= 30) {
    return "Fresh. Post within a few hours of publishing — the morning commute window, before 7 a.m. CT, is the one that matters.";
  }
  if (ageHours <= 72 && liveTopic) {
    return "Still current. Re-check 511 and the source before you post; the closure or advisory may have changed.";
  }
  if (ageHours <= 72) {
    return "A few days old. One push, then leave it — do not repost the same link in the same community.";
  }
  return "Reference piece. Share it once where it answers a real question (a group thread, a Reddit comment), not as a fresh-news post.";
}
const notes = shareNote();

const link = (medium, source = medium) =>
  `${siteUrl}/news/${slug}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;

const utm = {
  x: link("social", "x"),
  threads: link("social", "threads"),
  bluesky: link("social", "bluesky"),
  facebook: link("page", "facebook"),
  group: link("group", "facebook"),
  reddit: link("social", "reddit"),
  instagram: `${siteUrl}/instagram`,
};

/** Trim to a limit on a word boundary, keeping paragraph breaks. */
function clamp(text, limit, ellipsis = "…") {
  const clean = text.trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit - ellipsis.length);
  const space = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).trimEnd()}${ellipsis}`;
}

const hashtags = ["#Nebraska", "#I80"];
if (data.city && data.city !== "statewide") {
  hashtags.push(`#${data.city.replace(/-/g, "")}`);
}

/**
 * A dek and a summary bullet often say the same thing. Keep a bullet only if
 * it adds vocabulary the post already has.
 */
function addsDetail(candidate, reference) {
  const words = (s) =>
    new Set(String(s).toLowerCase().match(/[a-z0-9']{4,}/g) || []);
  const a = words(candidate);
  const b = words(reference);
  if (!a.size) return false;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / a.size < 0.5;
}
let seen = [title, dek].join(" ");
const bodyPoints = [firstFact, secondFact].filter((point) => {
  if (!point || !addsDetail(point, seen)) return false;
  seen += ` ${point}`;
  return true;
});
const groupPoints = bodyPoints.slice(0, 2).join("\n\n");
// X posts containing a URL cost $0.20 per request instead of $0.015. The
// default X copy is link-free on purpose; `xLink` is the priced variant.
function composeX(base, url, limit = 280) {
  const head = clamp(base, limit);
  const tail = url ? `\n\n${url}` : "";
  const room = limit - head.length - tail.length - 2;
  const fact = room >= 80 ? clamp(firstFact, room) : "";
  return `${fact ? `${head}\n\n${fact}` : head}${tail}`;
}
const xText = composeX(`${hook} ${title}`);
const xLink = composeX(`${hook} ${title}`, utm.x);

const threadsText = clamp(
  `${hook}\n\n${title}\n\n${bodyPoints[0] || dek}\n\n${utm.threads}`,
  500,
);

const blueskyText = clamp(`${hook} ${title}\n\n${utm.bluesky}`, 300);

const facebookText = [
  hook,
  "",
  title,
  "",
  dek,
  "",
  bodyPoints.join("\n"),
  "",
  `Full story: ${utm.facebook}`,
  "",
  hashtags.join(" "),
]
  .filter((part, index, all) => part !== "" || all[index - 1] !== "")
  .join("\n")
  .trim();

const groupText = [
  hook,
  "",
  title,
  "",
  dek,
  "",
  groupPoints,
  "",
  "Everything we could confirm is in the story — if you're driving that stretch today, check 511 before you go.",
  "",
  `Link: ${utm.group}`,
  "",
  "(I write for I-80 Things, a small independent news desk covering the corridor from Omaha to Kimball.)",
]
  .filter((part, index, all) => part !== "" || all[index - 1] !== "")
  .join("\n");

const redditTitle = clamp(title.replace(/\.$/, ""), 100);
const redditBody = [
  bodyPoints.join("\n\n"),
  "",
  `Full story, with the primary sources: ${utm.reddit}`,
  "",
  "I write the corridor desk at I-80 Things, which covers I-80 from Omaha to Kimball. Happy to answer questions or pull the source documents if anyone wants them.",
]
  .filter((part, index, all) => part !== "" || all[index - 1] !== "")
  .join("\n");

const kit = {
  slug,
  title,
  city: cityLabel,
  date: data.date ?? null,
  notes,
  utm,
  platforms: {
    x: { limit: 280, text: xText, withLink: xLink, cost: "link-free $0.015 · with URL $0.20" },
    threads: { limit: 500, text: threadsText },
    bluesky: { limit: 300, text: blueskyText },
    facebook: { text: facebookText },
    group: { text: groupText },
    reddit: { title: redditTitle, body: redditBody },
  },
};

if (asJson) {
  console.log(JSON.stringify(kit, null, 2));
  process.exit(0);
}

const sections = [];
const wanted = (key) => !only || only === key;
const heading = (label, extra = "") =>
  `\n${label}${extra ? ` — ${extra}` : ""}\n${"-".repeat(Math.min(72, label.length + extra.length + 4))}`;

if (wanted("x")) {
  sections.push(
    heading("X", `${xText.length}/280 chars, link-free`),
    xText,
    heading("X with link", `${xLink.length}/280 chars, $0.20 API cost`),
    xLink,
  );
}
if (wanted("threads")) {
  sections.push(
    heading("THREADS", `${threadsText.length}/500 chars`),
    threadsText,
  );
}
if (wanted("bluesky")) {
  sections.push(
    heading("BLUESKY", `${blueskyText.length}/300 chars`),
    blueskyText,
  );
}
if (wanted("facebook")) {
  sections.push(heading("FACEBOOK PAGE"), facebookText);
}
if (wanted("group")) {
  sections.push(
    heading("FACEBOOK GROUP", "post as yourself, 1–2 groups max"),
    groupText,
  );
}
if (wanted("reddit")) {
  sections.push(
    heading("REDDIT", "text post, link at the bottom"),
    `TITLE\n${redditTitle}`,
    `BODY\n${redditBody}`,
  );
}

console.log(
  [
    `SHARE KIT — ${title}`,
    `slug: ${slug} · city: ${cityLabel} · published: ${data.date ?? "unknown"}`,
    notes,
    usingFallbackSite
      ? `Links use ${siteUrl}. Set NEXT_PUBLIC_SITE_URL (or pass --site) once i80things.com resolves.`
      : "",
    "",
    "UTM LINKS",
    ...Object.entries(utm).map(([key, value]) => `  ${key.padEnd(9)} ${value}`),
    "",
    ...sections,
    "",
  ].join("\n"),
);
