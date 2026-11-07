export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  location: string;
  since: string;
  email?: string;
}

export const authors: Author[] = [
  {
    slug: "corridor-desk",
    name: "The Corridor Desk",
    role: "Staff reporters & editors",
    bio: "The Corridor Desk is the reporting team behind I-80 Things, covering crashes, closures, weather and construction along Interstate 80 in Nebraska.",
    location: "I-80 corridor, Nebraska",
    since: "2026",
    email: "news@i80things.com",
  },
  {
    slug: "grant-wasserman",
    name: "Grant Wasserman",
    role: "Founder & publisher",
    bio: "Grant started I-80 Things to make the Nebraska stretch of Interstate 80 easier to understand at a glance. He handles operations, advertising partnerships and corrections.",
    location: "Nebraska",
    since: "2026",
    email: "grant@i80things.com",
  },
];

/**
 * Two initials for the byline avatar. Articles are skipped so "The Corridor
 * Desk" reads CD rather than T.
 */
export function authorInitials(name: string): string {
  const words = name
    .replace(/\b(the|a|an)\b/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return name.charAt(0).toUpperCase();
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

export function getAuthor(slug: string): Author {
  return authors.find((a) => a.slug === slug) ?? authors[0];
}
