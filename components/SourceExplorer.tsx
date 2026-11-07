"use client";

import { useMemo, useState } from "react";
import type { Source, SourceCategory } from "@/lib/types";
import { Icon, Arrow } from "@/components/Icon";
import { trackEvent } from "@/lib/analytics";

const accessLabel: Record<string, string> = {
  free: "Free",
  "free-account": "Free account",
  metered: "Metered",
  paid: "Paid",
  "view-only": "View only",
};

const kindLabel: Record<string, string> = {
  web: "Web",
  rss: "RSS",
  api: "API",
  scanner: "Audio",
  social: "Social",
};

const reliabilityStyle: Record<string, string> = {
  official: "border-highway/30 bg-highway/5 text-highway",
  news: "border-ink/20 bg-ink/5 text-ink-soft",
  community: "border-amber-dark/30 bg-amber/10 text-amber-dark",
  data: "border-highway/30 bg-highway/5 text-highway",
};

const healthStyle: Record<string, string> = {
  ok: "border-green-700/30 bg-green-50 text-green-800",
  stale: "border-amber-dark/30 bg-amber/10 text-amber-dark",
  error: "border-red-700/30 bg-red-50 text-red-800",
  manual: "border-line bg-cream/60 text-slate",
};

const healthLabel: Record<string, string> = {
  ok: "OK",
  stale: "Stale",
  error: "Error",
  manual: "Manual",
};

function shortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function SourceExplorer({
  sources,
  categories,
  initialCategory,
}: {
  sources: Source[];
  categories: { id: SourceCategory; label: string; description: string }[];
  initialCategory?: SourceCategory | "all";
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SourceCategory | "all">(
    initialCategory ?? "all",
  );
  const [recommended, setRecommended] = useState(false);
  const [problemsOnly, setProblemsOnly] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const healthCounts = useMemo(() => {
    const counts = { ok: 0, stale: 0, error: 0, manual: 0 };
    for (const source of sources) {
      const status = source.health?.status ?? "manual";
      if (status === "ok" || status === "stale" || status === "error") {
        counts[status] += 1;
      } else {
        counts.manual += 1;
      }
    }
    return counts;
  }, [sources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((source) => {
      if (category !== "all" && source.category !== category) return false;
      if (recommended && !source.recommended) return false;
      if (problemsOnly) {
        const status = source.health?.status;
        if (status !== "stale" && status !== "error") return false;
      }
      if (!q) return true;
      return [
        source.name,
        source.coverage,
        source.city,
        source.notes,
        source.tags?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [sources, query, category, recommended, problemsOnly]);

  async function copyFeed(source: Source) {
    const url = source.feedUrl || source.apiUrl || source.url;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(source.id);
      trackEvent("source_feed_copy", {
        source: source.id,
        kind: source.kind,
      });
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  const activeCategory = categories.find((c) => c.id === category);

  return (
    <div>
      <div className="border border-line bg-cream/60 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search sources</span>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${sources.length} sources — scanners, papers, 511, weather…`}
              className="min-h-11 w-full border border-line bg-paper py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-slate/70 focus:border-ink"
            />
          </label>
          <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
              className="h-4 w-4 accent-[#14432f]"
            />
            Recommended only
          </label>
          <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={problemsOnly}
              onChange={(e) => setProblemsOnly(e.target.checked)}
              className="h-4 w-4 accent-[#14432f]"
            />
            Problems only
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 pb-1">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`inline-flex min-h-11 shrink-0 items-center border px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] uppercase transition ${
              category === "all"
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink-soft hover:border-ink"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`inline-flex min-h-11 shrink-0 items-center border px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] uppercase transition ${
                category === c.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink-soft hover:border-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xs text-slate">
          <strong className="text-ink">{filtered.length}</strong> source
          {filtered.length === 1 ? "" : "s"}
          {activeCategory ? ` · ${activeCategory.label}` : ""}
        </p>
        <p className="text-[10px] tracking-wide text-slate uppercase">
          {healthCounts.ok} feeds OK · {healthCounts.stale} stale ·{" "}
          {healthCounts.error} errors · {healthCounts.manual} manual
        </p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {filtered.map((source) => (
          <article
            key={source.id}
            className={`flex flex-col border bg-paper p-4 transition hover:border-ink ${
              source.recommended ? "border-highway/40" : "border-line"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-cream text-highway">
                  <Icon
                    name={
                      source.category === "scanner"
                        ? "scanner"
                        : source.category === "law-enforcement"
                          ? "shield"
                          : source.category === "traffic"
                            ? "road"
                            : source.category === "weather"
                              ? "cloud"
                              : source.category === "news"
                                ? "book"
                                : source.category === "government"
                                  ? "town"
                                  : source.category === "travel"
                                    ? "route"
                                    : "link"
                    }
                    className="h-4 w-4"
                  />
                </span>
                <div>
                  <h3 className="font-serif text-[17px] leading-tight font-semibold text-ink">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("source_open", { source: source.id, category: source.category })}
                      className="inline-flex min-h-11 items-center hover:underline hover:decoration-amber hover:decoration-2 hover:underline-offset-2"
                    >
                      {source.name}
                    </a>
                  </h3>
                  <p className="mt-0.5 text-[11px] tracking-wide text-slate">
                    {source.coverage}
                    {source.mileMarker ? ` · I-80 ${source.mileMarker}` : ""}
                  </p>
                </div>
              </div>
              {source.recommended ? (
                <span className="shrink-0 bg-highway px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-paper uppercase">
                  Pick
                </span>
              ) : null}
            </div>

            <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-soft">
              {source.notes}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                className={`border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] uppercase ${reliabilityStyle[source.reliability]}`}
              >
                {source.reliability}
              </span>
              <span className="border border-line px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-slate uppercase">
                {kindLabel[source.kind]}
              </span>
              <span className="border border-line px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-slate uppercase">
                {accessLabel[source.access]}
              </span>
              {source.reliability === "official" && source.category === "scanner" ? (
                <span className="text-[9px] font-semibold text-highway">
                  Official stream
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex items-center gap-3 border-t border-line pt-2.5">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("source_open", { source: source.id, category: source.category })}
                className="inline-flex min-h-11 items-center gap-1 text-[11px] font-bold tracking-[0.06em] text-highway uppercase hover:text-amber-dark"
              >
                {source.kind === "scanner" ? "Listen" : "Open"} <Arrow className="h-3 w-3" />
              </a>
              {source.feedUrl || source.apiUrl ? (
                <button
                  type="button"
                  onClick={() => copyFeed(source)}
                  className="inline-flex min-h-11 items-center text-[11px] font-semibold text-slate underline decoration-line underline-offset-2 hover:text-ink"
                >
                  {copied === source.id ? "Copied" : source.feedUrl ? "Copy RSS" : "Copy API"}
                </button>
              ) : null}
              <span className="ml-auto flex items-center gap-1.5">
                <span
                  className={`border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] uppercase ${healthStyle[source.health?.status ?? "manual"]}`}
                  title={source.health?.error ?? undefined}
                >
                  {healthLabel[source.health?.status ?? "manual"]}
                </span>
                <span className="text-[9px] tracking-wide text-slate/60 uppercase">
                  {source.health?.lastItemAt
                    ? `Last item ${shortDate(source.health.lastItemAt)}`
                    : source.health?.checkedAt
                      ? `Checked ${shortDate(source.health.checkedAt)}`
                      : source.kind === "rss"
                        ? "Feed unverified"
                        : "Checked 2026"}
                </span>
              </span>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-line p-10 text-center">
          <p className="font-serif text-xl text-ink">No sources match that search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setRecommended(false);
              setProblemsOnly(false);
            }}
            className="mt-3 text-xs font-bold tracking-[0.08em] text-highway uppercase underline decoration-amber decoration-2 underline-offset-4"
          >
            Reset filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
