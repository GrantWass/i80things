# DATA-DISTANCES — `/distances` estimate method

Source of truth for numbers on the page: `data/hub-distances.json`.
The page (`app/distances/page.tsx`) renders directly from that file.

## Reference miles (main-exit references, integers)

| Hub | Ref mile | Exit in `data/i80-exits.json` | Exit milepost | In `places.ts` range? |
| --- | --- | --- | --- | --- |
| Kimball | 22 | 22 | 22.69 | 20–29 yes |
| Sidney | 59 | 59 | 59.92 | 55–59 yes |
| Ogallala | 126 | 126 | 126.69 | 126–133 yes |
| North Platte | 177 | 177 | 177.16 | 177–190 yes |
| Lexington | 237 | 237 | 237.19 | 237–247 yes |
| Kearney | 272 | 272 | 272.60 | 272–281 yes |
| Grand Island | 312 | 312 | 312.07 | 306–318 yes |
| York | 353 | 353 | 353.09 | 348–353 yes |
| Seward | 379 | 379 | 379.08 | 373–388 yes |
| Lincoln | 401 | 401 | 401.04 | 395–401 yes |
| Omaha | 454 | 454 | 454.14 | 439–454 yes |

All 11 reference miles verified present as exit numbers on 2026-11-06.
Actual decimal mileposts run ~0.0–0.9 mi above the integer reference;
the page uses the integers, so each leg understates the true
exit-to-exit milepost difference by a fraction of a mile.

## Arithmetic

Legs (next ref mile − previous): 37, 67, 51, 60, 35, 40, 41, 26, 22, 53.
Sum = 432 = 454 − 22. ✓

Time = miles / speed × 60, rounded to nearest 5 min.
Total: 432 mi → 398.8 min → 400 (~6 h 40 min) at 65 mph;
370.3 min → 370 (~6 h 10 min) at 70 mph.

## Ambiguity / known limits

- Integer reference miles vs decimal mileposts: legs are ~0–1 mi short
  of strict exit-milepost differences. Documented as estimates.
- Hastings spur (Exit 312 → Hastings ≈ 16 road miles) comes from
  Hastings College directions, not from reference-mile math. The older
  "25 miles" wording in `places.ts`, the Amtrak guide and the mile-marker
  guide has been corrected to about 16 miles, with a correction note.
- Times assume a single steady speed for the whole leg — no slowdowns,
  metro congestion (notably Omaha/Lincoln), or limit changes.
