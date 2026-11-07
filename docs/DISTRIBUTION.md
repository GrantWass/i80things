# Distribution and sharing

How the corridor desk gets stories in front of people after they publish.
Written 2026-11-06. Platform rules change; re-check the dates here once a quarter.

**Where we are right now:** [`PUBLICITY.md`](./PUBLICITY.md) — live channels,
blockers, the group list and the 30-day plan. This file is the how-to.

The short version: **search and the newsletter are the traffic. Social is the
spark.** Facebook groups and Reddit can send a few hundred readers in an hour,
but they cannot be automated without risking the accounts, and they punish
anyone who treats them as a broadcast channel. Automate the surfaces that allow
it, hand-post the two that don't, and measure by referrals — not likes.

---

## 1. Where traffic actually comes from

| Channel | What it is good for | Realistic ceiling | Automatable |
| --- | --- | --- | --- |
| Google Search + Discover | Compounding daily traffic on "I-80 [town] [event]" | The bulk of the site | Already (SEO/schema/sitemaps) |
| Google News / Publisher Center | Closure and weather stories surface fast | Spiky, then fades | Already (news sitemap) |
| Facebook Page | A public record, cross-post target, ad base | Small without spend | **Yes** (Graph API) |
| Facebook groups | Local reach that search cannot give a new site | 100–2,000 views per good post | **No** (API removed 2024) |
| Reddit | Corrections, tips, arguments, occasional spike | 0–5k visits, high variance | Technically yes, practically no |
| Instagram | Brand, not clicks (no clickable links) | Followers, not sessions | Yes (already built) |
| Threads / Bluesky | Cheap syndication, near-zero effort | Small but free | **Yes** |
| X | A few closure/weather eyeballs | Small, and now metered | Yes, but pay-per-post |

Treat Facebook groups and Reddit as **reporting tools that also send traffic**.
The comments tell you what people actually want to know — that is worth more
than the clicks.

---

## 2. What can be automated, honestly

**Facebook groups — no.** Meta deprecated the Groups API in January 2024 and
removed it from every version on 22 April 2024, including the
`publish_to_groups` permission. Anything that claims to post to groups through
an official API in 2026 is either using a browser extension against Facebook's
internal endpoints or asking for your password. Both put the account at risk,
and a banned personal account takes the Page and the Instagram account with it.
The workflow below gets you 80% of the speed with none of the risk: post once
to the Page, then use Facebook's own **Share → Group** control.

**Reddit — technically yes, practically no.** A script app with OAuth can submit
links for free at low volume. But new accounts and link-only accounts get
shadowbanned, most Nebraska communities remove drive-by self-promotion, and one
bad automated post gets the domain blacklisted in Automod across the site. Post
by hand from an account with a real history.

**X — yes, but it now costs money.** Since February 2026 the free tier is gone
for new developers. Pay-per-use pricing (checked 2026-11-06,
<https://docs.x.com/x-api/getting-started/pricing>):

| Action | Cost |
| --- | --- |
| Post, no URL | $0.015 |
| Post containing a URL | **$0.200** |
| Read a post | $0.005 |

A daily link post is about $6/month. That is affordable but it is 13× the
link-free price, so the default share kit gives you a link-free X post and a
priced variant. If you route X through Buffer's free plan, Buffer's app pays X,
not you.

**Facebook Page, Threads, Bluesky, Instagram — yes, and free.** These are the
surfaces worth wiring up next, because each one accepts a clean API post with a
clickable link.

---

## 3. The daily share window (20 minutes, after publishing)

Publishing is not the end of the run. The story is live at 6 a.m.; the share
window is 6:00–6:25.

1. **Generate the kit.**
   ```bash
   npm run share -- --slug <slug>
   ```
   That prints per-platform copy, character counts and UTM links. Nothing is
   posted by the script.
2. **Instagram** (manual or `npm run social:instagram`): carousel + caption from
   the admin kit, bio link updated first.
3. **Facebook Page**: paste the Page copy. Then, on the published Page post,
   click **Share → Share to a group** for today's one or two groups. This is a
   native share with the Page's card — no retyping, no duplicate link, no
   "looks like spam" pattern.
4. **Threads**: paste, post. Same image as Instagram if it is a good one.
5. **Bluesky**: paste, post. Links are clickable and free.
6. **X**: only if the story changes how someone drives today. Link-free post;
   put the link in the profile or the reply only when the story is worth $0.20.
7. **Reddit**: only 2–3 stories a week, only in the subreddit that owns the
   story's geography or subject. Text post from the kit, link at the bottom.
8. **Log it** (see §8). Thirty seconds now saves an hour of guessing later.

If there is nothing worth sharing — a thin story, a rewrite of another outlet, a
fatality before notification — skip the window. Silence is fine. A feed of
low-value links teaches people to ignore you.

---

## 4. Which story goes where

| Story type | IG | FB Page | FB groups | Reddit | X | Threads / Bluesky |
| --- | --- | --- | --- | --- | --- | --- |
| Full closure / reopening | ✓ | ✓ | ✓ (share) | ✓ city sub | ✓ | ✓ |
| Weather warning | ✓ | ✓ | ✓ weather groups | ✓ state sub | ✓ | ✓ |
| Crash with injuries | ✓ | ✓ | ✗ until NSP confirms and family notified | ✗ usually | ✓ brief | ✓ brief |
| Construction / lane closures | ✓ | ✓ | ✓ town group | sometimes | ✗ | ✓ |
| City hub / town guide | ✓ | ✓ | ✓ that town's group | ✓ city sub if it adds something | ✗ | ✓ |
| Explainer (511, mile markers) | ✓ | ✓ | ✓ as an answer, not a post | ✓ as a comment | ✗ | ✓ |
| Statewide politics | ✓ | ✓ | ✗ | ✓ state sub | ✓ | ✓ |

Rule of thumb: **one story, one community.** The Omaha exits guide belongs in
r/Omaha. The Kimball story belongs in a Panhandle group. Posting the same link
to six communities is the behavior that gets domains banned.

---

## 5. Facebook groups playbook

### The list

`data/groups.json` is the canonical list. Read it with:

```bash
npm run groups                    # everything, best first
npm run groups -- --area kearney  # one town
npm run groups -- --ready         # only the ones worth posting to
npm run groups -- --area omaha --open   # open them in the browser
```

Verified on 2026-11-06 by reading the public group pages. Member counts drift.

| Group | Members | Access | Use it for |
| --- | --- | --- | --- |
| [US 81 Corridor weather alerts and road conditions](https://www.facebook.com/groups/908266202674538) | 91.5K | public | Weather, closures, road conditions. The name says US 81, but members post I-80 from Brady to North Platte |
| [Nebraska Weather Network](https://www.facebook.com/groups/346456688887466) | 13.5K | public | Warnings and corridor impacts, run with meteorologists |
| [Nebraska Road Conditions](https://www.facebook.com/groups/1737615886475241) | 1.1K | public | Small and exactly on topic — people asking about North Platte ⇄ Omaha drives |
| [Life In Lincoln Nebraska](https://www.facebook.com/groups/443334977081227) | 17.4K | public | Lincoln stories only |
| [What's Up Kearney](https://www.facebook.com/groups/2500057423408973) | 8.5K | private | Kearney stories; very active (≈630 posts/month) |
| Nebraska Panhandle weather alerts and road conditions | ? | private? | Kimball/Sidney/Ogallala weather and closures — needs a login check |
| Nebraska Severe Weather | ? | ? | Severe weather, run by a local meteorologist — needs a login check |
| Grand Island NE and surrounding area – Activities & Events | ? | ? | Only Grand Island group found — needs a login check |

Do **not** post in *Things To Do In Omaha & Beyond* (18.2K): its rules explicitly
ban "promoting your own group, newsletter or app."

**Towns still missing a verified group:** Omaha (the metro), Fremont, Columbus,
York, Seward, Lexington, Ogallala, Sidney, Kimball, and Hastings (only an events
group was found). Fill these in from inside Facebook:

1. Search `[town] Nebraska` under Groups, filter to **Your groups → Discover**.
2. Sort by activity, not size. A 4K group with posts today beats a 40K group
   whose last post is from March.
3. Open the group, read **About** and the pinned rules, note the member count.
4. Add it:
   ```bash
   npm run groups -- add --url https://www.facebook.com/groups/… \
     --name "Kearney Nebraska Community" --area kearney \
     --members 8500 --access private --priority 2 \
     --note "posts daily; admin requires town flair"
   ```
5. Join, read for a week, then share. Fifteen well-chosen groups beat a hundred
   joins.

### Rules that keep you welcome

1. **Read the pinned rules and the last ten posts.** Many groups ban links
   outright or confine them to one day. If links are banned, post the facts as
   text and put the link in the first comment — or don't post.
2. **Share from the Page, not a fresh link.** Native shares keep the card, look
   human, and let the group's algorithm treat it as a Page post.
3. **Two groups a day, maximum.** Rotate through the list. Never the same story
   in more than four groups.
4. **Disclose.** "I write for I-80 Things, the corridor news desk" in the post or
   the first comment. It costs nothing and it is the difference between a
   contributor and a spammer.
5. **Answer the comments for the first hour.** Group posts live or die in the
   first 60 minutes. Reply with facts, not links.
6. **Never argue.** If someone says the closure is fake, post the NDOT link and
   stop. Screenshots of arguments travel further than the story.
7. **Correct in public.** If the story changes, edit the comment thread, not
   just the site.
8. **No crash photos, no fatality posts before notification, no "share if you
   agree."** This is a newsroom, not an engagement farm.

### Cadence

- 1–2 group shares per published story, 4–6 per week total.
- Weather groups get warnings the evening before and the morning of.
- Town groups get that town's stories, and only that town's stories.
- Once a week, answer a question in a group with no link at all. That is the
  deposit; the shares are the withdrawal.

---

## 6. Reddit playbook

**Account:** one personal account, used like a person. Read the subs for a week
before posting. Comment on other people's posts. The account should have more
comments than submissions.

**Subreddits that fit the corridor** (read each one's rules and the last twenty
posts before you submit; rules and mods change):

| Subreddit | What it is for | How to use it |
| --- | --- | --- |
| r/Nebraska | Self-described "news, events, and occasional memes related to Nebraska" | The best default for statewide closures, weather and policy. Strict on self-promotion — comment first |
| r/Omaha | "Local news, events, and anything related to Omaha" | Omaha/Council Bluffs stories, metro closures |
| r/lincoln | Lincoln community | Lincoln stories; check the rules, they are tighter than r/Nebraska |
| r/Truckers | National driver community | Full closures and chain laws only, framed as driver information |
| r/weather | Weather enthusiasts | A genuine warning with the NWS link, not a site link |

Town subs, where they exist, convert best and reach the fewest people. Search
`r/[town]` before assuming one does not exist.

**Format that works:** a text post that stands alone. The first paragraph is the
confirmed fact. The second is what it means for the drive. The link sits at the
bottom as "full story with the primary sources." Flair it if the sub requires it.
No site name in the title.

**Cadence:** 2–3 posts a week maximum across all of Reddit. One link per sub per
30 days unless there is a materially new development. Comment in r/Nebraska on
weather and road threads with no link — that is where the account earns the
right to post.

**Never:** crosspost the same link to five subs, use the brand name as the
username, ask for upvotes, delete and repost after a bad start, or argue with a
mod. If a post is removed, message the mods once, politely, and move on.

---

## 7. X, Threads, Bluesky

**X** — the account is useful for two things: closures/weather and quoting local
outlets with added context. Post link-free when the title carries the fact
("I-80 westbound is closed at mile 395, NSP says"). A thread of 2–3 posts
outperforms one post with a link. Budget $5–10/month and stop there; X is not
where corridor readers are.

**Threads** — free, 500 characters, links work, and it inherits the Instagram
audience. Post the hook + title + one fact + link. No hashtag walls.

**Bluesky** — free, 300 characters, links work, no approval process, and the
handle can be `@i80things.com` once the domain is live. Cross-post every story
here; it costs nothing and it is the cheapest place to build a second archive.

**Mastodon** — optional. Only if you enjoy it.

---

## 8. Measurement

Every outbound link carries UTM parameters, generated by `npm run share`:

| Surface | `utm_source` | `utm_medium` | `utm_campaign` |
| --- | --- | --- | --- |
| X | `x` | `social` | `daily` |
| Threads | `threads` | `social` | `daily` |
| Bluesky | `bluesky` | `social` | `daily` |
| Facebook Page | `facebook` | `page` | `daily` |
| Facebook group | `facebook` | `group` | `daily` |
| Reddit | `reddit` | `social` | `daily` |
| Instagram bio | `instagram` | `social` | `bio` |

Vercel Analytics records the referrer but drops the query string, so the site
fires a `campaign_visit` event with `source`, `medium`, `campaign` and `path` on
any landing page that carries UTM parameters (`components/CampaignTracking.tsx`).
That event is the measurement — without it, a Facebook group share and a Page
share look identical.

**Weekly, five minutes:** in Vercel → Analytics → Events, sort
`campaign_visit` by `medium`. The number that matters is **sessions that reach a
second story**, not views. A group post that sends 400 people who bounce is worth
less than 40 who read two stories.

**Decision rule after 30 days:**

- A group that sent readers twice → keep it, post more.
- A group that removed two posts → leave it.
- A subreddit that removed one post → one polite mod message, then stop.
- A channel below 1% of sessions for a month → drop it and spend the time on the
  newsletter instead.

---

## 9. Programmatic roadmap

**Phase 1 — done.** `npm run share -- --slug <slug>` builds the copy, character
counts and UTM links for X, Threads, Bluesky, the Facebook Page, a group share
and a Reddit text post. `--json` for scripts, `--platform` for one surface.

**Phase 2 — one Meta app, three surfaces.** Add `scripts/publish-facebook.mjs`
and `scripts/publish-threads.mjs` next to `publish-instagram.mjs`. The same
long-lived Meta token covers the Page (`pages_manage_posts`) and Threads
(`threads_content_publish`); each is a two-call container → publish flow. Then:

```bash
npm run social:facebook -- --slug <slug> --publish
npm run social:threads  -- --slug <slug> --publish
```

Bluesky is the easiest of all: an app password and one `POST
com.atproto.repo.createRecord` call, no review, no cost.

**Phase 3 — scheduling instead of scripts.** Buffer's free plan covers three
channels with ten queued posts each and includes X and Threads; feeding it the
RSS (`/feed.xml`) or the share kit removes the manual step entirely. Postiz is a
self-hosted alternative if you would rather own it. A scheduler does not violate
any platform's rules — it is still an API post, just later.

**What stays manual forever:** Facebook group shares, Reddit posts, comment
replies. That is the job. It is also the part that builds the audience.

**The real growth lever** is still not social: it is the newsletter and Google
News. Twenty-two stories, three city hubs and a daily cadence is what gets the
site into Discover. Social is the thing that makes the first hundred readers
possible while search catches up.

---

## 10. Tracking sheet

Keep this in `data/sharing.md` or the run report. One line per post.

| Date | Slug | IG | FB Page | Groups | Reddit | X | Threads | Bluesky | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-06 | nighttime-lane-closures-… | ✓ | ✓ | Kearney Happenings | — | — | ✓ | ✓ | Group post got 3 comments asking about exits |

Notes worth keeping: which group removed a post, which sub asked for a source,
which story a group kept asking about. That is next week's story list.
