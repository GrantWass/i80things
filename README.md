# I-80 Things

**Daily news from Nebraska's I-80 corridor — Omaha (mile 454) to Kimball (mile 22).**

An independent, ad-supported local news site built for Vercel: verified reporting, a public source directory, a daily agent workflow, Instagram-ready images, and SEO/LLM-SEO built in.

**Live (Vercel):** https://i80things.vercel.app
**Code (GitHub):** https://github.com/GrantWass/i80things — source control only; GitHub Pages is not used.
**Launch status & remaining setup:** [docs/LAUNCH-STATUS.md](./docs/LAUNCH-STATUS.md)
**Domain/email/account next steps:** [docs/NEXT-STEPS.md](./docs/NEXT-STEPS.md)
**Daily agent runbook:** [docs/DAILY-RUN.md](./docs/DAILY-RUN.md)

---

## What's in this repo

- **News site** — Next.js 16 App Router, Tailwind 4, MDX content, static/ISR pages.
- **87 verified sources** — police scanners, State Patrol, NDOT, 511, NWS, 27 RSS feeds, town papers, open data APIs.
- **Daily agent system prompt** — [`AGENT.md`](./AGENT.md), plus the `i80-daily` OpenCode agent on Muse Spark 1.3 Contributor and a macOS scheduler. `npm run daily` runs the desk; `npm run daily:install` installs the 5:30 a.m. Central job.
- **Live corridor conditions** — `/conditions` combines Nebraska 511 closures/construction with point-based NWS alerts for every corridor town, cached for five minutes, plus a pure-CSS corridor map and auto-refresh.
- **Source health** — `npm run sources` writes `data/source-health.json`; `/sources` shows OK/stale/error/manual status for every feed.
- **Search** — `/search` searches published stories and the source directory; linked from the header and footer.
- **Staff admin** — password-protected `/admin` to publish stories, upload images, add sources and generate the Instagram kit. Commits to GitHub via the Contents API.
- **Instagram kit** — each selected story image gets a 1080×1350 JPEG (`/api/social/<slug>?image=N`) and a caption (`/api/social/<slug>/caption`). Stories can carry a gallery; the first image is the cover and you can mark several for an Instagram carousel. Real photos are used full-bleed; otherwise a branded text card is generated. No AI imagery, no QR codes; captions point to the link in bio.
- **Stock photo tool** — `npm run stock` finds CC0/public-domain photos (Openverse) or Pexels photos, downloads and crops them, and updates the story frontmatter with the credit.
- **Monetization** — Google AdSense slots, `ads.txt`, consent notice, privacy/terms pages, editorial standards.
- **Measurement** — cookieless Vercel Analytics + Speed Insights, with a corrected consent notice and UTM-tagged Instagram bio links.
- **SEO + LLM SEO** — NewsArticle/BreadcrumbList/Place JSON-LD, Google News sitemap, RSS, `llms.txt`, `llms-full.txt`, AI-crawler robots rules, city/topic hubs, internal linking.
- **Source research** — [`docs/SOURCE-RESEARCH.md`](./docs/SOURCE-RESEARCH.md) with verified URLs, feed IDs and access caveats.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional for local development
npm run dev
```

Open http://localhost:3000. The site works without env vars except `/admin`, which needs `ADMIN_PASSWORD`.

```bash
npm run validate   # check all stories
npm run log        # list everything published
npm run sources    # sweep RSS + NSP + NDOT + NWS alerts
npm run 511        # live I-80 events from Nebraska 511
npm run daily      # run the i80-daily OpenCode agent now
npm run build      # production build
```

Node 22+ and npm 10+ recommended.

---

## Deploy to Vercel

### 1. Push the repo

```bash
git add .
git commit -m "launch I-80 Things"
git push origin main
```

### 2. Import to Vercel

- Go to https://vercel.com/new and import `GrantWass/i80things`.
- Framework: **Next.js** (auto-detected). Build: `npm run build`. No special settings.
- Add the environment variables below before the first production build.

Or use the CLI:

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add ADMIN_PASSWORD production
vercel env add GITHUB_TOKEN production
vercel --prod
```

### 3. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical origin, e.g. `https://i80things.com`. Used in sitemaps, OG images, feeds, Instagram. |
| `ADMIN_PASSWORD` | **Yes** | Password for `/admin`. Use a long random string. |
| `ADMIN_SECRET` | Recommended | Extra HMAC secret for the admin session cookie. |
| `GITHUB_TOKEN` | **Yes** (on Vercel) | Fine-grained token, Contents: Read and write on this repo. Needed for the admin to publish. |
| `GITHUB_REPO` | Yes | `GrantWass/i80things` |
| `GITHUB_BRANCH` | Yes | `main` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional | `ca-pub-…` from AdSense. Ads render as reserved placeholders until set. |
| `ADSENSE_PUB_ID` | Optional | `pub-…`, served at `/ads.txt`. |
| `NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD` | Optional | Ad unit slot ID. |
| `NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE` | Optional | Ad unit slot ID. |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` | Optional | Ad unit slot ID. |
| `IG_USER_ID` | Optional | Instagram Business account ID for API posting. |
| `IG_ACCESS_TOKEN` | Optional | Long-lived Meta Graph token with `instagram_content_publish`. |
| `IG_GRAPH_VERSION` | Optional | Defaults to `v21.0`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Defaults to `hello@i80things.com`. |

### 4. Domain

The current production alias is **https://i80things.vercel.app** and `NEXT_PUBLIC_SITE_URL` is set to it. `i80things.com` does not resolve yet. When you buy/connect the domain:

1. Add `i80things.com` (and `www`) in Vercel → Domains and point DNS at Vercel.
2. Update `NEXT_PUBLIC_SITE_URL` to `https://i80things.com` in Production and Preview.
3. Redeploy so canonicals, sitemaps and generated images use the final host.

---

## Publishing stories

### Staff admin (`/admin`)

1. Set `ADMIN_PASSWORD` and `GITHUB_TOKEN` in Vercel.
2. Go to `/admin`, log in.
3. **New story** — headline, dek, markdown body, short-version bullets, town, topics, tags, sources, and an ordered image gallery. Upload several files, choose the cover, add alt/credit per image, and check the ones that belong in the Instagram carousel.
4. **Publish** — commits `content/posts/<slug>.mdx` to GitHub. Vercel rebuilds in ~1 minute.
5. The success screen gives you the live URL, the Instagram JPEG and the caption.

The admin uses the GitHub Contents API. If `GITHUB_TOKEN` is missing on Vercel, publishing returns a configuration error. Locally, it writes to the filesystem.

### By hand / by agent

```bash
npm run new -- --title "I-80 westbound reopens near Kearney" --city kearney \
  --topics crashes,state-patrol \
  --source "Nebraska State Patrol|https://statepatrol.nebraska.gov/..."
```

Edit the generated `.mdx`, then:

```bash
npm run validate
git add content/posts/<slug>.mdx
git commit -m "post: ..."
git push
```

### Frontmatter

```yaml
---
title: "Headline"                 # 45–70 chars
dek: "One sentence that adds information."
date: "2026-11-05T06:30:00-06:00"
updated: "2026-11-05T09:10:00-06:00"   # optional
author: corridor-desk
city: kearney                     # slug from data/places.ts, or statewide
topics: [crashes, state-patrol]   # from data/topics.ts
tags: [kearney, closure]
mileMarker: "272"
images:                            # optional gallery; first is the cover
  - src: "/images/posts/…jpg"
    alt: "Accurate description"
    credit: "Photo: …"
    creditUrl: "https://…"
    socialSrc: "/images/posts/…-social.jpg"  # optional 4:5 crop for Instagram
    instagram: true                # include in Instagram carousel
  - src: "/images/posts/…-2.jpg"
    alt: "Second image"
    credit: "Photo: …"
    creditUrl: "https://…"
    instagram: false
summary:
  - "Confirmed fact one."
  - "Confirmed fact two."
  - "Why it matters."
sources:
  - name: "Nebraska State Patrol"
    url: https://…
featured: false
draft: false
---
```

`npm run validate` checks required fields, valid cities/topics, source URLs, duplicate titles, placeholder text and image paths.

---

## The daily agent

Use [`AGENT.md`](./AGENT.md) as the system prompt for whichever agent runs the daily desk. The short version:

```bash
npm run log                       # 1. what have we published?
npm run sources -- --hours=24     # 2. what is new, verified or worth checking?
# 3. open the primary source, verify the five questions
npm run new -- --title "…"        # 4. scaffold
# 5. write, add sources, run validate
npm run validate
git add content/posts && git commit -m "post: …" && git push
```

The agent should publish **only** when a story is verified. A no-publish day is acceptable. The prompt includes dedupe rules, scanner ethics, crash-report verification, image rules, SEO requirements and the run-report format.

An OpenCode skill is included at [`.opencode/skills/i80-daily-post/SKILL.md`](./.opencode/skills/i80-daily-post/SKILL.md).

---

## Programmatic access

| Endpoint | Returns |
| --- | --- |
| `/api/posts` | Published stories with title, dek, date, city, topics, sources, URL, image and caption URLs. Supports `?limit=`, `?city=`, `?topic=`, `?since=`. |
| `/api/sources` | All 87 sources with category, access, reliability and notes. Supports `?category=`, `?recommended=true`, `?rss=true`. |
| `/api/alerts` | Active NWS alerts for all corridor towns (point-based). |
| `/api/social/<slug>` | 1080×1350 JPEG for the cover; add `?image=N` for other gallery images. |
| `/api/social/<slug>/caption` | JSON caption + URLs. |
| `/feed.xml` | RSS 2.0. |
| `/sitemap.xml`, `/news-sitemap.xml` | Standard + Google News sitemaps. |
| `/llms.txt`, `/llms-full.txt` | LLM-readable index and full text. |
| `/ads.txt` | AdSense publisher line when `ADSENSE_PUB_ID` is set. |

All public endpoints send permissive CORS headers; be polite and cache.

---

## Source directory

The directory lives in [`data/sources.json`](./data/sources.json) and is published at **/sources** with search, category filters and copyable feed URLs.

**87 sources** (verified November 2026):

- **22 scanner feeds** — NSP Troop H & A, Omaha PD, Omaha Fire, Douglas/Sarpy sheriffs, Lincoln PD/Fire, Lancaster rural fire, Seward, Buffalo/Kearney, Grand Island, Lincoln County/North Platte, Keith/Ogallala, Cheyenne/Sidney, Council Bluffs, NDOT districts.
- **27 RSS feeds** — Omaha World-Herald, WOWT, KETV, 3 News Now, Omaha Daily Record, Daily Nonpareil, Lincoln Journal Star, 10/11, KLKN, KFOR, York News-Times, Fremont Tribune, Columbus Telegram, Grand Island Independent, Hastings Tribune, Kearney Hub, Lexington Clipper-Herald, North Platte Telegraph, Sidney Sun-Telegraph, Star-Herald, Beatrice Daily Sun, Nebraska Examiner, Flatwater Free Press, McCook Gazette, Grant Tribune, Nebraska Trucking, Silicon Prairie News.
- **38 official and data links** — NSP, Omaha PD, Lincoln PD, NEMA, State Fire Marshal, DHHS, Nebraska 511, NDOT, plow tracker, NWS offices, alert API, AADT ArcGIS, Lincoln crash data, FARS, Amtrak/Amtraker, Legislature.

### Access caveats (important)

- **Nebraska 511** has no supported public incident/camera API. Its internal GraphQL endpoint is undocumented but does return events; `npm run 511` uses it for low-frequency monitoring. Do not build a production dependency on it, and confirm every closure with NDOT or NSP. For a supported feed, request the CARS/NDOT XML agreement.
- **NSP and NDOT** do not publish RSS feeds. Monitor their HTML pages.
- **Broadcastify** requires a free account for live listening. Archives and the Calls API are paid. Do not rebroadcast audio.
- **OpenMHz** has no public API and blocks automated access.
- **Omaha PD, Lincoln PD and Council Bluffs PD** sites use bot protection; open them in a browser.
- **FARS** lags by a year or more; never use it for breaking news.
- **Camera images** are view-only. Do not hotlink or redistribute without permission.

### Scanner law

Nebraska is a one-party-consent state, and unencrypted public-safety radio is expressly excluded from its interception statute (Neb. Rev. Stat. § 86-290). Listening is legal. Publishing a scanner tip still requires independent confirmation. We do not rebroadcast audio, publish tactical movements, or name victims before notification. See [`docs/SOURCE-RESEARCH.md`](./docs/SOURCE-RESEARCH.md).

---

## SEO and LLM SEO

Built in:

- Server-rendered semantic HTML, one H1, descriptive H2s, breadcrumbs.
- `NewsArticle`, `BreadcrumbList`, `Place`, `CollectionPage`, `Organization` and `WebSite` JSON-LD.
- Canonical URLs, Open Graph and Twitter cards with generated 1200×675 images.
- `sitemap.xml` for all pages; `news-sitemap.xml` limited to the last 48 hours; RSS.
- Town hubs (`/cities/<slug>`) and topic hubs (`/topics/<slug>`) with unique intros and internal links.
- Author pages and editorial-standards / about / contact / privacy pages for E-E-A-T.
- `llms.txt` + `llms-full.txt`, and explicit robots rules allowing GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended.
- Fast, mobile-first layout; ad slots reserve height to protect CLS.

To launch search visibility:

1. Verify the domain in [Google Search Console](https://search.google.com/search-console).
2. Submit `/sitemap.xml` and `/news-sitemap.xml`.
3. Create a publication in [Google Publisher Center](https://publishercenter.google.com/), verify ownership, add logo and sections.
4. Add the site to Bing Webmaster Tools.
5. Publish consistently. Publish **original** context, not rewritten feeds.

Do not mass-produce thin posts to chase volume. Google's spam policies target scaled content abuse, and AdSense rejects low-value sites.

---

## Monetization (AdSense)

1. Deploy with at least 15–20 substantial original stories and the legal/transparency pages. This repo ships with 13.
2. Apply at [adsense.google.com](https://www.google.com/adsense/), add the site, verify ownership, request review. Expect days to a few weeks.
3. Set `NEXT_PUBLIC_ADSENSE_CLIENT` (`ca-pub-…`) and `ADSENSE_PUB_ID` (`pub-…`).
4. Create three ad units and set the slot env vars (leaderboard, in-article, sidebar).
5. `/ads.txt` then serves the required line. Confirm it in AdSense → Sites.
6. Configure Google's consent management platform under **Privacy & messaging** for EEA/UK traffic. The site includes a lightweight cookie notice, but Google's CMP is what satisfies the personalized-ads requirement.
7. Enable Auto ads conservatively; keep the manual slots. Watch Core Web Vitals and ad density.

Realistic display RPM for a new local news site is roughly **$5–$15**; do not model the business on $30 RPM. At ~25k pageviews/month, apply to Raptive (threshold lowered to 25k) or Journey by Mediavine. Local direct sponsorships usually beat programmatic CPMs.

Never place ads that look like navigation, and never mix ads into the headline or hero.

---

## Instagram

Every story has:

- `GET /api/social/<slug>?image=N` → 1080×1350 **JPEG** for gallery image N (Meta requires JPEG).
- `GET /api/social/<slug>/caption` → JSON caption, bio link and image URL.

**Real photos, not AI imagery.** The selected gallery image is used as the full-bleed Instagram background and carries a small brand icon in the corner. If there is no image, the fallback is a clean branded text card — never an AI-generated scene. Upload real photos through `/admin` whenever possible, especially for crashes, weather and breaking news.

**Link in bio.** Captions start with a topic-specific hook, then the headline/context, then `Full story → link in bio.` Instagram captions cannot be clicked, so the admin kit also gives you a **Copy bio link** button. Paste that URL into the profile bio before posting.

Manual posting: `/admin` → **Instagram kit** → choose one or several gallery images for the carousel → put the link in bio → download/copy → post.

### Real photos

Use `npm run stock` to find a real, licensed photo and add it to a story:

```bash
npm run stock -- --query "Omaha skyline" --slug i-80-omaha-exits
npm run stock -- --query "Nebraska winter road" --slug winter-driving-i-80 --download --index 1 --update
```

It prefers Openverse's CC0/public-domain catalog and falls back to Pexels if `PEXELS_API_KEY` is set. It downloads a 1600×900 crop, saves it under `public/images/posts/<slug>/`, and writes the legacy cover fields into the frontmatter. To build a gallery, upload multiple images through `/admin` or add `images:` entries manually.

Prefer CC0/public-domain images. If you use CC BY/BY-SA, keep the credit and license note. Do not use AI-generated images of real events. Upload a photo through `/admin` if you have your own or an agency handout with permission.

API posting:

1. Convert the Instagram account to **Business** or **Creator**.
2. Link it to a Facebook Page.
3. Create a Meta app, add `instagram_content_publish`, complete App Review, and generate a long-lived token.
4. Set `IG_USER_ID`, `IG_ACCESS_TOKEN`, `NEXT_PUBLIC_SITE_URL` (public HTTPS).
5. Dry run: `npm run social:instagram -- --slug <slug>`
6. Publish: `npm run social:instagram -- --slug <slug> --publish`

Constraints: public HTTPS image URL, JPEG only, 4:5 to 1.91:1, ≤8 MB, caption ≤2,200 characters, ≤30 hashtags, 100 API-published posts per 24 hours. Keep 3–5 precise hashtags; keywords in the caption matter more than tag volume.

Because the caption says "link in bio," update the bio link to the current story before publishing. The API cannot do that for you.

---

## Project structure

```
app/
  page.tsx                     homepage
  news/                        archive + article pages
  conditions/                  511 + NWS corridor status page
  cities/                      town hubs with local guides
  topics/                      beat hubs
  sources/                     public source directory
  corrections/ image-credits/  public trust pages
  about|editorial-standards|contact|privacy|terms/
  authors/[slug]/              E-E-A-T author pages
  admin/                       staff login + dashboard
  api/
    admin/                     login, posts, sources, upload
    posts/ sources/ alerts/    public JSON APIs
    conditions/               511 + NWS JSON
    health/                   deploy/commit health check
    og/ social/[slug]/         generated images + captions
  feed.xml/ news-sitemap.xml/  syndication
  sitemap.ts robots.ts llms.txt/ llms-full.txt/ ads.txt/
components/                    UI, cards, ads, source explorer, admin
content/posts/                 MDX stories
data/                          sources.json, places.ts, topics.ts, authors.ts
lib/                           content, markdown, sources, NWS, GitHub, auth
scripts/                       agent tooling
docs/                          source research and operations notes
AGENT.md                       daily agent system prompt
```

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server. |
| `npm run build` | Production build. |
| `npm run validate` | Validate all MDX frontmatter and content. |
| `npm run log` | List published stories and source URLs (dedupe). |
| `npm run daily` | Run the `i80-daily` OpenCode agent (Muse Spark 1.3 Contributor) now. |
| `npm run daily:status` | Show the latest local daily-run log and schedule status. |
| `npm run daily:install` | Install the macOS launchd job for 5:30 a.m. Central. |
| `npm run daily:uninstall` | Remove the macOS daily job. |
| `npm run sources` | Sweep 27 RSS feeds, the NSP newsroom, NDOT releases and NWS alerts for candidate stories. |
| `npm run 511` | Read live I-80 events from Nebraska 511's internal GraphQL endpoint. Unofficial; use for monitoring only. |
| `npm run new -- --title …` | Scaffold a story. |
| `npm run social -- --slug …` | Print Instagram caption + selected image URLs (1–10). |
| `npm run stock -- --query …` | Find, download and credit a real stock/CC photo. |
| `npm run images:audit` | Check every story image for missing files, alt, credit, dimensions, aspect and duplicates. |
| `npm run social:instagram -- --slug … --publish` | Post to Instagram via Graph API. |
| `npm run brand` | Regenerate PNG brand assets. |

---

## Launch checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `GITHUB_TOKEN`.
- [ ] Confirm `/admin` login works and publishing commits to GitHub.
- [ ] Confirm a test post reaches production at `/news/<slug>`.
- [ ] Submit sitemaps to Search Console; create Publisher Center publication.
- [ ] Set AdSense env vars; verify `/ads.txt`; apply for AdSense.
- [ ] Configure Google CMP (Privacy & messaging).
- [ ] Create/convert the Instagram Business account; test `/api/social/<slug>`.
- [ ] Add the real contact email and domain.
- [ ] Run `npm run validate` and `npm run build`.
- [ ] Publish the next 5 days of original stories before applying for ads.

---

## Legal & editorial

- Independent. Not affiliated with NDOT, the Nebraska State Patrol, any city, or any campaign.
- Scanner traffic is a tip; verify before publishing.
- We link out and summarize; we do not republish other outlets' work.
- Corrections are public. See `/editorial-standards`.
- Privacy policy covers AdSense, cookies, CCPA/CPRA and EEA consent. See `/privacy`.

For the full source-by-source research, caveats and verification notes, see [`docs/SOURCE-RESEARCH.md`](./docs/SOURCE-RESEARCH.md). For scanner audio and free transcription, see [`docs/SCANNER-STT.md`](./docs/SCANNER-STT.md). For the image audit and display rules, see [`docs/IMAGE-AUDIT.md`](./docs/IMAGE-AUDIT.md). For the daily agent and scheduler, see [`docs/DAILY-RUN.md`](./docs/DAILY-RUN.md). For accounts, domain and monetization work that needs a human, see [`docs/NEXT-STEPS.md`](./docs/NEXT-STEPS.md).
