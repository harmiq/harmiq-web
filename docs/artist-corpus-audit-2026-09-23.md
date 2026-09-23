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


## Full classification run after content fingerprinting

The read-only classifier was executed successfully over all 11,951 physical pages.

Final class counts:

| Class | Pages |
|---|---:|
| directory | 9,184 |
| editorial | 3 |
| legacy-derived-candidate | 2,525 |
| generic-candidate | 239 |
| legacy-candidate | 0 |
| derived-candidate | 0 |
| unresolved | 0 |
| **Total** | **11,951** |

This means the 2,764 pages absent from `index.json` are not an amorphous unresolved bucket under the current evidence: 2,525 have strong legacy + derived/multi-entity signals, and 239 have generic/placeholder signals. This is still a **classification result, not an SEO decision**.

A particularly useful content-level signal is that **2,524 pages have a semicolon in the HTML title**, which is consistent with the legacy generator encoding multiple entities in a single title. The classifier also found other derived-structure evidence on a small number of pages.

The three explicit editorial profiles are now correctly recognized as `editorial`, rather than being swallowed by the directory class.

SEO state observed during the same run:

- pages with `noindex`: **0**
- pages missing canonical: **0**

These observations reinforce the safety rule: the next step is to inspect the 2,525 legacy-derived candidates and 239 generic candidates as separate editorial groups, not to mass-apply `noindex` or redirects.


## Generic-candidate breakdown

The 239 generic candidates are consistently marked by the old generated-content signals:

- `Top Hit 1`: **239**
- `Top Hit 2`: **239**
- `Análisis vocal avanzado en desarrollo.`: **92**
- `Artista Especial`: **20**
- `artista-especial-` slug marker: **20**

These markers can coexist with legacy V5 and with multi-entity title evidence. Therefore “generic” is a template/content-quality class, not proof that the URL is invalid or that it should be redirected.

Representative examples include multi-entity pages such as `a-n-i-m-a-l-chuck-jonhson`, `a-r-rahman-arijit-singh-shashaa-tirupati`, `aaron-smith-krono-luvli`, `above-beyond-richard-bedford-nox-vahn`, and explicit placeholder-style slugs such as `artista-especial-220` onward.

The correct next review is therefore to separate:
1. genuine artist/collaboration pages whose content is merely using the old V5 generator;
2. generated pages with insufficient editorial differentiation;
3. explicit placeholder records such as the `artista-especial-*` family.

No SEO directive is changed by this classification.
