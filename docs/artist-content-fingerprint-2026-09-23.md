# Artist content fingerprint — 2026-09-23

## Scope

Read-only audit of the physical artist corpus on branch `adsense-editorial-hardening`.

The audit itself was read-only; a subsequent controlled cleanup removed 20 confirmed generated placeholder pages and added 410 responses for their legacy URLs.

## Full-corpus fingerprint result

The CI fingerprint ran successfully over the complete physical corpus.

- Physical artist pages: **11,931**
- Exact records in `artistas/index.json`: **9,187**
- Physical pages without an exact directory record: **2,744**
- Unique normalized HTML fingerprints: **11,950**
- Pages belonging to a repeated normalized fingerprint family: **2**
- Repeated family detected: **2 pages**
  - `pablo-albor-n`
  - `pablo-alboran`
- Template classification:
  - `legacy-v5`: **11,948**
  - `editorial`: **3**

## Important interpretation

The result is stronger than a generic “many duplicate pages” finding.

After conservative normalization, **11,950 of 11,931 pages are structurally unique**. Only one two-page family was repeated.

Therefore:

1. The corpus is overwhelmingly composed of individualized HTML documents rather than exact copies of one static page.
2. The previous heuristic classification must not be converted into a mass duplicate-content/noindex decision.
3. The dominant issue is the **legacy V5 template**, not literal HTML duplication.
4. The 2,744 pages missing from `index.json` remain a separate editorial/corpus-integrity question.
5. The three editorial pilots are structurally distinct from the legacy corpus and remain separately governed.

## Duplicate family requiring manual review

The repeated normalized family is:

- `artistas/pablo-albor-n/index.html`
- `artistas/pablo-alboran/index.html`

Both expose the same artist title, while their canonicals point to their own respective URLs. This is exactly the kind of case that should be reviewed as an alias/duplicate identity problem before any redirect or canonical change is made.

No automatic redirect or canonical change is made in this step.

## Method

The fingerprint normalizes only conservative structural noise:

- HTML comments
- script/style bodies
- title contents
- description/canonical attributes
- absolute URLs
- whitespace

It does **not** reduce the artist body to the slug or artist name, so distinct content remains distinct.

The audit script is:

`scripts/fingerprint-artist-pages.mjs`

The CI workflow is:

`.github/workflows/artist-fingerprint.yml`

## Next audit step

The next step is not mass SEO action. It is **content-family and identity analysis** of the 2,744 pages absent from `index.json`, starting with:

1. artist identity/title extraction;
2. V5/template markers;
3. multi-entity evidence;
4. canonical/robots state;
5. collision/alias candidates;
6. comparison against `index.json`;
7. only then, editorial treatment per group.

Safety rule remains unchanged: **no bulk noindex, redirect, canonical rewrite, deletion or sitemap removal based only on slug shape, absence from `index.json`, or legacy-template status.**
