#!/usr/bin/env node
/**
 * Generate the raster brand assets used in Organization schema and RSS.
 * Run once after cloning, or when the brand changes:
 *
 *   node scripts/generate-brand.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "brand");
await fs.mkdir(outDir, { recursive: true });

const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="72" fill="#14432f"/>
  <rect x="28" y="28" width="456" height="456" rx="52" fill="none" stroke="#f7f4ec" stroke-width="14"/>
  <text x="256" y="196" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="bold" letter-spacing="9" fill="#f7f4ec">INTERSTATE</text>
  <text x="256" y="390" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="240" font-weight="bold" fill="#f7f4ec">80</text>
</svg>`;

const banner = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f4ec"/>
  <rect width="1200" height="14" fill="#14432f"/>
  <rect x="72" y="88" width="110" height="100" rx="8" fill="#14432f"/>
  <text x="127" y="124" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" letter-spacing="3" fill="#f7f4ec">INTERSTATE</text>
  <text x="127" y="176" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#f7f4ec">80</text>
  <text x="206" y="132" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#14150f">I-80 Things</text>
  <text x="207" y="166" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="4" fill="#5d6155">NEBRASKA CORRIDOR NEWS</text>
  <text x="72" y="330" font-family="Georgia, serif" font-size="74" font-weight="bold" fill="#14150f">Nebraska's I-80</text>
  <text x="72" y="412" font-family="Georgia, serif" font-size="74" font-weight="bold" fill="#14150f">corridor, covered daily.</text>
  <text x="72" y="474" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#5d6155">Crashes, closures, weather and construction from Omaha to Kimball.</text>
  <rect x="72" y="530" width="330" height="52" fill="#e3a008"/>
  <text x="237" y="563" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" letter-spacing="2" fill="#14150f">I80THINGS.COM</text>
  <text x="1128" y="590" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="16" letter-spacing="3" fill="#5d6155">VERIFIED SOURCES</text>
</svg>`;

await sharp(Buffer.from(icon)).png().toFile(path.join(outDir, "logo.png"));
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile(path.join(outDir, "logo-180.png"));
await sharp(Buffer.from(banner)).jpeg({ quality: 90 }).toFile(path.join(outDir, "og-default.jpg"));

console.log("Wrote public/brand/logo.png, logo-180.png and og-default.jpg");
