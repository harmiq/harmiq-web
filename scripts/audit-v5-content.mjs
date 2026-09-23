#!/usr/bin/env node
/**
 * Read-only content-level audit for the legacy V5 artist corpus.
 * It quantifies reusable V5 boilerplate and repeated claim patterns.
 * It never changes artist files or SEO directives.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");

const pages = fs.readdirSync(artistsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ slug: entry.name, file: path.join(artistsDir, entry.name, "index.html") }))
  .filter((page) => fs.existsSync(page.file));

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

function extract(html, re) {
  return (html.match(re) || [null, ""])[1].trim();
}

function normalizeTemplate(html, slug) {
  const title = extract(html, /<title>([^<]*)<\/title>/i);
  const h1 = extract(html, /<h1[^>]*>([^<]*)<\/h1>/i);
  let normalized = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/https?:\/\/[^"'\s<]+/g, "<URL>")
    .replaceAll(slug, "<ARTIST_SLUG>")
    .replaceAll(h1, "<ARTIST_NAME>")
    .replaceAll(title, "<TITLE>")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, "<meta name=\"description\">")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "<link rel=\"canonical\">")
    .replace(/\s+/g, " ")
    .trim();
  return { normalized, title, h1 };
}

const groups = new Map();
const markerCounts = Object.fromEntries(markers.map(([name]) => [name, 0]));
const rows = [];

for (const page of pages) {
  const html = fs.readFileSync(page.file, "utf8");
  const { normalized, title, h1 } = normalizeTemplate(html, page.slug);
  const templateFingerprint = crypto.createHash("sha256").update(normalized).digest("hex");
  const matched = [];
  for (const [name, re] of markers) {
    if (re.test(html)) {
      matched.push(name);
      markerCounts[name]++;
    }
  }
  const group = groups.get(templateFingerprint) || { fingerprint: templateFingerprint, count: 0, examples: [] };
  group.count++;
  if (group.examples.length < 10) group.examples.push(page.slug);
  groups.set(templateFingerprint, group);
  rows.push({ slug: page.slug, title, h1, templateFingerprint, markers: matched });
}

const repeatedTemplates = [...groups.values()]
  .filter((group) => group.count > 1)
  .sort((a, b) => b.count - a.count);

const markerCooccurrence = {};
for (const row of rows) {
  const key = row.markers.sort().join(" + ") || "none";
  markerCooccurrence[key] = (markerCooccurrence[key] || 0) + 1;
}

console.log(JSON.stringify({
  physicalPages: rows.length,
  uniqueTemplateFingerprints: groups.size,
  repeatedTemplatePages: repeatedTemplates.reduce((n, g) => n + g.count, 0),
  repeatedTemplateFamilies: repeatedTemplates.length,
  markerCounts,
  markerCooccurrence,
  topRepeatedTemplateFamilies: repeatedTemplates.slice(0, 50),
  generatedAt: new Date().toISOString()
}, null, 2));
