# DATA-TRUCK-PARKING

Source of truth for `/truck-parking`: `data/truck-parking.json`.

## Sources

- Open sites: NDOT "Interstate 80 Rest Areas" guide, Oct. 2015
  (`https://dot.nebraska.gov/media/fgceurxm/rest-areas.pdf`). NDOT's Rest Area
  Information page still linked this PDF on 2026-11-06; no newer official
  capacity inventory was found.
  Extracted Nov. 6, 2026 from the PDF text (4 pages). Only I-80 sites are
  included; the McCook primary-system site is out of scope.
- Planned site: NDOT "USDOT Invests Up to $59.6 Million" release, Nov. 5, 2026
  (`https://dot.nebraska.gov/media/tgzmld3a/20261105-comm-usdot-grants.pdf`).

## Row conventions

- `mile`: guide milepost; `mileApproximate: true` for the Deuel lot (~101.2,
  at Exit 101) and `mile: null` for Dawson County (site not announced).
- `nearestExit`: nearest exit **in `data/i80-exits.json`**, not necessarily the
  nearest real-world ramp. The Melia Hill site is 2 miles west of the Highway
  31 interchange, which is Exit 432 in the exit table.
- `nearestTown`: slug from `data/places.ts` (closest corridor hub by mile
  range), not necessarily the closest community (e.g. Cozad sites → Lexington,
  Sutherland/Brady sites → North Platte, Deuel lot → Ogallala).
- `truckSpaces: null` means the source states no count (Goehner truck-only
  site). Never invent counts; private truck stop counts are out of scope.
- Dawson County `truckSpaces: 120` follows the release's headline figure; the
  same release quotes ~92. Both figures are surfaced on the page. Status is
  `planned` — never present it as open.

## Maintenance

- Re-check counts against a newer NDOT guide or 511 before changing numbers;
  update `lastChecked` in the JSON when verified. The page footer states the
  last-checked date.
- When NDOT announces a Dawson County site/timeline, fill in `mile`,
  `nearestExit`, `direction`, and flip `status` to `open`.
