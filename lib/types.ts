export type SourceCategory =
  | "scanner"
  | "law-enforcement"
  | "traffic"
  | "weather"
  | "news"
  | "government"
  | "data"
  | "social"
  | "travel";

export type SourceAccess =
  | "free"
  | "free-account"
  | "metered"
  | "paid"
  | "view-only";

export type SourceReliability = "official" | "news" | "community" | "data";

export type SourceKind = "web" | "rss" | "api" | "scanner" | "social";

export type SourceHealthStatus = "ok" | "stale" | "error" | "manual";

export interface SourceHealth {
  status: SourceHealthStatus;
  checkedAt?: string;
  lastItemAt?: string | null;
  httpStatus?: number | null;
  error?: string | null;
}

export interface Source {
  id: string;
  name: string;
  category: SourceCategory;
  kind: SourceKind;
  url: string;
  feedUrl?: string;
  apiUrl?: string;
  coverage: string;
  city?: string;
  mileMarker?: string;
  access: SourceAccess;
  reliability: SourceReliability;
  recommended?: boolean;
  notes: string;
  tags?: string[];
  verified: string;
  health?: SourceHealth;
}

export interface PostSource {
  name: string;
  url: string;
}

export interface PostImage {
  src: string;
  alt: string;
  /** Optional display caption; falls back to alt. */
  caption?: string;
  credit?: string;
  creditUrl?: string;
  /** License label, e.g. "CC BY-SA 4.0". */
  license?: string;
  /** Link to the license deed or rights statement. */
  licenseUrl?: string;
  /** Optional 4:5/vertical crop for Instagram; falls back to src. */
  socialSrc?: string;
  /** Include this image in the Instagram carousel/selection. */
  instagram?: boolean;
}

export interface Post {
  slug: string;
  title: string;
  dek: string;
  /** Optional shorter title for <title> and social cards; H1 stays title. */
  seoTitle?: string;
  /** Optional search/social description; defaults to dek. */
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
  images: PostImage[];
  summary: string[];
  sources: PostSource[];
  featured?: boolean;
  draft?: boolean;
  instagramCaption?: string;
  body: string;
  readingTime: number;
}

export interface Place {
  slug: string;
  name: string;
  county: string;
  mileMarker: string;
  exit?: string;
  lat: number;
  lon: number;
  population?: number;
  blurb: string;
  knownFor: string[];
  nearby: string[];
  localGuide: {
    intro: string;
    highlights: { title: string; body: string }[];
  };
  featured?: boolean;
}

export interface Topic {
  slug: string;
  label: string;
  description: string;
  icon: string;
}
