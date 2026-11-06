#!/usr/bin/env node
/**
 * Audit every story image before it reaches a reader.
 *
 *   npm run images:audit
 *   npm run --silent images:audit -- --json
 *
 * Checks: file exists, dimensions, aspect ratio, file size, alt text, credit,
 * Instagram selection, social crop and duplicate bytes across stories.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const postsDir = path.join(process.cwd(), "content", "posts");
const files = fs
  .readdirSync(postsDir)
  .filter((file) => /\.mdx?$/.test(file))
  .sort();

const images = [];
const hashes = new Map();

for (const file of files) {
  const slug = file.replace(/\.mdx?$/, "");
  const { data } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
  const gallery = Array.isArray(data.images) ? data.images : [];
  const list = gallery.length
    ? gallery
    : data.image
      ? [
          {
            src: data.image,
            alt: data.imageAlt,
            credit: data.imageCredit,
            creditUrl: data.imageCreditUrl,
            license: data.imageLicense,
            licenseUrl: data.imageLicenseUrl,
            instagram: true,
          },
        ]
      : [];

  for (const [index, image] of list.entries()) {
    const src = typeof image?.src === "string" ? image.src.trim() : "";
    const local = src.startsWith("/") && !src.startsWith("/api/");
    const full = local
      ? path.join(process.cwd(), "public", src.replace(/^\//, ""))
      : null;
    const issues = [];
    let dimensions = null;
    let bytes = null;
    let hash = null;

    if (!src) {
      issues.push("missing src");
    } else if (local) {
      if (!fs.existsSync(full)) {
        issues.push("file not found");
      } else {
        const stat = fs.statSync(full);
        bytes = stat.size;
        hash = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
        try {
          const meta = await sharp(full).metadata();
          dimensions = { width: meta.width ?? null, height: meta.height ?? null };
          if (!meta.width || !meta.height) {
            issues.push("unreadable dimensions");
          } else {
            if (meta.width < 1200) issues.push("narrow: under 1200px");
            const ratio = meta.width / meta.height;
            if (Math.abs(ratio - 16 / 9) > 0.08) {
              issues.push(`aspect ${ratio.toFixed(2)}:1 (cards are 16:9)`);
            }
          }
        } catch {
          issues.push("sharp could not read file");
        }
        if (bytes > 500 * 1024) issues.push("large: over 500 KB");
      }
    }

    if (!image?.alt || !String(image.alt).trim()) issues.push("missing alt text");
    if (!image?.credit) issues.push("missing credit");
    if (image?.credit && !image?.creditUrl) issues.push("credit has no source URL");
    if (!image?.license) issues.push("missing license");
    if (image?.license && !image?.licenseUrl) issues.push("license has no URL");
    if (image?.socialSrc) {
      const socialFull = path.join(
        process.cwd(),
        "public",
        String(image.socialSrc).replace(/^\//, ""),
      );
      if (!fs.existsSync(socialFull)) issues.push("socialSrc file not found");
    }

    if (hash) {
      const previous = hashes.get(hash);
      if (previous) {
        issues.push(`duplicate of ${previous.slug} image ${previous.index + 1}`);
      } else {
        hashes.set(hash, { slug, index });
      }
    }

    images.push({
      slug,
      index: index + 1,
      src,
      alt: image?.alt ?? "",
      credit: image?.credit ?? "",
      creditUrl: image?.creditUrl ?? "",
      license: image?.license ?? "",
      licenseUrl: image?.licenseUrl ?? "",
      socialSrc: image?.socialSrc ?? null,
      instagram: Boolean(image?.instagram),
      dimensions,
      bytes,
      issues,
    });
  }
}

const summary = {
  stories: files.length,
  images: images.length,
  withIssues: images.filter((image) => image.issues.length).length,
  missingAlt: images.filter((image) => image.issues.includes("missing alt text")).length,
  missingCredit: images.filter((image) => image.issues.includes("missing credit")).length,
  missingLicense: images.filter((image) => image.issues.includes("missing license")).length,
  duplicates: images.filter((image) => image.issues.some((issue) => issue.startsWith("duplicate of"))).length,
};

if (asJson) {
  console.log(JSON.stringify({ summary, images }, null, 2));
  process.exit(images.some((image) => image.issues.length) ? 1 : 0);
}

console.log(`\nIMAGE AUDIT — ${summary.images} images across ${summary.stories} stories\n`);
for (const image of images) {
  const size = image.dimensions
    ? `${image.dimensions.width}x${image.dimensions.height}`
    : "unknown";
  const kb = image.bytes ? `${Math.round(image.bytes / 1024)}KB` : "";
  console.log(`[${image.slug} #${image.index}] ${size} ${kb}`);
  console.log(`  ${image.src}`);
  if (image.issues.length) {
    for (const issue of image.issues) console.log(`  ! ${issue}`);
  } else {
    console.log("  OK");
  }
}

console.log(`
SUMMARY
  ${summary.images} images
  ${summary.withIssues} with issues
  ${summary.missingAlt} missing alt
  ${summary.missingCredit} missing credit
  ${summary.missingLicense} missing license
  ${summary.duplicates} duplicates
`);

process.exit(images.some((image) => image.issues.length) ? 1 : 0);
