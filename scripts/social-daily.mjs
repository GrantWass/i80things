#!/usr/bin/env node
/**
 * Post the day's lead story to Instagram and the Facebook Page.
 *
 * Runs after the daily desk publishes, and is safe to rerun: it skips a
 * platform when the story title already appears in recent posts, and it waits
 * for the Vercel deploy so the social image URL resolves.
 *
 *   npm run social:daily                        # dry run
 *   npm run social:daily -- --publish
 *   npm run social:daily -- --slug <slug> --publish
 *   npm run social:daily -- --date 2026-11-08 --publish
 *   npm run social:daily -- --all --publish     # every story dated that day
 *
 * Missing credentials skip that platform instead of failing the run. A real
 * posting failure exits non-zero so the daily run reports it.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name) => {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return null;
  const next = args[index + 1];
  return next && !next.startsWith("--") ? next : null;
};

const shouldPublish = has("publish");
const postAll = has("all");
const slugArg = value("slug");
const dateArg = value("date");
const waitSeconds = Number(value("wait") ?? 600);
const tz = "America/Chicago";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  /* no local env file */
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const igUserId = process.env.IG_USER_ID;
const igToken = process.env.IG_ACCESS_TOKEN;
const pageId = process.env.FB_PAGE_ID;
const fbToken = process.env.FB_PAGE_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
const version = process.env.IG_GRAPH_VERSION || "v27.0";
const graph = `https://graph.facebook.com/${version}`;

if (!siteUrl || !siteUrl.startsWith("https://")) {
  console.error("Set NEXT_PUBLIC_SITE_URL to the public HTTPS deployment.");
  process.exit(1);
}

const dateKey = (iso) => {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
};

const today = dateKey(new Date().toISOString());
const targetDate = dateArg || today;

const dir = path.join(process.cwd(), "content", "posts");
const posts = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    return {
      slug: file.replace(/\.mdx$/, ""),
      title: String(data.title || "").trim(),
      draft: Boolean(data.draft),
      dateKey: dateKey(data.date),
      time: data.date ? new Date(data.date).getTime() : 0,
    };
  })
  .filter((post) => !post.draft && post.title);

let candidates;
if (slugArg) {
  const match = posts.find((post) => post.slug === slugArg);
  if (!match) {
    console.error(`No published post at content/posts/${slugArg}.mdx`);
    process.exit(1);
  }
  candidates = [match];
} else {
  candidates = posts
    .filter((post) => post.dateKey === targetDate)
    .sort((a, b) => b.time - a.time);
}

if (!candidates.length) {
  console.log(`No new story dated ${targetDate} (${tz}). Nothing to post.`);
  process.exit(0);
}

// Post oldest first so the newest story ends up at the top of both feeds.
const selected = postAll ? [...candidates].reverse() : candidates.slice(0, 1);
const count = selected.length;

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function alreadyOnInstagram(title) {
  if (!igUserId || !igToken) return null;
  const res = await fetch(
    `${graph}/${igUserId}/media?fields=caption&limit=25&access_token=${encodeURIComponent(igToken)}`,
  );
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  const needle = normalize(title);
  return (json.data || []).some((media) =>
    normalize(media.caption).includes(needle),
  );
}

async function pageToken() {
  if (!pageId || !fbToken) return null;
  const res = await fetch(
    `${graph}/${pageId}?fields=access_token&access_token=${encodeURIComponent(fbToken)}`,
  );
  const json = await res.json();
  return json.error ? fbToken : json.access_token || fbToken;
}

async function alreadyOnFacebook(title) {
  if (!pageId || !fbToken) return null;
  const token = await pageToken();
  const res = await fetch(
    `${graph}/${pageId}/feed?fields=message&limit=25&access_token=${encodeURIComponent(token)}`,
  );
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  const needle = normalize(title);
  return (json.data || []).some((post) =>
    normalize(post.message).includes(needle),
  );
}

const reachable = async (url) => {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
};

async function waitForDeploy(slug) {
  if (waitSeconds <= 0) return true;
  const article = `${siteUrl}/news/${slug}`;
  const image = `${siteUrl}/api/social/${slug}`;
  const deadline = Date.now() + waitSeconds * 1000;
  process.stdout.write(`Waiting for ${slug} to deploy`);
  while (Date.now() < deadline) {
    if ((await reachable(article)) && (await reachable(image))) {
      process.stdout.write(" — live.\n");
      return true;
    }
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
  process.stdout.write("\n");
  return false;
}

function publish(script, slug, extra = []) {
  const res = spawnSync(
    process.execPath,
    [path.join("scripts", script), "--slug", slug, ...extra],
    { stdio: "inherit", env: process.env },
  );
  return res.status === 0;
}

let failures = 0;

for (const post of selected) {
  console.log(`\n=== ${post.title}`);
  console.log(`    ${siteUrl}/news/${post.slug}`);

  if (shouldPublish && !(await waitForDeploy(post.slug))) {
    console.error(`    Not live after ${waitSeconds}s; skipped to avoid a broken image URL.`);
    failures += 1;
    continue;
  }

  const extra = count > 1 ? ["--direct-link"] : [];

  for (const platform of ["instagram", "facebook"]) {
    const check =
      platform === "instagram" ? alreadyOnInstagram : alreadyOnFacebook;
    let posted;
    try {
      posted = await check(post.title);
    } catch (error) {
      console.error(
        `    ${platform}: could not check recent posts (${error.message}); skipping to avoid a duplicate.`,
      );
      failures += 1;
      continue;
    }
    if (posted === null) {
      console.log(`    ${platform}: no credentials, skipped.`);
      continue;
    }
    if (posted) {
      console.log(`    ${platform}: already posted, skipped.`);
      continue;
    }
    if (!shouldPublish) {
      console.log(`    ${platform}: would post (dry run).`);
      continue;
    }
    console.log(`    ${platform}: posting…`);
    const ok = publish(`publish-${platform}.mjs`, post.slug, extra);
    if (!ok) failures += 1;
  }
}

if (failures) {
  console.error(`\n${failures} social action(s) failed.`);
  process.exit(1);
}
console.log("\nSocial step complete.");
