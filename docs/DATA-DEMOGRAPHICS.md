# DATA-DEMOGRAPHICS — /demographics sources and verification

Last verified: 2026-11-06.

## What the page shows

Exact 2010 and 2020 decennial Census counts for the 12 corridor hubs in
`data/places.ts` (Omaha, Lincoln, Grand Island, Kearney, Hastings,
North Platte, Lexington, Ogallala, Sidney, Kimball, York, Seward), plus the
latest Vintage 2025 city population estimates (July 1, 2025), 2020 county
population, numeric change, percent change, I-80 mile marker and main exits. Hastings is flagged as the US-281 spur
(not on I-80). No statewide rank is shown (deliberately omitted — easy to
get wrong).

Data file: `data/town-demographics.json`. Page: `app/demographics/page.tsx`.
At-a-glance figures (combined 2020 population, hub count, fastest-growing by
percent change) are computed in the page from the table rows, not hardcoded.

## Sources

- 2020 counts: U.S. Census Bureau, 2020 Census PL 94-171, Table P1
  (total population, variable `P1_001N`). Verified from the published file:
  `https://www2.census.gov/programs-surveys/decennial/2020/data/01-Redistricting_File--PL_94-171/Nebraska/ne2020.pl.zip`
  — segment 1 joined to the geographic header by LOGRECNO
  (summary level 160 = places, 050 = counties).
- 2010 counts: U.S. Census Bureau, 2010 decennial count as published in the
  `CENSUS2010POP` field of:
  `https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/cities/totals/sub-est2019_31.csv`
- 2025 estimates: U.S. Census Bureau, Vintage 2025 city and town population
  estimates:
  `https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/sub-est2025_31.csv`
  (`POPESTIMATE2025`). These are estimates, not a decennial census.
- Canonical API references (same variables the files carry):
  - `https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N&for=place:*&in=state:31`
  - `https://api.census.gov/data/2010/dec/sf1?get=NAME,P001001&for=place:*&in=state:31`
  - `https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N&for=county:*&in=state:31`

## Latest data

The 2020 Census is the latest decennial census. The 2025 column is the latest
Vintage 2025 estimate (July 1, 2025), not a new census. The next decennial
census is 2030.

## Caveat (recorded in the JSON `meta.caveat`)

At verification time the Census API returned a "Missing Key" page for all
three endpoints (the API now requires a key), so figures were verified
against the Bureau's published files carrying the identical variables instead
of a live API response. The numbers are the same ones the API returns
(state total cross-checks: 1,961,504 for Nebraska 2020).

## Place-name matching

All 12 hubs matched Census incorporated places of type "city" with no
ambiguity — e.g. API/geo name "Omaha city, Nebraska" → hub `omaha`.
No mismatches, no guessing, no alternate candidates (each name is unique in
Nebraska). County names match `data/places.ts` exactly.

## Verification log (2026-11-06)

Each 2020 value was read from PL segment 1 `P1_001N` by LOGRECNO and each
2010 value from `CENSUS2010POP`. County 2020 values were additionally
cross-checked against the Vintage 2024 county estimates
`ESTIMATESBASE2020` (equal for Douglas, Lancaster, Lincoln and most others;
off by single digits to ~30 in a few counties due to post-census boundary
updates — the PL count is authoritative and is what the page uses).

One correction caught by verification: Lincoln County's 2020 population is
34,676 (PL P1_001N), not 34,914 from memory. All other values matched
expectations.

| Town | County (2020) | 2020 | 2010 | Change | % |
| --- | --- | --- | --- | --- | --- |
| Kimball | Kimball County (3,434) | 2,290 | 2,496 | −206 | −8.3% |
| Sidney | Cheyenne County (9,468) | 6,410 | 6,757 | −347 | −5.1% |
| Ogallala | Keith County (8,335) | 4,878 | 4,737 | +141 | +3.0% |
| North Platte | Lincoln County (34,676) | 23,390 | 24,733 | −1,343 | −5.4% |
| Lexington | Dawson County (24,111) | 10,348 | 10,230 | +118 | +1.2% |
| Kearney | Buffalo County (50,084) | 33,790 | 30,787 | +3,003 | +9.8% |
| Hastings | Adams County (31,205) | 25,152 | 24,907 | +245 | +1.0% |
| Grand Island | Hall County (62,895) | 53,131 | 48,520 | +4,611 | +9.5% |
| York | York County (14,125) | 8,066 | 7,766 | +300 | +3.9% |
| Seward | Seward County (17,609) | 7,643 | 6,964 | +679 | +9.8% |
| Lincoln | Lancaster County (322,608) | 291,082 | 258,379 | +32,703 | +12.7% |
| Omaha | Douglas County (584,526) | 486,051 | 408,958 | +77,093 | +18.9% |

Combined 2020 hub population: 952,231. Fastest-growing by percent: Omaha (+18.9%).

## Updating

Decennial counts change only with a new census (next: 2030). To re-verify:
re-download the two `filesUsed` URLs above (or query the API endpoints with a
key), re-match the 12 `censusName` values, update `lastVerified` in the JSON
and the docs file. The page reads all display values from the JSON.
