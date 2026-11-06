export const site = {
  name: "I-80 Things",
  shortName: "I-80 Things",
  tagline: "Nebraska's I-80 corridor, covered daily",
  description:
    "Daily news from the I-80 corridor in Nebraska: crashes, closures, weather, construction and the towns from Omaha to Kimball. Verified sources, no filler.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://i80things.com").replace(
    /\/$/,
    "",
  ),
  locale: "en_US",
  language: "en-US",
  timeZone: "America/Chicago",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@i80things.com",
  twitter: "@i80things",
  instagram: "i80things",
  instagramUrl: "https://www.instagram.com/i80things/",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  adsensePubId: process.env.ADSENSE_PUB_ID || "",
  founded: 2026,
  corridor: "I-80 in Nebraska · Mile 454 (Omaha) to Mile 22 (Kimball)",
} as const;

export const nav = [
  { href: "/news", label: "Latest" },
  { href: "/cities", label: "Corridor towns" },
  { href: "/topics", label: "Topics" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
] as const;
