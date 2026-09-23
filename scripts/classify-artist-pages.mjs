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
const editorialMap = editorial.profiles || editorial.artists || {};

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
  const titleStart = html.toLowerCase().indexOf("<title>");
  const titleEnd = titleStart >= 0 ? html.toLowerCase().indexOf("</title>", titleStart + 7) : -1;
  const title = titleStart >= 0 && titleEnd > titleStart ? html.slice(titleStart + 7, titleEnd) : "";
  if (title.includes(";")) reasons.push("semicolon-in-title");

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

  // Content evidence outranks slug heuristics for legacy generated pages.
  if (legacy.length && derived.length) {
    return {
      class: "legacy-derived-candidate",
      confidence: "high",
      reasons: [...legacy, ...derived],
      legacy,
      generic,
      derived,
      hasNoindex,
      hasCanonical
    };
  }

  if (legacy.length) {
    return {
      class: "legacy-candidate",
      confidence: "high",
      reasons: legacy,
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

const reasonCounts = classified.reduce((acc, item) => {
  for (const reason of item.reasons) {
    acc[reason] = (acc[reason] || 0) + 1;
  }
  return acc;
}, {});

const derivedReasonCounts = classified
  .filter((item) => item.class === "legacy-derived-candidate")
  .reduce((acc, item) => {
    for (const reason of item.derived) {
      acc[reason] = (acc[reason] || 0) + 1;
    }
    return acc;
  }, {});

const derivedShapeCounts = classified
  .filter((item) => item.class === "legacy-derived-candidate")
  .reduce((acc, item) => {
    const multiEntity = item.derived.includes("semicolon-in-title");
    const directoryPrefix = item.derived.some((x) => x.startsWith("prefix-of-directory-record:"));
    const separator = item.derived.some((x) => x.startsWith("separator:"));
    const shape = [
      multiEntity ? "semicolon-title" : "no-semicolon-title",
      directoryPrefix ? "directory-prefix" : "no-directory-prefix",
      separator ? "collab-separator" : "no-collab-separator"
    ].join("+");
    acc[shape] = (acc[shape] || 0) + 1;
    return acc;
  }, {});

const genericSubclasses = classified
  .filter((item) => item.class === "generic-candidate")
  .reduce((acc, item) => {
    let subclass = "generic-other";
    if (/^artista-especial-\d+$/.test(item.slug)) {
      subclass = "explicit-placeholder";
    } else if (item.generic.includes("Análisis vocal avanzado en desarrollo.")) {
      subclass = "unfinished-content";
    } else if (item.derived.includes("semicolon-in-title")) {
      subclass = "generic-multientity";
    }
    acc[subclass] = (acc[subclass] || 0) + 1;
    return acc;
  }, {});

const examples = {};
for (const className of [
  "editorial",
  "directory",
  "generic-candidate",
  "legacy-derived-candidate",
  "legacy-candidate",
  "derived-candidate",
  "unresolved"
]) {
  examples[className] = classified
    .filter((item) => item.class === className)
    .slice(0, 30)
    .map((item) => ({
      slug: item.slug,
      reasons: item.reasons,
      legacy: item.legacy,
      generic: item.generic,
      derived: item.derived,
      hasNoindex: item.hasNoindex,
      hasCanonical: item.hasCanonical
    }));
}

const summary = {
  directoryRecords: records.length,
  physicalPages: pages.length,
  counts,
  legacyByClass: legacyCounts,
  pagesWithNoindex: noindexCount,
  pagesMissingCanonical: missingCanonicalCount,
  editorialProfiles: Object.keys(editorialMap).length,
  reasonCounts,
  genericSubclasses,
  derivedReasonCounts,
  derivedShapeCounts,
  examples,
  generatedAt: new Date().toISOString()
};
console.log(JSON.stringify(summary, null, 2));
