#!/usr/bin/env node
/**
 * Generate every brand asset from lib/brand.mjs.
 *
 * Run after changing the mark, palette or copy:
 *
 *   npm run brand
 *
 * `npm run brand:check` fails CI when a committed asset drifts from the source.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  brand,
  brandColors,
  brandIconSvg,
  brandMarkSvg,
} from "../lib/brand.mjs";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
await fs.mkdir(brandDir, { recursive: true });

// Favicon: Next reads app/icon.svg directly.
const icon = `${brandIconSvg({ size: 64 })}\n`;
await fs.writeFile(path.join(root, "app", "icon.svg"), icon);

// PWA / Organization schema / Instagram profile image. The crest mark, not
// the plain favicon: at these sizes the state and cobs are legible.
const iconLarge = Buffer.from(brandIconSvg({ size: 512, crest: true }));
await sharp(iconLarge).png().toFile(path.join(brandDir, "logo.png"));
await sharp(iconLarge).resize(180, 180).png().toFile(path.join(brandDir, "logo-180.png"));

// Profile picture: the crest on white, zoomed out so a circular avatar crop
// never touches the badge edges. 1024 square, mark at 66%.
const profileSize = 1024;
const profileMark = 680;
const profileMargin = (profileSize - profileMark) / 2;
const profileBadge = await sharp(Buffer.from(brandIconSvg({ size: 1024, crest: true })))
  .resize(profileMark, profileMark)
  .png()
  .toBuffer();
const profile = await sharp({
  create: {
    width: profileSize,
    height: profileSize,
    channels: 4,
    background: "#ffffff",
  },
})
  .composite([{ input: profileBadge, left: profileMargin, top: profileMargin }])
  .png()
  .toBuffer();
await fs.writeFile(path.join(brandDir, "profile-white.png"), profile);
await sharp(profile)
  .resize(512, 512)
  .png()
  .toFile(path.join(brandDir, "profile-white-512.png"));

// Raster lockup for OG and Instagram cards, which cannot be trusted to
// typeset the wordmark themselves. 168×132 = 3× the 56×44 mark.
const mark = await sharp(Buffer.from(brandMarkSvg({ size: 132 })))
  .png()
  .toBuffer();
await fs.writeFile(path.join(brandDir, "mark.png"), mark);

const banner = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${brandColors.paper}"/>
  <rect width="1200" height="14" fill="${brandColors.highway}"/>
  <text x="206" y="132" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="${brandColors.ink}">${brand.name}</text>
  <text x="207" y="166" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="4" fill="${brandColors.slate}">${brand.descriptor.toUpperCase()}</text>
  <text x="72" y="330" font-family="Georgia, serif" font-size="74" font-weight="bold" fill="${brandColors.ink}">Nebraska's I-80</text>
  <text x="72" y="412" font-family="Georgia, serif" font-size="74" font-weight="bold" fill="${brandColors.ink}">corridor, covered daily.</text>
  <text x="72" y="474" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="${brandColors.slate}">Crashes, closures, weather and construction from Omaha to Kimball.</text>
  <rect x="72" y="530" width="330" height="52" fill="${brandColors.amber}"/>
  <text x="237" y="563" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" letter-spacing="2" fill="${brandColors.ink}">I80THINGS.COM</text>
  <text x="1128" y="590" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="16" letter-spacing="3" fill="${brandColors.slate}">VERIFIED SOURCES</text>
</svg>`;

// The badge is composited from the shared PNG so the banner cannot drift from
// the mark either.
const bannerBase = await sharp(Buffer.from(banner)).png().toBuffer();
const badge = await sharp(mark).resize({ width: 110 }).png().toBuffer();
await sharp(bannerBase)
  .composite([{ input: badge, left: 72, top: 88 }])
  .jpeg({ quality: 90 })
  .toFile(path.join(brandDir, "og-default.jpg"));

console.log(
  "Wrote app/icon.svg, public/brand/logo.png, logo-180.png, mark.png and og-default.jpg",
);
