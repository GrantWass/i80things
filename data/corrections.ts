export interface Correction {
  /** ISO date the correction was published. */
  date: string;
  /** Headline at the time of correction. */
  story: string;
  /** Slug of the corrected story. */
  slug: string;
  /** What changed and why. */
  summary: string;
}

/**
 * Public correction log. Add an entry whenever a substantive fact, caption,
 * image credit or framing changes after publication.
 */
export const corrections: Correction[] = [
  {
    date: "2026-11-06",
    story: "I-80 mile markers and Amtrak guides: Hastings spur distance",
    slug: "i-80-mile-markers-nebraska-explained",
    summary:
      "An earlier version said Hastings was about 25 miles from I-80/Exit 312. The road distance is about 16 miles south via US-281; the guides have been corrected.",
  },
  {
    date: "2026-11-06",
    story: "Sidney and Kimball: the last 60 miles of I-80 in Nebraska",
    slug: "sidney-kimball-last-60-miles",
    summary:
      "An earlier version listed a third Sidney interchange that does not exist and called Kimball the last Nebraska exit before Wyoming. Sidney's interchanges are exits 55 and 59; Kimball is the last town of any size, with exits 8 and 1 continuing west. The headline and segment description have also been tightened.",
  },
  {
    date: "2026-11-06",
    story: "Grand Island at mile 312: four exits, the State Fair and the Hastings spur",
    slug: "grand-island-at-mile-312-four-exits-the-state-fair-and-the-hastings-spur",
    summary:
      "An earlier version listed exits 306 and 309 and put Hastings about 25 miles from Exit 312. The Grand Island exits are 305, 312, 314 and 318, and Hastings is about 16 miles south via US-281. The story also described an active-work pattern that dated quickly; it now points readers to Nebraska 511 for current work.",
  },
  {
    date: "2026-11-06",
    story: "Hit-and-run on I-80 in Lincoln ends in 110-mph pursuit and arrest",
    slug: "hit-and-run-on-i-80-in-lincoln-ends-in-110-mph-pursuit-and-arrest",
    summary:
      "An earlier version described the Lincoln traffic mix as running between exits 395 and 409, and the cover caption implied the pursuit began at the Nebraska State Capitol. The pursuit began on I-80; the Lincoln exit range is 395–401. Both have been corrected.",
  },
];
