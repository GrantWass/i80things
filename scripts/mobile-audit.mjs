#!/usr/bin/env node
/**
 * Mobile audit for the I-80 Things reference pages.
 *
 *   node scripts/mobile-audit.mjs --pages /exits,/rest-areas
 *   node scripts/mobile-audit.mjs --width 390 --height 844 --out /tmp/i80-mobile
 *
 * Uses the locally installed Chrome through puppeteer-core. It does not edit
 * anything. Outputs screenshots + JSON per page.
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const base = arg("base", "https://i80things.vercel.app").replace(/\/$/, "");
const pages = (arg("pages", "/data,/exits,/rest-areas,/truck-parking,/construction,/demographics,/distances"))
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);
const width = Number(arg("width", "390"));
const height = Number(arg("height", "844"));
const out = arg("out", "/tmp/i80-mobile-audit");
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const results = [];
for (const route of pages) {
  const url = `${base}${route}`;
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2000));

  const data = await page.evaluate(() => {
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        !el.classList.contains("sr-only")
      );
    };
    const selector = (el) => {
      if (!el) return "";
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const cls = [...el.classList].slice(0, 3).map((c) => `.${c}`).join("");
      const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
      return `${tag}${id}${cls}${text ? ` [${text}]` : ""}`;
    };

    const overflow = [...document.querySelectorAll("body *")]
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return { el, rect };
      })
      .filter(({ rect }) => rect.right > innerWidth + 1 || rect.left < -1)
      .slice(0, 15)
      .map(({ el, rect }) => ({
        selector: selector(el),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      }));

    const tapTargets = [...document.querySelectorAll("a, button, input, summary, select")]
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          selector: selector(el),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter((item) => item.width < 44 || item.height < 44)
      .slice(0, 25);

    const tables = [...document.querySelectorAll("table")].map((table) => {
      const parent = table.parentElement;
      const parentStyle = parent ? getComputedStyle(parent) : null;
      return {
        rows: table.querySelectorAll("tbody tr").length,
        tableWidth: Math.round(table.getBoundingClientRect().width),
        parentOverflowX: parentStyle?.overflowX ?? null,
        parentWidth: parent ? Math.round(parent.getBoundingClientRect().width) : null,
      };
    });

    const headings = [...document.querySelectorAll("h1, h2")]
      .filter(visible)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90),
        top: Math.round(el.getBoundingClientRect().top),
      }));

    const search = document.querySelector('input[type="search"], input[placeholder]');
    return {
      title: document.title,
      viewport: { innerWidth, innerHeight, scrollWidth: document.documentElement.scrollWidth },
      overflow,
      tapTargets,
      tables,
      headings: headings.slice(0, 10),
      hasSearch: Boolean(search),
      searchTop: search ? Math.round(search.getBoundingClientRect().top) : null,
    };
  });

  const slug = route.replace(/^\//, "").replace(/\//g, "-") || "home";
  await page.screenshot({ path: path.join(out, `${slug}-${width}.png`), fullPage: false });
  await page.screenshot({ path: path.join(out, `${slug}-${width}-full.png`), fullPage: true });
  results.push({ route, url, ...data });

  console.log(`\n${route}`);
  console.log(`  title: ${data.title}`);
  console.log(`  viewport: ${data.viewport.innerWidth} / scrollWidth ${data.viewport.scrollWidth}`);
  console.log(`  overflow: ${data.overflow.length}`);
  console.log(`  tap targets <44px: ${data.tapTargets.length}`);
  console.log(`  tables: ${data.tables.map((t) => `${t.rows} rows, ${t.parentOverflowX}`).join("; ") || "none"}`);
  for (const item of data.overflow.slice(0, 5)) {
    console.log(`    overflow: ${item.selector} (${item.left}–${item.right})`);
  }
  for (const item of data.tapTargets.slice(0, 5)) {
    console.log(`    tap: ${item.selector} (${item.width}×${item.height})`);
  }
  await page.close();
}

fs.writeFileSync(path.join(out, "audit.json"), JSON.stringify(results, null, 2));
await browser.close();
console.log(`\nWrote ${path.join(out, "audit.json")} and screenshots.`);
