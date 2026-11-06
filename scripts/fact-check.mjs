#!/usr/bin/env node
/**
 * Second-pass checks before a story is published.
 *
 *   npm run factcheck
 *   npm run factcheck -- --publish
 *   npm run factcheck -- --changed --network
 *   npm run factcheck -- --json
 *
 * This is deliberately conservative: hard errors stop a publish; warnings are
 * for a human or the i80-fact-check reviewer to resolve.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

const args = process.argv.slice(2);
const publish = args.includes("--publish");
const changedOnly = args.includes("--changed");
const network = args.includes("--network");
const asJson = args.includes("--json");

const postsDir = path.join(process.cwd(), "content", "posts");
const errors = [];
const warnings = [];
const reports = [];

const placesSource = fs.readFileSync(path.join(process.cwd(), "data", "places.ts"), "utf8");
const knownPlaces = new Map(
  [...placesSource.matchAll(
    /\{\s*slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?mileMarker:\s*"([^"]+)"/g,
  )].map((match) => [match[1], { slug: match[1], name: match[2], mileMarker: match[3] }]),
);
const topicsSource = fs.readFileSync(path.join(process.cwd(), "data", "topics.ts"), "utf8");
const knownTopics = new Set(
  [...topicsSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]),
);
const exitData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "i80-exits.json"), "utf8"),
);
const knownExits = new Map(exitData.exits.map((item) => [item.exit, item.mile]));

function error(file, message) {
  errors.push({ file, message });
}
function warn(file, message) {
  warnings.push({ file, message });
}

function changedFiles() {
  try {
    const out = execFileSync("git", ["status", "--porcelain"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const files = out
      .split("\n")
      .map((line) => line.slice(3).trim())
      .filter((line) => /^content\/posts\/.*\.mdx?$/.test(line))
      .map((line) => path.join(process.cwd(), line));
    return [...new Set(files)];
  } catch {
    return [];
  }
}

const files = (
  changedOnly
    ? changedFiles()
    : fs
        .readdirSync(postsDir)
        .filter((file) => /\.mdx?$/.test(file))
        .map((file) => path.join(postsDir, file))
).filter((file) => fs.existsSync(file));

if (!files.length) {
  console.error("No post files found to check.");
  process.exit(1);
}

function stripCode(value = "") {
  return String(value).replace(/```[\s\S]*?```/g, " ");
}

function extractInternalLinks(body) {
  return [...body.matchAll(/\]\((\/(?:news|cities|topics|authors)\/[^)\s#?]+)/g)].map(
    (match) => match[1],
  );
}

function urlIsValid(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkUrl(value) {
  if (!urlIsValid(value)) return { ok: false, status: 0, reason: "invalid URL" };
  try {
    const response = await fetch(value, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "I80Things/1.0 fact-check" },
      signal: AbortSignal.timeout(12000),
    });
    return { ok: response.status < 400, status: response.status, reason: response.statusText };
  } catch (cause) {
    return { ok: false, status: 0, reason: cause instanceof Error ? cause.message : "fetch failed" };
  }
}

const seenTitles = new Map();
const seenSourceUrls = new Map();

for (const file of files) {
  const relative = path.relative(process.cwd(), file);
  const raw = fs.readFileSync(file, "utf8");
  let parsed;
  try {
    parsed = matter(raw);
  } catch (cause) {
    error(relative, `invalid YAML frontmatter: ${cause.message.split("\n")[0]}`);
    continue;
  }
  const data = parsed.data;
  const body = stripCode(parsed.content);
  const report = { file: relative, errors: 0, warnings: 0 };

  if (!data.title || String(data.title).trim().length < 8) {
    error(relative, "missing or too-short title");
  }
  if (!data.dek || String(data.dek).trim().length < 20) {
    error(relative, "missing or too-short dek");
  }
  if (data.seoTitle && String(data.seoTitle).length > 60) {
    warn(relative, "seoTitle is over 60 characters");
  }
  if (data.seoDescription) {
    const length = String(data.seoDescription).length;
    if (length > 160) warn(relative, "seoDescription is over 160 characters");
    if (length < 120) warn(relative, "seoDescription is under 120 characters");
  }
  if (!data.date || Number.isNaN(new Date(data.date).getTime())) {
    error(relative, "missing or invalid date");
  } else if (new Date(data.date).getTime() > Date.now() + 86400000) {
    error(relative, "date is more than a day in the future");
  }
  if (data.updated) {
    if (Number.isNaN(new Date(data.updated).getTime())) {
      error(relative, "invalid updated date");
    } else if (data.date && new Date(data.updated) < new Date(data.date)) {
      error(relative, "updated date is before publish date");
    }
    if (!/\b(correction|corrected|updated|update)\b/i.test(body)) {
      warn(relative, "updated date is set but the body has no correction/update note");
    }
  }
  if (publish && data.draft === true) {
    error(relative, "draft: true in a publish run");
  }
  if (!data.city) {
    error(relative, "missing city");
  } else if (data.city !== "statewide" && !knownPlaces.has(data.city)) {
    error(relative, `unknown city slug: ${data.city}`);
  }
  if (!Array.isArray(data.topics) || !data.topics.length) {
    error(relative, "missing topics");
  } else {
    for (const topic of data.topics) {
      if (!knownTopics.has(topic)) warn(relative, `unknown topic slug: ${topic}`);
    }
  }
  if (!Array.isArray(data.summary) || data.summary.length < 3) {
    warn(relative, "summary should have at least three bullets");
  }
  if (!Array.isArray(data.sources) || !data.sources.length) {
    error(relative, "missing sources");
  } else {
    if (data.sources.length < 2) warn(relative, "only one source");
    for (const source of data.sources) {
      if (!source?.name || !source?.url) {
        error(relative, "source is missing a name or URL");
        continue;
      }
      if (!urlIsValid(source.url)) {
        error(relative, `invalid source URL: ${source.url}`);
        continue;
      }
      seenSourceUrls.set(source.url.replace(/#.*$/, ""), relative);
    }
  }

  const title = String(data.title ?? "");
  if (seenTitles.has(title.toLowerCase())) {
    warn(relative, `duplicate title also used by ${seenTitles.get(title.toLowerCase())}`);
  } else {
    seenTitles.set(title.toLowerCase(), relative);
  }

  // Headline/city mile-marker sanity. This is a warning because a story can
  // legitimately mention a nearby mile marker outside the hub's range.
  const mileMatches = [...`${data.title} ${data.dek}`.matchAll(/\bmile\s+(\d{1,3})\b/gi)];
  const place = knownPlaces.get(data.city);
  if (place && mileMatches.length) {
    const numbers = mileMatches.map((match) => Number(match[1]));
    const range = place.mileMarker.match(/\d+/g)?.map(Number) ?? [];
    if (range.length >= 1) {
      const min = Math.min(...range);
      const max = Math.max(...range);
      if (!numbers.some((number) => number >= min - 5 && number <= max + 5)) {
        warn(relative, `headline/dek mile marker does not match ${place.name} (${place.mileMarker})`);
      }
    }
  }

  // Freshness language. These are warnings, not bans: a current advisory can
  // be legitimate if it is date-stamped and sourced.
  const freshnessPatterns = [
    /\bcurrently\b/gi,
    /\bright now\b/gi,
    /\bthis (?:morning|afternoon|evening|week|month)\b/gi,
    /\btoday\b/gi,
    /\btonight\b/gi,
  ];
  const freshnessHits = freshnessPatterns
    .flatMap((pattern) => [...body.matchAll(pattern)].map((match) => match[0]))
    .slice(0, 5);
  if (freshnessHits.length) {
    warn(relative, `time-sensitive wording: ${[...new Set(freshnessHits)].join(", ")}`);
  }
  if (/\b(advisory is|closure is|is closed|are closed|in effect|detour is|currently closed)\b/i.test(body) && !/\b(as of|updated|on [A-Z][a-z]+ \d|\d{4})\b/i.test(body)) {
    warn(relative, "current road/weather status without a date stamp");
  }
  if (/\b(first|second|third|fourth)\s+weekend\b|\beach\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(body)) {
    warn(relative, "recurring event date: confirm the year-specific date");
  }
  if (/\b(reopened|reopening|ribbon cutting|set for|scheduled for|will reopen)\b/i.test(body)) {
    warn(relative, "event status: verify it happened, not just that it was scheduled");
  }
  if (/\b(largest|smallest|oldest|highest|lowest)\b/i.test(body)) {
    warn(relative, "superlative/ranking claim: verify it against a source");
  }

  const images = Array.isArray(data.images) ? data.images : [];
  if (!images.length && !data.image) {
    warn(relative, "no image");
  }
  for (const [index, image] of images.entries()) {
    if (!image?.alt || !String(image.alt).trim()) error(relative, `image ${index + 1}: missing alt`);
    if (!image?.credit) error(relative, `image ${index + 1}: missing credit`);
    if (image?.credit && !image?.creditUrl) error(relative, `image ${index + 1}: missing credit URL`);
    if (!image?.license) error(relative, `image ${index + 1}: missing license`);
    if (image?.license && !image?.licenseUrl) error(relative, `image ${index + 1}: missing license URL`);
    if (image?.licenseUrl && !urlIsValid(image.licenseUrl)) {
      error(relative, `image ${index + 1}: invalid license URL`);
    }
    const caption = String(image?.caption ?? "");
    if (caption && caption.length < 20) warn(relative, `image ${index + 1}: very short caption`);
    if (/\bstock\b/i.test(caption) && !/\bnot (?:the|this)\b/i.test(caption)) {
      warn(relative, `image ${index + 1}: stock image caption should say it is not the actual site`);
    }
  }
  if (data.image) {
    if (!data.imageAlt) error(relative, "legacy image: missing alt");
    if (!data.imageCredit) error(relative, "legacy image: missing credit");
    if (!data.imageCreditUrl) error(relative, "legacy image: missing credit URL");
    if (!data.imageLicense) error(relative, "legacy image: missing license");
    if (!data.imageLicenseUrl) error(relative, "legacy image: missing license URL");
  }

  // Exit numbers are the easiest hard fact to get wrong. Check every
  // "Exit N" against the NDOT-derived registry and the story's city range.
  const exitMentions = [...body.matchAll(/\bExit\s+(\d{1,3})\b/g)];
  for (const match of exitMentions) {
    const number = Number(match[1]);
    if (!knownExits.has(number)) {
      error(relative, `unknown Nebraska I-80 exit: ${number}`);
      continue;
    }
    if (place) {
      const range = place.mileMarker.match(/\d+/g)?.map(Number) ?? [];
      if (range.length >= 1) {
        const min = Math.min(...range);
        const max = Math.max(...range);
        const exitMile = knownExits.get(number);
        if (exitMile < min - 10 || exitMile > max + 10) {
          warn(relative, `Exit ${number} is outside the ${place.name} area (${place.mileMarker})`);
        }
      }
    }
  }

  for (const link of extractInternalLinks(body)) {
    const [kind, slug] = link.split("/").filter(Boolean);
    if (kind === "cities" && !knownPlaces.has(slug)) warn(relative, `internal link to unknown city: ${link}`);
    if (kind === "topics" && !knownTopics.has(slug)) warn(relative, `internal link to unknown topic: ${link}`);
    if (kind === "news") {
      const target = path.join(postsDir, `${slug}.mdx`);
      if (!fs.existsSync(target)) warn(relative, `internal link to missing story: ${link}`);
    }
  }

  if (network && Array.isArray(data.sources)) {
    for (const source of data.sources) {
      if (!source?.url || !urlIsValid(source.url)) continue;
      const result = await checkUrl(source.url);
      if (!result.ok) {
        if ([401, 403, 429].includes(result.status)) {
          warn(relative, `source blocked automated check (${result.status}): ${source.url}`);
        } else {
          warn(relative, `source did not return 2xx (${result.status || result.reason}): ${source.url}`);
        }
      }
    }
  }

  report.errors = errors.filter((item) => item.file === relative).length;
  report.warnings = warnings.filter((item) => item.file === relative).length;
  reports.push(report);
}

if (asJson) {
  console.log(JSON.stringify({ files: reports, errors, warnings }, null, 2));
} else {
  for (const report of reports) {
    const marker = report.errors ? "✗" : report.warnings ? "!" : "✓";
    console.log(`${marker} ${report.file}`);
    for (const item of errors.filter((entry) => entry.file === report.file)) {
      console.log(`  ERROR ${item.message}`);
    }
    for (const item of warnings.filter((entry) => entry.file === report.file)) {
      console.log(`  WARN  ${item.message}`);
    }
  }
  console.log(`\n${files.length} files · ${errors.length} errors · ${warnings.length} warnings`);
}

process.exit(errors.length ? 1 : 0);
