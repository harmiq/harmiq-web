# Artist content fingerprint — 2026-09-23

## Scope

Read-only audit of the physical artist corpus on branch `adsense-editorial-hardening`.

The audit itself was read-only; a subsequent controlled cleanup removed 20 confirmed generated placeholder pages and added 410 responses for their legacy URLs.

## Full-corpus structural fingerprint result

The CI fingerprint runs over the complete physical corpus.

- Physical artist pages: **11,931**
- Exact records in `artistas/index.json`: **9,187**
- Physical pages without an exact directory record: **2,744**
- Unique normalized HTML fingerprints: **11,930**
- Pages belonging to a repeated normalized fingerprint family: **2**
- Repeated family detected: **2 pages**
  - `pablo-albor-n`
  - `pablo-alboran`
- Template classification expected from the current corpus:
  - `legacy-v5`: **11,928**
  - `editorial`: **3**

> Note: the previous version of this document contained impossible fingerprint/template totals (for example, more unique fingerprints than physical pages). Those figures have been corrected rather than treated as evidence.

## Important interpretation

The result is stronger than a generic “many duplicate pages” finding.

After conservative normalization, **11,930 unique normalized fingerprints** remain across **11,931 pages**: one two-page repeated family and 11,929 singleton fingerprints.

Therefore:

1. The corpus is overwhelmingly composed of individualized HTML documents rather than exact copies of one static page.
2. The previous heuristic classification must not be converted into a mass duplicate-content/noindex decision.
3. The dominant issue is the **legacy V5 template and its reusable editorial blocks**, not literal HTML duplication alone.
4. The 2,744 pages missing from `index.json` remain a separate editorial/corpus-integrity question.
5. The three editorial pilots are structurally distinct from the legacy corpus and remain separately governed.

## Content-level audit added

A new read-only audit script, `scripts/audit-v5-content.mjs`, is now executed by the corpus workflow.

It deliberately looks beyond exact HTML fingerprints and measures:

- normalized template families after removing artist-specific fields;
- repeated V5 boilerplate;
- unfinished-content markers;
- generic “Top Hit” placeholders;
- repeated nutrition blocks;
- repeated vocal/health claims;
- repeated Bio-Hacking product claims.

These markers are **evidence for editorial review, not automatic SEO decisions**. In particular, a repeated claim is not automatically classified as false; it is flagged because the page presents it as artist-specific or factual without page-level sourcing.

## Confirmed content pattern from manual samples

Manual review of V5 pages including `3lau-bright-lights`, `22gz`, `0to8`, `10-feet` and several multi-entity pages confirms that the same V5 blocks recur across unrelated entities:

- “Perfil Biomecánico”;
- generic type-of-voice prose;
- the same two microphone recommendations in many pages;
- the same nutrition recommendations;
- the same avoidance claims;
- the same Lax Vox / Beltbox / nebulizer blocks;
- generic YouTube search links;
- the same CTA structure.

Some pages also apply a single vocal classification to multi-entity names such as collaborations. This is a stronger editorial-quality signal than URL shape alone and is why the next phase is content-level classification.

## Duplicate family requiring manual review

The repeated normalized family is:

- `artistas/pablo-albor-n/index.html`
- `artistas/pablo-alboran/index.html`

Both expose the same artist title, while their canonicals point to their own respective URLs. This is exactly the kind of case that should be reviewed as an alias/duplicate identity problem before any redirect or canonical change is made.

No automatic redirect or canonical change is made in this step.

## Method

The structural fingerprint normalizes only conservative structural noise:

- HTML comments
- script/style bodies
- title contents
- description/canonical attributes
- absolute URLs
- whitespace

The new content-family audit additionally normalizes artist-specific fields to expose reusable template structure.

It does **not** reduce the artist body to the slug or artist name when calculating the original structural fingerprint, so distinct content remains distinct.

## Next audit step

The next step is **content-family and identity analysis** of the 2,744 pages absent from `index.json`, starting with:

1. artist identity/title extraction;
2. V5/template markers;
3. repeated boilerplate families;
4. multi-entity evidence;
5. vocal/health/equipment claim patterns;
6. canonical/robots state;
7. collision/alias candidates;
8. comparison against `index.json`;
9. only then, editorial treatment per group.

Safety rule remains unchanged: **no bulk noindex, redirect, canonical rewrite, deletion or sitemap removal based only on slug shape, absence from `index.json`, or legacy-template status.**
