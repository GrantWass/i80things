import sourcesData from "@/data/sources.json";
import healthData from "@/data/source-health.json";
import type { Source, SourceCategory, SourceHealth } from "@/lib/types";

const sources = sourcesData as Source[];

interface HealthFileEntry {
  id: string;
  name: string;
  url: string;
  status: "ok" | "stale" | "error";
  httpStatus: number | null;
  checkedAt: string;
  lastItemAt: string | null;
  error: string | null;
}

interface HealthFile {
  generatedAt: string;
  feeds: Record<string, HealthFileEntry>;
}

const healthFile = healthData as HealthFile;

function healthForSource(source: Source): SourceHealth {
  if (!source.feedUrl) return { status: "manual" };
  const entry = healthFile?.feeds?.[source.id];
  if (!entry) return { status: "manual" };
  return {
    status: entry.status,
    checkedAt: entry.checkedAt,
    lastItemAt: entry.lastItemAt,
    httpStatus: entry.httpStatus,
    error: entry.error,
  };
}

export const sourceCategories: {
  id: SourceCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "scanner",
    label: "Scanners",
    description:
      "Human listening only. Audio is not ingested by the daily desk; a scanner call is a tip, never a fact.",
  },
  {
    id: "law-enforcement",
    label: "Police & emergency",
    description:
      "State Patrol, city police, sheriffs and emergency management releases.",
  },
  {
    id: "traffic",
    label: "Traffic & roads",
    description: "511, NDOT, plows and construction notices.",
  },
  {
    id: "weather",
    label: "Weather",
    description: "NWS offices and alert feeds covering the corridor.",
  },
  {
    id: "news",
    label: "Newsrooms",
    description:
      "Local papers, TV and radio. We link out and write original summaries — never republish.",
  },
  {
    id: "government",
    label: "Government",
    description: "Legislature, agencies and public records.",
  },
  {
    id: "data",
    label: "Data & APIs",
    description: "Crash data, traffic counts and machine-readable feeds.",
  },
  {
    id: "social",
    label: "Social accounts",
    description: "Official agency accounts that break news first.",
  },
  {
    id: "travel",
    label: "Travel",
    description: "Amtrak, rest areas and corridor travel information.",
  },
];

const categoryOrder = new Map(
  sourceCategories.map((category, index) => [category.id, index]),
);

const ordered: Source[] = [...sources]
  .map((source) => ({ ...source, health: healthForSource(source) }))
  .sort((a, b) => {
    const categoryDiff =
      (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99);
    if (categoryDiff !== 0) return categoryDiff;
    return a.name.localeCompare(b.name);
  });

export function getAllSources(): Source[] {
  return ordered;
}

export function getRecommendedSources(): Source[] {
  return ordered.filter((s) => s.recommended);
}

export function getSourcesByCategory(category: SourceCategory): Source[] {
  return ordered.filter((s) => s.category === category);
}

export function getSource(id: string): Source | undefined {
  return ordered.find((s) => s.id === id);
}

export function getSourcesForPlace(slug: string): Source[] {
  return ordered.filter((s) => s.city === slug);
}

export function getRssSources(): Source[] {
  return ordered.filter((s) => Boolean(s.feedUrl));
}

export function getSourceHealthSummary(): {
  ok: number;
  stale: number;
  error: number;
  manual: number;
  generatedAt: string | null;
} {
  let ok = 0;
  let stale = 0;
  let error = 0;
  let manual = 0;
  for (const source of ordered) {
    switch (source.health?.status) {
      case "ok":
        ok += 1;
        break;
      case "stale":
        stale += 1;
        break;
      case "error":
        error += 1;
        break;
      default:
        manual += 1;
        break;
    }
  }
  return { ok, stale, error, manual, generatedAt: healthFile?.generatedAt ?? null };
}

export const scannerLegalNote =
  "Nebraska is a one-party-consent state, and unencrypted public-safety radio is expressly excluded from its interception statute (Neb. Rev. Stat. § 86-290). Listening is legal. Publishing tips from a scanner still requires independent confirmation from the agency, and we never rebroadcast raw audio or publish tactical movements. Feed delays exist for officer safety.";
