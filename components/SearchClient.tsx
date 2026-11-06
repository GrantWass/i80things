"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Source } from "@/lib/types";

type PostResult = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  city: string;
  topics: string[];
  tags: string[];
  url: string;
};

type SourceResult = Pick<
  Source,
  "id" | "name" | "url" | "coverage" | "category" | "city" | "mileMarker" | "notes" | "reliability"
>;

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [sources, setSources] = useState<SourceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/posts?limit=100").then((res) => res.json() as Promise<{ posts?: PostResult[] }>),
      fetch("/api/sources").then((res) => res.json() as Promise<{ sources?: SourceResult[] }>),
    ])
      .then(([postData, sourceData]) => {
        if (!active) return;
        setPosts(postData.posts ?? []);
        setSources(sourceData.sources ?? []);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );

  const matchedPosts = useMemo(() => {
    if (!terms.length) return posts.slice(0, 8);
    return posts
      .filter((post) => {
        const haystack = `${post.title} ${post.dek} ${post.city} ${post.topics.join(" ")} ${post.tags.join(" ")}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 12);
  }, [posts, terms]);

  const matchedSources = useMemo(() => {
    if (!terms.length) return sources.filter((source) => source.reliability === "official").slice(0, 6);
    return sources
      .filter((source) => {
        const haystack = `${source.name} ${source.coverage} ${source.city ?? ""} ${source.mileMarker ?? ""} ${source.notes} ${source.category}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 10);
  }, [sources, terms]);

  return (
    <div>
      <label className="block">
        <span className="kicker text-slate">Search</span>
        <input
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Try “Kearney”, “closure”, “winter” or “State Patrol”"
          autoFocus
          className="mt-2 w-full border border-ink bg-paper px-4 py-3 text-base text-ink outline-none focus:border-highway"
        />
      </label>

      {loading ? (
        <p className="mt-6 text-sm text-slate">Loading the index…</p>
      ) : failed ? (
        <p className="mt-6 text-sm text-slate">
          Search could not load. Browse the{" "}
          <Link href="/news" className="font-semibold text-highway underline decoration-amber">
            news archive
          </Link>{" "}
          or the{" "}
          <Link href="/sources" className="font-semibold text-highway underline decoration-amber">
            source directory
          </Link>
          .
        </p>
      ) : (
        <div
          className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.8fr]"
          aria-live="polite"
        >
          <section>
            <h2 className="border-b-2 border-ink pb-2 font-serif text-2xl font-semibold">
              Stories {terms.length ? `(${matchedPosts.length})` : ""}
            </h2>
            {matchedPosts.length ? (
              <ul className="mt-4 divide-y divide-line">
                {matchedPosts.map((post) => (
                  <li key={post.slug} className="py-4 first:pt-0">
                    <Link href={`/news/${post.slug}`} className="group block">
                      <p className="font-serif text-xl leading-snug font-semibold group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
                        {post.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate">
                        {post.dek}
                      </p>
                      <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                        {post.city.replace("-", " ")} · {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate">
                No stories matched. Try a town, a topic or a shorter phrase.
              </p>
            )}
          </section>

          <section>
            <h2 className="border-b-2 border-ink pb-2 font-serif text-2xl font-semibold">
              Sources {terms.length ? `(${matchedSources.length})` : ""}
            </h2>
            {matchedSources.length ? (
              <ul className="mt-4 space-y-3">
                {matchedSources.map((source) => (
                  <li key={source.id} className="border border-line bg-paper p-3">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-ink hover:text-highway"
                    >
                      {source.name}
                    </a>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate">
                      {source.coverage}
                      {source.city ? ` · ${source.city}` : ""}
                      {source.mileMarker ? ` · MM ${source.mileMarker}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate">
                No sources matched. Browse the full{" "}
                <Link href="/sources" className="font-semibold text-highway underline decoration-amber">
                  source desk
                </Link>
                .
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
