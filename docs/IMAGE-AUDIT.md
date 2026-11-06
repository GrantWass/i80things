# Story image audit — November 2026

Tooling: `npm run images:audit` (`scripts/audit-images.mjs`).

## Snapshot

- **25 images across 22 stories** (covers plus three multi-image galleries).
- **0 missing alt text, 0 missing credits, 0 duplicate files** after the fixes below.
- Every image is **1600×900** (16:9); the largest is **450 KB**. `next/image` serves responsive AVIF/WebP crops, so the source size is not the delivered size.
- Every image has a source/license URL.
- Three stories now have an explicit `images:` gallery; the rest use the legacy cover fields and are normalized by `lib/content.ts`.


## Cover inventory

| Story | Cover image | Assessment |
| --- | --- | --- |
| Amtrak California Zephyr | Train at Omaha | Accurate and specific; strong. |
| How to read Nebraska 511 | I-80 message sign in snow | Strong; directly supports the story. |
| I-80 around Lincoln | I-80 approach with Capitol | Strong; good sense of place. |
| Mile markers explained | Chappell aerial | Relevant town/I-80 view; not literally a mile marker, but the alt is accurate. |
| I-80 through Omaha | Downtown skyline at dusk | Good, though darker than the others. |
| Service gaps | Sidney Eastbound rest-area sign | Alt corrected; it is a sign, not a rest-area building. |
| Kearney at mile 272 | The Archway over I-80 | Strong and unmistakable. |
| NDOT construction | I-80 work zone near Wyoming | Strong. |
| Scanner radio | Handheld scanner | Accurate but generic; acceptable for an explainer. |
| NSP crash reports | NSP Dodge Charger | Replaced the badge close-up; strong. |
| North Platte | Golden Spike Tower | Strong. |
| Sidney to Kimball | Downtown Kimball main street + Cabela’s | New cover; much stronger than the parking-lot aerial. |
| Winter driving | I-80 entrance after snow | Strong; directly on point. |
| Grand Island at mile 312 | Downtown Grand Island | Strong; Highsmith CC0. |
| Lexington at mile 237 | Lexington water tower + Platte valley cornfield | Water tower gives the town identity; the cornfield is explicitly captioned as near Minden. |
| Ogallala at mile 126 | Lake McConaughy aerial + historic gas station | Lake gives the story its reason; gas station supports the fuel-stop angle. |
| Hit-and-run pursuit in Lincoln | Downtown Lincoln skyline | City context; the caption does not pretend the pursuit started at the Capitol. |
| York at mile 353 | Painted hot-air-balloon water tower | The city's actual landmark; the image is the subject, not a generic field. |
| Seward at mile 379 | Downtown Seward courthouse square | The actual downtown the story describes. |
| Kimball at mile 22 | Downtown Kimball | The actual county-seat downtown, not a highway stock photo. |
| Hastings at Exit 312 | Downtown Hastings, Second Street | The actual downtown; the caption explains the US-281 spur. |
| Grand Island at mile 312 | 2026 aerial of Grand Island | Replaced a poorly sourced downtown image with a clearly credited CC0 aerial. |
| Nighttime closures at mile 427 | Nighttime bridge construction | Stock image of bridge work, explicitly captioned as not the mile 427 site; better than a generic road shot. |
| Nebraska scanner radio | Handheld Uniden scanner | Replaced an extreme close-up of a speaker grille with a recognizable scanner. |

## Fixes made

| Story | Issue | Fix |
| --- | --- | --- |
| Nebraska State Patrol crash reports | Cover was a zoomed-in shoulder patch, alt claimed it was a vehicle | Replaced with a real NSP Dodge Charger cruiser; accurate alt/credit. Removed a duplicate storm-sign image already used by the 511 story. Added a 4:5 `socialSrc` crop and a real caption. |
| I-80 service gaps | Alt said “rest area” but the photo is the Sidney Eastbound **sign** | Alt corrected to “The Sidney Eastbound rest area sign on I-80.” |
| Sidney to Kimball | Cover was a Cabela’s headquarters parking-lot aerial, weak for a “last 60 miles” story | New cover: a downtown Kimball main-street view (public domain). Cabela’s HQ kept as the second gallery image. Both have captions, credits and Instagram flags. |
| New city stories (Grand Island, Lexington, Ogallala) | First drafts had usable but generic images (downtown, cornfield, gas station) | Grand Island kept its downtown image; Lexington gained the water tower as cover with the cornfield as a captioned secondary; Ogallala gained Lake McConaughy as cover with the gas station secondary. |

## Display changes

- **Article gallery** (`components/ArticleGallery.tsx`):
  - Cover is clickable and opens a full-screen lightbox.
  - Multi-image stories show a thumbnail strip below the cover.
  - Lightbox supports prev/next, counter, Escape/arrow keys, caption, alt text and credit.
  - Caption falls back to alt text when no caption is set.
- **Cards** show a “N photos” badge when a story has a gallery.
- **Image credits** page lists every gallery image with its own credit/source.
- **Sitemaps** include all gallery images, not just covers.
- **Instagram** uses each selected image at 1080×1350 with the corner brand watermark; `socialSrc` can provide a better 4:5 crop for a specific image.
- **Admin** lets editors upload multiple images, set caption/alt/credit, choose the cover, reorder and pick Instagram images.

## Remaining work / guidance

- Existing single-image stories can gain a second image when a good, relevant, licensed photo exists. Do not add a second image just to fill a gallery.
- Every image needs: accurate alt, a caption if the alt alone is not enough context, credit, credit URL, and a real check that the crop works on both 16:9 cards and 4:5 Instagram.
- For a photo that crops badly at 4:5 (wide vehicles, signs), add a `socialSrc` crop instead of accepting a bad Instagram crop.
- The admin Instagram-kit checkbox selection is local for manual posting. The API carousel uses the `instagram: true` flags in the story frontmatter.
- If focal-point control becomes necessary, add a `focalPoint` field rather than hard-coding `object-position` in components.

## New-image checklist

1. Is the photo real, relevant and correctly licensed?
2. Does the alt describe what is actually visible?
3. Is there a caption that adds context beyond the alt?
4. Is the credit and source URL exact?
5. Does it work as a 16:9 card, an article hero and a 4:5 Instagram image?
6. If not, add a `socialSrc` crop.
7. Run `npm run images:audit` and `npm run validate`.
