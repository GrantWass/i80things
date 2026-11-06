#!/usr/bin/env node
/**
 * Weekly freshness audit for published stories.
 *
 *   npm run stories:audit
 *   npm run stories:audit -- --due
 *   npm run stories:audit -- --json
 *   npm run stories:audit -- --markdown
 *
 * This does not edit or publish anything. It flags stories whose review date
 * has passed and finds language that tends to go stale. The weekly GitHub
 * Actions job turns the output into an issue.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const asMarkdown = args.includes("--markdown");
const dueOnly = args.includes("--due");
const failOnDue = args.includes("--fail-on-due");

const postsDir = path.join(process.cwd(), "content", "posts");
const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function daysSince(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? Math.floor((now - time) / day) : 0;
}

function cadence(data) {
  const topics = data.topics ?? [];
  const tags = (data.tags ?? []).join(" ").toLowerCase();
  if (topics.includes("crashes") || topics.includes("weather") || topics.includes("state-patrol")) {
    return 14;
  }
  if (/construction|lane closure|work zone|closure|detour/.test(tags)) return 14;
  if (topics.includes("road-conditions")) return 30;
  if (topics.includes("explainers")) return 180;
  if (data.city && data.city !== "statewide" && /at mile|guide|exits/i.test(data.title ?? "")) {
    return 180;
  }
  return 90;
}

function staleLines(body) {
  const immediate = /\b(currently|right now|today|tonight|this week|this weekend|next week|last week|this month)\b/i;
  const status = /\b(advisory|closure|closed|detour|work zone|lane closure)\b/i;
  const change = /\b(starts?|scheduled|expected|will begin|will close|will reopen|remains|in effect|through|until)\b/i;
  const dated = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}\s*(?:a\.m\.|p\.m\.)|20\d{2})\b/i;
  const hits = [];
  for (const line of body.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const suspicious = immediate.test(line) || (status.test(line) && change.test(line) && dated.test(line));
    if (suspicious) {
      const text = line.replace(/\s+/g, " ").trim();
      if (text.length > 8) hits.push(text.slice(0, 220));
    }
  }
  return hits.slice(0, 6);
}

const stories = [];
for (const file of fs.readdirSync(postsDir).filter((name) => /\.mdx?$/.test(name))) {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  let parsed;
  try {
    parsed = matter(raw);
  } catch {
    continue;
  }
  const data = parsed.data;
  if (data.draft) continue;
  const reviewed = data.updated ?? data.date;
  const age = daysSince(reviewed);
  const cadenceDays = cadence(data);
  const due = age > cadenceDays;
  const body = parsed.content;
  const stale = staleLines(body);
  const correctionMentioned = /\bcorrection\b/i.test(body);
  const issues = [];
  if (due) issues.push(`review cadence ${cadenceDays}d; last reviewed ${age}d ago`);
  if (correctionMentioned && !data.updated) issues.push("correction note without updated date");
  if (stale.length) issues.push("possible stale/current wording");
  stories.push({
    slug,
    title: data.title ?? slug,
    city: data.city ?? "statewide",
    date: data.date ?? null,
    updated: data.updated ?? null,
    reviewed,
    age,
    cadence: cadenceDays,
    due,
    stale,
    issues,
  });
}

stories.sort((a, b) => Number(b.due) - Number(a.due) || b.age - a.age);
const dueStories = stories.filter((story) => story.due);
const selected = dueOnly ? dueStories : stories;
const generated = new Date().toISOString();

if (asJson) {
  console.log(JSON.stringify({ generated, counts: { stories: stories.length, due: dueStories.length }, stories: selected }, null, 2));
} else if (asMarkdown) {
  console.log(`# Story review — ${generated.slice(0, 10)}\n`);
  console.log(`${stories.length} published stories; **${dueStories.length} due for review**.\n`);
  if (!dueStories.length) {
    console.log("No stories are past their review cadence.\n");
  } else {
    console.log("## Due for review\n");
    for (const story of dueStories) {
      console.log(`- [${story.title}](https://i80things.vercel.app/news/${story.slug}) — ${story.city} — last reviewed ${story.age}d ago (cadence ${story.cadence}d)`);
      for (const issue of story.issues) console.log(`  - ${issue}`);
    }
    console.log("");
  }
  const stale = stories.filter((story) => story.stale.length);
  if (stale.length) {
    console.log("## Possible stale wording\n");
    for (const story of stale) {
      console.log(`- ${story.title} (\`${story.slug}\`)`);
      for (const line of story.stale.slice(0, 3)) console.log(`  - ${line}`);
    }
    console.log("");
  }
  console.log("Review means: confirm the facts against the current primary source, update the story if needed, set `updated`, and add a correction note for substantive changes. Do not rewrite a story just to change its date.");
} else {
  console.log(`STORY AUDIT — ${stories.length} published stories\n`);
  for (const story of selected) {
    const marker = story.due ? "DUE " : "OK  ";
    console.log(`${marker} ${String(story.age).padStart(3)}d / ${String(story.cadence).padStart(3)}d  ${story.title}`);
    for (const issue of story.issues) console.log(`      ${issue}`);
    for (const line of story.stale.slice(0, 2)) console.log(`      ↳ ${line}`);
  }
  console.log(`\n${dueStories.length} due; ${stories.length - dueStories.length} within cadence.\n`);
}

if (failOnDue && dueStories.length) process.exit(1);
