/**
 * The story module. One ESM module owns a story in both directions:
 *
 *   readStoryFile(absPath)  frontmatter + body + derived fields
 *   parseStory(raw, { path })  the pure decode (no validation)
 *   writeStory(draft, options?)  validate, normalise, encode
 *   publishVerdict(story, { mode })  mode: "draft" | "publish"
 *
 * Defaults, normalisation and the publish rules live here so the reader
 * (`lib/content.ts`), the desk scripts (`scripts/validate-posts.mjs`,
 * `scripts/fact-check.mjs`) and the write route
 * (`app/api/admin/posts/route.ts`) cannot disagree. `gray-matter` stays the
 * encoder/decoder behind this module.
 *
 * @typedef {import("./story-types").Story} Story
 * @typedef {import("./story-types").StoryDraft} StoryDraft
 * @typedef {import("./story-types").Verdict} Verdict
 * @typedef {import("./story-types").WriteResult} WriteResult
 * @typedef {import("./story-types").WriteOptions} WriteOptions
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Fallback author when frontmatter names none. */
const DEFAULT_AUTHOR = "corridor-desk";

/** Fallback city when frontmatter names none. */
const DEFAULT_CITY = "statewide";

/** A date more than this far ahead counts as scheduled in error. */
const FUTURE_TOLERANCE_MS = 86400000;

/**
 * slugify mirrors lib/utils.ts. It is duplicated here (a few lines) because
 * this plain ESM module cannot import TypeScript.
 *
 * @param {string} input
 * @returns {string}
 */
function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function urlIsValid(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalise one gallery entry. Mirrors the historical reader: `alt` falls
 * back to the legacy `imageAlt` then the title, credit/license fall back to
 * the legacy top-level fields, and the cover (index 0) defaults to selected
 * for Instagram.
 *
 * @param {any} image
 * @param {any} fm
 * @param {number} index
 * @returns {import("./story-types").StoryImage | null}
 */
function normaliseGalleryImage(image, fm, index) {
  if (typeof image?.src !== "string" || !image.src.trim()) return null;
  return {
    src: image.src.trim(),
    alt: (image.alt || fm.imageAlt || fm.title || "").trim(),
    caption: image.caption?.trim() || undefined,
    credit: image.credit || fm.imageCredit,
    creditUrl: image.creditUrl || fm.imageCreditUrl,
    license: image.license || fm.imageLicense,
    licenseUrl: image.licenseUrl || fm.imageLicenseUrl,
    socialSrc: image.socialSrc,
    instagram: image.instagram ?? index === 0,
  };
}

/**
 * Pure decode: frontmatter + body + derived fields. Never validates; never
 * touches the disk. Throws on invalid YAML, like `gray-matter` does.
 *
 * @param {string} raw
 * @param {{ path?: string }} [options]
 * @returns {Story}
 */
export function parseStory(raw, { path: filePath } = {}) {
  const { data, content } = matter(raw);
  const fm = data ?? {};
  const base =
    typeof filePath === "string" ? filePath.split("/").pop() ?? "" : "";
  const slug = base.replace(/\.mdx?$/, "");

  const images = (Array.isArray(fm.images) ? fm.images : [])
    .map((image, index) => normaliseGalleryImage(image, fm, index))
    .filter((image) => image !== null);

  if (!images.length && fm.image) {
    images.push({
      src: fm.image,
      alt: (fm.imageAlt || fm.title || "").trim(),
      caption: undefined,
      credit: fm.imageCredit,
      creditUrl: fm.imageCreditUrl,
      license: fm.imageLicense,
      licenseUrl: fm.imageLicenseUrl,
      socialSrc: undefined,
      instagram: true,
    });
  }

  const cover = images[0];

  return {
    slug,
    title: fm.title ?? "",
    dek: fm.dek ?? "",
    seoTitle: fm.seoTitle,
    seoDescription: fm.seoDescription,
    date: fm.date ?? "",
    updated: fm.updated,
    author: fm.author || DEFAULT_AUTHOR,
    city: fm.city || DEFAULT_CITY,
    topics: fm.topics ?? [],
    tags: fm.tags ?? [],
    mileMarker: fm.mileMarker,
    image: cover?.src ?? fm.image,
    imageAlt: cover?.alt ?? fm.imageAlt,
    imageCredit: cover?.credit ?? fm.imageCredit,
    imageCreditUrl: cover?.creditUrl ?? fm.imageCreditUrl,
    imageLicense: cover?.license ?? fm.imageLicense,
    imageLicenseUrl: cover?.licenseUrl ?? fm.imageLicenseUrl,
    images,
    summary: fm.summary ?? [],
    sources: fm.sources ?? [],
    featured: fm.featured ?? false,
    draft: fm.draft ?? false,
    instagramCaption: fm.instagramCaption,
    body: content,
  };
}

/**
 * Read one story file off disk.
 *
 * @param {string} absPath
 * @returns {Story}
 */
export function readStoryFile(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  return parseStory(raw, { path: path.basename(absPath) });
}

/**
 * The publish gate. Owns the structural publish rules so the draft gate and
 * the publish gate cannot contradict each other:
 *
 * - `mode: "draft"`: a story with `draft: true` is valid (a warning notes it
 *   stays off the site).
 * - `mode: "publish"`: a story with `draft: true` is an error.
 *
 * Summary bullets: fewer than 2 is an error; fewer than 3 is a warning.
 *
 * @param {Story} story
 * @param {{ mode?: "draft" | "publish" }} [options]
 * @returns {Verdict}
 */
export function publishVerdict(story, { mode } = {}) {
  const errors = [];
  const warnings = [];
  const gate = mode === "publish" ? "publish" : "draft";

  if (!story || typeof story !== "object") {
    return { ok: false, errors: ["missing story"], warnings };
  }

  if (!story.slug) errors.push("missing slug");

  const title = typeof story.title === "string" ? story.title : "";
  if (!title.trim()) {
    errors.push("missing title");
  } else if (title.trim().length < 8) {
    errors.push("title is too short (at least 8 characters)");
  }

  if (!story.dek) errors.push("missing dek");

  const dateValue = new Date(story.date);
  if (!story.date || Number.isNaN(dateValue.getTime())) {
    errors.push("invalid or missing date");
  } else if (dateValue.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
    errors.push("date is more than a day in the future");
  }

  const summary = Array.isArray(story.summary) ? story.summary : [];
  if (summary.length < 2) {
    errors.push('add at least 2 "short version" bullets');
  } else if (summary.length < 3) {
    warnings.push("summary should have at least three bullets");
  }

  const gallery = Array.isArray(story.images) ? story.images : [];
  gallery.forEach((image, index) => {
    const n = index + 1;
    if (!image || typeof image.src !== "string" || !image.src.trim()) {
      errors.push(`image ${n}: missing src`);
      return;
    }
    if (!image.alt || !String(image.alt).trim()) {
      errors.push(`image ${n}: missing alt`);
    }
    if (!image.credit) {
      errors.push(`image ${n}: missing credit`);
    } else if (!image.creditUrl) {
      errors.push(`image ${n}: missing credit URL`);
    }
    if (!image.license) {
      errors.push(`image ${n}: missing license`);
    } else if (!image.licenseUrl) {
      errors.push(`image ${n}: missing license URL`);
    }
    if (image.licenseUrl && !urlIsValid(image.licenseUrl)) {
      errors.push(`image ${n}: invalid license URL`);
    }
  });

  if (story.image && gallery.length === 0) {
    if (!story.imageAlt) errors.push("legacy image: missing alt");
    if (!story.imageCredit) errors.push("legacy image: missing credit");
    if (story.imageCredit && !story.imageCreditUrl) {
      errors.push("legacy image: missing credit URL");
    }
    if (!story.imageLicense) errors.push("legacy image: missing license");
    if (story.imageLicense && !story.imageLicenseUrl) {
      errors.push("legacy image: missing license URL");
    }
  }

  if (gate === "publish") {
    if (story.draft) errors.push("draft: true in a publish run");
  } else if (story.draft) {
    warnings.push("draft — will not appear on the site");
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Sanitize the compose-form gallery. Mirrors the historical write route:
 * keep entries with a usable src (`/images/…` or `https://…`), cap at ten,
 * fall back to the headline for missing alt text.
 *
 * @param {unknown} input
 * @param {string} title
 * @returns {Array<Record<string, unknown>>}
 */
function sanitizeImages(input, title) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((image) => typeof image?.src === "string" && image.src.trim())
    .filter((image) => {
      const src = image.src.trim();
      return src.startsWith("/images/") || src.startsWith("https://");
    })
    .slice(0, 10)
    .map((image) => {
      const src = image.src.trim();
      const alt = (image.alt ?? "").trim() || title;
      const caption = (image.caption ?? "").trim();
      const credit = (image.credit ?? "").trim();
      const creditUrl = (image.creditUrl ?? "").trim();
      const license = (image.license ?? "").trim();
      const licenseUrl = (image.licenseUrl ?? "").trim();
      const socialSrc = (image.socialSrc ?? "").trim();
      return {
        src,
        alt,
        ...(caption ? { caption } : {}),
        ...(credit ? { credit } : {}),
        ...(creditUrl ? { creditUrl } : {}),
        ...(license ? { license } : {}),
        ...(licenseUrl ? { licenseUrl } : {}),
        ...(socialSrc ? { socialSrc } : {}),
        instagram: Boolean(image.instagram),
      };
    });
}

/**
 * Validate, normalise and encode a compose-form draft. The returned `errors`
 * reuse the write route's historical messages so its 400 responses are
 * unchanged. Slug collisions resolve against `options.slugExists`; city and
 * topics filter against the provided whitelists when given.
 *
 * @param {StoryDraft} draft
 * @param {WriteOptions} [options]
 * @returns {Promise<WriteResult>}
 */
export async function writeStory(draft, options = {}) {
  const input = draft ?? {};
  const errors = [];
  const warnings = [];

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const dek = typeof input.dek === "string" ? input.dek.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";

  if (!title || title.length < 8) {
    errors.push("A headline of at least 8 characters is required.");
  }
  if (!dek) {
    errors.push("A dek is required.");
  }
  if (!body || body.length < 200) {
    errors.push("The story body must be at least 200 characters.");
  }

  const { validCities, validTopics, slugExists } = options;
  const city =
    typeof input.city === "string" &&
    input.city &&
    (Array.isArray(validCities) ? validCities.includes(input.city) : true)
      ? input.city
      : DEFAULT_CITY;
  const topics = Array.isArray(input.topics)
    ? Array.isArray(validTopics)
      ? input.topics.filter((topic) => validTopics.includes(topic))
      : input.topics.filter((topic) => typeof topic === "string")
    : [];
  const tagSource = Array.isArray(input.tags)
    ? input.tags.map((tag) => String(tag))
    : String(input.tags ?? "").split(",");
  const tags = tagSource
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const summarySource = Array.isArray(input.summary)
    ? input.summary.map((item) => String(item))
    : String(input.summary ?? "").split("\n");
  const summary = summarySource
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
  const sources = (Array.isArray(input.sources) ? input.sources : [])
    .filter((source) => source?.name?.trim() && /^https?:\/\//.test(source?.url ?? ""))
    .slice(0, 12);

  const baseSlug = title ? slugify(title) : "";
  let slug = baseSlug;
  if (baseSlug && typeof slugExists === "function") {
    let suffix = 2;
    while (await slugExists(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
      if (suffix > 20) break;
    }
  }

  const publishedDate = input.date ? new Date(input.date) : new Date();
  if (Number.isNaN(publishedDate.getTime())) {
    errors.push("Invalid publication date.");
  }

  const storyPath = slug ? `content/posts/${slug}.mdx` : "";

  if (errors.length) {
    return { ok: false, errors, warnings, path: storyPath, content: "" };
  }

  /** @type {Record<string, unknown>} */
  const frontmatter = {
    title,
    dek,
    date: publishedDate.toISOString(),
    author: DEFAULT_AUTHOR,
    city,
    topics,
    tags,
    summary,
    sources: sources.map((source) => ({
      name: source.name.trim(),
      url: source.url,
    })),
    featured: Boolean(input.featured),
    draft: Boolean(input.draft),
  };

  if (input.images !== undefined) {
    const images = sanitizeImages(input.images, title);
    if (images.length) {
      frontmatter.images = images;
      const cover = images[0];
      frontmatter.image = cover.src;
      frontmatter.imageAlt = cover.alt;
      if (cover.credit) frontmatter.imageCredit = cover.credit;
      if (cover.creditUrl) frontmatter.imageCreditUrl = cover.creditUrl;
      if (cover.license) frontmatter.imageLicense = cover.license;
      if (cover.licenseUrl) frontmatter.imageLicenseUrl = cover.licenseUrl;
    }
  } else if (input.image) {
    frontmatter.image = input.image;
    frontmatter.imageAlt = input.imageAlt || title;
    if (input.imageCredit) frontmatter.imageCredit = input.imageCredit;
    if (input.imageCreditUrl) frontmatter.imageCreditUrl = input.imageCreditUrl;
  }
  if (input.instagramCaption) {
    frontmatter.instagramCaption = input.instagramCaption;
  }

  const content = matter.stringify(`${body}\n`, frontmatter);
  return { ok: true, errors, warnings, path: storyPath, content };
}
