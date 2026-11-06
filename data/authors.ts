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
    bio: "The Corridor Desk is the reporting team behind I-80 Things. We monitor Nebraska State Patrol releases, Nebraska 511, the National Weather Service and local newsrooms along the interstate, then verify and write every item ourselves. Tips are checked against an official source before publication.",
    location: "I-80 corridor, Nebraska",
    since: "2026",
    email: "news@i80things.com",
  },
  {
    slug: "grant-wasserman",
    name: "Grant Wasserman",
    role: "Founder & publisher",
    bio: "Grant started I-80 Things to make the Nebraska stretch of Interstate 80 easier to understand at a glance — for the people who drive it every day, not just the ones passing through. He handles operations, advertising partnerships and corrections.",
    location: "Nebraska",
    since: "2026",
    email: "grant@i80things.com",
  },
];

export function getAuthor(slug: string): Author {
  return authors.find((a) => a.slug === slug) ?? authors[0];
}
