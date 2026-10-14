#!/usr/bin/env node
/**
 * Read-only audit of the static artist corpus before any bulk SEO action.
 *
 * Usage: node scripts/audit-artist-pages.mjs
 *
 * Reports structural coverage and editorial-risk signals. These are heuristics,
 * not an automated quality verdict and never trigger noindex, redirects or deletion.
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
  for (const entry of fs.readdirSync(artistsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(artistsDir, entry.name, "index.html");
    if (fs.existsSync(file)) result.push({ slug: entry.name, file });
  }
  return result;
};

const records = readJson(indexPath);
const editorial = fs.existsSync(editorialPath) ? readJson(editorialPath) : { profiles: {} };
const recordMap = new Map(records.map((artist) => [artist.s, artist]));
const pages = walkArtistPages();
const legacyMarkers = ["Perfil Vocal V5", "Bio-Hacking Vocal", "Vocal Bio-Hacking Kit", "Perfil Biomecánico"];
const genericMarkers = [
  ["nutrition", /Guía de Nutrición Vocal|nutrición vocal/i],
  ["bioHackingKit", /Vocal Bio-Hacking Kit|Bio-Hacking Vocal/i],
  ["genericHitLabels", /Top Hit\s*[12]/i],
  ["genericVoiceClaim", /(?:voz única|rango vocal exacto|voz perfecta|voz excepcional)/i],
  ["unfinished", /TODO|Lorem ipsum|contenido próximamente|por completar/i]
];
const hasNoindex = (html) => /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
const hasCanonical = (html) => /<link\b[^>]*rel=["']canonical["']/i.test(html);
const hasAdsense = (html) => /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(html);
const visibleText = (html) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&(?:quot|ldquo|rdquo);/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();
const looksDerived = (slug) => {
  if (recordMap.has(slug)) return false;
  for (const known of recordMap.keys()) if (slug.startsWith(known + "-")) return true;
  return /(?:-x-|-(?:feat|ft|with)-|;|&)/i.test(slug);
};

const legacy = [];
const missingFromDirectory = [];
const derived = [];
const legacyIndividual = [];
const legacyDerived = [];
const noindex = [];
const missingCanonical = [];
const editorialSignals = {
  under300Words: [],
  under600Words: [],
  noSpecificListeningGuide: [],
  genericMarkers: Object.fromEntries(genericMarkers.map(([key]) => [key, []])),
  missingAdsenseLoader: [],
  hasAdsenseLoader: []
};
const pageSummaries = [];

for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  const text = visibleText(html);
  const words = text ? text.split(/\s+/).length : 0;
  const isLegacy = legacyMarkers.some((marker) => html.includes(marker));
  if (isLegacy) legacy.push(page.slug);
  if (hasNoindex(html)) noindex.push(page.slug);
  if (!hasCanonical(html)) missingCanonical.push(page.slug);
  if (!recordMap.has(page.slug)) {
    missingFromDirectory.push(page.slug);
    if (looksDerived(page.slug)) {
      derived.push(page.slug);
      if (isLegacy) legacyDerived.push(page.slug);
    }
  } else if (isLegacy) legacyIndividual.push(page.slug);

  if (words < 300) editorialSignals.under300Words.push(page.slug);
  if (words < 600) editorialSignals.under600Words.push(page.slug);
  if (!/gu[ií]a de escucha|escucha activa|qu[eé] escuchar/i.test(text)) {
    editorialSignals.noSpecificListeningGuide.push(page.slug);
  }
  for (const [key, pattern] of genericMarkers) {
    if (pattern.test(text)) editorialSignals.genericMarkers[key].push(page.slug);
  }
  if (hasAdsense(html)) editorialSignals.hasAdsenseLoader.push(page.slug);
  else editorialSignals.missingAdsenseLoader.push(page.slug);
  pageSummaries.push({ slug: page.slug, words, legacy: isLegacy, hasCanonical: hasCanonical(html), hasAdsense: hasAdsense(html) });
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
  editorialRiskSignals: {
    under300VisibleWords: editorialSignals.under300Words.length,
    under600VisibleWords: editorialSignals.under600Words.length,
    noListeningGuideSignal: editorialSignals.noSpecificListeningGuide.length,
    genericMarkers: Object.fromEntries(Object.entries(editorialSignals.genericMarkers).map(([key, slugs]) => [key, slugs.length])),
    pagesWithAdsenseLoader: editorialSignals.hasAdsenseLoader.length,
    pagesWithoutAdsenseLoader: editorialSignals.missingAdsenseLoader.length
  },
  generatedAt: new Date().toISOString()
};

console.log(JSON.stringify(summary, null, 2));
console.log("\nEditorial-risk examples (heuristic only; review before acting):");
for (const [label, slugs] of [
  ["Under 300 visible words", editorialSignals.under300Words],
  ["Under 600 visible words", editorialSignals.under600Words],
  ["No listening-guide signal", editorialSignals.noSpecificListeningGuide],
  ...Object.entries(editorialSignals.genericMarkers).map(([key, slugs]) => [`Generic marker: ${key}`, slugs])
]) {
  console.log(`\n${label} (${slugs.length}):`);
  for (const slug of slugs.slice(0, 12)) console.log(" - " + slug);
}
console.log("\nLegacy V5 examples:");
for (const slug of legacy.slice(0, 20)) console.log(" - " + slug);
console.log("\nPages without directory record (examples):");
for (const slug of missingFromDirectory.slice(0, 20)) console.log(" - " + slug);
console.log("\nDerived-looking pages (examples):");
for (const slug of derived.slice(0, 20)) console.log(" - " + slug);
