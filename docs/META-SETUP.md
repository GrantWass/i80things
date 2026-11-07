# Meta setup: Facebook Page, Instagram, and the API

The exact path from nothing to "the site can post to Instagram." Written
2026-11-06 against the current Meta Business Suite and Instagram app flows.
Menu names move; if yours differ by a word, look for the nearest match.

**Time:** about 60 minutes, plus a day of waiting if Meta asks for identity
confirmation.

---

## Progress

State on 2026-11-06. Tick these off as you go; the order is the order.

**Have**
- [x] Personal Facebook account
- [x] Instagram account, `@i80.things`
- [x] Page created with name, category and bio

**Remaining, in order**
- [ ] Page **About**, contact and website (§1)
- [ ] Page **username** (§1)
- [ ] **Publish** the Page (§1)
- [ ] Privacy pass — Page off your personal profile (§1, §6)
- [ ] Instagram → **Business** account (§2)
- [ ] Link Instagram ↔ Page (§3)
- [ ] Test cross-post, then delete it (§3)
- [ ] **Business portfolio** + second admin + 2FA (§4)
- [ ] Developer app + **system user token** (§5) — only if you want automated posting
- [ ] Privacy checklist (§6)

> **Placeholder values to replace later.** Until `i80things.com` resolves and
> email works, the Page's website and contact email are temporary. When the domain
> goes live: Page → About → Contact and website → `https://i80things.com` and the
> working `hello@` address. Tracked in `NEXT-STEPS.md` §1.

---

## 0. The four things (people mix these up)

| Thing | What it is | Do you need it? |
| --- | --- | --- |
| **Personal Facebook profile** | Your identity. Every Page is owned by a person | Yes, unavoidable |
| **Facebook Page** | The public "I-80 Things" presence, with followers and a username | **Yes** — this is what you are making |
| **Meta Business portfolio** | A container in Business Suite that holds the Page, the Instagram account and the app | Recommended, not required |
| **Meta developer app** | The API credentials, only for automation | Only for `npm run social:instagram` |

"Create a business account" in conversation usually means **the Page plus a
Business portfolio**. Instagram's "Business account" is a separate switch on the
Instagram side. You need both, and they get linked.

---

## 0.5 The constraint: keep it off your personal profile

Meta does not sell a "company login." Every Page and every Business portfolio is
owned by **one or more personal Facebook profiles**, and one person may hold only
one personal profile. So a Page with no human behind it does not exist.

**This guide assumes the Page must not be visibly tied to your personal
profile.** That is achievable. What is not achievable is removing your personal
account from the ownership chain.

**What the public can see**

- The Page's name, category, creation date, posts and follower count.
- The Page's **transparency** panel — creation date, name changes, who paid for
  ads. It does **not** list admins.
- Nothing about which personal profile owns or administers the Page.

Your name appears publicly only if you post or comment **as yourself** instead of
as the Page, or if you deliberately feature the Page on your profile. The Page
roles list is private to admins.

**The privacy build — four rules, applied throughout this guide**

1. **Never feature the Page on your profile.** Do not add it during creation, and
   check Profile → About → Pages afterwards (§1, §6).
2. **Never interact as yourself.** Compose and comment as the Page, answer from
   the Page inbox, and share into groups as the Page (§4, §6).
3. **Never let automation use your login.** Run every script with a **system
   user** token generated in Business Suite, not a token from Graph API Explorer
   (§5).
4. **Always have a second admin.** A trusted person in the Business portfolio
   keeps the Page alive if your profile is restricted, and means you are never
   the single point of failure (§4).

**If you do not want Facebook at all**, there is a real fork:

- **Instagram API with Instagram Login** publishes to Instagram through
  `graph.instagram.com` with `instagram_business_basic` and
  `instagram_business_content_publish` — **no Facebook Page required**.
- Threads is created from the Instagram account, not a Facebook Page.
- Bluesky, Reddit and the newsletter need no Meta account at all.

The cost is **Facebook group distribution**, the largest reach item on the list
(91.5K and 13.5K member groups). Without a personal Facebook account you can
still share from Instagram and Threads, but you cannot post into groups.

**Also avoid:** creating a second "business" personal profile or buying an
existing Page. Both violate Meta's terms, and either can take the Page down with
no appeal.

---

## 1. Finish the Facebook Page (15 min)

The Page exists. This is the About, username, publish and privacy pass. Do it in a
desktop browser.

**About and contact**

1. On the Page, click **Edit** on the intro card, or go to **About**.
2. Fill in:
   - **Description:** `Daily news from the I-80 corridor in Nebraska: crashes,
     closures, weather, construction and the towns from Omaha to Kimball.`
   - **Website:** the live site. Use `https://i80things.vercel.app` for now.
   - **Email:** a dedicated address you create for the site — not your primary
     personal inbox. `hello@i80things.com` does not resolve yet, so use something
     like `i80things@gmail.com` until mail forwarding exists. The Page's contact
     email is public.
   - **Location:** `Nebraska, United States`. Do not invent a street address.
3. These two fields are **placeholders**. When the domain goes live, come back and
   change the website to `https://i80things.com` and the email to `hello@i80things.com`.
   It is tracked in `NEXT-STEPS.md` §1 so it does not get forgotten.

**Username**

4. Page → **Settings** → **Username** (or **Edit** on the intro card → Username).
5. Try `i80things`. If it is taken: `i80thingsne`, then `i80.things`.
6. This sets `facebook.com/<username>` and is what people search for. It can be
   changed later, but every change is public in the Page's transparency panel.

**Publish**

7. Page → **Settings** → **Page visibility** → **Publish**. A Page left
   unpublished cannot be linked to Instagram and cannot be posted to by the API.
8. If Meta asks you to confirm your identity, do it now. Skipping it is the most
   common cause of "the API says I have no permission."

**Privacy pass**

9. Open your **personal profile** → **About** → **Pages** (or the **Featured**
   tab). If I-80 Things is listed, remove it.
10. Do not like or follow the Page from your personal account.
11. Settings & privacy → Settings → **Audience and visibility** → set your profile
    to **Friends** or **Only me**.

> Done when: the Page loads in an incognito window, the username resolves, and
> nothing on your personal profile points to it.

---

## 1.5 Instagram profile: name, bio, link (5 min)

Do this on the phone right after linking the Page.

**Name field** (30 characters, searchable — this is not the username):

`I-80 Things | Nebraska news` — 26 characters. Keep "Nebraska" in it; that is
what people type into search.

**Bio** (150 characters):

```
Daily news from Nebraska's I-80 corridor: crashes,
closures, weather and construction, Omaha to Kimball.
```

106 characters. No hashtags, no emoji wall, no "follow for more."

**Links** (up to 5, one primary):

1. Profile → **Edit profile** → **Links** → **Add external link**.
2. Primary link:
   `https://i80things.vercel.app/instagram`
   Paste it once and leave it. The route redirects to the newest published story
   and appends `utm_source=instagram&utm_medium=social&utm_campaign=bio`.
3. Second link (optional): `https://i80things.vercel.app` labelled "All stories".
4. Save.

There is nothing to swap between posts. To pin a specific story instead of the
newest, use `https://i80things.vercel.app/instagram?s=<slug>`; the admin kit
shows both URLs.

**Contact info:** Account type and tools → Contact info → hide it, or use the
dedicated address. It is public on a Business account.

When the domain goes live, update the bio link to `https://i80things.com/instagram`
and the contact email in the same pass (tracked in `NEXT-STEPS.md` §1).

---

## 2. Switch Instagram to a professional account (10 min)

Do this in the Instagram app, not the browser.

1. Open Instagram → your profile → **☰** (top right).
2. **Settings and activity** → **Account type and tools**.
   On some versions it is **Business tools and controls**.
3. **Switch to professional account** → **Continue**.
4. Choose **Business**, not Creator. Business is the safer default for a
   publisher: it supports scheduling, contact buttons and the full publishing
   API.
5. Pick a category: **News & media website** or **Publisher**.
6. Review the contact details → **Next** → **Done**.

If the account is already professional, skip to step 3 — you only need to link
the Page.

---

## 3. Link Instagram and the Page (5 min)

Two ways in; either works, the second is easier to verify.

**From Instagram**

1. Settings and activity → **Account type and tools** → **Business tools and
   controls** → **Connect a Facebook Page**.
2. Log in with the personal profile that owns the Page.
3. Select **I-80 Things** → **Connect** → allow the permissions.

**From Facebook**

1. On the Page: **Settings** → **Linked accounts** → **Instagram** → **Connect
   account**.
2. Log in to the Instagram account and approve.

**Verify before moving on**

- Instagram: Account type and tools shows **Connected to I-80 Things**.
- Facebook: Page → Settings → Linked accounts shows **@i80.things**.
- Post one test photo from the Page composer with "also share to Instagram"
  ticked. If it appears on Instagram, the link is real.
- Turn **off** "Share to Facebook" in the Instagram composer by default. Posts
  made from Instagram should not start appearing on your personal timeline
  because a toggle was left on.

---

## 4. Create the Meta Business portfolio (5 min, recommended)

1. Go to <https://business.facebook.com> → **Create an account**.
2. Business name: `I-80 Things`. Your name and a work email.
3. **Settings → Accounts → Pages → Add** → claim the I-80 Things Page.
4. **Settings → Accounts → Instagram accounts → Add** → connect `@i80.things`.
5. **Add a second admin.** Settings → People → Invite a trusted person, then give
   them the Page and Instagram account with **Manage** access. They need their
   own personal Facebook profile. This is the difference between a Page that
   survives your account being restricted and one that dies with it.
6. Turn on two-factor authentication for every admin. Meta requires it for
   Business portfolio admins and will lock the portfolio without it.

This is also where the API identity comes from: the **system user** you create in
§5 lives in the portfolio, not in your personal account.

---

## 5. The developer app, for automation only (20 min)

Meta now recommends **Instagram API with Unified Login** for new integrations.
It does not need a Facebook Page, uses the same host as the old setup
(`graph.facebook.com`), and issues a **Business Integration System User Access
Token** that belongs to the business portfolio rather than to you. Verified
against the docs on 2026-11-06; the Page-token flow in older guides is the legacy
path.

The existing `publish-instagram.mjs` already calls `graph.facebook.com/<ig-id>/media`,
so it works with this token unchanged. Set `IG_GRAPH_VERSION=v27.0`.

**Prerequisites**

- A Business portfolio that owns the app.
- The Instagram account is professional (Business).
- The app uses **Facebook Login for Business** (new apps do by default).

**Create the app**

1. <https://developers.facebook.com/apps> → **Create app**.
2. Name `I-80 Things`. Use case: **Manage messaging & content on Instagram**.
3. Link it to the I-80 Things business portfolio when asked.
4. Open **Use cases → Manage messaging & content on Instagram → Customize**, then
   the **API setup with Unified login** tab. That tab only appears for apps owned
   by a portfolio and using Facebook Login for Business.

**Create a configuration**

1. **Create new configuration** → **Edit permissions**.
2. Keep only what publishing needs: `instagram_basic` and
   `instagram_content_publish`. Drop messages, comments, ads.
3. **Use this configuration**, set an HTTPS **Redirect URL** you control (the
   site itself is fine, e.g. `https://i80things.vercel.app/`), and save.
4. The preview shows the token type and expiry.

**Get the token (own account)**

1. **Generate access tokens → Add account**, invite `@i80.things` as an
   **Instagram Tester**.
2. Accept in Instagram on the web: **Settings → Website permissions → Apps and
   websites → Tester invites**.
3. **Generate token** → complete the login → copy the token. It is shown once.

For a non-expiring production token, create a Business Suite **system user**
named `i80-publisher`, assign it the Instagram account and the app with full
control, and generate a token with the same two permissions and expiry **Never**.
Either token works; the system user one survives you changing your login.

**Get the Instagram account ID**

With this token `/me` is the system user, not the account. Use:

```
GET /me/assigned_instagram_accounts?fields=id,username
```

The `id` for `i80.things` is `IG_USER_ID`. Do not use the Page ID or the old
`/me/accounts` response; they belong to the legacy Facebook Login setup.

**Environment variables**

```bash
IG_USER_ID=17841…          # from /me/assigned_instagram_accounts
IG_ACCESS_TOKEN=EAA…       # Unified Login SUAT or system user token
IG_GRAPH_VERSION=v27.0
NEXT_PUBLIC_SITE_URL=https://i80things.vercel.app
```

`publish-instagram.mjs` loads `.env.local` automatically. Test:

```bash
curl -s "https://graph.facebook.com/v27.0/$IG_USER_ID?fields=username&access_token=$IG_ACCESS_TOKEN"
npm run social:instagram -- --slug nighttime-lane-closures-start-sunday-on-i-80-at-mile-427
npm run social:instagram -- --slug … --publish
```

The second command is a dry run: it prints the image URL and caption and posts
nothing.

**If you would rather not use a Business portfolio at all**, the fallback is
**Instagram API with Instagram Login**: `graph.instagram.com`,
`instagram_business_basic`, `instagram_business_content_publish`, and an
Instagram user token. It needs a one-line host change in the script.

---

## 6. The privacy checklist (run before your first post)

**Public surface**

- [ ] Profile → **About → Pages** does not list I-80 Things (and the **Featured**
      tab is clean).
- [ ] You do not like or follow the Page from your personal account.
- [ ] Incognito search for "I-80 Things" shows the Page, not your profile. Search
      your name + "I-80 Things" and confirm nothing ties them.
- [ ] Your personal profile's public visibility is **Friends** or **Only me**
      (Settings → Audience and visibility).

**Posting**

- [ ] Every Page post is composed with the Page avatar showing, not your profile.
      Check the top of the composer before publishing.
- [ ] Replies come from the **Page inbox** (Business Suite → Inbox), not from your
      personal notifications.
- [ ] Group shares are made **as the Page**. In the share dialog, look for the
      identity selector; if the only option is your personal name, cancel and post
      from the Page instead of sharing.
- [ ] You never comment on the Page's posts as yourself. On a news site, one
      personal reply under a crash story is the kind of thing people screenshot.

**Access**

- [ ] The token in Vercel is the **system user** token, not a Graph API Explorer
      token from your login.
- [ ] A second admin exists in the Business portfolio, with 2FA.
- [ ] You have the portfolio's recovery codes and the Page's backup admin noted
      somewhere offline.

**Where your name can still appear**

- **Group member lists.** To share into a group you join it with your personal
  account, and many groups show their member list. Nothing fixes this short of
  not using groups.
- **Group shares.** Some groups attribute a shared Page post to the person who
  shared it, not the Page.
- **Group comments.** If you answer a question as yourself instead of the Page,
  your name is on it.
- **Ad transparency.** The Page's transparency panel lists who paid for ads. Do
  not run ads from a personal payment method you want kept private.

If something leaks, fix it the same day: remove the Page from your profile,
delete the personal comment, untag yourself, and switch the share to the Page.

---

## 7. If it does not work

| Symptom | Cause | Fix |
| --- | --- | --- |
| "No Instagram account connected" | Link never completed, or wrong IG account selected | Redo §3; check the Page's Linked accounts |
| API returns permission error | App missing `instagram_content_publish` or `pages_read_engagement` | Add to the token request, regenerate |
| System user token rejected | Asset not assigned, or app not linked to the portfolio | Reassign the Page and Instagram account to the system user |
| "Page Publishing Authorization required" | New or unverified Page | Page Settings → Page setup → complete PPA |
| Image fails to load | `image_url` not public HTTPS, or not JPEG | Check `/api/social/<slug>` returns a JPEG publicly |
| Token works then dies | Used a short-lived user token | Use the system user token, or exchange for a long-lived Page token |
| Two Instagram accounts confused | Personal and business both logged in | Log out of the personal one in the app before linking |
| Page invisible to others | Still unpublished | Settings → Page visibility → Publish |

---

## 8. What this unlocks

| After | You can | Tool |
| --- | --- | --- |
| Page created | Share stories into groups as the Page | `npm run share`, `npm run groups` |
| Instagram linked | Post from Page composer to both | Meta Business Suite |
| API app + system user token | Automated carousel posts, no personal token | `npm run social:instagram -- --publish` |
| Business portfolio + second admin | Survive a lockout or a restricted profile | Business Suite |
| Page + IG linked | Threads app setup | Threads |

Update `docs/PUBLICITY.md` §2 and §4 when each step is done, and put the real
follower count in the baseline table in §6.
