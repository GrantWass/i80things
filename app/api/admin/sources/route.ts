import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { readRepoFile, writeRepoFile } from "@/lib/github";
import { slugify } from "@/lib/utils";
import { sourceCategories } from "@/lib/sources";
import type { Source } from "@/lib/types";

const validCategories = new Set<string>(sourceCategories.map((c) => c.id));
const validKinds = new Set(["web", "rss", "api", "scanner", "social"]);
const validAccess = new Set(["free", "free-account", "metered", "paid", "view-only"]);
const validReliability = new Set(["official", "news", "community", "data"]);

type Body = {
  id?: string;
  name?: string;
  category?: string;
  kind?: string;
  url?: string;
  feedUrl?: string;
  apiUrl?: string;
  coverage?: string;
  city?: string;
  mileMarker?: string;
  access?: string;
  reliability?: string;
  recommended?: boolean;
  notes?: string;
  tags?: string;
  deleteId?: string;
};

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: Body;
  try {
    input = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const file = await readRepoFile("data/sources.json");
  if (!file) {
    return NextResponse.json({ error: "Could not read data/sources.json." }, { status: 500 });
  }

  let sources: Source[];
  try {
    sources = JSON.parse(file.content) as Source[];
  } catch {
    return NextResponse.json({ error: "data/sources.json is not valid JSON." }, { status: 500 });
  }

  if (input.deleteId) {
    const filtered = sources.filter((s) => s.id !== input.deleteId);
    if (filtered.length === sources.length) {
      return NextResponse.json({ error: "Source not found." }, { status: 404 });
    }
    await writeRepoFile(
      "data/sources.json",
      `${JSON.stringify(filtered, null, 2)}\n`,
      `sources: remove ${input.deleteId}`,
    );
    return NextResponse.json({ ok: true, removed: input.deleteId, count: filtered.length });
  }

  const name = input.name?.trim();
  const url = input.url?.trim();

  if (!name) return NextResponse.json({ error: "A name is required." }, { status: 400 });
  if (!url || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "A valid http(s) URL is required." }, { status: 400 });
  }
  if (!input.category || !validCategories.has(input.category)) {
    return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
  }

  const id = input.id?.trim() || slugify(name);
  const source: Source = {
    id,
    name,
    category: input.category as Source["category"],
    kind: (validKinds.has(input.kind ?? "") ? input.kind : "web") as Source["kind"],
    url,
    coverage: input.coverage?.trim() || "Nebraska",
    access: (validAccess.has(input.access ?? "") ? input.access : "free") as Source["access"],
    reliability: (validReliability.has(input.reliability ?? "")
      ? input.reliability
      : "news") as Source["reliability"],
    recommended: Boolean(input.recommended),
    notes: input.notes?.trim() || "",
    verified: new Date().toISOString().slice(0, 10),
  };

  if (input.feedUrl?.trim()) source.feedUrl = input.feedUrl.trim();
  if (input.apiUrl?.trim()) source.apiUrl = input.apiUrl.trim();
  if (input.city?.trim()) source.city = input.city.trim();
  if (input.mileMarker?.trim()) source.mileMarker = input.mileMarker.trim();
  if (input.tags?.trim()) {
    source.tags = input.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }

  const index = sources.findIndex((s) => s.id === id);
  if (index >= 0) {
    sources[index] = { ...sources[index], ...source };
  } else {
    sources.push(source);
  }
  sources.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  try {
    await writeRepoFile(
      "data/sources.json",
      `${JSON.stringify(sources, null, 2)}\n`,
      `${index >= 0 ? "sources: update" : "sources: add"} ${name}`,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the source." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    source,
    count: sources.length,
    updated: index >= 0,
  });
}
