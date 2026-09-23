#!/usr/bin/env node
/**
 * Read-only V5 content-family audit.
 * Separates reusable template blocks from artist-specific fields.
 * Never modifies SEO directives or artist pages.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const pages = fs.readdirSync(artistsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => ({ slug: e.name, file: path.join(artistsDir, e.name, "index.html") }))
  .filter((p) => fs.existsSync(p.file));

const markers = [
  ["legacy-v5", /Perfil Vocal V5|Bio-Hacking Vocal|Vocal Bio-Hacking Kit|Perfil Biomecánico/i],
  ["unfinished", /Análisis vocal avanzado en desarrollo\./i],
  ["generic-hit-labels", /Top Hit 1|Top Hit 2/i],
  ["generic-nutrition", /Agua \(Temperatura Ambiente\)|Té de Jengibre y Miel|Frutas con Alto Contenido de Agua/i],
  ["nutrition-avoid-claims", /Lácteos \(Generan Mucosidad\)|Cafeína \(Deshidrata\)|Picante \(Reflujo Gástrico\)/i],
  ["lax-vox-claim", /must-have.*hidratar y relajar tus cuerdas vocales/i],
  ["beltbox-claim", /silenciando tu volumen un 90%/i],
  ["nebulizer-claim", /Hidratación directa a través de micro-partículas/i],
  ["generic-voice-claim", /voz masculina más aguda y brillante|voz masculina más grave|facilidad natural en los registros agudos|proyección brillante/i]
];

const esc = (s) => s.replace(/[.*+?^{}()|[\]\\]/g, "\\$&");
const extract = (html, re) => (html.match(re) || [null, ""])[1].trim();

function normalize(html, slug) {
  const title = extract(html, /<title>([^<]*)<\/title>/i);
  const h1 = extract(html, /<h1[^>]*>([^<]*)<\/h1>/i);
  let x = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/https?:\/\/[^"'\s<]+/g, "<URL>")
    .replace(new RegExp(esc(slug), "gi"), "<ARTIST_SLUG>")
    .replace(new RegExp(esc(h1), "gi"), "<ARTIST_NAME>")
    .replace(new RegExp(esc(title), "gi"), "<TITLE>")
    .replace(/data-name=["'][^"']+["']/gi, 'data-name="<ARTIST_NAME>"')
    .replace(/alt=["'][^"']+["']/gi, 'alt="<ARTIST_NAME>"')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '<meta name="description">')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '<link rel="canonical">')
    .replace(/\s+/g, " ")
    .trim();
  return { normalized: x, title, h1 };
}

const groups = new Map();
const markerCounts = Object.fromEntries(markers.map(([n]) => [n, 0]));
const markerCooccurrence = {};
const rows = [];

for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  const { normalized, title, h1 } = normalize(html, page.slug);
  const fingerprint = crypto.createHash("sha256").update(normalized).digest("hex");
  const matched = [];
  for (const [name, re] of markers) {
    if (re.test(html)) { matched.push(name); markerCounts[name]++; }
  }
  const key = matched.slice().sort().join(" + ") || "none";
  markerCooccurrence[key] = (markerCooccurrence[key] || 0) + 1;
  const group = groups.get(fingerprint) || { fingerprint, count: 0, examples: [] };
  group.count++;
  if (group.examples.length < 10) group.examples.push(page.slug);
  groups.set(fingerprint, group);
  rows.push({ slug: page.slug, title, h1, templateFingerprint: fingerprint, markers: matched });
}

const repeated = [...groups.values()].filter((g) => g.count > 1).sort((a,b) => b.count-a.count);

console.log(JSON.stringify({
  physicalPages: rows.length,
  uniqueTemplateFingerprints: groups.size,
  repeatedTemplatePages: repeated.reduce((n,g) => n + g.count, 0),
  repeatedTemplateFamilies: repeated.length,
  markerCounts,
  markerCooccurrence,
  topRepeatedTemplateFamilies: repeated.slice(0, 50),
  generatedAt: new Date().toISOString()
}, null, 2));
