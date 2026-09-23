# SEO treatment matrix — artist corpus (pre-change)

This matrix is a decision framework only. It does not modify pages.

| Corpus class | Evidence | Proposed next review |
|---|---|---|
| editorial | Explicit editorial profile metadata + editorial template | Keep indexable; validate sources and internal links |
| directory | Exact match in `artistas/index.json` | Audit quality/template; do not bulk noindex |
| legacy-derived-candidate | Legacy V5/Bio-Hacking + derived/multi-entity evidence | Review as collaboration/legacy pages; do not redirect automatically |
| legacy-candidate | Legacy V5/Bio-Hacking without derived signal | Review individually/batch by content fingerprint |
| derived-candidate | Derived structure without legacy evidence | Preserve until content/value is checked |
| generic-candidate | Explicit placeholder/generic evidence | Highest-priority cleanup review |
| unresolved | Insufficient evidence | No automatic SEO action |

## Current known facts

- 11,951 physical artist pages.
- 9,187 exact directory records.
- 2,764 physical pages have no exact directory record.
- The audit has found that pages outside the directory can still be real multi-entity/collaboration pages.
- Existing legacy pages generally already have canonicals and are currently indexable; therefore canonical presence alone is not evidence that a page should remain indexable.

## Safety constraints

1. No bulk `noindex` from slug shape alone.
2. No automatic redirect from a collaboration page to the first artist named in its slug/title.
3. No deletion based only on absence from `index.json`.
4. Placeholder pages are reviewed separately.
5. Editorial pages are kept separate from legacy-generated pages.

## Next operation

Build a content fingerprint report for the non-directory corpus using title, description, template markers, canonical, robots state and repeated boilerplate. The report should quantify exact template families before any SEO directive is changed.
