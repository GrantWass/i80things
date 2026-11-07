# Publicity status

Where the I-80 Things launch actually stands. The how-to is in
[`DISTRIBUTION.md`](./DISTRIBUTION.md); this is the scoreboard, the blockers and
the next three moves. Update the date and the tables when something changes.

**Updated:** 2026-11-06
**Live site:** <https://i80things.vercel.app> · 23 stories
**Canonical domain:** `i80things.com` — does not resolve yet

---

## 1. The honest summary

The publishing side is real: a live site, 23 original stories, a daily agent, a
generated Instagram image and caption for every story, full-content RSS, news
sitemap, schema and `llms.txt`. The **distribution** side has barely started.
Nothing has been posted to a Facebook group, Reddit, Threads or Bluesky, no
newsletter exists, and the public identity still sits on a `vercel.app` URL.

The bottleneck is not code. It is roughly three hours of account setup and one
week of joining groups before the first share. Everything needed to share is
already built and waiting (see §3).

Until that changes, the site is a well-built newsroom with no front door.

Rows marked **unknown** or **confirm** are read from the repo, not from the
accounts. Correct them the first time you log in.

---

## 2. Channel scoreboard

| Channel | State | Blocked on | Next action |
| --- | --- | --- | --- |
| Site / SEO / RSS | **Live** | — | Submit sitemaps, fix crawl errors |
| Google Search Console | Unknown | Account | Verify, submit `/sitemap.xml` + `/news-sitemap.xml` |
| Bing Webmaster | Not started | Account | Same sitemaps, 10 minutes |
| Google News / Publisher Center | Not started | Custom domain | Create publication after the domain is live |
| Custom domain + email | **Blocked** | Purchase + DNS | Buy, point at Vercel, set SPF/DKIM/DMARC |
| Instagram | Manual kit ready | Business account + Page | Link Page, then optionally the Graph API |
| Facebook Page | **Not confirmed** | — | Create it today if it does not exist; it unlocks groups, IG API and Threads |
| Facebook groups | List started, 0 posted | Page + joins | Join the three priority-one groups, read for a week |
| Reddit | Not started | Account warmth | Comment for a week, then 2–3 posts a week |
| Threads | Not started | Meta app | Same app as Instagram; 20 minutes |
| Bluesky | Not started | — | Free, no review; cheapest win on the list |
| X | Deliberately deferred | Pay-per-use pricing | Revisit after the first month of data |
| Newsletter | Not started | Provider choice | Buttondown or Resend; highest-leverage build |
| Analytics | Installed | — | `campaign_visit` is built but not deployed; see §6 |

---

## 3. Built and waiting

All of this exists in the working tree. It goes live when committed and pushed.

| Asset | What it does | Where |
| --- | --- | --- |
| Share kit | Per-platform copy + UTM links for X, Threads, Bluesky, Facebook Page, group, Reddit | `scripts/share.mjs`, `npm run share -- --slug …` |
| Group list | 14 groups with size, access, priority and notes | `data/groups.json`, `npm run groups` |
| Campaign tracking | Fires `campaign_visit` (source/medium/campaign) on UTM landings | `components/CampaignTracking.tsx` |
| Instagram kit | 1080×1350 JPEG per gallery image, caption, bio link | `/api/social/<slug>`, `/admin` |
| Instagram poster | Graph API dry-run / publish | `scripts/publish-instagram.mjs` |
| Distribution playbook | Routine, routing matrix, group and Reddit rules, measurement | `docs/DISTRIBUTION.md` |
| Full RSS + news sitemap | Feeds schedulers, aggregators, Google News | `/feed.xml`, `/news-sitemap.xml` |

Not built: Facebook Page poster, Threads poster, Bluesky poster, newsletter signup.

---

## 4. Accounts, in dependency order

Order matters — the Facebook Page unlocks three other surfaces.

| # | Account | Why now | Cost | Time | Depends on |
| --- | --- | --- | --- | --- | --- |
| 1 | Facebook Page | Groups, Instagram API, Threads | Free | 15 min | — |
| 2 | Instagram → Business, linked to the Page | API posting, carousel | Free | 20 min | Page |
| 3 | Threads | Free syndication with links | Free | 15 min | Page |
| 4 | Bluesky | Free, links work, `@i80things.com` later | Free | 10 min | — |
| 5 | Reddit | r/Nebraska and city subs | Free | 15 min + a week of reading | — |
| 6 | Custom domain + mail | Public identity, email, AdSense | ~$15/yr + forwarding | 1 hour | Purchase |
| 7 | Search Console / Bing | Indexing | Free | 20 min | Domain preferred |
| 8 | Newsletter provider | Owned audience | Free tier | 1 hour | Domain for sending |
| 9 | X | Small reach, now metered | ~$6/mo at 1 link post/day | 20 min | Decision |

Step-by-step walkthrough for rows 1–3: [`META-SETUP.md`](./META-SETUP.md).
That file also covers the no-personal-Facebook fork (§0.5): you can publish to
Instagram without a Page, but you lose Facebook group distribution.

**Privacy stance:** the Page is never featured on the personal profile, all
posting and replying happens as the Page, and API automation uses a **system user
token** from the Business portfolio, never a token from the personal login. A
second admin is required so the Page survives a restricted profile. The checklist
is in `META-SETUP.md` §6.

**Environment variables still needed in Vercel** (see `LAUNCH-STATUS.md`):
`ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, plus
`IG_USER_ID` / `IG_ACCESS_TOKEN` after step 2.

---

## 5. Facebook groups: where the list stands

Verified from public group pages on 2026-11-06. Counts drift; re-check on join.

| Status | Count | Detail |
| --- | --- | --- |
| Priority one, verified | 3 | US 81 Corridor (91.5K), Nebraska Weather Network (13.5K), Nebraska Road Conditions (1.1K) |
| Town groups, verified | 5 | Life In Lincoln (17.4K), What's Up Kearney (8.5K), Kearney Activities (5.8K), Hastings events (9.2K), North Platte (6.7K) |
| Needs a login check | 5 | Panhandle weather, Nebraska Severe Weather, Grand Island, Omaha/Council Bluffs, Nebraska freight |
| Do not post | 1 | Things To Do In Omaha & Beyond — rules ban promoting your own site |
| Joined | **0 recorded** | Not tracked yet; add a `joinedAt` field when you join |
| Shared into | **0 recorded** | — |

Missing a group altogether: the main Omaha metro group, Fremont, Columbus, York,
Seward, Lexington, Ogallala, Sidney, Kimball.

The list, filters and add command:

```bash
npm run groups
npm run groups -- --area kearney --open
```

---

## 6. Measurement baseline

Nothing is recorded yet. Fill this in on the first Monday after the accounts are
live, then weekly.

| Metric | Today | Week 1 | Week 4 | Notes |
| --- | --- | --- | --- | --- |
| Sessions | unknown | | | Vercel Analytics → Visitors |
| Top referrer | unknown | | | |
| `campaign_visit` by medium | not deployed | | | Needs the component pushed |
| Instagram followers | unknown | | | Confirm the account first |
| Facebook Page followers | 0 | | | |
| Groups joined / posted | 0 / 0 | | | |
| Reddit karma / posts | 0 / 0 | | | |
| Newsletter subscribers | 0 | | | No signup exists yet |

The only number that decides anything is **sessions that reach a second story**.
Likes and follower counts do not pay for the site.

---

## 7. The next 30 days

**Week 1 — set the table**
- [x] Create the Facebook Page
- [ ] Finish the About, contact, username and publish the Page — [`META-SETUP.md`](./META-SETUP.md) §1
- [ ] Confirm the Page does not appear on your personal profile (Profile → About → Pages)
- [ ] Switch Instagram to Business and link it to the Page (§2–3)
- [ ] Create the Business portfolio, add a second admin, create the system user (§4–5)
- [ ] Replace the Page's placeholder website and email once the domain is live (`NEXT-STEPS.md`)
- [ ] Create Bluesky with an app password
- [ ] Commit and push the share kit, group list and campaign tracking
- [ ] Join the three priority-one groups; read, do not post
- [ ] Start the Reddit account; comment, do not post

**Week 2 — first shares**
- [ ] Share one strong story to the Page, then to one weather group and one town group
- [ ] One Reddit text post in r/Nebraska
- [ ] Check `campaign_visit` in analytics; note what worked

**Week 3 — fill the map**
- [ ] Join the remaining town groups; add them with `npm run groups -- add`
- [ ] Answer one group question with no link
- [ ] Post the second Reddit story, in a city sub

**Week 4 — decide**
- [ ] Review the baseline table
- [ ] Cut any channel under 1% of sessions
- [ ] Decide on X, the domain and the newsletter provider
- [ ] If search is still flat, publish the two best evergreen guides to groups as answers

---

## 8. Open decisions

1. **Domain timing.** Every day on `vercel.app` is a day of links, handles and
   search history that has to move later. This is the cheapest unblock on the
   list and it gates email, AdSense and Google News.
2. **X: pay or skip.** Link posts cost $0.20 each; a scheduler sidesteps the fee
   because the scheduler's app pays X. Defer until there is data.
3. **Who posts to groups.** A Page share looks institutional; a personal post
   with disclosure gets more replies. Recommendation: share from the Page,
   answer comments as the person who wrote it.
4. **Newsletter provider.** Buttondown (simple, cheap) vs Resend (developer-first,
   needs code). Pick before the domain so the sending domain is set up once.
5. **Disclosure.** Always say "I write for I-80 Things." It is the difference
   between a local reporter and a spam account, and Reddit's rules require it.

---

## 9. Reminders

Open loops that are easy to forget. Clear them or move them to a dated task.

- [ ] Replace the Facebook Page's placeholder **website** (`vercel.app` →
  `i80things.com`) and **contact email** (personal → `hello@`) once the domain and
  mail work. See `NEXT-STEPS.md` §1 and `META-SETUP.md` §1.
- [ ] Update the Instagram bio link to the canonical domain at the same time.
- [ ] Update the Instagram **contact email** (Account type and tools → Contact
  info) at the same time — it is public.
- [ ] The second admin must accept the Business portfolio invite, or the backup
  does not exist.
- [ ] Rotate the system user token if it is ever pasted into a chat, a commit or a
  screenshot.

---

## 10. Change log

| Date | Change |
| --- | --- |
| 2026-11-06 | Created. Verified 8 public Facebook groups and 1 to avoid; built share kit, group list and campaign tracking; site at 23 stories, domain still unset |
| 2026-11-06 | Page created; progress block and placeholder reminders added to `META-SETUP.md` |
