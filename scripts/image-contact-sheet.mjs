#!/usr/bin/env node
/**
 * Build labeled contact sheets for visual review of story images.
 *
 *   npm run images:sheet
 *   npm run images:sheet -- --slug york-at-mile-353 --out /tmp/i80-images
 *   npm run stock -- --query "truck stop" --json > .cache/candidates.json
 *   npm run images:sheet -- --manifest .cache/candidates.json
 *
 * The sheet is deliberately simple: a readable grid plus a JSON manifest.
 * A vision-capable reviewer can open the JPEGs; an editor can use the
 * manifest to match an index back to the exact post, source and caption.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { readStoryFile } from "../lib/story.mjs";

const args = process.argv.slice(2);
function arg(name, fallback = null) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const onlySlug = arg("slug");
const candidateFile = arg("manifest");
const outDir = path.resolve(
  process.cwd(),
  arg("out", candidateFile ? ".cache/image-candidates" : ".cache/image-review"),
);
const perPage = Math.max(1, Number(arg("per-page", "6")));
const columns = Math.max(1, Math.min(3, Number(arg("columns", "2"))));
const candidateLimit = Math.max(1, Number(arg("limit", "12")));
const tileW = 620;
const tileH = 349;
const labelH = 82;
const gap = 18;
const margin = 24;
const headerH = 76;
const footerH = 36;
const sheetW = margin * 2 + columns * tileW + (columns - 1) * gap;

const postsDir = path.join(process.cwd(), "content", "posts");
const items = [];
let mode = "audit";

if (candidateFile) {
  mode = "candidates";
  const manifestPath = path.resolve(process.cwd(), candidateFile);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Candidate manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const results = (payload.results ?? payload.images ?? []).slice(0, candidateLimit);
  for (const [index, result] of results.entries()) {
    const remote = result.thumbnail || result.imageUrl;
    if (!remote) continue;
    items.push({
      kind: "candidate",
      candidateIndex: index + 1,
      title: String(result.title || result.alt || "Untitled"),
      alt: String(result.alt || ""),
      caption: `${result.creator || "Unknown"} · ${result.license || "Unknown"} · ${result.width || "?"}×${result.height || "?"}`,
      credit: String(result.creator || ""),
      license: String(result.license || ""),
      remote,
      fallback: String(result.imageUrl || ""),
      sourceUrl: String(result.sourceUrl || ""),
      imageUrl: String(result.imageUrl || ""),
      query: String(payload.query || ""),
      provider: String(payload.provider || ""),
    });
  }
} else {
  const files = fs
    .readdirSync(postsDir)
    .filter((file) => /\.mdx?$/.test(file))
    .sort();

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    if (onlySlug && slug !== onlySlug) continue;
    const story = readStoryFile(path.join(postsDir, file));
    for (const [index, image] of story.images.entries()) {
      if (!image.src.startsWith("/")) continue;
      const full = path.join(process.cwd(), "public", image.src.replace(/^\//, ""));
      if (!fs.existsSync(full)) continue;
      items.push({
        kind: "audit",
        slug,
        imageIndex: index + 1,
        src: image.src,
        full,
        alt: image.alt,
        caption: image.caption ?? "",
        credit: image.credit ?? "",
        license: image.license ?? "",
      });
    }

  }
}

if (!items.length) {
  console.error(
    candidateFile
      ? "No usable candidate thumbnails in the manifest."
      : "No local story images found.",
  );
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function truncate(value, length) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

function lines(value, width, maxLines) {
  const words = String(value || "").replace(/\s+/g, " ").trim().split(" ");
  const out = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      out.push(current);
      current = word;
      if (out.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (out.length < maxLines && current) out.push(current);
  if (out.length === maxLines) {
    const joined = out.join(" ");
    const full = words.join(" ");
    if (joined.length < full.length) {
      out[maxLines - 1] = `${out[maxLines - 1].replace(/[.,;:!?]?$/, "")}…`;
    }
  }
  return out;
}

const pages = [];
for (let start = 0; start < items.length; start += perPage) {
  pages.push(items.slice(start, start + perPage));
}

const manifest = {
  generatedAt: new Date().toISOString(),
  mode,
  source: mode === "candidates" ? candidateFile : "content/posts",
  count: items.length,
  pages: [],
  images: items.map((item, index) =>
    mode === "candidates"
      ? {
          index: index + 1,
          title: item.title,
          alt: item.alt,
          caption: item.caption,
          creator: item.credit,
          license: item.license,
          imageUrl: item.imageUrl,
          thumbnail: item.remote,
          sourceUrl: item.sourceUrl,
          query: item.query,
          provider: item.provider,
        }
      : {
          index: index + 1,
          slug: item.slug,
          image: item.imageIndex,
          src: item.src,
          alt: item.alt,
          caption: item.caption,
          credit: item.credit,
          license: item.license,
        },
  ),
};

for (const [pageIndex, page] of pages.entries()) {
  const composites = [];
  const labels = [];
  const pageRows = Math.ceil(page.length / columns);
  const sheetH =
    headerH +
    pageRows * (tileH + labelH) +
    (pageRows - 1) * gap +
    margin +
    footerH;

  for (const [localIndex, item] of page.entries()) {
    const col = localIndex % columns;
    const row = Math.floor(localIndex / columns);
    const x = margin + col * (tileW + gap);
    const y = headerH + row * (tileH + labelH + gap);
    const number = items.indexOf(item) + 1;

    let input = item.full;
    if (!input) {
      let response = await fetch(item.remote, {
        headers: { "User-Agent": "I80Things/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok && item.fallback && item.fallback !== item.remote) {
        response = await fetch(item.fallback, {
          headers: { "User-Agent": "I80Things/1.0" },
          signal: AbortSignal.timeout(20000),
        });
      }
      if (!response.ok) {
        console.error(`Could not fetch candidate ${item.candidateIndex}: HTTP ${response.status}`);
        continue;
      }
      input = Buffer.from(await response.arrayBuffer());
    }
    const image = await sharp(input)
      .rotate()
      .resize(tileW, tileH, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    composites.push({ input: image, left: x, top: y });

    const title =
      item.kind === "candidate"
        ? truncate(item.title, 72)
        : truncate(`${item.slug} #${item.imageIndex}`, 72);
    const captionLines = lines(
      item.caption || item.alt || "No caption",
      86,
      2,
    );
    labels.push(`
      <rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" fill="none" stroke="#c9c0ad" stroke-width="1"/>
      <rect x="${x}" y="${y + tileH}" width="${tileW}" height="${labelH}" fill="#f4efe3" stroke="#c9c0ad" stroke-width="1"/>
      <rect x="${x + 10}" y="${y + 10}" width="42" height="24" fill="#1f6b45"/>
      <text x="${x + 31}" y="${y + 27}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#f4efe3">${String(number).padStart(2, "0")}</text>
      <text x="${x + 12}" y="${y + tileH + 23}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#1c1b18">${esc(title)}</text>
      ${captionLines
        .map(
          (line, i) =>
            `<text x="${x + 12}" y="${y + tileH + 43 + i * 16}" font-family="Arial, sans-serif" font-size="12" fill="#5f5b52">${esc(line)}</text>`,
        )
        .join("")}
    `);
  }

  const header = `
    <text x="${margin}" y="36" font-family="Georgia, serif" font-size="24" font-weight="700" fill="#1c1b18">I-80 Things · image ${mode === "candidates" ? "candidates" : "audit"}</text>
    <text x="${sheetW - margin}" y="35" text-anchor="end" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1" fill="#5f5b52">PAGE ${pageIndex + 1} / ${pages.length} · ${items.length} IMAGES</text>
    <line x1="${margin}" y1="50" x2="${sheetW - margin}" y2="50" stroke="#1c1b18" stroke-width="2"/>
    <text x="${margin}" y="${sheetH - 16}" font-family="Arial, sans-serif" font-size="10" fill="#5f5b52">Review subject match, crop, visible text, people and caption support. Manifest: ${mode === "candidates" ? "candidates-manifest.json" : "manifest.json"}</text>
  `;

  const overlay = `<svg width="${sheetW}" height="${sheetH}" xmlns="http://www.w3.org/2000/svg">
    ${header}
    ${labels.join("")}
  </svg>`;

  const filename = `contact-${String(pageIndex + 1).padStart(2, "0")}.jpg`;
  const output = path.join(outDir, filename);
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: "#f4efe3",
    },
  })
    .composite([...composites, { input: Buffer.from(overlay), left: 0, top: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(output);

  manifest.pages.push({
    page: pageIndex + 1,
    file: filename,
    images: page.map((item) => items.indexOf(item) + 1),
  });
  console.log(`${output}  (${page.length} images)`);
}

const manifestName =
  mode === "candidates" ? "candidates-manifest.json" : "manifest.json";
fs.writeFileSync(
  path.join(outDir, manifestName),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`\n${items.length} images · ${pages.length} pages`);
console.log(`Manifest: ${path.join(outDir, manifestName)}`);
