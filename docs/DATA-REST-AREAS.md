# DATA-REST-AREAS — source notes

Source: NDOT, "Nebraska's Interstate 80 Rest Areas" (guidance document),
dated **Oct. 2015**.
PDF: https://dot.nebraska.gov/media/fgceurxm/rest-areas.pdf (4 pages).
NDOT's Rest Area Information page still linked this PDF on 2026-11-06; no newer
official I-80 rest-area capacity guide was found.
Transcribed 2026-11-06. `lastVerified` in `data/rest-areas.json` is the
transcription date, not a field check.

## What was extracted

All 19 named I-80 rest areas plus both truck-parking-only areas, east to
west as listed in the guide: Melia Hill WB (431.60), Platte River EB
(425.08), Blue River EB (381.29), Goehner WB truck (375.50), York WB
(355.23), York EB (350.80), Grand Island WB (316.52), Grand Island EB
(314.93), Kearney WB (270.94), Kearney EB (269.04), Cozad WB (227.46),
Cozad EB (226.73), Brady EB (194.35), Brady WB (193.75), Sutherland WB
(159.94), Sutherland EB (159.60), Ogallala WB (132.55), Ogallala EB
(124.66), Sidney WB (61.37), Sidney EB (51.40), and Interchange 101 truck
parking (US-138 / Exit 101, Deuel County, both directions).

## Counts (computed, not hardcoded)

- 21 I-80 sites: 19 full-service rest areas + 2 truck-only lots.
- Listed truck spaces total 260 (Goehner count unstated, excluded).
- Check: 24+10+7+7+7+7+7+7+7+7+7+18+22+7+7+7+7+7+28+60 = 260.

## Assumptions and judgment calls

- `restrooms` is listed as an amenity for every full-service area and for
  Goehner ("open with all services"). The guide's general section lists
  full toilet facilities as a standard feature; only the family/alternate
  restroom is called out per site, so that is recorded separately.
- Sutherland EB car count is 25 (not the usual 26) — transcribed as stated.
- Goehner (MM 375.50): guide says verbatim "Open with all services. TRUCK
  PARKING ONLY." No space counts given; `truckSpaces` is null and the note
  quotes the guide.
- Interchange 101: no milepost in the guide; `milepost` is null and the
  location is keyed to Exit 101. Guide says "No amenities are available."
- McCook Rest Area (primary-system, on Hwy 6/34, seasonal Apr 1–Oct 1) is
  NOT on I-80 and is excluded from the data; it is not mentioned on the
  page to avoid confusion.
- Bicentennial sculptures (marked `*` in the guide, "Sculpture name:
  Artist") are recorded verbatim in `sculpture`. Sutherland EB's Oregon
  Trail / O'Fallons Bluff note is in `notes` with `historic-site` amenity.
- Nearest exits are the closest interchange by mile in `data/i80-exits.json`
  (e.g. Sidney EB → Exit 48; Melia Hill → Exit 432). Nearest city hubs use
  the same ≤25-mile rule as `app/exits/page.tsx`; Sutherland sites fall
  outside every hub range, so `citySlug` is null and the corridor reads
  "Sutherland".
- Cozad and Brady areas are linked to the Lexington and North Platte hubs
  as the nearest corridor towns.

## Discrepancies / uncertainty

- None in transcription: every milepost, direction, and space count was
  cross-checked against the extracted PDF text twice. Two items are
  inherently uncertain because the guide itself is vague: Goehner's
  capacity/services and whether any site has changed since Oct. 2015.
- The guide's "Cars mean all passenger vehicles" note is reflected in the
  page copy (car counts include SUVs/pickups).
