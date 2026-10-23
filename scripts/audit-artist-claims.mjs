#!/usr/bin/env node
/**
 * Read-only audit of repeated or potentially unsupported claims in artist pages.
 *
 * Usage: node scripts/audit-artist-claims.mjs
 *
 * This script only reports candidate pages. It does not rewrite content or change
 * canonicals, robots directives, redirects, sitemaps, or AdSense code.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const directoryRecords = JSON.parse(fs.readFileSync(path.join(artistsDir, "index.json"), "utf8"));
const directorySlugs = new Set(directoryRecords.map((artist) => artist.s));
const pages = fs.readdirSync(artistsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ slug: entry.name, file: path.join(artistsDir, entry.name, "index.html") }))
  .filter((page) => fs.existsSync(page.file));

const checks = [
  ["legacy-template-label", /Perfil Vocal V5|Bio-Hacking Vocal|Vocal Bio-Hacking Kit|Perfil Biomecánico/i],
  ["generic-hit-placeholder", /Top Hit 1|Top Hit 2/i],
  ["unfinished-analysis-placeholder", /Análisis vocal avanzado en desarrollo\./i],
  ["unsupported-nutrition-claim", /Lácteos \(Generan Mucosidad\)|Cafeína \(Deshidrata\)|Picante \(Reflujo Gástrico\)|Agua \(Temperatura Ambiente\)|Té de Jengibre y Miel/i],
  ["generic-voice-claim", /voz masculina más aguda y brillante|voz masculina más grave|facilidad natural en los registros agudos|proyección brillante/i],
  ["repeated-equipment-claim", /Shure SM7B|Neumann U87 Ai|Warm Audio WA-87 R2|LEWITT LCT 440 PURE/i],
  ["unverified-range-claim", /rango excepcional de casi 3 octavas|Rango Vocal<\/span>\s*<span class="hw-name">[A-G][#b]?\d\s*[–-]\s*[A-G][#b]?\d/i]
];

const findings = Object.fromEntries(checks.map(([name]) => [name, []]));
let pagesRead = 0;
for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  pagesRead++;
  for (const [name, pattern] of checks) {
    if (pattern.test(html)) findings[name].push(page.slug);
  }
}
const summary = Object.fromEntries(Object.entries(findings).map(([name, slugs]) => [
  name, {
    count: slugs.length,
    examples: slugs.slice(0, 20),
    outsideDirectoryCount: slugs.filter((slug) => !directorySlugs.has(slug)).length,
    outsideDirectory: slugs.filter((slug) => !directorySlugs.has(slug))
  }
]));
console.log(JSON.stringify({
  pagesRead,
  note: "Heuristic candidates only; inspect evidence before editing or making SEO decisions.",
  findings: summary,
  generatedAt: new Date().toISOString()
}, null, 2));
