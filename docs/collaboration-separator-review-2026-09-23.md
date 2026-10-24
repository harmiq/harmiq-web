# Collaboration separator review — 2026-09-23

## Scope

Manual review of the current artist corpus for slugs containing the collaboration separators `-x-`, `-feat-`, `-ft-` or `-with-` and a semicolon-separated HTML title.

## Confirmed multi-entity cases

| URL slug | Title entity count | Existing directory prefix |
|---|---:|---|
| `a1-x-j1-nemzzz` | 2 | none |
| `illenium-x-ambassadors-alan-walker` | 3 | `illenium` |
| `im-with-her-sara-watkins-sarah-jarosz-ao` | 4 | none |
| `lil-nas-x-jack-harlow` | 2 | `lil-nas-x` |
| `mike-dunn-md-x-spress` | 2 | `mike-dunn` |
| `salem-ilese-tomorrow-x-together-alan-wal` | 3 | `salem-ilese` |

All six pages expose a self-canonical URL and use the legacy V5 template.

## Decision

No automatic redirect, canonical rewrite, deletion or noindex was applied.

The presence of an existing artist prefix is insufficient to establish that the collaboration URL should redirect to that artist. Doing so could collapse a distinct multi-entity/search intent into an individual-artist page.

The correct next step is to reconstruct the relationship represented by each collaboration URL and determine whether the page can carry unique collaboration/repertoire content. If not, retire it only after establishing an appropriate destination or explicit removal strategy.

## Related separator-only pages

The corpus also contains legitimate individual/group names containing words such as `with` or `x` without semicolon-separated multi-entity titles (for example `man-with-a-mission`, `mark-with-a-k`, `sleeping-with-sirens`, `tomorrow-x-together`). These were not treated as collaboration pages merely because their slugs contain a separator-like string.

## Safety conclusion

Do not use separator presence alone as an SEO deletion or redirect rule.
