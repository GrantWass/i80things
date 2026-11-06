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
    story: "Hit-and-run on I-80 in Lincoln ends in 110-mph pursuit and arrest",
    slug: "hit-and-run-on-i-80-in-lincoln-ends-in-110-mph-pursuit-and-arrest",
    summary:
      "An earlier version described the Lincoln traffic mix as running between exits 395 and 409, and the cover caption implied the pursuit began at the Nebraska State Capitol. The pursuit began on I-80; the Lincoln exit range is 395–401. Both have been corrected.",
  },
];
