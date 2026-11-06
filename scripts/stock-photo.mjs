#!/usr/bin/env node
/**
 * Find and import a real, commercially usable photo for a story.
 *
 *   npm run stock -- --query "Omaha skyline" --slug i-80-omaha-exits
 *   npm run stock -- --query "Nebraska winter road" --slug winter-driving-i-80 --download --index 1
 *   npm run stock -- --query "Kearney Nebraska" --slug kearney-i-80-midpoint-stop --download --update
 *   npm run stock -- --url "https://…/photo.jpg" --credit "Photo: Name / Source (CC BY 4.0)" \
 *     --source-url "https://…" --alt "Description" --slug <slug> --download --update
 *
 * Providers:
 *   - Openverse (default): keyless, CC0 / public domain, Wikimedia + Flickr sources.
 *   - Pexels: set PEXELS_API_KEY for a much larger modern stock library.
 *
 * Prefer CC0/PDM. If you use CC BY/BY-SA, keep the credit, license and source
 * URL. Never use a photo you cannot license for commercial use. Never use
 * AI-generated imagery of real events.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const args = process.argv.slice(2);
function arg(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : null;
}

const query = arg("query");
const slug = arg("slug");
const directUrl = arg("url");
const directCredit = arg("credit");
const directSourceUrl = arg("source-url");
const directAlt = arg("alt");
const indexArg = arg("index") ? Number(arg("index")) : 1;
const shouldDownload = args.includes("--download");
const shouldUpdate = args.includes("--update");
const asJson = args.includes("--json");
const providerArg = args.find((a) => a.startsWith("--provider="));
const provider = providerArg
  ? providerArg.split("=")[1]
  : process.env.PEXELS_API_KEY
    ? "pexels"
    : "openverse";

if (!query && !directUrl) {
  console.error('Usage: npm run stock -- --query "Omaha skyline" [--slug <slug>] [--download --index 1] [--update]');
  console.error('   or: npm run stock -- --url "https://…" --credit "Photo: …" --slug <slug> --download --update');
  process.exit(1);
}

const UA = "I80Things/1.0 (+https://i80things.com; hello@i80things.com)";

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

async function searchOpenverse() {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("license", "cc0,pdm");
  url.searchParams.set("page_size", "20");
  url.searchParams.set("mature", "false");
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const data = await res.json();
  return (data.results ?? [])
    .filter((item) => item.url && item.width >= 1000 && item.height >= 600)
    .map((item) => ({
      title: clean(item.title || "Untitled"),
      creator: clean(item.creator || "Unknown"),
      license: (item.license || "").toUpperCase(),
      licenseUrl: item.license_url || "",
      sourceUrl: item.foreign_landing_url || item.detail_url || item.url,
      imageUrl: item.url,
      thumbnail: item.thumbnail,
      width: item.width,
      height: item.height,
      provider: "Openverse",
      alt: clean(item.title || query),
    }));
}

async function searchPexels() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY is not set.");
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "20");
  url.searchParams.set("orientation", "landscape");
  const res = await fetch(url, { headers: { Authorization: key, Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const data = await res.json();
  return (data.photos ?? []).map((photo) => ({
    title: clean(photo.alt || query),
    creator: clean(photo.photographer || "Pexels photographer"),
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    sourceUrl: photo.url,
    imageUrl: photo.src?.large2x || photo.src?.original,
    thumbnail: photo.src?.medium,
    width: photo.width,
    height: photo.height,
    provider: "Pexels",
    alt: clean(photo.alt || query),
  }));
}

let results = [];
if (directUrl) {
  results = [{
    title: directAlt || query || "Photo",
    creator: directCredit || "Unknown",
    license: "See source",
    licenseUrl: directSourceUrl || directUrl,
    sourceUrl: directSourceUrl || directUrl,
    imageUrl: directUrl,
    thumbnail: directUrl,
    width: 0,
    height: 0,
    provider: "Direct",
    alt: directAlt || query || "Nebraska",
    credit: directCredit,
  }];
  if (!directCredit) {
    console.error("Direct imports require --credit so the photo is attributed.");
    process.exit(1);
  }
} else {
  try {
    results = provider === "pexels" ? await searchPexels() : await searchOpenverse();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (!results.length) {
  console.error("No images found. Try a broader query or set PEXELS_API_KEY.");
  process.exit(1);
}

if (asJson) {
  console.log(JSON.stringify({ query: query || directAlt, provider, results }, null, 2));
  process.exit(0);
}

if (!directUrl) {
  console.log(`\nSTOCK IMAGES — "${query}" — ${provider}\n`);
  results.forEach((image, i) => {
    console.log(`[${i + 1}] ${image.title}`);
    console.log(`    ${image.creator} · ${image.license} · ${image.width}×${image.height}`);
    console.log(`    page: ${image.sourceUrl}`);
    console.log(`    file: ${image.imageUrl}`);
    console.log("");
  });
}

if (!shouldDownload) {
  console.log("Pick one with: npm run stock -- --query \"...\" --slug <slug> --download --index N [--update]\n");
  process.exit(0);
}

if (!slug) {
  console.error("--slug is required with --download.");
  process.exit(1);
}

const chosen = directUrl ? results[0] : results[Math.max(0, Math.min(results.length - 1, indexArg - 1))];
if (!chosen?.imageUrl) {
  console.error("That image has no downloadable URL.");
  process.exit(1);
}

const res = await fetch(chosen.imageUrl, {
  headers: { "User-Agent": UA, Accept: "image/*" },
  signal: AbortSignal.timeout(30000),
});
if (!res.ok) {
  console.error(`Download failed: HTTP ${res.status}`);
  process.exit(1);
}

const input = Buffer.from(await res.arrayBuffer());
const outDir = path.join(process.cwd(), "public", "images", "posts", slug);
fs.mkdirSync(outDir, { recursive: true });
const filename = `${Date.now()}-${slug.slice(0, 40)}.jpg`;
const outPath = path.join(outDir, filename);
await sharp(input)
  .rotate()
  .resize(1600, 900, { fit: "cover", position: "attention" })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(outPath);

const publicPath = `/images/posts/${slug}/${filename}`;
const credit = chosen.credit
  || `Photo: ${chosen.creator} / ${chosen.provider} (${chosen.license})`;

console.log(`\nWrote ${publicPath}\n`);
console.log("Add these to the story frontmatter:\n");
console.log(`image: "${publicPath}"`);
console.log(`imageAlt: "${chosen.alt.replace(/"/g, '\\"')}"`);
console.log(`imageCredit: "${credit.replace(/"/g, '\\"')}"`);
console.log(`imageCreditUrl: "${chosen.sourceUrl}"\n`);

if (shouldUpdate) {
  const postPath = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
  if (!fs.existsSync(postPath)) {
    console.error(`No post at ${postPath}. The image was saved but the frontmatter was not updated.`);
    process.exit(1);
  }
  const raw = fs.readFileSync(postPath, "utf8");
  const parsed = matter(raw);
  parsed.data.image = publicPath;
  parsed.data.imageAlt = chosen.alt;
  parsed.data.imageCredit = credit;
  parsed.data.imageCreditUrl = chosen.sourceUrl;
  fs.writeFileSync(postPath, matter.stringify(parsed.content, parsed.data));
  console.log(`Updated ${path.relative(process.cwd(), postPath)}`);
}
