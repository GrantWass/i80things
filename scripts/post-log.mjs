#!/usr/bin/env node
/**
 * Print what we have already published. Run this before writing anything.
 *
 *   npm run log
 *   npm run log -- --json
 *   npm run log -- --days 14
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const daysArg = args.find((a) => a.startsWith("--days="));
const days = daysArg ? Number(daysArg.split("=")[1]) : null;

const dir = path.join(process.cwd(), "content", "posts");
const posts = fs
  .readdirSync(dir)
  .filter((f) => /\.mdx?$/.test(f))
  .map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.mdx?$/, ""),
      title: data.title,
      date: data.date,
      city: data.city || "statewide",
      topics: data.topics ?? [],
      tags: data.tags ?? [],
      draft: Boolean(data.draft),
      sources: (data.sources ?? []).map((s) => s.url),
      words: content.split(/\s+/).filter(Boolean).length,
    };
  })
  .filter((post) => {
    if (!days) return true;
    return Date.now() - new Date(post.date).getTime() <= days * 864e5;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

if (asJson) {
  console.log(JSON.stringify({ count: posts.length, posts }, null, 2));
  process.exit(0);
}

console.log(`\nPUBLISHED / DRAFTED — ${posts.length} item(s)\n`);
for (const post of posts) {
  console.log(`${post.date.slice(0, 10)}  ${post.draft ? "DRAFT" : "LIVE "}  ${post.city.padEnd(13)} ${post.title}`);
  console.log(`  /news/${post.slug}`);
  if (post.sources.length) console.log(`  sources: ${post.sources.join("  ")}`);
}
console.log(`
DEDUPE RULES
1. If a headline covers the same event, do not write a second story. Update the existing one.
2. If a source URL already appears above, we have used it. Find a new development or skip.
3. A follow-up is allowed only with a materially new fact (reopening, charges, cause, fatality, official report).
4. Never publish the same story in two towns. One story, one canonical URL.
`);
