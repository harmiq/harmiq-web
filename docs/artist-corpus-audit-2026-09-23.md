# Artist corpus audit — 2026-09-23

Branch: `adsense-editorial-hardening`

## Corpus

- Physical artist pages: **11,951**
- Records in `artistas/index.json`: **9,187**
- Physical pages without an exact directory record: **2,764**
- Candidate derived/collaboration pages from structural evidence: **1,812**
- Candidate generic/placeholder slugs observed: **20** (`artista-especial-220` through `artista-especial-239`)
- Remaining unclassified pages requiring content-level review: **952**

## Interpretation

The 2,764 pages without a directory record must **not** be treated as a single SEO category.

The 1,812 derived candidates include collaboration-style slugs such as:

- `22gz-kodak-black`
- `3lau-bright-lights`
- `a-great-big-world-christina-aguilera`
- `above-beyond-richard-bedford`
- `aitana-morat`

These are candidates only. A slug containing multiple artist-like names is not sufficient evidence by itself to decide indexation, canonicalization, redirecting, or removal.

The 20 `artista-especial-220`...`artista-especial-239` pages are explicit placeholder/generic candidates and should be reviewed separately from real artist collaborations.

The remaining 952 pages are deliberately left unresolved until their rendered content is inspected. No bulk SEO action should be based solely on their absence from `index.json`.

## Editorial pilots

The following pages are explicitly declared in `artistas/editorial-profiles.json`:

- `ed-sheeran`
- `ariana-grande`
- `bad-bunny`

They use the editorial profile format rather than the legacy V5 template.

## Safety rule

This audit is classification only. It does not add `noindex`, redirects, canonical changes, sitemap changes, or deletions.


## Follow-up content check

The first structural pass left 952 pages unresolved because their slugs do not reliably reveal the relationship between the entities.

A content-level sample was checked across that unresolved set. The sampled pages consistently used the legacy V5 format and encoded multiple names in the page title with semicolons, for example:

- `3LAU;Bright Lights | Perfil Vocal V5 | Harmiq`
- `Bethel Music;Steffany Gretzinger | Perfil Vocal V5 | Harmiq`
- `Frédéric Chopin;Daniel Barenboim | Perfil Vocal V5 | Harmiq`
- `Pritam;Jubin Nautiyal | Perfil Vocal V5 | Harmiq`
- `TOKYO ROSE;ALEX | Perfil Vocal V5 | Harmiq`

The classifier now records these content signals as evidence (`semicolon-in-title` and `legacy-v5-template`). This improves classification without turning the evidence into an automatic SEO action.

A larger content-level inventory is still required before deciding the final treatment of the unresolved set.
