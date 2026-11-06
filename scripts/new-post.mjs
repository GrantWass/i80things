#!/usr/bin/env node
/**
 * Scaffold a new story. The agent should fill in the body and verify facts.
 *
 *   npm run new -- --title "I-80 reopens near Kearney" --city kearney \
 *     --topics crashes,state-patrol \
 *     --source "Nebraska State Patrol|https://statepatrol.nebraska.gov/..." \
 *     --draft
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function flag(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}
function flagAll(name) {
  return args.reduce((values, arg, index) => {
    if (arg === `--${name}`) values.push(args[index + 1]);
    return values;
  }, []);
}

const title = flag("title");
const city = flag("city") || "statewide";
const dek = flag("dek") || "";
const topics = (flag("topics") || "crashes").split(",").map((t) => t.trim()).filter(Boolean);
const tags = (flag("tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
const sources = flagAll("source").map((value) => {
  const [name, url] = value.split("|");
  return { name: (name || "").trim(), url: (url || "").trim() };
});
const isDraft = args.includes("--draft");

if (!title) {
  console.error(`Usage:
  npm run new -- --title "Headline" --city kearney --topics crashes,state-patrol \\
    --source "Nebraska State Patrol|https://..." [--draft]`);
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 90);

const file = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
if (fs.existsSync(file)) {
  console.error(`Refusing to overwrite existing post: ${file}`);
  process.exit(1);
}

const now = new Date().toISOString();
const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
dek: "${(dek || "One sentence that adds information beyond the headline.").replace(/"/g, '\\"')}"
date: "${now}"
author: corridor-desk
city: ${city}
topics:
${topics.map((t) => `  - ${t}`).join("\n")}
tags:
${(tags.length ? tags : ["nebraska", "i-80"]).map((t) => `  - ${t}`).join("\n")}
summary:
  - "Confirmed fact one."
  - "Confirmed fact two."
  - "Why it matters or what happens next."
sources:
${sources.length
  ? sources.map((s) => `  - name: "${s.name.replace(/"/g, '\\"')}"\n    url: ${s.url}`).join("\n")
  : `  - name: "Nebraska State Patrol"\n    url: https://statepatrol.nebraska.gov/divisions/office-superintendent/news`}
featured: false
draft: ${isDraft ? "true" : "false"}
---

Lead paragraph: what happened, where (mile marker + direction), when, and who confirmed it.

## What we know

- Location:
- Time:
- Status:
- Agency:

## Why it matters

Context for drivers on this stretch. Who is affected, what to do instead, how long it may last.

## What happens next

What to watch for, when we will update, and where the official information lives.

<!-- Before publishing:
  - Verify every claim with the agency. Scanner traffic is not confirmation.
  - Link the primary source in the body AND in the sources list.
  - Add real context. Do not copy another outlet's article.
  - Run: npm run validate
-->
`;

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, frontmatter);
console.log(`Created ${path.relative(process.cwd(), file)}`);
console.log(`URL will be /news/${slug}`);
console.log(`Next: fill the body, verify sources, run npm run validate.`);
