# Glossary

The domain language for I-80 Things. Use these names in code, docs and review
notes. If a term is missing here and the work needs it, add it before naming a
module after it.

## The corridor

**Corridor** — Interstate 80 across Nebraska, mile 0 at the Wyoming line to
mile 454 at the Missouri River. *Not* the whole interstate.

**Mile marker (MM)** — Nebraska's reference mile on I-80. Exit numbers match
mile markers, so "Exit 312" and "MM 312" locate the same place.

**Hub** — a corridor town with its own page at `/cities/<slug>`: eleven on I-80
plus Hastings, which sits on the US-281 spur south of Exit 312. *Not* every
town near the interstate.

**Corridor position** — where a hub sits on I-80, as one numeric mile range and
a fraction of the corridor. The display string ("MM 439–454") is derived, never
the source.

**Region** — the West / Central / East partition used to group rows on the data
pages. Bounds are editorial and still provisional.

## The newsroom

**Story** — one piece of journalism: frontmatter, body, images, and the rules
that make it publishable. Lives in `content/posts/*.mdx`.

**Draft** — a story that is structurally publishable but not public. Draft runs
set `draft: true` and are excluded from feeds, sitemaps and the homepage.

**Publish gate** — the checks a story must pass to go live: validation, fact
check, image audit, build. One story either passes the gate or it does not.

**Desk** — the daily workflow that finds, verifies and publishes a story: the
sweeps, the agent, the review pass and the gate.

**Source** — an external feed or document the desk reads (Nebraska 511, NWS,
NDOT releases, newsrooms). *Not* a citation inside a story.

## The reference pages

**Data page** — one of the six reference pages that share one shape:
`/rest-areas`, `/truck-parking`, `/construction`, `/demographics`,
`/distances`, `/exits`.

**Start-here cards** — the four largest rows at the top of a data page, linking
to their detail row.

**Inventory** — the set of physical sites on the corridor, one record and one
id per site, whatever page displays it.

**The mark** — the site's logo glyph and its lockup copy, defined in
`lib/brand.mjs` and rendered by the header, the footer, the staff desk and the
image routes.
