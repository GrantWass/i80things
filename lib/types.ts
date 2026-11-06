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
}

export interface PostSource {
  name: string;
  url: string;
}

export interface Post {
  slug: string;
  title: string;
  dek: string;
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
  featured?: boolean;
}

export interface Topic {
  slug: string;
  label: string;
  description: string;
  icon: string;
}
