---
name: i80-daily-post
description: Research, verify and publish a daily story for I-80 Things, the Nebraska I-80 corridor news site. Use when asked to run the daily news desk, find a corridor story, check what has already been posted, or add a source.
---

# I-80 Things daily desk

You are publishing verified local news for **I-80 Things**, covering Interstate 80 in Nebraska from Omaha (mile 454) to Kimball (mile 22).

**Read [`AGENT.md`](../../../AGENT.md) before your first run.** It is the full system prompt: sourcing hierarchy, verification questions, writing rules, SEO requirements, scanner ethics, image policy and the run-report format.

## Fast path

1. **What have we posted?**
   ```bash
   npm run log
   npm run cities:coverage
   npm run stories:audit -- --due
   ```
   Skip anything covering the same event in the last 7 days, or using the same source URL without a new development. If there is no breaking story, prefer a city hub with zero local stories.

2. **What is new?**
   The source and 511 sweeps already ran. Read the preflight bundle at
   `$DAILY_BUNDLE` (`sources.txt`, `511.json`, `meta.json`); do not re-sweep
   the feeds with `npm run sources` or `npm run 511`.
   Then open the primary source. Check NSP, NDOT, 511 and NWS manually for anything the feeds missed.

3. **Verify the five questions.** What happened, where (mile marker + direction), when, who confirmed it, current status. No verification → no story.

4. **Write and illustrate.**
   ```bash
   npm run new -- \
     --title "I-80 westbound reopens near Kearney after crash" \
     --city kearney \
     --topics crashes,state-patrol \
     --source "Nebraska State Patrol|https://…"
   ```
   Fill the body with original context, 3–5 short-version bullets, a sources list and internal links to the city/topic/related story.
   Choose 1–3 real images that show the subject — not the first generic stock result. Add alt, caption, credit and credit URL. If the 4:5 crop is bad, add `socialSrc`. For visual review, save stock JSON and run `npm run images:sheet -- --manifest …`; after adding images, run `npm run images:sheet -- --slug <slug>` and inspect the labeled sheet. Never put a one-day advisory or undated "current" condition in an evergreen story.

5. **Validate and publish.**
   ```bash
   npm run validate
   npm run images:audit
   npm run factcheck -- --publish
   npm run review -- --slug <slug>
   npm run build
   git add content/posts public/images/posts data/source-health.json
   git commit -m "post: <headline>"
   git push
   ```
   Vercel rebuilds. Then verify the live article, the Instagram JPEG and the city hub all return/show the story. In publish mode, do not leave `draft: true`.

6. **Instagram.**
   ```bash
   npm run social -- --slug <slug>
   ```
   Images: `https://i80things.vercel.app/api/social/<slug>?image=N` (1080×1350 JPEG each). Caption from the command output. Mark 1–10 gallery images `instagram: true` for a carousel.

## Hard rules

- Scanner traffic is a tip, never a source. Confirm with the agency.
- Never copy another outlet. Link out and add original context.
- Never fabricate a name, quote, mile marker, time, cause or image.
- One event, one story, one URL.
- No AI images of real events.
- Do not reuse an image from another story.
- Prefer durable facts; date-stamp current road/lake/weather conditions and link to the official source.
- Check every exit number against `data/i80-exits.json`; do not guess an exit.
- For rankings, distances, recurring dates and event status, verify the year and the primary source.
- A no-publish day is acceptable. A fabricated story is not.

## Output

End with the run report from AGENT.md §9: published, updated, skipped (with reasons), source health, next checks.
