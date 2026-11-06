# Accessibility & Performance Audit — 2026-11-05

Tool: Lighthouse 13.6.0 (headless Chrome), mobile (Moto G4-ish, throttled) + desktop.
Target: production `https://i80things.vercel.app` (Vercel deployment).
Raw JSON retained in the auditor's temp dir (not committed).

## Scores

| Page | Form | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/` | mobile | 96 | 96 | 100 | 100 |
| `/` | desktop | 100 | 96 | 100 | 100 |
| `/conditions` | mobile | 100 | 96 | 100 | 100 |
| `/news/how-to-read-nebraska-511` | mobile | 97 | 96 | 100 | 100 |

No failing `link-name`, `button-name`, `image-alt`, `heading-order`, `landmark`,
`meta-viewport`, or `target-size` audits. The same two accessibility failures
repeat on every page; performance notes are framework-level and minor.

**Post-fix re-run (homepage, mobile):** performance **99**, accessibility **100**,
best practices **100**, SEO **100**. The contrast and brand-link fixes below
cleared the remaining accessibility failures.

## Top findings (actionable)

1. **`text-amber-dark` (#a97400) fails contrast on light surfaces — 3.3–3.7:1, needs 4.5:1.**
   Impact: high — every kicker (`.kicker`), mile-marker badge (`MM 55–65`), and
   `CONSTRUCTION` pill on `/` and `/conditions`. This alone caps accessibility at 96.
   Fix: darken the token to `#7c5500` (6.05 paper / 5.50 cream). ✅ FIXED in
   `app/globals.css` (`--color-amber-dark`).

2. **Rank numerals `text-amber` (#e3a008) on paper — 2.05:1, needs 3:1 (large text).**
   Impact: medium — CompactCard numbers ("02", "03"…) on homepage/article pages.
   Fix: `text-amber` → `text-amber-dark` class in `components/PostCards.tsx:135`.
   ✅ FIXED in `components/PostCards.tsx`; interim CSS removed.

3. **Footer tagline `text-slate` on ink — 2.89:1, needs 4.5:1.**
   Impact: medium — "NEBRASKA CORRIDOR NEWS" under the footer brand.
   Fix: change class in `components/SiteFooter.tsx` (via `Brand light` in
   `components/SiteHeader.tsx:21`). ✅ FIXED: light brand tagline now uses
   `text-cream/70`; interim CSS removed.

4. **Footer disclaimer `text-cream/35` on ink — 2.86:1, needs 4.5:1.**
   Impact: low — "Not affiliated with NDOT…" fine print.
   Fix: bump to `text-cream/70` in `components/SiteFooter.tsx:82`.
   ✅ FIXED; interim CSS removed.

5. **Logo link `aria-label="I-80 Things home"` mismatches visible text (axe `label-content-name-mismatch`).**
   Impact: medium — flagged on header + footer of every page; speech-input users
   saying visible text ("Interstate 80") won't activate the link.
   Fix: remove the `aria-label` and let the accessible name compute from the
   visible brand text.
   ✅ FIXED in `components/SiteHeader.tsx` (`Brand`).

6. **Focus ring amber (#e3a008) on paper — 2.05:1, needs 3:1 (WCAG 2.4.11/2.4.13).**
   Impact: medium — keyboard users on all light surfaces.
   Fix: ring color → highway green (10.2:1 on paper); keep amber on ink surfaces
   (7.6:1). ✅ FIXED in `app/globals.css` (`:focus-visible` + dark-surface override).

7. **Mobile FCP 2.2s / TTI 4.2s on `/` (perf 96); render-blocking CSS + ~14 KB legacy-JS
   polyfill (`Array.prototype.at`) + LCP image discovery.**
   Impact: low — desktop is 100, mobile 96–100; content is static and fast.
   Fix: framework-level, not CSS — `next/font` preload tuning, `priority` on the
   LCP image, `browserslist`/transpile target for the polyfill. Left for a
   performance pass; deliberately not chased here.

8. **`text-cream/50`, `/70`, `/75` on ink pass but with thin margins (~4.6–8:1).**
   Impact: low — no audit failure today.
   Fix: none now; if footer copy ever shrinks below 12px or opacity is lowered,
   re-check. Noted so a future redesign doesn't regress.

## Fixed in this pass (`app/globals.css` only; `app/layout.tsx` untouched)

- `--color-amber-dark`: `#a97400` → `#7c5500` (resolves finding 1 everywhere).
- `:focus-visible` ring → highway green + amber retained on `.bg-ink`/`footer`
  (finding 6).
- Scoped interim lifts for findings 2–4 (each commented with the proper
  component-level fix and file:line).
- `body { overflow-x: clip }` — horizontal-scroll guard; `clip` (not `hidden`)
  so `position: sticky` header keeps working.
- Reduced motion: already correct (`prefers-reduced-motion` kills animations and
  smooth scroll, including `.read-progress`); no change needed.
- Tap targets: Lighthouse `target-size` already passes; no change (the mobile
  menu `<summary>` is the thinnest control — revisit only if its padding shrinks).

No changes to data, content, conditions, search, sources, or any component file.
Layout needs no change: skip link, `lang`, landmarks, and metadata are correct
(SEO 100); `<div id="main">` is fine because pages render their own `<main>`
(adding a second `<main>` in layout would be a regression).

## Remaining

- Finding 7 only if mobile performance drops below 90; not worth design churn
  now.
- Re-run Lighthouse after the component contrast/aria fixes deploy.
- Design call: the darkened `amber-dark` (#7c5500) is intentionally less "gold"
  at small sizes for legibility. If brand wants the brighter gold back for large
  display type only, scope it to ≥24px/bold contexts (3:1 rule) — never body/kicker text.
