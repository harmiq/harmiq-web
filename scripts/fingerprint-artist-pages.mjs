#!/usr/bin/env node
/**
 * Build a read-only content/template fingerprint report for artist pages.
 *
 * The script does not modify artist pages or SEO directives.
 *
 * Usage:
 *   node scripts/fingerprint-artist-pages.mjs
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const indexPath = path.join(artistsDir, "index.json");

const records = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const recordMap = new Map(records.map((artist) => [artist.s, artist]));

const pages = fs.readdirSync(artistsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const slug = entry.name;
    const file = path.join(artistsDir, slug, "index.html");
    return fs.existsSync(file) ? { slug, file } : null;
  })
  .filter(Boolean);

function firstMatch(html, re) {
  return (html.match(re) || [null, ""])[1].trim();
}

function normalizeForFingerprint(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "<script></script>")
    .replace(/<style[\s\S]*?<\/style>/gi, "<style></style>")
    .replace(/<title>[\s\S]*?<\/title>/gi, "<title></title>")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '<meta name="description">')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '<link rel="canonical">')
    .replace(/https?:\/\/[^"'\s<]+/g, "<URL>")
    .replace(/\b[0-9a-f]{40}\b/gi, "<SHA40>")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyTemplate(html) {
  if (/Perfil Vocal V5|Bio-Hacking Vocal|Vocal Bio-Hacking Kit|Perfil Biomecánico/i.test(html)) {
    return "legacy-v5";
  }
  if (/Perfil vocal editorial|Fuentes y criterio|Análisis vocal, canciones y técnica/i.test(html)) {
    return "editorial";
  }
  if (/Análisis vocal avanzado en desarrollo\.|Top Hit 1|Top Hit 2|Artista Especial/i.test(html)) {
    return "generic-placeholder";
  }
  return "other";
}

const fingerprints = new Map();
const rows = [];

for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  const normalized = normalizeForFingerprint(html);
  const fingerprint = crypto.createHash("sha256").update(normalized).digest("hex");
  const title = firstMatch(html, /<title>([^<]*)<\/title>/i);
  const description = firstMatch(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  );
  const canonical = firstMatch(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i
  );
  const robots = firstMatch(
    html,
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i
  );

  const row = {
    slug: page.slug,
    directory: recordMap.has(page.slug),
    template: classifyTemplate(html),
    fingerprint,
    size: Buffer.byteLength(html),
    title,
    description,
    canonical,
    robots
  };

  rows.push(row);

  const group = fingerprints.get(fingerprint) || {
    fingerprint,
    count: 0,
    templates: new Set(),
    slugs: []
  };

  group.count += 1;
  group.templates.add(row.template);
  if (group.slugs.length < 10) group.slugs.push(page.slug);
  fingerprints.set(fingerprint, group);
}

const groups = [...fingerprints.values()]
  .map((group) => ({
    fingerprint: group.fingerprint,
    count: group.count,
    templates: [...group.templates].sort(),
    examples: group.slugs
  }))
  .sort((a, b) => b.count - a.count);

const templateCounts = rows.reduce((acc, row) => {
  acc[row.template] = (acc[row.template] || 0) + 1;
  return acc;
}, {});

const summary = {
  physicalPages: rows.length,
  directoryRecords: records.length,
  uniqueNormalizedFingerprints: groups.length,
  repeatedFingerprintPages: rows.length - groups.filter((g) => g.count === 1).reduce((n, g) => n + g.count, 0),
  templateCounts,
  generatedAt: new Date().toISOString()
};

console.log(JSON.stringify(summary, null, 2));
console.log("\nTop repeated fingerprints:");
for (const group of groups.slice(0, 50)) {
  if (group.count > 1) console.log(JSON.stringify(group));
}
