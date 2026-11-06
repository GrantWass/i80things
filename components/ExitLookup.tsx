"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ExitLookupRow = {
  exit: number;
  mile: number;
  road: string;
  placeName: string | null;
  placeSlug: string | null;
  featured?: boolean;
};

export function ExitLookup({ rows }: { rows: ExitLookupRow[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return rows
      .filter((row) =>
        [
          String(row.exit),
          row.mile.toFixed(1),
          row.road,
          row.placeName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 12);
  }, [query, rows]);

  const featured = useMemo(
    () => rows.filter((row) => row.featured).slice(0, 12),
    [rows],
  );
  const hubCount = useMemo(
    () => new Set(rows.map((row) => row.placeSlug).filter(Boolean)).size,
    [rows],
  );
  const endMile = useMemo(
    () => Math.round(Math.max(...rows.map((row) => row.mile))),
    [rows],
  );

  return (
    <section className="border border-line bg-paper p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="kicker text-amber-dark">Find your exit</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold md:text-3xl">
            Search by exit, mile, town or road
          </h2>
          <label className="mt-3 block">
            <span className="sr-only">Search I-80 exits</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try 312, Kearney, mile 426 or NE 31"
              className="w-full border border-ink bg-paper px-4 py-3 text-base text-ink outline-none focus:border-amber-dark focus:ring-2 focus:ring-amber/30"
              autoComplete="off"
            />
          </label>
          <p className="mt-2 text-[11px] leading-relaxed text-slate">
            Search the full table. The main town exits are highlighted below.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px border border-line bg-line text-center">
          <div className="bg-cream p-3">
            <p className="font-serif text-2xl font-semibold">{rows.length}</p>
            <p className="mt-1 text-[9px] leading-tight font-bold tracking-[0.08em] text-slate uppercase">
              Current exits
            </p>
          </div>
          <div className="bg-cream p-3">
            <p className="font-serif text-2xl font-semibold">{hubCount}</p>
            <p className="mt-1 text-[9px] leading-tight font-bold tracking-[0.08em] text-slate uppercase">
              On-corridor hubs
            </p>
          </div>
          <div className="bg-cream p-3">
            <p className="font-serif text-2xl font-semibold">{endMile}</p>
            <p className="mt-1 text-[9px] leading-tight font-bold tracking-[0.08em] text-slate uppercase">
              Omaha mile
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="kicker text-slate">
            {query ? `${results.length} match${results.length === 1 ? "" : "es"}` : "Main town exits"}
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[10px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark"
            >
              Clear search
            </button>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(query ? results : featured).map((row) => (
            <div
              key={row.exit}
              className="border border-line bg-cream p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-serif text-lg font-semibold">
                  Exit {row.exit}
                </p>
                <span className="text-[10px] font-bold tracking-wide text-slate uppercase">
                  Mile {row.mile.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">
                {row.road || "Interchange"}
              </p>
              {row.placeSlug ? (
                <Link
                  href={`/cities/${row.placeSlug}`}
                  className="mt-2 inline-block text-[11px] font-semibold text-highway underline decoration-amber underline-offset-2"
                >
                  {row.placeName} hub →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
        {query && !results.length ? (
          <p className="mt-3 border border-line bg-cream p-4 text-sm text-slate">
            No exit matched “{query}”. Try a town name, an exit number or a
            mile marker.
          </p>
        ) : null}
      </div>
    </section>
  );
}
