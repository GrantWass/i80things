# Next steps

Items that need an account, a purchase, or a decision. Code-only work is
tracked in the repo and deployed through Vercel. Domain and email are
deliberately deferred; they are first here because most other growth work
depends on them.

## 1. Domain and email (deferred by request)

Current state: `i80things.com` has no A or MX records, so the published
addresses (`hello@`, `news@`, `grant@`) do not work. The live canonical origin
is `https://i80things.vercel.app`.

When ready:

1. Buy/confirm `i80things.com`.
2. Add it in Vercel → Domains, set the apex as primary and redirect
   `www` to the apex.
3. Set up mail forwarding or a mailbox:
   - low-cost forwarding: ImprovMX, ForwardEmail;
   - full mailbox: Fastmail, Google Workspace, Microsoft 365.
   - At minimum: `hello@`, `news@`, `grant@`, `tips@`.
4. Add SPF, DKIM and DMARC records.
5. Update Vercel env `NEXT_PUBLIC_SITE_URL=https://i80things.com` and redeploy.
6. Update Google Search Console, Bing Webmaster Tools, AdSense and Instagram
   bio link to the new domain.
7. Keep `i80things.vercel.app` as a redirect, not a second canonical.

Do not apply to AdSense with the `vercel.app` URL as the public identity if the
custom domain is imminent; the review and canonical history are cleaner on the
final domain.

## 2. Production admin

Only `NEXT_PUBLIC_SITE_URL` is currently set on Vercel, so `/admin` is locked.
Set these in Vercel → Settings → Environment Variables (Production):

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | A long, unique password (not reused anywhere) |
| `ADMIN_SECRET` | A separate 32+ character random string |
| `GITHUB_TOKEN` | Fine-grained PAT, Contents: Read and write, scoped to `GrantWass/i80things` |
| `GITHUB_REPO` | `GrantWass/i80things` |
| `GITHUB_BRANCH` | `main` |

After setting them, test `/admin` by publishing a draft, confirming Vercel
rebuilds, then deleting the test post. Consider adding TOTP 2FA and a shared
rate limiter (Upstash/Vercel KV) before relying on the admin from public
networks. The login route has a small in-memory limiter, but serverless
instances do not share state.

## 3. Search and measurement

Analytics code is now in the app (`@vercel/analytics` + Speed Insights,
cookieless). To finish:

- Turn on Web Analytics and Speed Insights in the Vercel project.
- Verify the site in Google Search Console; submit `/sitemap.xml` and
  `/news-sitemap.xml`.
- Add the site to Bing Webmaster Tools; submit the same sitemaps.
- Create the Google Publisher Center publication and verify ownership.
- Optional: IndexNow key file for Bing.
- Add UTM parameters to every outbound campaign; the Instagram bio link already
  uses `utm_source=instagram&utm_medium=social&utm_campaign=bio`.

## 4. AdSense and consent

Prerequisites before applying:

- custom domain and working contact email;
- 15–20 substantial original stories (the site has 18, including local news and evergreen guides);
- privacy, terms, corrections and editorial standards pages (done);
- a Google-certified CMP for EEA/UK traffic.

The current banner is a simple notice, **not** a certified consent-management
platform. For AdSense:

1. Apply at <https://www.google.com/adsense/>.
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT`, `ADSENSE_PUB_ID`, and the three slot IDs.
3. Set up Google CMP in AdSense → Privacy & messaging.
4. Replace/augment the existing consent notice with the Google CMP.
5. Confirm `/ads.txt` serves the correct publisher ID.

Until traffic supports AdSense, direct local sponsorships (towing, tires, truck
stops, hotels, dealerships) may be more realistic. Add an `/advertise` page with
flat monthly placements and a labeled sponsored-content policy before selling.

## 5. Newsletter

No email capture exists yet. Recommended:

- Provider: Buttondown, Resend, or Mailchimp.
- Signup on the homepage, article footer, and a dedicated `/newsletter` page.
- Daily 6 a.m. CT digest: top corridor story + closures/weather + one town note.
- Add a privacy line and double opt-in.
- Add `NEWSLETTER_API_KEY` and the provider endpoint to Vercel env.

This is the highest-leverage owned audience after daily publishing.

## 6. Instagram API

The manual Instagram kit works without API access. To automate:

- Convert `@i80.things` to a Business account.
- Link a Facebook Page.
- Create a Meta app with `instagram_basic`,
  `instagram_content_publish`, `pages_read_engagement`.
- Add `IG_USER_ID` and a long-lived `IG_ACCESS_TOKEN` to Vercel.
- Test one image post, then a carousel/Reel.

The daily agent prepares the image and caption; it should not auto-post until
the token and approval flow are tested.

## 7. Distribution

- Create a Facebook Page and cross-post the Instagram image/caption.
- Claim the same handle on Threads and Bluesky if available.
- Share only high-value corridor stories in relevant Nebraska subreddits and
  local Facebook groups; do not spam.
- Consider Apple News, Flipboard and NewsBreak after 30+ stories.

## 8. Monitoring and quality

- Add uptime monitoring (Better Stack, UptimeRobot) for `/`, `/conditions`,
  `/api/conditions`, `/api/health`, `/feed.xml`.
- Add error tracking (Sentry) for the Next.js app and admin routes.
- Add a link checker to CI.
- Add Lighthouse CI or a manual monthly performance check.
- Review the generated `data/source-health.json` dashboard on `/sources`; rerun `npm run sources` to refresh stale/error feeds.
- Review image licenses at `/image-credits` when new photos are added.

## 9. Daily run

The `i80-daily` agent and macOS launchd job are installed by:

```bash
npm run daily:install
```

See `docs/DAILY-RUN.md`. If macOS blocks the background job from reading
Documents, grant Full Disk Access or run `npm run daily` from Terminal. The job
uses the locally authenticated OpenCode Go account; do not commit credentials.

## 10. Editorial

- Keep the daily cadence: 1–2 verified corridor stories per weekday, plus the
  conditions page.
- Add a named byline to original reporting when appropriate; keep
  `corridor-desk` for roundups.
- Publish a short correction log entry whenever a substantive fix is made.
- Build out the town guides with verified local detail; do not pad them with
  invented businesses or rankings.
