# I-80 Nebraska source research

Verified **November 5, 2026** against live URLs, HTTP responses and, where noted, working API calls. This is the research behind [`data/sources.json`](../data/sources.json). The public directory is at **https://i80things.com/sources**.

Corridor covered: I-80 in Nebraska, Omaha (mile 454) west to Kimball (mile 22), plus the Iowa border at Council Bluffs and the Hastings/Fremont/Columbus/Beatrice/McCook spurs when relevant.

---

## 1. Scanners and public-safety radio

All Broadcastify links returned HTTP 200. Live listening requires a **free Broadcastify account** since October 2026. Archives and the Calls API are paid. Listener counts are not exposed to anonymous requests and are not reported here.

| Feed | URL | Coverage | Notes |
| --- | --- | --- | --- |
| NSP Troop H & A | https://www.broadcastify.com/listen/feed/41080 | Lancaster + Omaha-area State Patrol | Best single NSP feed in the east |
| Omaha PD Northeast | https://www.broadcastify.com/listen/feed/35492 | Omaha NE precinct | Busiest Omaha feed |
| Omaha PD Southeast | https://www.broadcastify.com/listen/feed/35490 | Omaha SE | I-80/I-480, river approaches |
| Omaha PD Southwest | https://www.broadcastify.com/listen/feed/35491 | Omaha SW | West Omaha / Gretna |
| Omaha PD Northwest | https://www.broadcastify.com/listen/feed/35495 | Omaha NW | — |
| Omaha Fire | https://www.broadcastify.com/listen/feed/34221 | Omaha Fire | Extrications, EMS |
| Douglas County Sheriff | https://www.broadcastify.com/listen/feed/39790 | Douglas County | Rural I-80 calls |
| Sarpy County Sheriff | https://www.broadcastify.com/listen/feed/43260 | Sarpy County | **Official** feed, has archives |
| Sarpy County portal | https://www.sarpy.gov/900/Radio-Traffic-Feeds | Sarpy County | Official, login-free |
| Lincoln PD + Lancaster Sheriff | https://www.broadcastify.com/listen/feed/14395 | Lincoln + Lancaster | Stereo: law left, fire right |
| Lincoln Fire | https://www.broadcastify.com/listen/feed/18959 | Lincoln Fire | Fire/EMS split |
| Lancaster rural fire | https://www.broadcastify.com/listen/feed/21281 | Rural Lancaster | I-80 between Lincoln and Seward |
| Seward County Sheriff | https://www.broadcastify.com/listen/feed/21526 | Seward/Milford | Exits 373–388 |
| Cass County fire / Otoe-Cass-Johnson | https://www.broadcastify.com/listen/feed/32263 · https://www.broadcastify.com/listen/feed/23275 | Cass/Otoe | Greenwood/Plattsmouth |
| Buffalo County / Kearney | https://www.broadcastify.com/listen/feed/40751 | Kearney + Buffalo County | PD, sheriff, fire/EMS |
| Grand Island PD/Fire | https://www.broadcastify.com/listen/feed/26964 | Grand Island | Digital PD not fully carried |
| Lincoln County / North Platte | https://www.broadcastify.com/listen/feed/35653 | North Platte + Lincoln County | Main west-central feed |
| Lincoln County Fire | https://www.broadcastify.com/listen/feed/30234 | Lincoln County fire/EMS | — |
| Keith County / Ogallala | https://www.broadcastify.com/listen/feed/40675 | Ogallala + Keith County | Fire/EMS; I-80/I-76 junction |
| Cheyenne County / Sidney | https://www.broadcastify.com/listen/feed/47673 | Sidney + Cheyenne County | Fire/EMS; no Kimball feed |
| Scotts Bluff County | https://www.broadcastify.com/listen/feed/39012 | Scottsbluff/Gering | Western reference; no Kimball feed |
| NDOT District 4 | https://www.broadcastify.com/listen/feed/36578 | Polk/Merrick/Platte/Colfax | Plow/maintenance |
| NDOT District 3 | https://www.broadcastify.com/listen/feed/36579 | Platte/Colfax/Dodge/Washington | Plow/maintenance |
| Council Bluffs PD (delayed) | https://www.broadcastify.com/listen/feed/45846 | Council Bluffs | **Official**, 15-min delay |
| Council Bluffs Fire (delayed) | https://www.broadcastify.com/listen/feed/45845 | Council Bluffs | **Official**, 15-min delay |
| Pottawattamie County streams | https://holt.pottcountysheriff.gov/streams/?sPermalink=streams&dID=19 | Council Bluffs / Pott. County | Official delayed streams |
| Broadcastify Nebraska index | https://www.broadcastify.com/listen/stid/31 | Statewide | Directory |
| Broadcastify Calls (NSP) | https://www.broadcastify.com/calls/tg/6699 | Statewide trunked | Paid/metered API |
| Broadcastify Calls API docs | https://www.broadcastify.com/calls/dev/ | — | Prepaid per-record; catalog API $2,500/mo |

**Gaps found:** no standalone Broadcastify feeds for NSP Troops B/C/D/E, Kearney PD, North Platte PD, Sidney PD, or Kimball/Deuel/Keith law. The Calls portal covers some; county Facebook pages fill others.

**OpenMHz:** systems exist (e.g. Douglas County Fire) but `openmhz.com` and `api.openmhz.com` return Cloudflare 403 to automated requests. No public API. Link for humans only; do not depend on it.

**Legal:** Neb. Rev. Stat. § 86-290 (https://nebraskalegislature.gov/laws/statutes.php?statute=86-290). One-party consent; "readily accessible to the general public" governmental/police/fire radio is excluded from interception. Listening is legal. Publishing unlawfully intercepted content is a separate felony. We confirm tips with agencies, never rebroadcast audio, and never publish tactical movements. RCFP guide: https://www.rcfp.org/reporters-recording-guide/nebraska/.

---

## 2. Police, fire and emergency sources

| Source | URL | Notes |
| --- | --- | --- |
| NSP newsroom | https://statepatrol.nebraska.gov/divisions/office-superintendent/news | Primary wire; no RSS |
| NSP reports | https://statepatrol.nebraska.gov/divisions/office-superintendent/reports-information | Annual stats |
| NSP crash reports | https://statepatrol.nebraska.gov/services/crashaccident-report-requests | Redirects to NDOT Records, 402-479-4645 |
| Omaha PD press releases | https://police.cityofomaha.org/press-releases | 403 to curl; use browser |
| Lincoln PD activity | https://www.lincoln.ne.gov/City/Departments/Police/Police-Activity | 403 to curl; daily summaries |
| NEMA newsroom | https://nema.nebraska.gov/newsroom.php | Emergencies, flooding |
| State Fire Marshal | https://sfm.nebraska.gov/agency/news | Fire investigations, burn bans |
| DHHS news | https://dhhs.ne.gov/pages/news-releases.aspx | Health alerts |
| NSP on X | https://x.com/NEStatePatrol | Fastest posts; verify |
| NSP on Facebook | https://www.facebook.com/NEStatePatrol/ | Mirror |

County sheriff and city PD pages for Grand Island, Kearney, North Platte, Sidney and the corridor counties publish primarily on Facebook/X. We link to them where verified; do not treat a social post as final confirmation if the agency has a newsroom.

---

## 3. Traffic, roads and construction

| Source | URL | Access | Notes |
| --- | --- | --- | --- |
| Nebraska 511 | https://511.nebraska.gov/ | Free, view-only | Incidents, closures, cameras, plows, rest areas |
| Plow tracker | https://plows.nebraska.gov/ | View-only | Redirects to 511 plow layer |
| NDOT travel | https://dot.nebraska.gov/travel/ | Free | Travel hub |
| NDOT news | https://dot.nebraska.gov/news-events/news-releases/ | Free, no RSS | Check weekdays |
| NDOT news JSON API | `https://dot.nebraska.gov/api/NewsAndEvents/FilteredNews` | Free, keyless | Undocumented endpoint behind NDOT's news grid; title, date, PDF link |
| NDOT projects | https://dot.nebraska.gov/projects/ | Free | District construction PDFs |
| Detour PDF | https://dot.nebraska.gov/media/4v5lbeay/construction-detours-info.pdf | Free | Static guidance |
| NDOT traffic counts | https://gis.ne.gov/dot/rest/services/AADTCountsDOT/MapServer | Free ArcGIS | Keyless query |
| Lincoln crash data | https://opendata.lincoln.ne.gov/ | Free ArcGIS | 2019–2022 layers |
| NDOT crash data | https://dot.nebraska.gov/safety/crash/ | Free PDFs | Annual/monthly |
| NTIP crash map | https://ntip.nebraska.gov/Map | View-only | No verified bulk export |
| FARS | https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars | Free, lagging | Bot-protected; bulk downloads |

**NDOT news API:** `https://dot.nebraska.gov/api/NewsAndEvents/FilteredNews` returns a JSON array with `navigationTitle`, `newsDate`, `documentLink` and `dateString`. It is undocumented but public and powers NDOT's own FilteredNews.js grid. Poll it once a day; do not hammer it. The PDF `documentLink` is the actual release.

**Nebraska 511 specifics:** the public site is a Castle Rock ITS "CARS" single-page app. There is **no supported public JSON/XML API**. Camera and incident data require a CARS/NDOT XML feed agreement. The internal `/api/graphql` proxy answers CMS queries but event/camera queries are undocumented; do not build on it. 511 by phone; `*55` for NSP emergencies.

**Working keyless examples:**

```bash
# AADT query
curl -s "https://gis.ne.gov/dot/rest/services/AADTCountsDOT/MapServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=1"

# Lincoln 2022 crashes
curl -s "https://services1.arcgis.com/wpJGOi6N4Rq5cqFv/arcgis/rest/services/Traffic_Crashes_2022/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=1"
```

---

## 4. Weather

NWS API is free and keyless but requires a descriptive `User-Agent`.

| Source | URL / endpoint | Coverage |
| --- | --- | --- |
| NWS Omaha/Valley | https://www.weather.gov/oax/ | Omaha to Seward |
| NWS Hastings | https://www.weather.gov/gid/ | York to Lexington |
| NWS North Platte | https://www.weather.gov/lbf/ | North Platte to Ogallala |
| NWS Cheyenne | https://www.weather.gov/cys/ | Kimball/Sidney |
| NWS Goodland | https://www.weather.gov/gld/ | Southwest spillover |
| Active alerts | `https://api.weather.gov/alerts/active?area=NE` | Statewide |
| Corridor alerts | `https://api.weather.gov/alerts/active?zone=NEC055,NEC109,NEC079,NEC019,NEC111,NEC033` | Six key counties |
| Point forecast | `https://api.weather.gov/points/41.2565,-95.9345` | Then follow `forecast` URL |
| Omaha grid forecast | `https://api.weather.gov/gridpoints/OAX/83,60/forecast` | Working example |
| Office metadata | `https://api.weather.gov/offices/OAX` | Contact info |

Corridor county zones verified: Douglas `NEC055`, Lancaster `NEC109`, Hall `NEC079`, Buffalo `NEC019`, Lincoln `NEC111`, Cheyenne `NEC033`. WFOs: OAX, GID, LBF, CYS, GLD, BOU.

**Nebraska Mesonet:** no public API. The viewer pulls from internal sheets. Contact NSCO for data access. Do not screen-scrape.

---

## 5. Newspapers, TV and radio (verified RSS)

All feeds tested live on 2026-11-05. Cloudflare-fronted WordPress feeds require a browser User-Agent.

| Outlet | Feed | Status | Paywall |
| --- | --- | --- | --- |
| Omaha World-Herald | `https://omaha.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| WOWT 6 | `https://www.wowt.com/arc/outboundfeeds/rss/?output=1` | 200 | None |
| KETV 7 | `https://www.ketv.com/topstories-rss` | 200 | None |
| 3 News Now / KMTV | `https://www.3newsnow.com/index.rss` | 200 | None |
| Omaha Daily Record | `https://omahadailyrecord.com/rss.xml` | 200 | Hard |
| Daily Nonpareil | `https://nonpareilonline.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Lincoln Journal Star | `https://journalstar.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| 10/11 News | `https://www.1011now.com/arc/outboundfeeds/rss/?output=1` | 200 | None |
| KLKN | `https://www.klkntv.com/feed/` | 200 | None |
| KFOR | `https://www.kfornow.com/feed/` | 200 | None |
| York News-Times | `https://yorknewstimes.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Fremont Tribune | `https://fremonttribune.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Columbus Telegram | `https://columbustelegram.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Grand Island Independent | `https://theindependent.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Hastings Tribune | `https://hastingstribune.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Metered |
| Kearney Hub | `https://kearneyhub.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Lexington Clipper-Herald | `https://lexch.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| North Platte Telegraph | `https://nptelegraph.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Sidney Sun-Telegraph | `https://www.suntelegraph.com/rss/articles` | 200 | Metered |
| Scottsbluff Star-Herald | `https://starherald.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| Beatrice Daily Sun | `https://beatricedailysun.com/search/?f=rss&t=article&l=10&s=start_time&sd=desc` | 200 | Soft |
| McCook Gazette | `https://www.mccookgazette.com/rss.xml` | 200 | Metered |
| Grant Tribune | `https://www.granttribune.com/rss` | 200 | None |
| Nebraska Examiner | `https://nebraskaexaminer.com/feed/` | 200 | None |
| Flatwater Free Press | `https://flatwaterfreepress.org/feed/` | 200 (browser UA) | None |
| Silicon Prairie News | `https://siliconprairienews.com/feed/` | 200 (browser UA) | None |
| Nebraska Trucking Assn. | `https://nebtrucking.com/feed/` | 200 | None |

**No feed (monitor manually):** Nebraska Public Media (https://nebraskapublicmedia.org/news/), News Channel Nebraska (https://nebraska.tv/), KVNO (https://kvno.org/newsradio/), Seward County Independent (https://www.sewardindependent.com/news), Keith County News (https://ogallalakcnews.com/Welcome.html), Holdrege Daily Citizen, Auburn Nemaha County Herald (no resolvable site), NDOT.

**Stale feed:** Nebraska Rural Radio / KRVN (`https://ruralradio.com/feed/`) last updated May 2026. Monitor the homepage instead.

**Aggregation rules:** link out, write original context, never republish the body. KETV/Hearst terms prohibit scraping and redistribution. Treat metered sites as headline sources only.

---

## 6. Government, data and travel

| Source | URL | Notes |
| --- | --- | --- |
| Nebraska Legislature | https://nebraskalegislature.gov/bills/ | POST search forms; no JSON API |
| NEMA | https://nema.nebraska.gov/newsroom.php | Emergency news |
| NDOT AADT | `https://gis.ne.gov/dot/rest/services/AADTCountsDOT/MapServer` | Keyless ArcGIS, annual counts |
| NDOT crash portal | https://dot.nebraska.gov/safety/crash/ | PDFs |
| NTIP | https://ntip.nebraska.gov/Map | Crash map, view-only |
| Lincoln open data | https://opendata.lincoln.ne.gov/ | Crash layers 2019–2022 |
| FARS | https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars | Lagging |
| Amtrak Zephyr | https://www.amtrak.com/california-zephyr-train | Official schedule |
| Amtraker | `https://api.amtraker.com/v2/trains/5` / `6` | Unofficial, keyless |
| NDOT research | https://dot.nebraska.gov/business-center/research/ | PDFs |
| Bid Express | https://www.bidx.com/ne/lettings | Login required |

Nebraska stops on the Zephyr: Omaha, Lincoln, Hastings, Holdrege, McCook. West of Lincoln the route follows the Platte south of I-80.

---

## 7. Programmatic APIs checked

| API | Status | Auth | Use |
| --- | --- | --- | --- |
| `api.weather.gov` | Working | User-Agent only | Alerts, forecasts |
| NDOT AADT ArcGIS | Working | None | Traffic counts |
| Lincoln crash FeatureServer | Working | None | Crash analysis |
| Amtraker v2 | Working | None | Zephyr status |
| NWS radar WMS | Working | None | Radar tiles |
| 511 internal GraphQL | Reachable but undocumented | None | **Do not depend on** |
| Broadcastify Calls API | Paid | Account + prepaid | Archived radio calls |
| OpenMHz API | None/403 | — | Do not use |
| NDOT cameras | View-only | — | No hotlinking |
| FARS API | 403 to curl | — | Browser/bulk only |
| Bid Express | Login | Account | Not public |
| Nebraska Mesonet | No API | — | Contact NSCO |

---

## 8. Monetization and distribution research

**AdSense:** no official traffic minimum; practical approval needs 20–30 substantial original posts, About/Contact/Privacy/Terms, HTTPS and clean navigation. AI content is allowed if it adds value; scaled content abuse is not. `ads.txt` is effectively required. Google-certified CMP with IAB TCF is required for personalized ads in the EEA/UK. Auto ads + 2–4 manual units is the recommended hybrid. Expect days to 2–4 weeks for review. Sources: https://support.google.com/adsense/answer/9724 and https://developers.google.com/search/docs/fundamentals/using-gen-ai-content.

**Google News / Discover:** Publisher Center is for management, not algorithmic approval, but create and verify a publication. News sitemap must contain only the last 48 hours, max 1,000 URLs. NewsArticle schema should match the visible headline, author and dates. Do not use the Indexing API for articles; its supported scope is JobPosting and BroadcastEvent.

**LLM SEO:** `llms.txt` is a community proposal, not adopted by the major labs. It is cheap to ship (this repo does) but not a ranking strategy. What works: be indexed, answer in the first 30% of the page, use clear entities, original data/context, semantic HTML, and allow the crawlers you want citations from. `Google-Extended` controls Gemini training, not Search or AI Overviews; blocking Googlebot kills both.

**Instagram:** Business/Creator account linked to a Facebook Page; Meta app with `instagram_content_publish` and App Review; long-lived token. Image must be a public HTTPS JPEG, 4:5 to 1.91:1, ≤8 MB. Two-step publish: create container → publish. 100 API-published posts/24h. Hashtags are weak reach signals in 2026; keywords in the caption matter more. Official docs: https://developers.facebook.com/documentation/instagram-platform/content-publishing.

**Ad networks:** AdSense $5–$12 RPM; Ezoic/Journey $8–$18; Mediavine 50k sessions; Raptive 25k pageviews (lowered Oct 2025); direct local sales $25–$75 CPM equivalent.

---

## 9. What is still missing

- No verified standalone scanner feed for Kimball, Deuel, Dawson or Keith law enforcement.
- No public API for 511 incidents/cameras; a CARS data agreement is the only supported route.
- No RSS for NSP, NDOT, Nebraska Public Media, News Channel Nebraska, KVNO, Seward County Independent or Keith County News.
- No public API for Nebraska Mesonet.
- Omaha's live traffic-restriction ArcGIS service was returning 404 at verification time.
- Court records and crash-report lookups remain manual/paid.

Add new sources through `/admin` → **Sources**, or edit [`data/sources.json`](../data/sources.json) and run `npm run build`.
