/**
 * Shared story shapes. The desk scripts (`scripts/*.mjs`) cannot import
 * TypeScript, so the canonical runtime lives in `lib/story.mjs` with JSDoc
 * types that point back here. `lib/content.ts` reuses these types directly.
 */

export interface StoryImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  socialSrc?: string;
  instagram?: boolean;
}

export interface StorySource {
  name: string;
  url: string;
}

export interface Story {
  slug: string;
  title: string;
  dek: string;
  seoTitle?: string;
  seoDescription?: string;
  date: string;
  updated?: string;
  author: string;
  city: string;
  topics: string[];
  tags: string[];
  mileMarker?: string;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
  /** Ordered gallery. The first image is the cover. */
  images: StoryImage[];
  summary: string[];
  sources: StorySource[];
  featured: boolean;
  draft: boolean;
  instagramCaption?: string;
  body: string;
}

export interface StoryImageInput {
  src?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  socialSrc?: string;
  instagram?: boolean;
}

/** Compose-form draft, as posted to the admin write route. */
export interface StoryDraft {
  title?: string;
  dek?: string;
  body?: string;
  city?: string;
  topics?: string[];
  tags?: string | string[];
  summary?: string | string[];
  sources?: { name?: string; url?: string }[];
  date?: string;
  images?: StoryImageInput[];
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
  featured?: boolean;
  draft?: boolean;
  instagramCaption?: string;
}

export type VerdictMode = "draft" | "publish";

export interface Verdict {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface WriteResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  path: string;
  content: string;
}

export interface WriteOptions {
  validCities?: string[];
  validTopics?: string[];
  slugExists?: (slug: string) => boolean | Promise<boolean>;
}
