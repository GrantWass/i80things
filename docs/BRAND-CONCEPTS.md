# Brand concepts: subtle Nebraska charm

**Shipped 2026-11-06:** option 2 from `brand-concepts-7.html` — the traced
Nebraska silhouette between two husked cobs, in the band above `INTERSTATE 80`.
Implemented in `lib/brand.mjs`; the avatar asset is
`public/brand/profile-white.png` (1024 square, white, mark at 66%). The favicon
and the 44 px header lockup stay plain, because the crest is illegible below
about 48 px.

Three directions for adding a Nebraska signal to the mark without turning a news
brand into a farm brand. Visual preview: **[`brand-concepts.html`](./brand-concepts.html)**
(open it in a browser — it is self-contained).

Nothing here is wired into `lib/brand.mjs` yet. The current mark is unchanged
until one is chosen.

---

## What stays fixed

- The interstate badge: rounded square, highway green `#14432f`, paper ring.
- `INTERSTATE` over `80`.
- Amber `#e3a008` as the only accent.
- Newsreader-style serif for the wordmark, Public Sans for labels.

The charm has to live inside that system, or it fights the thing that makes the
site look credible on a crash story.

---

## Round three: traced state, husk cup

Visual preview: **[`brand-concepts-6.html`](./brand-concepts-6.html)**.

Round two's silhouette was still hand-drawn and wrong: the panhandle was twice as
wide as the real one. It is now traced from a public-domain Nebraska GeoJSON, 60
points, true 2.18:1 aspect, with the real Missouri River edge. The corn is a
kernel-textured cob sitting in a **husk cup** — three leaves wrapping the base,
middle leaf in front — instead of blades radiating from the bottom, which read as
rocket fins.

This is the direction unless something else wins:

| Piece | Decision |
| --- | --- |
| State | Traced path, filled paper, 24 × 11 units in the band |
| Cobs | 8 × 14 units, tilted ±7°, one each side |
| Husk | Cup of three leaves; tan `#d8cdaa`, front leaf `#e8dfc6` |
| Type | `INTERSTATE` and `80` unchanged |
| Small sizes | Falls back to the plain badge below 48 px |

Still open: whether the cobs survive at 64 px or drop to a simplified sliver, and
whether the state stays filled or becomes an outline at large sizes.

Earlier pages (`brand-concepts.html`, `-2`, `-3`, `-4`, `-5`) are kept for the
record; their shapes and husks are superseded.

---

## Round two: the top band

The first three did not land. The useful observation was the empty strip above
`INTERSTATE` — 24 × 10 units in a 64 px badge, and the only part of the mark with
nothing to do. Round two puts every idea there.

Visual preview: **[`brand-concepts-2.html`](./brand-concepts-2.html)**.

| Concept | The move | At 16 px | Risk |
| --- | --- | --- | --- |
| **Big Sky** | Amber sun on a hairline horizon | Dot over a line — survives | Reads generic-sunrise |
| **The Platte** | Thin river line with one fork | Gold squiggle | Can look like a wellness brand |
| **Three Kernels** | Three amber kernels, like an ear | Three dots | Dots before kernels |
| **Nebraska** | 15 × 9 silhouette of the state | Amber blob | Looks like a stain |
| **Crane** | Sandhill crane in the band | Gone | Needs a fallback below 48 px |

If one of these is the direction, **Big Sky** is the safest and **Three Kernels**
is the most charming. They also combine: Big Sky in the badge, Three Kernels never
— one corn reference is the ceiling.

---

## 1. Kernel Dot

A single amber kernel replaces the dot over the **i** in *Things*, and the full
stop after it. The badge does not change.

| | |
| --- | --- |
| **Visibility** | Low. Reads as punctuation until you look. |
| **Risk** | Almost none. No legibility or contrast change. |
| **Where** | Wordmark in the header, footer, OG cards, Instagram card corner. |
| **Effort** | Small: split the wordmark into spans around an inline SVG. |

Best if the goal is "a detail regulars eventually notice."

## 2. Furrow

Faint field rows sit behind the number, and one amber horizon line closes the
badge at the bottom. The same three-line motif becomes the site's section divider.

| | |
| --- | --- |
| **Visibility** | Medium. The badge changes, but only at the base. |
| **Risk** | Low. At 32 px the rows disappear and the amber line reads as a rule. |
| **Where** | Badge base, section dividers, OG and Instagram footers. |
| **Effort** | Medium: new SVG parts in `lib/brand.mjs` plus a divider component. |

Best if you want the brand to feel like the place, not just report on it — and
you are willing to use the motif across the site so it reads as a system.

## 3. Cob Ring

The zero in 80 becomes a spiral of amber kernels — a corn-cob cross-section,
which is geometric rather than cartoonish. It only appears at display sizes; 64 px
and below fall back to the plain 80.

| | |
| --- | --- |
| **Visibility** | High. The one people mention. |
| **Risk** | Medium: two marks to maintain (display and small), and a dotted circle can read as a sun or flower at bad sizes. |
| **Where** | Instagram avatar, OG card corner, large print. |
| **Effort** | Medium-high: responsive mark plus a size rule that every surface must follow. |

Best if the Instagram grid is the priority and you accept a mark that changes with
size.

---

## They are not mutually exclusive

1 and 2 combine cleanly: the furrow badge carries the place, the kernel dot keeps
the wordmark from being purely typographic. That is the combination I would ship —
it is quiet in the header, memorable in the OG card, and adds no new colors.

3 is the alternative to that combination, not an addition to it: a kernel ring plus
a kernel dot plus furrows is three corn references where one is enough.

---

## Decision guide

1. **Look at the 16 px row first.** If you cannot tell what changed, the concept
   is too fine for a favicon and belongs only on large surfaces.
2. **Imagine it over a fatality story.** If it feels flippant, it is too loud.
3. **Ask whether a reader would describe it to someone else.** "The I-80 one with
   the corn" is the test for 3.

---

## Implementation, once chosen

`lib/brand.mjs` is the single source of truth. `app/icon.svg`, the PNGs in
`public/brand/`, the header mark and the generated cards all come from it.

1. Edit `brandMarkParts()` / `brandIconSvg()` in `lib/brand.mjs`.
2. `npm run brand` regenerates icons, lockups and the OG banner.
3. Update the wordmark in `components/SiteHeader.tsx` if the kernel dot is chosen.
4. Check the Instagram watermark path used by `/api/social/<slug>`.
5. `npm run images:audit` and `npm run build`.
6. Look at the favicon at 16 px before committing.

Keep the rule from the preview: charm never appears inside an alert, a fact box or
a correction notice.
