import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { authors } from "@/data/authors";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date ?? new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: latest, changeFrequency: "hourly", priority: 1 },
    { url: `${site.url}/news`, lastModified: latest, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site.url}/conditions`, lastModified: latest, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site.url}/sources`, lastModified: "2026-11-05", changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/cities`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/topics`, lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/about`, lastModified: "2026-11-05", changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/editorial-standards`, lastModified: "2026-11-05", changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/corrections`, lastModified: "2026-11-05", changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/image-credits`, lastModified: "2026-11-05", changeFrequency: "monthly", priority: 0.4 },
    { url: `${site.url}/contact`, lastModified: "2026-11-05", changeFrequency: "monthly", priority: 0.4 },
    { url: `${site.url}/privacy`, lastModified: "2026-11-05", changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified: "2026-11-05", changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...posts.map((post) => ({
      url: `${site.url}/news/${post.slug}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: "daily" as const,
      priority: 0.9,
      ...(post.images.length
        ? { images: post.images.map((image) => absoluteUrl(image.src)) }
        : {}),
    })),
    ...places.map((place) => ({
      url: `${site.url}/cities/${place.slug}`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...topics.map((topic) => ({
      url: `${site.url}/topics/${topic.slug}`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...authors.map((author) => ({
      url: `${site.url}/authors/${author.slug}`,
      lastModified: "2026-11-05",
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
