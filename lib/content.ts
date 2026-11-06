import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post } from "@/lib/types";
import { readingTime } from "@/lib/utils";

const postsDirectory = path.join(process.cwd(), "content", "posts");

type Frontmatter = {
  title?: string;
  dek?: string;
  date?: string;
  updated?: string;
  author?: string;
  city?: string;
  topics?: string[];
  tags?: string[];
  mileMarker?: string;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  summary?: string[];
  sources?: { name: string; url: string }[];
  featured?: boolean;
  draft?: boolean;
  instagramCaption?: string;
};

function parsePost(filename: string): Post | null {
  const slug = filename.replace(/\.mdx?$/, "");
  const fullPath = path.join(postsDirectory, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;

  if (!fm.title || !fm.date || !fm.dek) return null;

  return {
    slug,
    title: fm.title,
    dek: fm.dek,
    date: fm.date,
    updated: fm.updated,
    author: fm.author || "corridor-desk",
    city: fm.city || "statewide",
    topics: fm.topics ?? [],
    tags: fm.tags ?? [],
    mileMarker: fm.mileMarker,
    image: fm.image,
    imageAlt: fm.imageAlt,
    imageCredit: fm.imageCredit,
    imageCreditUrl: fm.imageCreditUrl,
    summary: fm.summary ?? [],
    sources: fm.sources ?? [],
    featured: fm.featured ?? false,
    draft: fm.draft ?? false,
    instagramCaption: fm.instagramCaption,
    body: content,
    readingTime: readingTime(content),
  };
}

let cache: { posts: Post[]; mtime: number } | null = null;

function readAll(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const stat = fs.statSync(postsDirectory);
  if (cache && cache.mtime === stat.mtimeMs) return cache.posts;
  const posts = fs
    .readdirSync(postsDirectory)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("."))
    .map(parsePost)
    .filter((p): p is Post => p !== null)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        a.title.localeCompare(b.title),
    );
  cache = { posts, mtime: stat.mtimeMs };
  return posts;
}

export function getAllPosts(options?: { includeDrafts?: boolean }): Post[] {
  const posts = readAll();
  return options?.includeDrafts ? posts : posts.filter((p) => !p.draft);
}

export function getPost(slug: string): Post | undefined {
  return readAll().find((p) => p.slug === slug);
}

export function getPostsByCity(city: string, limit?: number): Post[] {
  const posts = getAllPosts().filter((p) => p.city === city);
  return limit ? posts.slice(0, limit) : posts;
}

export function getPostsByTopic(topic: string, limit?: number): Post[] {
  const posts = getAllPosts().filter(
    (p) => p.topics.includes(topic) || p.tags.includes(topic),
  );
  return limit ? posts.slice(0, limit) : posts;
}

export function getFeaturedPosts(limit = 3): Post[] {
  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured);
  return (featured.length >= limit ? featured : [...featured, ...posts])
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, limit);
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const scored = others.map((p) => {
    let score = 0;
    if (p.city === post.city) score += 5;
    score += p.topics.filter((t) => post.topics.includes(t)).length * 2;
    score += p.tags.filter((t) => post.tags.includes(t)).length;
    return { post: p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || +new Date(b.post.date) - +new Date(a.post.date))
    .slice(0, limit)
    .map((s) => s.post);
}

export function getAdjacentPosts(post: Post): {
  previous?: Post;
  next?: Post;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  return {
    next: index > 0 ? posts[index - 1] : undefined,
    previous: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export function getMostRecentUpdate(): string {
  const posts = getAllPosts();
  return posts[0]?.date ?? new Date().toISOString();
}

export function isRecent(post: Post, hours = 48): boolean {
  return Date.now() - new Date(post.date).getTime() < hours * 60 * 60 * 1000;
}
