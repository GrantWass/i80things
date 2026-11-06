# DATA-CONSTRUCTION

How `/construction` gets its data, and what it does not claim.

## Current source: Nebraska 511 reader

- The page imports `getRoadConditions` from `lib/road-conditions.ts` — the
  same unofficial reader behind `/conditions` (undocumented 511 GraphQL
  endpoint, `next: { revalidate: 300 }`, 20s timeout, cached five minutes).
- It filters the reader's I-80 events to `construction` + `closure`
  categories. `incident` events are shown in a separate, clearly labeled
  section when present; `conditions`/`other` events are left to `/conditions`.
- Each event shows: title, description, mile (parsed from
  `location.primaryLinearReference`), last updated, agency, and a link to the
  event on 511.nebraska.gov.
- Page-level `export const revalidate = 300` matches the reader cache.
- All counts ("active events", "districts represented", "last checked") are
  computed at render time. Never hardcode counts or claims.

## Planning source: NDOT weekly Construction & Detour Report

- URL: https://dot.nebraska.gov/media/4v5lbeay/construction-detours-info.pdf
- The PDF covers long-term projects that may never appear in 511. The page
  links it alongside 511 and states the distinction: **511 = current
  conditions, PDF = planning**. If the PDF URL changes, update
  `NDOT_REPORT_URL` in `app/construction/page.tsx` and the `sources` array
  in `data/ndot-districts.json`.

## District grouping (`data/ndot-districts.json`)

- Groupings follow the NDOT district map
  (https://dot.nebraska.gov/about/divisions-districts/,
  map image https://dot.nebraska.gov/media/23fp3ujl/districts-map-lines-color.png).
- Mile ranges are **approximate service areas for sorting events west → east**,
  aligned to nearby county lines — they are NOT official boundary claims:
  - District 5: 0–<110 (Kimball, Cheyenne, Deuel)
  - District 6: 110–<300 (Keith, Lincoln, Dawson, Buffalo)
  - District 4: 300–<362 (Hall, Hamilton, York)
  - District 1: 362–<440 (Seward, Lancaster, Cass)
  - District 2: 440–455 inclusive (Sarpy, Douglas)
- The page states the approximation next to every district heading and in the
  methodology and caveat blocks. Events with no parseable mile marker render
  under "Location unclear", never forced into a district.

## Fallback states

- Reader error OR zero construction/closure events → honest panel linking
  Nebraska 511 and the NDOT weekly PDF, with copy that differs per case
  (unavailable vs. none returned).
- The page never implies NDOT authorship: copy calls it "an unofficial
  reader of Nebraska 511", JSON-LD `Dataset` is labeled a reader snapshot
  ("Not an official NDOT dataset").

## Verification notes (Nov 2026)

- NDOT divisions & districts page fetched and confirmed: eight field
  districts, District Engineers listed, district map image present at the
  `/media/23fp3ujl/` URL.
- County-to-district assignment cross-checked against the task's district
  map reading: D5 panhandle HQ region, D6 North Platte region, D4 Grand
  Island region, D1 Lincoln region, D2 Omaha region. Mile cut points sit at
  plausible county lines (Cheyenne/Deuel ~80, Buffalo/Hall ~300, York/Seward
  ~360, Cass/Sarpy ~440). Precision limit: the district map is a county-level
  graphic, so exact mile cut points cannot be derived from it — hence
  "approximate" throughout.
- 511 GraphQL endpoint probed during build: reachable, returning I-80
  construction/closure events (e.g. "I-80 in both directions: Bridge
  construction", "I-80 westbound: Construction work", "I-80 … Roadside
  mowing"). Page built against live reader shape, not fixtures.
