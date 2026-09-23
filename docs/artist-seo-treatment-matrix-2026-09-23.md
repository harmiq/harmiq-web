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

- 11,931 physical artist pages.
- 9,187 exact directory records.
- 2,744 physical pages have no exact directory record.
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


## Quantified legacy-derived subgroup

The full classifier found **2,525** `legacy-derived-candidate` pages.

Their structural evidence breaks down as follows:

| Shape | Pages | Interpretation |
|---|---:|---|
| semicolon title + directory prefix | 1,690 | multi-entity legacy page with a known directory artist prefix |
| semicolon title + no directory prefix | 829 | multi-entity legacy page without an obvious directory anchor |
| semicolon title + directory prefix + collaboration separator | 3 | explicit collaboration-style slug plus known directory prefix |
| semicolon title + no directory prefix + collaboration separator | 2 | explicit collaboration-style slug without directory anchor |
| no semicolon title + directory prefix | 1 | anomalous legacy-derived page requiring individual review |

Additional fact: **2,524/2,525** of this group contain a semicolon in the HTML title.

### Treatment implication

The 1,690 pages with a directory prefix are **not automatically redirect targets**. A prefix only establishes that one known directory record appears to anchor the slug; it does not establish that the collaboration page's search intent, content, or canonical destination is identical to that artist.

The 829 pages without a directory prefix need a different review path because there is no obvious single destination.

The 5 pages with explicit collaboration separators and the single no-semicolon anomaly should be individually checked before any technical action.

No redirects, noindex directives, canonical rewrites or deletions are made by this audit.
