import sourcesData from "@/data/sources.json";
import type { Source, SourceCategory } from "@/lib/types";

const sources = sourcesData as Source[];

export const sourceCategories: {
  id: SourceCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "scanner",
    label: "Scanners",
    description:
      "Live and archived public-safety radio. Listen for tips, confirm with an official source before publishing.",
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

const ordered = [...sources].sort((a, b) => {
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

export const scannerLegalNote =
  "Nebraska is a one-party-consent state, and unencrypted public-safety radio is expressly excluded from its interception statute (Neb. Rev. Stat. § 86-290). Listening is legal. Publishing tips from a scanner still requires independent confirmation from the agency, and we never rebroadcast raw audio or publish tactical movements. Feed delays exist for officer safety.";
