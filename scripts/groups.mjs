#!/usr/bin/env node
/**
 * Read and edit the Facebook group list in data/groups.json.
 *
 *   npm run groups                       # everything, best first
 *   npm run groups -- --area kearney     # only groups for one town
 *   npm run groups -- --area kearney --open
 *   npm run groups -- --ready            # priority 1-2, verified, no strikes
 *   npm run groups -- --json
 *
 *   npm run groups -- add --url <group-url> --name "..." --area kearney \
 *     --members 8500 --access private --priority 2 --note "..."
 *
 * Nothing here talks to Facebook. It is a list and a checklist, not a scraper.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

const FILE = path.join(process.cwd(), "data", "groups.json");
const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);

function flag(name, fallback = null) {
  const inline = args.find((a) => a.startsWith(`--${name}=`));
  if (inline) return inline.split("=").slice(1).join("=");
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith("--")) {
    return args[index + 1];
  }
  return fallback;
}

if (!fs.existsSync(FILE)) {
  console.error(`No group list at ${FILE}`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const groups = Array.isArray(data.groups) ? data.groups : [];

const compact = (count) => {
  if (typeof count !== "number") return "?";
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  return String(count);
};

const area = (flag("area") || "").toLowerCase();
const onlyReady = has("ready");
const asJson = has("json");

// ---------------------------------------------------------------- add a group
if (args[0] === "add") {
  const url = flag("url");
  const name = flag("name");
  if (!url || !name) {
    console.error(
      'Usage: npm run groups -- add --url <group-url> --name "Group name" [--area kearney] [--members 8500] [--access private] [--priority 2] [--note "..."]',
    );
    process.exit(1);
  }
  const id = flag("id") || url.replace(/\/+$/, "").split("/").pop().toLowerCase();
  const members = Number(flag("members", "0")) || null;
  const entry = {
    id,
    name,
    url,
    access: flag("access", "unknown"),
    members,
    area: flag("area", "statewide"),
    fit: (flag("fit", "") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    priority: Number(flag("priority", "2")) || 2,
    status: flag("status", "needs-check"),
    checkedAt: new Date().toISOString().slice(0, 10),
    note: flag("note", ""),
    lastPostedAt: null,
    strikes: 0,
  };
  const existing = groups.findIndex((group) => group.id === id);
  if (existing !== -1) {
    groups[existing] = { ...groups[existing], ...entry };
    console.log(`Updated ${name}.`);
  } else {
    groups.push(entry);
    console.log(`Added ${name}. ${groups.length} groups in the list.`);
  }
  data.groups = groups;
  fs.writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`);
  process.exit(0);
}

// ------------------------------------------------------------------- list
let shown = groups.filter((group) => {
  if (onlyReady && (group.priority > 2 || group.status !== "verified" || group.strikes >= 2)) {
    return false;
  }
  if (!area) return true;
  const haystack = `${group.area} ${group.name} ${(group.fit || []).join(" ")}`.toLowerCase();
  return haystack.includes(area);
});

shown = shown.sort((a, b) => {
  const rank = (group) => (group.priority === 0 ? 9 : group.priority);
  if (rank(a) !== rank(b)) return rank(a) - rank(b);
  return (b.members || 0) - (a.members || 0);
});

if (asJson) {
  console.log(JSON.stringify({ updated: data.updated, count: shown.length, groups: shown }, null, 2));
  process.exit(0);
}

if (!shown.length) {
  console.log(`No groups match ${area ? `"${area}"` : "that filter"}.`);
  console.log("Search inside Facebook, then: npm run groups -- add --url … --name …");
  process.exit(0);
}

const labels = {
  0: "DO NOT POST",
  1: "Every relevant story",
  2: "Only when the story is in that town",
  3: "Low value — occasional use",
};

console.log(
  `\nFACEBOOK GROUPS — ${shown.length} shown · updated ${data.updated}\n` +
    "Share from the Page, not a fresh link. Two groups a day, maximum.\n",
);

let current = null;
for (const group of shown) {
  if (group.priority !== current) {
    current = group.priority;
    console.log(`\n${labels[current] || `Priority ${current}`}`);
    console.log("-".repeat(72));
  }
  const meta = [
    compact(group.members).padStart(6),
    group.access.padEnd(7),
    (group.area || "").padEnd(13),
  ].join(" ");
  console.log(`${meta} ${group.name}`);
  console.log(`         ${group.url}`);
  if (group.status === "needs-check") console.log("         status: needs a look inside Facebook");
  if (group.strikes) console.log(`         strikes: ${group.strikes}`);
  if (group.note) console.log(`         ${group.note}`);
}

const ready = groups.filter(
  (group) => group.priority === 1 && group.status === "verified" && group.strikes < 2,
);
console.log(
  `\n${groups.length} groups in the list · ${ready.length} priority-one · ` +
    `${groups.filter((g) => g.status === "needs-check").length} still to check.`,
);
console.log(`Post today's kit: npm run share -- --slug <slug>\n`);

if (has("open")) {
  for (const group of shown) {
    execFile("open", [group.url], () => {});
  }
  console.log(`Opened ${shown.length} group${shown.length === 1 ? "" : "s"} in the browser.`);
}
