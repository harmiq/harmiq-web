#!/usr/bin/env node
/**
 * Read-only inventory of likely affiliate or referral links in repository HTML.
 *
 * Usage: node scripts/audit-affiliate-links.mjs
 *
 * Tagged retail links and known affiliate-network domains are review candidates.
 * Plain Amazon destinations are not treated as affiliate links without a referral
 * parameter. This script does not infer whether a relationship is paid and never
 * edits markup.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", "node_modules", "dist", "build", ".netlify", ".vercel"]);
const affiliateDomain = /(?:^|[./])(?:amazon\.[a-z.]+|amzn\.to|awin1\.com|shareasale\.com|impact\.com|impactradius\.com|rakutenadvertising\.com|partnerize\.com|tradetracker\.net)(?:[:/?#]|$)/i;
const referralParameter = /[?&](?:tag|aff|affid|affiliate|partner|partnerid|ascsubtag|linkcode|ref_|ref=|irclickid|clickid)=/i;
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(path.join(dir, entry.name));
    }
  }
}
walk(root);

const findings = [];
let anchorsScanned = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const anchorTags = html.match(/<a\b[^>]*>/gi) || [];
  for (const tag of anchorTags) {
    const hrefMatch = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!hrefMatch) continue;
    anchorsScanned++;
    const href = (hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? "").replace(/&amp;/gi, "&");
    if (!/^https?:/i.test(href)) continue;
    if (!affiliateDomain.test(href) && !referralParameter.test(href)) continue;
    const relMatch = tag.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rel = (relMatch?.[1] ?? relMatch?.[2] ?? relMatch?.[3] ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    const status = rel.includes("sponsored") ? "sponsored" : rel.includes("nofollow") ? "nofollow-only" : "missing-qualifier";
    findings.push({ file: path.relative(root, file).replaceAll(path.sep, "/"), href, rel, status });
  }
}
const byStatus = (status) => findings.filter((item) => item.status === status);
const summary = {
  affiliateCandidates: findings.length,
  sponsored: byStatus("sponsored").length,
  nofollowOnly: byStatus("nofollow-only").length,
  missingQualifier: byStatus("missing-qualifier").length
};
console.log(JSON.stringify({
  htmlFilesScanned: files.length,
  anchorsScanned,
  note: "Tagged retail links and known affiliate-network domains only; inspect affiliate terms and page context.",
  summary,
  examples: {
    sponsored: byStatus("sponsored").slice(0, 30),
    nofollowOnly: byStatus("nofollow-only").slice(0, 30),
    missingQualifier: byStatus("missing-qualifier").slice(0, 100)
  },
  findings,
  generatedAt: new Date().toISOString()
}, null, 2));
