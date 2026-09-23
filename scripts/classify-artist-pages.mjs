#!/usr/bin/env node
/**
 * Classify static artist pages before any bulk SEO action.
 *
 * This script is READ-ONLY with respect to the artist corpus.
 * It creates no redirects, noindex directives, canonicals or sitemap entries.
 *
 * Usage:
 *   node scripts/classify-artist-pages.mjs
 *
 * Classes:
 *   editorial         -> explicit editorial profile
 *   directory         -> exact record in artistas/index.json
 *   generic-candidate -> no directory record + strong placeholder/generic markers
 *   derived-candidate -> no directory record + strong derived/collaboration signal
 *   unresolved        -> no directory record, but insufficient evidence
 *
 * Important:
 *   "candidate" is deliberate. A heuristic never becomes an SEO decision.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const indexPath = path.join(artistsDir, "index.json");
const editorialPath = path.join(artistsDir, "editorial-profiles.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const records = readJson(indexPath);
const recordMap = new Map(records.map((artist) => [artist.s, artist]));
const editorial = fs.existsSync(editorialPath)
  ? readJson(editorialPath)
  : { profiles: {} };
const editorialMap = editorial.profiles || {};

const pages = fs.readdirSync(artistsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const slug = entry.name;
    const file = path.join(artistsDir, slug, "index.html");
    return fs.existsSync(file) ? { slug, file } : null;
  })
  .filter(Boolean);

const legacyMarkers = [
  "Perfil Vocal V5",
  "Bio-Hacking Vocal",
  "Vocal Bio-Hacking Kit",
  "Perfil Biomecánico"
];

const genericMarkers = [
  "Análisis vocal avanzado en desarrollo.",
  "Top Hit 1",
  "Top Hit 2",
  "Artista Especial",
  "artista-especial-"
];

const derivedSeparators = [
  "-x-",
  "-feat-",
  "-ft-",
  "-with-"
];

const knownSlugs = [...recordMap.keys()].sort((a, b) => b.length - a.length);

function derivedEvidence(slug, html) {
  const reasons = [];

  for (const known of knownSlugs) {
    if (slug.startsWith(known + "-")) {
      reasons.push(`prefix-of-directory-record:${known}`);
      break;
    }
  }

  for (const separator of derivedSeparators) {
    if (slug.includes(separator)) reasons.push(`separator:${separator}`);
  }

  if (slug.includes(";")) reasons.push("semicolon-in-slug");
  if (slug.includes("&")) reasons.push("ampersand-in-slug");

  // Legacy V5 pages encode multi-entity names in the title with semicolons.
  // This is stronger evidence than slug heuristics for collaboration pages.
  const title = (html.match(/<title>([^<]*)<\\/title>/i) || [null, ""])[1];
  if (title.includes(";")) reasons.push("semicolon-in-title");

  // The old generator explicitly labels these pages as V5/Bio-Hacking.
  if (/Perfil Vocal V5|Bio-Hacking Vocal/i.test(html)) {
    reasons.push("legacy-v5-template");
  }

  return [...new Set(reasons)];
}

function classify(page) {
  const html = fs.readFileSync(page.file, "utf8");
  const legacy = legacyMarkers.filter((marker) => html.includes(marker));
  const generic = genericMarkers.filter((marker) => html.includes(marker));
  const derived = derivedEvidence(page.slug, html);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);

  if (Object.prototype.hasOwnProperty.call(editorialMap, page.slug)) {
    return {
      class: "editorial",
      confidence: "high",
      reasons: ["explicit-editorial-profile"],
      legacy,
      generic,
      derived,
      hasNoindex,
      hasCanonical
    };
  }

  if (recordMap.has(page.slug)) {
    return {
      class: "directory",
      confidence: "high",
      reasons: ["exact-directory-record"],
      legacy,
      generic,
      derived,
      hasNoindex,
      hasCanonical
    };
  }

  if (generic.length) {
    return {
      class: "generic-candidate",
      confidence: "high",
      reasons: generic,
      legacy,
      generic,
      derived,
      hasNoindex,
      hasCanonical
    };
  }

  if (derived.length) {
    return {
      class: "derived-candidate",
      confidence: "medium",
      reasons: derived,
      legacy,
      generic,
      derived,
      hasNoindex,
      hasCanonical
    };
  }

  return {
    class: "unresolved",
    confidence: "low",
    reasons: ["no-strong-structural-signal"],
    legacy,
    generic,
    derived,
    hasNoindex,
    hasCanonical
  };
}

const classified = pages.map((page) => ({
  slug: page.slug,
  ...classify(page)
}));

const counts = classified.reduce((acc, item) => {
  acc[item.class] = (acc[item.class] || 0) + 1;
  return acc;
}, {});

const legacyCounts = classified.reduce((acc, item) => {
  if (item.legacy.length) acc[item.class] = (acc[item.class] || 0) + 1;
  return acc;
}, {});

const noindexCount = classified.filter((item) => item.hasNoindex).length;
const missingCanonicalCount = classified.filter((item) => !item.hasCanonical).length;

const summary = {
  directoryRecords: records.length,
  physicalPages: pages.length,
  counts,
  legacyByClass: legacyCounts,
  pagesWithNoindex: noindexCount,
  pagesMissingCanonical: missingCanonicalCount,
  editorialProfiles: Object.keys(editorialMap).length,
  generatedAt: new Date().toISOString()
};

console.log(JSON.stringify(summary, null, 2));

for (const className of [
  "generic-candidate",
  "derived-candidate",
  "unresolved"
]) {
  console.log(`\n${className} examples:`);
  for (const item of classified.filter((x) => x.class === className).slice(0, 30)) {
    console.log(` - ${item.slug} [${item.reasons.join(", ")}]`);
  }
}
