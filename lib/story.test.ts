import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  parseStory,
  publishVerdict,
  readStoryFile,
  writeStory,
} from "./story.mjs";

const VALID_RAW = `---
title: "Nighttime lane closures start Sunday on I-80 at mile 427"
dek: "Bridge joint replacement at mile marker 427 begins Nov. 8, with alternating lane closures from 9 p.m. to 6 a.m."
date: "2026-11-06T08:30:00-06:00"
author: corridor-desk
city: statewide
topics:
  - road-conditions
tags:
  - construction
summary:
  - "Work starts in the eastbound lanes, then moves westbound."
  - "Closures run 9 p.m. to 6 a.m. for about 10 days."
  - "Overnight drivers should slow down through the work zone."
sources:
  - name: "Nebraska DOT"
    url: https://dot.nebraska.gov/media/h3sbjda1/20261104-d1.pdf
  - name: "Nebraska 511"
    url: https://511.nebraska.gov/
image: /images/posts/example/cover.jpg
imageAlt: Nighttime bridge work on an interstate
imageCredit: "Photo: Example / Wikimedia Commons (CC0)"
imageCreditUrl: https://example.com/photo
imageLicense: "CC0 1.0"
imageLicenseUrl: https://creativecommons.org/publicdomain/zero/1.0/
draft: false
---

Overnight drivers on I-80 between Lincoln and Omaha should plan for narrowed lanes starting Sunday.
`;

const GALLERY_RAW = `---
title: "A gallery story with two images"
dek: "A dek long enough to pass every gate we have."
date: "2026-11-06T08:30:00-06:00"
imageCredit: "Photo: Desk / Example (CC BY 4.0)"
imageCreditUrl: https://example.com/credit
imageLicense: "CC BY 4.0"
imageLicenseUrl: https://creativecommons.org/licenses/by/4.0/
images:
  - src: /images/posts/example/one.jpg
    alt: First image alt
    credit: "Photo: One / Example"
    creditUrl: https://example.com/one
    license: "CC BY 4.0"
    licenseUrl: https://creativecommons.org/licenses/by/4.0/
  - src: /images/posts/example/two.jpg
summary:
  - "First bullet."
  - "Second bullet."
  - "Third bullet."
sources:
  - name: "Nebraska 511"
    url: https://511.nebraska.gov/
  - name: "Nebraska DOT"
    url: https://dot.nebraska.gov/
---

Body text.
`;

describe("parseStory", () => {
  it("decodes a valid story with frontmatter, body and derived fields", () => {
    const story = parseStory(VALID_RAW, {
      path: "nighttime-lane-closures-start-sunday-on-i-80-at-mile-427.mdx",
    });
    assert.equal(
      story.slug,
      "nighttime-lane-closures-start-sunday-on-i-80-at-mile-427",
    );
    assert.equal(
      story.title,
      "Nighttime lane closures start Sunday on I-80 at mile 427",
    );
    assert.ok(story.body.includes("narrowed lanes starting Sunday"));
    assert.equal(story.author, "corridor-desk");
    assert.equal(story.city, "statewide");
    assert.deepEqual(story.topics, ["road-conditions"]);
    assert.equal(story.draft, false);
    assert.equal(story.images.length, 1);
    assert.equal(story.images[0].src, "/images/posts/example/cover.jpg");
  });

  it("falls back to the legacy cover image as the gallery", () => {
    const story = parseStory(VALID_RAW, { path: "example.mdx" });
    assert.equal(story.images.length, 1);
    assert.equal(story.image, "/images/posts/example/cover.jpg");
    assert.equal(story.imageAlt, "Nighttime bridge work on an interstate");
    assert.equal(
      story.imageCredit,
      "Photo: Example / Wikimedia Commons (CC0)",
    );
    assert.equal(story.imageLicense, "CC0 1.0");
    assert.equal(story.images[0].instagram, true);
  });

  it("normalises a gallery: alt fallback, credit inheritance, instagram default", () => {
    const story = parseStory(GALLERY_RAW, { path: "gallery.mdx" });
    assert.equal(story.images.length, 2);
    assert.equal(story.images[0].alt, "First image alt");
    // Second image has no alt: falls back to the title.
    assert.equal(story.images[1].alt, "A gallery story with two images");
    // Second image has no credit block: inherits the top-level fields.
    assert.equal(story.images[1].credit, "Photo: Desk / Example (CC BY 4.0)");
    assert.equal(
      story.images[1].licenseUrl,
      "https://creativecommons.org/licenses/by/4.0/",
    );
    // Cover defaults to selected; the rest default off.
    assert.equal(story.images[0].instagram, true);
    assert.equal(story.images[1].instagram, false);
    // Cover flattening follows the gallery.
    assert.equal(story.image, "/images/posts/example/one.jpg");
  });

  it("drops gallery entries without a src", () => {
    const story = parseStory(
      GALLERY_RAW.replace(
        "  - src: /images/posts/example/two.jpg",
        "  - src: ''",
      ),
      { path: "gallery.mdx" },
    );
    assert.equal(story.images.length, 1);
  });

  it("applies defaults for author, city, lists and flags", () => {
    const story = parseStory(
      `---\ntitle: T\ndate: "2026-11-06T08:30:00-06:00"\n---\n\nHi.\n`,
      { path: "t.mdx" },
    );
    assert.equal(story.author, "corridor-desk");
    assert.equal(story.city, "statewide");
    assert.deepEqual(story.topics, []);
    assert.deepEqual(story.summary, []);
    assert.deepEqual(story.sources, []);
    assert.equal(story.featured, false);
    assert.equal(story.draft, false);
  });
});

describe("readStoryFile", () => {
  it("reads a file off disk with the basename slug", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "story-"));
    const abs = path.join(dir, "example-slug.mdx");
    fs.writeFileSync(abs, VALID_RAW);
    try {
      const story = readStoryFile(abs);
      assert.equal(story.slug, "example-slug");
      assert.ok(story.title.length > 8);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("publishVerdict", () => {
  it("passes a valid story in both modes", () => {
    const story = parseStory(VALID_RAW, { path: "example.mdx" });
    assert.deepEqual(publishVerdict(story, { mode: "draft" }), {
      ok: true,
      errors: [],
      warnings: [],
    });
    assert.deepEqual(publishVerdict(story, { mode: "publish" }), {
      ok: true,
      errors: [],
      warnings: [],
    });
  });

  it("errors on a missing title and a missing date", () => {
    const noTitle = parseStory(VALID_RAW.replace(/^title:.*\n/m, ""), {
      path: "example.mdx",
    });
    const verdict = publishVerdict(noTitle, { mode: "draft" });
    assert.equal(verdict.ok, false);
    assert.ok(verdict.errors.includes("missing title"));

    const noDate = parseStory(VALID_RAW.replace(/^date:.*\n/m, ""), {
      path: "example.mdx",
    });
    const dateVerdict = publishVerdict(noDate, { mode: "draft" });
    assert.equal(dateVerdict.ok, false);
    assert.ok(
      dateVerdict.errors.some((message) => message.includes("date")),
    );
  });

  it("errors on a too-short title and a future date", () => {
    const story = parseStory(VALID_RAW, { path: "example.mdx" });
    const short = publishVerdict(
      { ...story, title: "Short" },
      { mode: "draft" },
    );
    assert.equal(short.ok, false);
    assert.ok(short.errors.some((message) => message.includes("too short")));

    const future = publishVerdict(
      { ...story, date: new Date(Date.now() + 3 * 86400000).toISOString() },
      { mode: "draft" },
    );
    assert.equal(future.ok, false);
    assert.ok(future.errors.includes("date is more than a day in the future"));
  });

  it("treats draft: true as valid in draft mode and an error in publish mode", () => {
    const story = parseStory(
      VALID_RAW.replace("draft: false", "draft: true"),
      { path: "example.mdx" },
    );
    const draftMode = publishVerdict(story, { mode: "draft" });
    assert.equal(draftMode.ok, true);
    assert.ok(
      draftMode.warnings.includes("draft — will not appear on the site"),
    );

    const publishMode = publishVerdict(story, { mode: "publish" });
    assert.equal(publishMode.ok, false);
    assert.ok(publishMode.errors.includes("draft: true in a publish run"));
  });

  it("requires two summary bullets and warns below three", () => {
    const story = parseStory(VALID_RAW, { path: "example.mdx" });
    const one = publishVerdict(
      { ...story, summary: ["Only one."] },
      { mode: "draft" },
    );
    assert.equal(one.ok, false);
    assert.ok(one.errors.includes('add at least 2 "short version" bullets'));

    const two = publishVerdict(
      { ...story, summary: ["One.", "Two."] },
      { mode: "draft" },
    );
    assert.equal(two.ok, true);
    assert.ok(
      two.warnings.includes("summary should have at least three bullets"),
    );
  });

  it("requires image credit and license", () => {
    const story = parseStory(VALID_RAW, { path: "example.mdx" });
    const noCredit = publishVerdict(
      {
        ...story,
        images: [{ ...story.images[0], credit: undefined }],
        imageCredit: undefined,
      },
      { mode: "draft" },
    );
    assert.equal(noCredit.ok, false);
    assert.ok(noCredit.errors.includes("image 1: missing credit"));

    const noLicense = publishVerdict(
      {
        ...story,
        images: [{ ...story.images[0], license: undefined }],
        imageLicense: undefined,
      },
      { mode: "draft" },
    );
    assert.equal(noLicense.ok, false);
    assert.ok(noLicense.errors.includes("image 1: missing license"));
  });
});

describe("writeStory", () => {
  it("validates, normalises and encodes a draft", async () => {
    const result = await writeStory(
      {
        title: "Nighttime lane closures start Sunday on I-80 at mile 427",
        dek: "Bridge work begins Nov. 8 with nightly lane closures.",
        body: `${"Sentence one. ".repeat(40)}`,
        city: "statewide",
        topics: ["road-conditions"],
        tags: "Construction, Lane Closure",
        summary: "- first\n- second\n- third",
        sources: [{ name: "Nebraska 511", url: "https://511.nebraska.gov/" }],
        date: "2026-11-06T08:30:00-06:00",
        images: [
          {
            src: "/images/posts/example/cover.jpg",
            alt: "Cover alt",
            credit: "Photo: Example",
            creditUrl: "https://example.com/photo",
            license: "CC0 1.0",
            licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
          },
        ],
        draft: true,
      },
      { validCities: ["statewide"], validTopics: ["road-conditions"] },
    );
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
    assert.equal(
      result.path,
      "content/posts/nighttime-lane-closures-start-sunday-on-i-80-at-mile-427.mdx",
    );
    assert.ok(result.content.includes("Nighttime lane closures"));
    assert.ok(result.content.includes("draft: true"));
  });

  it("rejects a short headline, a missing dek, a short body and a bad date", async () => {
    const headline = await writeStory({
      title: "Short",
      dek: "A dek.",
      body: "x".repeat(300),
    });
    assert.equal(headline.ok, false);
    assert.equal(
      headline.errors[0],
      "A headline of at least 8 characters is required.",
    );

    const dek = await writeStory({
      title: "A headline long enough",
      dek: "",
      body: "x".repeat(300),
    });
    assert.equal(dek.ok, false);
    assert.equal(dek.errors[0], "A dek is required.");

    const body = await writeStory({
      title: "A headline long enough",
      dek: "A dek.",
      body: "too short",
    });
    assert.equal(body.ok, false);
    assert.equal(
      body.errors[0],
      "The story body must be at least 200 characters.",
    );

    const date = await writeStory({
      title: "A headline long enough",
      dek: "A dek.",
      body: "x".repeat(300),
      date: "not-a-date",
    });
    assert.equal(date.ok, false);
    assert.ok(date.errors.includes("Invalid publication date."));
  });

  it("dedupes slugs through slugExists", async () => {
    const result = await writeStory(
      {
        title: "A headline long enough",
        dek: "A dek.",
        body: "x".repeat(300),
      },
      { slugExists: (slug) => slug === "a-headline-long-enough" },
    );
    assert.equal(result.ok, true);
    assert.equal(result.path, "content/posts/a-headline-long-enough-2.mdx");
  });

  it("falls back to the cover image and coerces an unknown city", async () => {
    const result = await writeStory(
      {
        title: "A headline long enough",
        dek: "A dek.",
        body: "x".repeat(300),
        city: "nowhere",
        image: "/images/posts/example/cover.jpg",
      },
      { validCities: ["statewide"] },
    );
    assert.equal(result.ok, true);
    assert.ok(result.content.includes("city: statewide"));
    assert.ok(
      result.content.includes("image: /images/posts/example/cover.jpg"),
    );
  });
});
