#!/usr/bin/env node
/**
 * Safely replace only the known generic V5 block on verified directory pages.
 * Default mode is read-only. Use --apply --limit N to write a bounded batch.
 * No SEO directives, redirects, robots rules, sitemap entries, or AdSense code are authored.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artistsDir = path.join(root, "artistas");
const records = JSON.parse(fs.readFileSync(path.join(artistsDir, "index.json"), "utf8"));
const recordMap = new Map(records.map((record) => [record.s, record]));
const editorialFile = path.join(artistsDir, "editorial-profiles.json");
const editorial = fs.existsSync(editorialFile) ? JSON.parse(fs.readFileSync(editorialFile, "utf8")) : { profiles: {} };
const editorialMap = editorial.profiles || editorial.artists || {};
const apply = process.argv.includes("--apply");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : 0;
if (apply && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) {
  throw new Error("Apply mode requires --limit between 1 and 1000.");
}
const htmlEscape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const decodeEntities = (value) => value
  .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(Number(n)));
const textOnly = (value) => decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
const fold = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const get = (html, re) => (html.match(re) || [null, ""])[1] || "";
const canonicalOf = (html) => get(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
const robotsOf = (html) => get(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
const titleOf = (html) => get(html, /<title>([\s\S]*?)<\/title>/i);
// Description attributes may contain apostrophes in artist names; capture by matching quote type.
// Parse the full quoted meta description even when an artist name contains an apostrophe.
// The filtered candidate set is reviewed as a bounded exact-template batch.
const descriptionOf = (html) => {
  const match = html.match(/<meta\b(?=[^>]*name=["']description["'])[^>]*content=(["'])(.*?)\1[^>]*>/i);
  return match?.[2] || "";
};
const adSignature = (html) => {
  const scripts = [...html.matchAll(/<script\b[\s\S]*?<\/script>/gi)].map((m) => m[0]).filter((x) => /adsbygoogle|pagead|ca-pub-|google_ad_client/i.test(x));
  const attrs = [...html.matchAll(/\b(?:data-ad-client|data-ad-slot)=["'][^"']+["']/gi)].map((m) => m[0]);
  const publishers = [...html.matchAll(/ca-pub-[0-9-]+/gi)].map((m) => m[0]);
  return JSON.stringify({ scripts, attrs, publishers });
};
const balanced = (html) => {
  const safe = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const voids = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const stack = [];
  for (const tag of safe.match(/<\/?[a-z][^>]*>/gi) || []) {
    const name = (tag.match(/^<\/?([a-z0-9-]+)/i) || [null, ""])[1].toLowerCase();
    if (tag.startsWith("</")) {
      if (stack.pop() !== name) return false;
    } else if (!voids.has(name) && !tag.endsWith("/>")) stack.push(name);
  }
  return stack.length === 0;
};
const genericBio = /(?:La voz masculina más aguda y brillante, con una capacidad de proyección emocional que la convierte en la más admirada del repertorio\.|Voz masculina que equilibra potencia y calidez, con graves resonantes y agudos accesibles\. El tipo vocal más común entre grandes intérpretes\.|La voz masculina más grave, con un timbre oscuro e inconfundible que aporta autoridad y presencia única\.|La voz masculina más aguda y brillante, con proyección emocional y facilidad natural en los registros agudos\.)/i;
const expectedH3 = new Set(["Perfil Biomecánico", "Guía de Nutrición Vocal", "Vocal Bio-Hacking Kit", "Mejores Interpretaciones"]);
const expectedProducts = new Set(["Lax Vox (Terapia de Pajita)", "Beltbox (Máscara Vocal)", "Nebulizador Vocal"]);
const allowedSongLabels = new Set(["Top Hit 1", "Top Hit 2", "Mejores canciones", "En vivo", "Grandes éxitos"]);
const pages = fs.readdirSync(artistsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  .map((entry) => ({ slug: entry.name, file: path.join(artistsDir, entry.name, "index.html") }))
  .filter((page) => fs.existsSync(page.file)).sort((a, b) => a.slug.localeCompare(b.slug));
const skipped = {};
const candidates = [];
const increment = (key) => { skipped[key] = (skipped[key] || 0) + 1; };

function inspect(page) {
  const record = recordMap.get(page.slug);
  if (!record) return { reason: "not-exact-directory-record" };
  if (Object.prototype.hasOwnProperty.call(editorialMap, page.slug)) return { reason: "editorial-profile" };
  const html = fs.readFileSync(page.file, "utf8");
  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) return { reason: "has-noindex" };
  const canonical = canonicalOf(html);
  if (!canonical) return { reason: "missing-canonical" };
  const h1 = textOnly(get(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i));
  if (!h1 || fold(h1) !== fold(record.n)) return { reason: "h1-not-exact-directory-name" };
  const title = textOnly(titleOf(html));
  if (fold(title) !== fold(record.n + " | Perfil Vocal V5 | Harmiq")) return { reason: "title-not-exact-v5-template" };
  const description = textOnly(descriptionOf(html));
  const expectedDescription = "Descubre el perfil vocal de " + record.n + ": tipo de voz " + record.v + ", tecnica de canto y equipo recomendado para grabar.";
  if (fold(description) !== fold(expectedDescription)) return { reason: "description-not-exact-v5-template" };
  const voice = textOnly(get(html, /<div\b[^>]*letter-spacing:2px;margin-bottom:0\.5rem[^>]*>([\s\S]*?)<\/div>\s*<h1\b/i));
  if (voice !== record.v) return { reason: "hero-classification-mismatch" };
  const tagline = /<p\b[^>]*font-weight:600[^>]*>\s*Bio-Hacking Vocal\s*&(?:amp;)?\s*Análisis de Equipo\s*<\/p>/i;
  if (!tagline.test(html)) return { reason: "tagline-not-exact-template" };
  const start = html.indexOf('<div class="grid-v5">');
  const marker = '<div style="text-align:center;margin-top:5rem';
  const end = html.indexOf(marker, start);
  if (start < 0 || end < 0) return { reason: "grid-boundary-not-exact" };
  const grid = html.slice(start, end);
  if (/adsbygoogle|pagead|ca-pub-|google_ad_client/i.test(grid)) return { reason: "adsense-inside-replaced-region" };
  if (!grid.includes("Lax Vox (Terapia de Pajita)") || !grid.includes("Beltbox (Máscara Vocal)") || !grid.includes("Nebulizador Vocal")) return { reason: "products-not-exact-template" };
  if (!genericBio.test(grid)) return { reason: "bio-not-known-generic-copy" };
  const h3 = [...grid.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => textOnly(m[1]).replace(/^[^\p{L}\p{N}]*/u, ""));
  if (h3.length !== expectedH3.size || h3.some((text) => !expectedH3.has(text))) return { reason: "section-headings-not-exact-template" };
  const h4 = [...grid.matchAll(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi)].map((m) => textOnly(m[1]));
  if (h4.length !== expectedProducts.size || h4.some((text) => !expectedProducts.has(text))) return { reason: "product-headings-not-exact-template" };
  const songs = [...grid.matchAll(/<a\b[^>]*class=["'][^"']*\bsong-card\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)];
  if (songs.length < 2) return { reason: "song-module-not-exact-template" };
  for (const match of songs) {
    const tag = match[0].slice(0, match[0].indexOf(">") + 1);
    const href = get(tag, /\bhref=["']([^"']+)["']/i);
    const label = textOnly(get(match[1], /<span\b[^>]*>([\s\S]*?)<\/span>/i));
    if (!/^https:\/\/www\.youtube\.com\/results\?search_query=/i.test(href) || !allowedSongLabels.has(label)) return { reason: "song-links-not-generic-template" };
  }
  const expectedCanonical = canonical;
  const expectedRobots = robotsOf(html);
  const expectedAds = adSignature(html);
  const newTitle = html.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + htmlEscape(record.n + " | Directorio vocal Harmiq") + "</title>");
  const newDescription = newTitle.replace(/<meta\b(?=[^>]*name=["']description["'])[^>]*content=["'][^"']*["'][^>]*>/i,
    '<meta name="description" content="' + htmlEscape("Ficha del directorio vocal de Harmiq: " + record.n + " — clasificación registrada: " + record.v + ".") + '">');
  const cleanTagline = newDescription.replace(tagline, '<p style="color:var(--m);font-weight:600">Ficha del directorio vocal</p>');
  const entry = '<div class="grid-v5"><section class="card-v5" style="grid-column:1 / -1" aria-labelledby="directory-scope"><h2 id="directory-scope">Registro del directorio vocal</h2><dl style="display:grid;grid-template-columns:max-content 1fr;gap:.5rem 1rem;color:var(--m);font-size:1.05rem"><dt>Artista</dt><dd>' + htmlEscape(record.n) + '</dd><dt>Clasificación registrada</dt><dd>' + htmlEscape(record.v) + '</dd></dl><p style="color:var(--m);margin-top:1rem">El directorio registra esta clasificación general; esta ficha no documenta un análisis vocal individual ni fuentes verificadas para equipo, entrenamiento, nutrición o repertorio.</p><p style="color:var(--m);margin-top:1rem">La clasificación del directorio no sustituye una evaluación vocal individual.</p></section></div>';
  const updatedStart = cleanTagline.indexOf('<div class="grid-v5">');
  const updatedEnd = cleanTagline.indexOf(marker, updatedStart);
  if (updatedStart < 0 || updatedEnd < 0) return { reason: "rewritten-grid-boundary-not-exact" };
  const updated = cleanTagline.slice(0, updatedStart) + entry + cleanTagline.slice(updatedEnd);
  if (canonicalOf(updated) !== expectedCanonical) return { reason: "canonical-changed" };
  if (robotsOf(updated) !== expectedRobots) return { reason: "robots-changed" };
  if (adSignature(updated) !== expectedAds) return { reason: "adsense-changed" };
  if (!balanced(updated)) return { reason: "unbalanced-markup" };
  if (/Vocal Bio-Hacking Kit|Perfil Biomecánico|Guía de Nutrición Vocal|Lax Vox|Beltbox|Nebulizador Vocal|Top Hit 1|Top Hit 2/i.test(updated)) return { reason: "generic-claims-remain" };
  return { page, html, updated, voice: record.v };
}

for (const page of pages) {
  const result = inspect(page);
  if (result.reason) increment(result.reason);
  else candidates.push({ ...result, slug: page.slug });
}
const selected = apply ? candidates.slice(0, limit) : [];
for (const candidate of selected) fs.writeFileSync(candidate.page.file, candidate.updated, "utf8");
const output = {
  mode: apply ? "apply" : "dry-run",
  pagesScanned: pages.length,
  directoryRecords: records.length,
  eligibleExactTemplatePages: candidates.length,
  selectedForThisBatch: apply ? selected.length : 0,
  changed: apply ? selected.map((item) => item.slug) : [],
  skippedByReason: skipped,
  eligibleSamples: candidates.slice(0, 30).map((item) => ({ slug: item.slug, voice: item.voice }))
};
console.log(JSON.stringify(output, null, 2));
