#!/usr/bin/env node
/**
 * Audit static artist pages before any bulk SEO action.
 *
 * Usage:
 *   node scripts/audit-artist-pages.mjs
 *
 * The script is intentionally read-only. It reports:
 * - directory records vs physical artist pages;
 * - legacy V5 pages;
 * - derived/combined-looking URLs;
 * - pages with no directory record;
 * - editorial profiles declared in artistas/editorial-profiles.json.
 *
 * It does not add noindex, redirects, canonicals or delete files.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const indexPath = path.join(artistsDir, "index.json");
const editorialPath = path.join(artistsDir, "editorial-profiles.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const walkArtistPages = () => {
  const result = [];
  for (const name of fs.readdirSync(artistsDir, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    const file = path.join(artistsDir, name.name, "index.html");
    if (fs.existsSync(file)) result.push({ slug: name.name, file });
  }
  return result;
};

const records = readJson(indexPath);
const editorial = fs.existsSync(editorialPath) ? readJson(editorialPath) : { profiles: {} };
const recordMap = new Map(records.map((a) => [a.s, a]));
const pages = walkArtistPages();

const legacyMarkers = [
  "Perfil Vocal V5",
  "Bio-Hacking Vocal",
  "Vocal Bio-Hacking Kit",
  "Perfil Biomecánico"
];

const looksDerived = (slug) => {
  // Heuristic only. A URL is derived-looking when its slug starts with a
  // known directory artist plus a separator, or contains collaboration-style
  // separators/markers. This is never used to make an SEO decision.
  if (recordMap.has(slug)) return false;
  for (const known of recordMap.keys()) {
    if (slug.startsWith(known + "-")) return true;
  }
  return /(?:-x-|-(?:feat|ft|with)-|;|&)/i.test(slug);
};

const legacy = [];
const missingFromDirectory = [];
const derived = [];
const legacyIndividual = [];
const legacyDerived = [];
const noindex = [];
const missingCanonical = [];

for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  const isLegacy = legacyMarkers.some((marker) => html.includes(marker));
  if (isLegacy) legacy.push(page.slug);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  if (hasNoindex) noindex.push(page.slug);
  if (!hasCanonical) missingCanonical.push(page.slug);
  if (!recordMap.has(page.slug)) {
    missingFromDirectory.push(page.slug);
    if (looksDerived(page.slug)) {
      derived.push(page.slug);
      if (isLegacy) legacyDerived.push(page.slug);
    }
  } else if (isLegacy) {
    legacyIndividual.push(page.slug);
  }
}

const summary = {
  directoryRecords: records.length,
  physicalArtistPages: pages.length,
  pagesWithoutDirectoryRecord: missingFromDirectory.length,
  pagesMatchingDirectoryRecord: pages.length - missingFromDirectory.length,
  legacyV5Pages: legacy.length,
  legacyIndividualPages: legacyIndividual.length,
  legacyDerivedPages: legacyDerived.length,
  derivedLookingPages: derived.length,
  pagesWithNoindex: noindex.length,
  pagesMissingCanonical: missingCanonical.length,
  editorialProfiles: Object.keys(editorial.profiles || {}).length,
  generatedAt: new Date().toISOString()
};

console.log(JSON.stringify(summary, null, 2));

console.log("\nLegacy V5 examples:");
for (const slug of legacy.slice(0, 20)) console.log(" - " + slug);

console.log("\nPages without directory record (examples):");
for (const slug of missingFromDirectory.slice(0, 20)) console.log(" - " + slug);

console.log("\nDerived-looking pages (examples):");
for (const slug of derived.slice(0, 20)) console.log(" - " + slug);