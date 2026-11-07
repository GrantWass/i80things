import fs from "node:fs";
import path from "node:path";
import { readStoryFile } from "@/lib/story.mjs";
import type { Post } from "@/lib/types";
import { readingTime } from "@/lib/utils";

const postsDirectory = path.join(process.cwd(), "content", "posts");

function parsePost(filename: string): Post | null {
  const fullPath = path.join(postsDirectory, filename);
  const story = readStoryFile(fullPath);

  if (!story.title || !story.date || !story.dek) return null;

  const cover = story.images[0];

  return {
    slug: story.slug,
    title: story.title,
    dek: story.dek,
    seoTitle: story.seoTitle,
    seoDescription: story.seoDescription,
    date: story.date,
    updated: story.updated,
    author: story.author,
    city: story.city,
    topics: story.topics,
    tags: story.tags,
    mileMarker: story.mileMarker,
    image: cover?.src ?? story.image,
    imageAlt: cover?.alt ?? story.imageAlt,
    imageCredit: cover?.credit ?? story.imageCredit,
    imageCreditUrl: cover?.creditUrl ?? story.imageCreditUrl,
    imageLicense: cover?.license ?? story.imageLicense,
    imageLicenseUrl: cover?.licenseUrl ?? story.imageLicenseUrl,
    images: story.images,
    summary: story.summary,
    sources: story.sources,
    featured: story.featured,
    draft: story.draft,
    instagramCaption: story.instagramCaption,
    body: story.body,
    readingTime: readingTime(story.body),
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
