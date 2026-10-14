#!/usr/bin/env node
/**
 * Read-only grouping of legacy V5 structure among exact directory records.
 * Reports shared markup families; it does not edit pages or make SEO decisions.
 * Usage: node scripts/audit-residual-directory-templates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const records = JSON.parse(fs.readFileSync(path.join(artistsDir, "index.json"), "utf8"));
const recordMap = new Map(records.map((record) => [record.s, record]));
const editorialFile = path.join(artistsDir, "editorial-profiles.json");
const editorialData = fs.existsSync(editorialFile) ? JSON.parse(fs.readFileSync(editorialFile, "utf8")) : {};
const editorial = editorialData.profiles || editorialData.artists || {};
const legacyMarkers = ["Perfil Vocal V5", "Bio-Hacking Vocal", "Vocal Bio-Hacking Kit", "Perfil Biomecánico"];

const decode = (s) => s
  .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(Number(n)));
const visible = (s) => decode(s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
const matchCount = (s, re) => [...s.matchAll(re)].length;
const headings = (s, tag) => [...s.matchAll(new RegExp("<" + tag + "\\b[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "gi"))]
  .map((m) => visible(m[1]).replace(/^[^\p{L}\p{N}]*/u, "").trim())
  .filter(Boolean);

const groups = new Map();
let legacyDirectoryPages = 0;
let directoryPagesScanned = 0;
let editorialPagesSkipped = 0;
const nonLegacyDirectoryPages = [];
const pages = fs.readdirSync(artistsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ slug: entry.name, file: path.join(artistsDir, entry.name, "index.html") }))
  .filter((page) => recordMap.has(page.slug) && fs.existsSync(page.file))
  .sort((a, b) => a.slug.localeCompare(b.slug));

for (const page of pages) {
  if (Object.prototype.hasOwnProperty.call(editorial, page.slug)) {
    editorialPagesSkipped++;
    continue;
  }
  directoryPagesScanned++;
  const html = fs.readFileSync(page.file, "utf8");
  const isLegacy = legacyMarkers.some((marker) => html.includes(marker));
  if (!isLegacy) {
    nonLegacyDirectoryPages.push(page.slug);
    continue;
  }
  legacyDirectoryPages++;

  const gridStart = html.indexOf('<div class="grid-v5">');
  const ctaMarker = '<div style="text-align:center;margin-top:5rem';
  const gridEnd = gridStart >= 0 ? html.indexOf(ctaMarker, gridStart) : -1;
  const grid = gridStart >= 0 && gridEnd >= 0 ? html.slice(gridStart, gridEnd) : "";
  const h2 = headings(grid, "h2");
  const h3 = headings(grid, "h3");
  const h4 = headings(grid, "h4");
  const classes = {
    cardV5: matchCount(grid, /\bclass=["'][^"']*\bcard-v5\b[^"']*["']/gi),
    sideLeft: matchCount(grid, /\bclass=["'][^"']*\bside-left\b[^"']*["']/gi),
    sideRight: matchCount(grid, /\bclass=["'][^"']*\bside-right\b[^"']*["']/gi),
    hardwareGrid: matchCount(grid, /\bclass=["'][^"']*\bhw-grid\b[^"']*["']/gi),
    dietBox: matchCount(grid, /\bclass=["'][^"']*\bdiet-box\b[^"']*["']/gi),
    gadgetCard: matchCount(grid, /\bclass=["'][^"']*\bgadget-card\b[^"']*["']/gi),
    songCard: matchCount(grid, /\bclass=["'][^"']*\bsong-card\b[^"']*["']/gi)
  };
  const tagline = visible((html.match(/<p\b[^>]*font-weight:600[^>]*>([\s\S]*?)<\/p>/i) || [null, ""])[1]);
  const shape = {
    gridBoundary: grid ? "bounded" : "missing-or-unrecognized",
    h2, h3, h4, classes,
    tagline,
    hasKnownGenericVoiceCopy: /La voz masculina más aguda y brillante|Voz masculina que equilibra potencia y calidez|La voz masculina más grave/i.test(grid),
    hasUnfinishedAnalysisText: grid.includes("Análisis vocal avanzado en desarrollo."),
    hasGenericHitLabels: /Top Hit\s*[12]/i.test(grid),
    hasCanonical: /<link\b[^>]*rel=["']canonical["']/i.test(html),
    hasNoindex: /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
  };
  const key = JSON.stringify(shape);
  if (!groups.has(key)) groups.set(key, { count: 0, shape, samples: [] });
  const group = groups.get(key);
  group.count++;
  if (group.samples.length < 50) group.samples.push(page.slug);
}

const orderedGroups = [...groups.values()].sort((a, b) => b.count - a.count || JSON.stringify(a.shape).localeCompare(JSON.stringify(b.shape)));
console.log(JSON.stringify({
  mode: "read-only-structural-audit",
  generatedAt: new Date().toISOString(),
  directoryRecords: records.length,
  directoryPagesScanned,
  editorialPagesSkipped,
  legacyDirectoryPages,
  nonLegacyDirectoryPages: nonLegacyDirectoryPages.length,
  structuralFamilyCount: orderedGroups.length,
  groups: orderedGroups,
  note: "Families describe repeated markup only. Samples require human content review before any edit or SEO decision."
}, null, 2));
