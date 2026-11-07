# Brand

The I-80 Things mark is one piece of artwork with one palette. Nothing
re-typesets it by hand.

## Source of truth

| File | Role |
| --- | --- |
| `lib/brand.mjs` | Palette, name/descriptor, mark geometry. Imported by app code and every script. |
| `components/BrandMark.tsx` | The mark as inline SVG for the site (header, footer, staff desk). |
| `scripts/generate-brand.mjs` | Writes every raster/vector asset from that geometry. |
| `scripts/brand-check.mjs` | Fails CI when a surface drifts or clips. |

`app/globals.css` `@theme` tokens must match `brandColors`; the brand check
enforces it.

## The mark

- Fixed 56 × 44 viewBox: green field, inset paper ring, `INTERSTATE` eyebrow,
  serif `80`. Only the height is chosen at the call site (`h-11 w-auto`); the
  proportions and aspect ratio are fixed.
- The eyebrow is locked with `textLength` (browsers) plus a matching
  `letter-spacing` (librsvg/sharp), so no font substitution can push the `I`
  or `E` outside the sign. That was the original clipping bug: the wordmark was
  ~54px wide in a 48px badge and the cream letters vanished over the paper
  background.
- The square lockup (`brandIconSvg`) is a separate, also fixed, 64 × 64
  composition for favicons and avatars.

## Assets

| Asset | Size | Used by |
| --- | --- | --- |
| `app/icon.svg` | 64 × 64 | Browser favicon (Next metadata) |
| `public/brand/logo.png` | 512 × 512 | Organization schema, RSS image, Instagram profile, social watermark |
| `public/brand/logo-180.png` | 180 × 180 | Web app manifest |
| `public/brand/mark.png` | 168 × 132 | OG and Instagram cards (embedded, never re-typeset) |
| `public/brand/og-default.jpg` | 1200 × 630 | Static fallback card |

## Rules

1. **Never rebuild the badge in a component or route.** Use `<BrandMark />` for
   the site and `getBrandMarkImage()` for generated images. `brand:check` fails
   if `INTERSTATE` appears in `app/`, `components/` or `lib/` outside
   `lib/brand.mjs`.
2. **Colour comes from `brandColors`** (or the matching CSS token), never a
   literal. OG/Instagram routes already consume it.
3. **Change the mark in `lib/brand.mjs`, then run `npm run brand`** and commit
   the regenerated files. `npm run brand:check` must pass.
4. Raster generation needs the stack in `brand.mark.sans` / `brand.mark.serif`
   installed (Arial or Helvetica, Georgia). CI only verifies committed assets,
   it does not regenerate them.

## Adding a surface

- In the app: `<BrandMark className="h-… w-auto" />`.
- In a generated image: `<img src={await getBrandMarkImage()} width={…} height={…} />`
  keeping the 56:44 ratio.
- For a new raster size, add it to `scripts/generate-brand.mjs` and to the
  asset list in `scripts/brand-check.mjs` so its size and edge safety are
  enforced.
