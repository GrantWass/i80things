#!/usr/bin/env node
/**
 * Validate every post before deploy.
 *
 *   npm run validate
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseStory, publishVerdict } from "../lib/story.mjs";

const postsDir = path.join(process.cwd(), "content", "posts");
const placesSource = fs.readFileSync(path.join(process.cwd(), "data", "places.ts"), "utf8");
const topicsSource = fs.readFileSync(path.join(process.cwd(), "data", "topics.ts"), "utf8");

const validCities = new Set(["statewide", ...[...placesSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1])]);
const validTopics = new Set([...topicsSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
const files = fs.readdirSync(postsDir).filter((f) => /\.mdx?$/.test(f));
const errors = [];
const warnings = [];
const titles = new Map();

for (const file of files) {
  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  let data;
  let content;
  try {
    ({ data, content } = matter(raw));
  } catch (error) {
    errors.push(`content/posts/${file}: invalid YAML frontmatter — ${error.message.split("\n")[0]}`);
    console.log(`✗ ${file}`);
    continue;
  }
  const slug = file.replace(/\.mdx?$/, "");
  const at = `content/posts/${file}`;

  const story = parseStory(raw, { path: file });
  const verdict = publishVerdict(story, { mode: "draft" });
  for (const message of verdict.errors) errors.push(`${at}: ${message}`);
  for (const message of verdict.warnings) warnings.push(`${at}: ${message}`);

  if (!data.city || !validCities.has(data.city)) errors.push(`${at}: invalid city "${data.city}"`);
  if (!Array.isArray(data.topics) || data.topics.length === 0) errors.push(`${at}: add at least one topic`);
  for (const topic of data.topics ?? []) {
    if (!validTopics.has(topic)) errors.push(`${at}: unknown topic "${topic}"`);
  }
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    errors.push(`${at}: add at least one primary source`);
  }
  for (const source of data.sources ?? []) {
    if (!source.name || !/^https?:\/\//.test(source.url ?? "")) {
      errors.push(`${at}: source needs a name and http(s) URL`);
    }
  }
  if (content.length < 600) warnings.push(`${at}: body is only ${content.length} characters`);
  if (/Confirmed fact one|Lead paragraph: what happened|TODO|TKTK/i.test(content)) {
    errors.push(`${at}: template placeholder text still present`);
  }
  if (data.image && data.image.startsWith("/") && !data.image.startsWith("/api/")) {
    const imagePath = path.join(process.cwd(), "public", data.image.replace(/^\//, ""));
    if (!fs.existsSync(imagePath)) errors.push(`${at}: image not found at public${data.image}`);
  }
  if (data.images !== undefined) {
    if (!Array.isArray(data.images) || data.images.length === 0) {
      errors.push(`${at}: "images" must be a non-empty array`);
    } else {
      data.images.forEach((image, index) => {
        const label = `${at}: images[${index}]`;
        if (!image || typeof image.src !== "string" || !image.src.trim()) {
          errors.push(`${label}: missing src`);
          return;
        }
        if (image.src.startsWith("/") && !image.src.startsWith("/api/")) {
          const imagePath = path.join(process.cwd(), "public", image.src.replace(/^\//, ""));
          if (!fs.existsSync(imagePath)) errors.push(`${label}: image not found at public${image.src}`);
        }
        if (image.socialSrc && image.socialSrc.startsWith("/") && !image.socialSrc.startsWith("/api/")) {
          const socialPath = path.join(process.cwd(), "public", image.socialSrc.replace(/^\//, ""));
          if (!fs.existsSync(socialPath)) errors.push(`${label}: socialSrc not found at public${image.socialSrc}`);
        }
        if (image.instagram !== undefined && typeof image.instagram !== "boolean") {
          errors.push(`${label}: "instagram" must be true or false`);
        }
      });
      if (!data.images.some((image) => image && image.instagram)) {
        warnings.push(`${at}: no images marked for Instagram — will default to the cover`);
      }
    }
  }
  if (titles.has(data.title)) {
    errors.push(`${at}: duplicate title with ${titles.get(data.title)}`);
  } else {
    titles.set(data.title, file);
  }
  if (!data.instagramCaption && (!data.title || !data.dek)) {
    warnings.push(`${at}: no Instagram caption and not enough metadata to generate one`);
  }
  console.log(`✓ ${slug}`);
}

console.log(`\n${files.length} posts checked.`);
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length})`);
  for (const warning of warnings) console.log(`  ! ${warning}`);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length})`);
  for (const error of errors) console.log(`  ✗ ${error}`);
  process.exit(1);
}
console.log("\nAll posts valid.\n");
