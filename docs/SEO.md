# SEO and distribution checklist

The technical foundation is already strong: server-rendered pages, canonicals,
Open Graph/Twitter cards, NewsArticle JSON-LD, breadcrumbs, RSS, sitemap,
news sitemap, `robots.txt`, `llms.txt`, city/topic hubs, author pages and
`max-image-preview:large` for Discover.

The remaining work is mostly **domain, verification, content depth and links**.

## 1. Domain and canonical origin — highest priority

The live canonical is `https://i80things.vercel.app`. That is a staging origin,
not a brand domain.

When the domain is ready:

1. Add the apex domain in Vercel and redirect `www` to the apex.
2. Set `NEXT_PUBLIC_SITE_URL=https://i80things.com` in Production.
3. Redeploy. Every canonical, sitemap URL, RSS item and JSON-LD `@id` should
   switch to the new origin together.
4. Keep `i80things.vercel.app` as a 301 redirect, not a second canonical.
5. Update the Instagram bio link, Google Search Console, Bing, AdSense and
   Publisher Center.
6. Submit the new sitemaps and use the Change of Address tool in Search Console.

Do not build link equity on `vercel.app` and then migrate without a plan.

## 2. Search Console, Bing and Publisher Center

Add these environment variables and verify:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_BING_SITE_VERIFICATION=...
```

The app emits the verification meta tags when they are present.

Then:

- Google Search Console: verify, submit `/sitemap.xml` and `/news-sitemap.xml`.
- Bing Webmaster Tools: verify, submit the same sitemaps, consider IndexNow.
- Google Publisher Center: create the publication, verify ownership, add logo
  and sections. This is separate from Search Console.
- Check the Rich Results Test on one article and one city page.

## 3. Structured data

Current article schema includes `NewsArticle`, `BreadcrumbList`, `Place`,
`ImageObject` with credit/license, `citation` links and a
`NewsMediaOrganization` publisher with editorial/corrections policies.

Still worth adding:

- `sameAs` links for every real social profile.
- A real named editor/publisher as `Person`, not only the desk as an
  organization, where a story has a named byline.
- `dateModified` on every substantive update (already supported from frontmatter).
- `CorrectionComment` or a visible correction note for corrected stories.
- `ImageObject` width/height/caption for every image (now present for stories).

Validate after template changes:

```bash
# Google Rich Results Test or Schema Markup Validator
open https://search.google.com/test/rich-results
open https://validator.schema.org/
```

## 4. Content depth and internal links

The site now has 22 stories and no empty city hubs. That is enough to launch,
not enough to dominate.

Priorities:

- **I-80 exit guide**: `/exits` now lists every interstate exit with mile marker
  and nearest corridor town. Link it from city hubs, the mile-marker guide and
  relevant stories.
- **More local reporting per hub**: one story per town is a start; three to five
  original local stories per hub is a real footprint. Do not pad with generic
  copy.
- **Topic clusters**: link every crash story to the crash topic, every closure
  to road conditions, every weather story to the weather topic, and every town
  story to its city hub.
- **Follow-ups and updates**: a corrected or updated story should keep the same
  URL, update `updated`, and add a correction note. Do not create a new URL for
  a routine update.
- **Original data**: the exit table, 511 guide, service-gap guide and scanner
  explainer are stronger than rewritten feeds. Build more assets like these.
- **Avoid thin pages**: `/search` is already `noindex`; keep paginated archive
  pages canonical and avoid indexable empty filter pages.

## 5. On-page details

- Article titles should stay under roughly 60 characters where possible.
- Deks/descriptions should stay roughly 120–160 characters.
- Keep one H1 per page, descriptive H2s and a clean breadcrumb.
- Use the city name, exit number and mile marker naturally in headlines.
- Add `news_keywords` (already emitted from tags) but do not stuff it.
- Do not reuse the same image across stories; the image audit enforces this.
- Keep image alt text descriptive and captions factual.
- Every story should link to its city hub, its topic hub and at least one
  related story.

## 6. Performance and monitoring

- Run Lighthouse or PageSpeed Insights on mobile for the homepage, one article,
  one city hub and `/conditions`.
- Watch Core Web Vitals in Vercel Speed Insights after ads are enabled.
- Keep ad slots height-reserved to protect CLS.
- Add a link checker to CI; the fact-check script already checks source formats,
  but not every outbound URL.
- Add uptime monitoring for `/`, `/conditions`, `/api/health`, `/feed.xml` and
  `/sitemap.xml`.
- Add a weekly check of Search Console queries, indexed pages and 404s.

## 7. Distribution

- Google Discover depends on large images, fresh stories and a clear publisher;
  `max-image-preview:large` is already set.
- Google News depends on Publisher Center, a news sitemap, clear authorship and
  a working contact page. The contact email still needs to be fixed.
- Submit only high-value corridor stories to local groups and Reddit; do not
  mass-post.
- Consider IndexNow for Bing after the domain is stable.

## Quick audit commands

```bash
npm run validate
npm run factcheck
npm run images:audit
npm run build
```

Then check:

```bash
curl -s https://i80things.vercel.app/robots.txt
curl -s https://i80things.vercel.app/sitemap.xml | head
curl -s https://i80things.vercel.app/news-sitemap.xml | head
curl -s https://i80things.vercel.app/feed.xml | head
```
