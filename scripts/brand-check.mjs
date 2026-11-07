#!/usr/bin/env node
/**
 * Brand regression guard.
 *
 * Fails when:
 *  - app/globals.css tokens drift from lib/brand.mjs
 *  - app/icon.svg is not exactly what `npm run brand` would write
 *  - a committed raster asset is the wrong size
 *  - any badge asset has paper-colored ink in its outer band (the clipped-
 *    wordmark failure mode)
 *  - a component hand-rolls the `INTERSTATE` lockup again
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  brand,
  brandColors,
  brandIconSvg,
} from "../lib/brand.mjs";

const root = process.cwd();
const problems = [];

const kebab = (value) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

// 1. CSS tokens are the styling source; brand.mjs is the asset source.
const css = await fs.readFile(path.join(root, "app", "globals.css"), "utf8");
const tokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [
    m[1],
    m[2].toLowerCase(),
  ]),
);
for (const [key, value] of Object.entries(brandColors)) {
  const token = tokens.get(kebab(key));
  if (!token) {
    problems.push(`globals.css is missing --color-${kebab(key)} (${value})`);
  } else if (token !== value.toLowerCase()) {
    problems.push(
      `globals.css --color-${kebab(key)} is ${token}, brand.mjs says ${value}`,
    );
  }
}

// 2. The favicon is generated, never edited by hand.
const iconPath = path.join(root, "app", "icon.svg");
const icon = (await fs.readFile(iconPath, "utf8")).trim();
if (icon !== brandIconSvg({ size: brand.icon.size }).trim()) {
  problems.push("app/icon.svg is stale — run `npm run brand`");
}

// 3. Raster assets exist at the size the app expects.
const assets = [
  { file: "logo.png", width: 512, height: 512 },
  { file: "logo-180.png", width: 180, height: 180 },
  { file: "mark.png", width: 168, height: 132 },
  { file: "og-default.jpg", width: 1200, height: 630 },
];

for (const asset of assets) {
  const file = path.join(root, "public", "brand", asset.file);
  try {
    const meta = await sharp(file).metadata();
    if (meta.width !== asset.width || meta.height !== asset.height) {
      problems.push(
        `${asset.file} is ${meta.width}×${meta.height}, expected ${asset.width}×${asset.height}`,
      );
    }
  } catch {
    problems.push(`public/brand/${asset.file} is missing — run \`npm run brand\``);
  }
}

// 4. No paper-colored ink in the outer 2px of a badge: that is where the old
//    HTML lockup used to bleed the wordmark's first and last letters.
const paperish = (r, g, b) => r > 200 && g > 200 && b > 190;
for (const file of ["logo.png", "logo-180.png", "mark.png"]) {
  const source = path.join(root, "public", "brand", file);
  let raw;
  try {
    raw = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  } catch {
    continue;
  }
  const { data, info } = raw;
  const band = 2;
  let hits = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const edge =
        x < band || y < band || x >= info.width - band || y >= info.height - band;
      if (!edge) continue;
      const i = (y * info.width + x) * 4;
      if (data[i + 3] < 8) continue;
      if (paperish(data[i], data[i + 1], data[i + 2])) hits++;
    }
  }
  if (hits > 0) {
    problems.push(
      `${file} has ${hits} paper-colored pixels on its outer edge — the wordmark is clipping`,
    );
  }
}

// 5. Components must use <BrandMark>, not their own badge markup.
const sourceDirs = ["app", "components", "lib"];
const offenders = [];
for (const dir of sourceDirs) {
  for (const file of await walk(path.join(root, dir))) {
    if (!/\.(tsx?|jsx?|mjs)$/.test(file)) continue;
    if (file.endsWith(path.join("lib", "brand.mjs"))) continue;
    const text = await fs.readFile(file, "utf8");
    if (text.includes(brand.markLabel)) offenders.push(path.relative(root, file));
  }
}
if (offenders.length) {
  problems.push(
    `hand-rolled "${brand.markLabel}" lockup in ${offenders.join(", ")} — use components/BrandMark`,
  );
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

if (problems.length) {
  console.error("Brand check failed:\n");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

console.log(
  `Brand check passed: ${Object.keys(brandColors).length} tokens, ` +
    `${assets.length} assets, no clipped wordmark.`,
);
