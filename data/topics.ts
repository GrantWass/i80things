import type { Topic } from "@/lib/types";

export const topics: Topic[] = [
  {
    slug: "crashes",
    label: "Crashes & incidents",
    description:
      "Collisions, closures, pursuits and emergency response on I-80 in Nebraska — attributed to the agency that confirmed them.",
    icon: "alert",
  },
  {
    slug: "road-conditions",
    label: "Road conditions",
    description:
      "Construction, lane closures, detours, rest areas and what Nebraska 511 is showing along the corridor.",
    icon: "road",
  },
  {
    slug: "weather",
    label: "Weather",
    description:
      "Snow, ice, wind, flooding and severe weather that changes how — or whether — you drive I-80.",
    icon: "cloud",
  },
  {
    slug: "state-patrol",
    label: "State Patrol",
    description:
      "Nebraska State Patrol activity, crash reports and the public-safety side of the interstate.",
    icon: "shield",
  },
  {
    slug: "travel",
    label: "Travel & stops",
    description:
      "Road trips, truck stops, rest areas, Amtrak and the practical business of moving across Nebraska.",
    icon: "route",
  },
  {
    slug: "community",
    label: "Corridor communities",
    description:
      "The towns along I-80: local government, schools, growth and the decisions that shape the exits.",
    icon: "town",
  },
  {
    slug: "business",
    label: "Business & freight",
    description:
      "Trucking, agriculture, manufacturing and the economy that moves on the interstate.",
    icon: "briefcase",
  },
  {
    slug: "explainers",
    label: "Explainers",
    description:
      "How the corridor works: 511, crash reports, plows, mile markers, scanner law and more.",
    icon: "book",
  },
];

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function topicLabel(slug: string): string {
  return getTopic(slug)?.label ?? slug;
}
