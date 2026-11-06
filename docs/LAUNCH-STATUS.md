# Launch status

**Live:** https://i80things.vercel.app
**Repo:** https://github.com/GrantWass/i80things
**Verified:** November 5, 2026
**Account/purchase work:** [NEXT-STEPS.md](./NEXT-STEPS.md)

## Live now

- 13 original corridor stories, including the 511 guide, mile-marker reference, winter-driving guide, service-gap guide, scanner explainer and town hubs with unique local guides.
- `/conditions` — a five-minute-cached corridor status page combining Nebraska 511 closures/construction with point-based NWS alerts for every town.
- 87-source directory at `/sources`, with search, category filters, copyable RSS URLs, scanner links and live feed-health status from `data/source-health.json`.
- Public trust pages at `/corrections` and `/image-credits`.
- Public JSON APIs: `/api/posts`, `/api/sources`, `/api/alerts`.
- City hubs, topic hubs, author pages, RSS, sitemaps, Google News sitemap, `llms.txt`, `llms-full.txt`, `ads.txt`.
- Generated 1200×675 OG images and 1080×1350 Instagram JPEGs per selected gallery image. Real photos are used full-bleed, with a corner brand watermark; captions use a "link in bio" CTA, no QR codes.
- AdSense-ready slots, privacy notice, editorial standards, corrections policy.
- Daily agent: the `i80-daily` OpenCode agent on Muse Spark 1.3 Contributor, a 5:30 a.m. Central macOS scheduler, and `npm run daily`.
- Cookieless Vercel Analytics + Speed Insights, custom events for search and outbound actions; responsive `next/image` delivery for story photos.
- Full-content RSS, site search, corridor map and NWS point forecasts on town hubs.
- Daily agent tooling: `npm run log`, `npm run sources`, `npm run new`, `npm run validate`, `npm run social`.
- Password-protected admin UI for stories, sources, image uploads and the Instagram kit (needs env vars below).
- GitHub → Vercel auto-deploy on every push to `main`.

## Needs your action

| Item | Why | Where |
| --- | --- | --- |
| Buy/connect a domain | `i80things.com` does not resolve. A custom domain is strongly recommended before applying to AdSense. | Vercel → Domains, then update `NEXT_PUBLIC_SITE_URL` and redeploy. |
| Set `ADMIN_PASSWORD` | Enables `/admin`. Without it the page shows "Admin is locked". | Vercel → Settings → Environment Variables. |
| Set `GITHUB_TOKEN` | Lets `/admin` commit stories, sources and images. Fine-grained token, Contents: Read and write. | Vercel env. Keep `GITHUB_REPO=GrantWass/i80things`, `GITHUB_BRANCH=main`. |
| Apply for AdSense | Revenue. Needs the site live, 15–20 substantial stories (we have 13), legal pages and a custom domain. | https://www.google.com/adsense/ |
| Set AdSense IDs | `NEXT_PUBLIC_ADSENSE_CLIENT`, `ADSENSE_PUB_ID`, three slot IDs. | Vercel env. `/ads.txt` updates automatically. |
| Set up Google CMP | Required for personalized ads in EEA/UK. | AdSense → Privacy & messaging. |
| Search Console + Publisher Center | Indexing and News/Discover eligibility. | Search Console, publishercenter.google.com. |
| Instagram Business + API | Optional. Manual kit works without it. Needs Business account, linked Facebook Page, `instagram_content_publish`, long-lived token. | Meta for Developers. |

## First post-launch checks

```bash
curl https://i80things.vercel.app/api/posts?limit=5
curl https://i80things.vercel.app/api/sources?recommended=true
curl https://i80things.vercel.app/api/alerts
curl https://i80things.vercel.app/api/conditions
curl https://i80things.vercel.app/api/health
curl -I https://i80things.vercel.app/api/social/how-to-read-nebraska-511
```

- Submit `/sitemap.xml` and `/news-sitemap.xml` in Search Console.
- Create the Publisher Center publication and verify ownership.
- Test `/admin` after setting the password and GitHub token: publish a draft, confirm Vercel rebuilds, delete the test post.
- Post the first Instagram story using the admin **Instagram kit**.
- Apply to AdSense after 2–3 more original stories.

## Deliberate limits

- Nebraska 511 has no supported public incident/camera API. We link and describe; we do not scrape camera images.
- Broadcastify requires a free account for live listening. Archives and the Calls API are paid.
- NSP and NDOT newsrooms do not publish RSS. `npm run sources` now pulls the NSP HTML list and NDOT's public JSON endpoint.
- Omaha PD, Lincoln PD and Council Bluffs PD block automated requests; open them in a browser.
- We do not auto-publish from scanners. Every scanner tip requires agency confirmation.
