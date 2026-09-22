# Audit of 2,764 derived artist URLs

## Corpus

On branch `adsense-editorial-hardening`:

- 11,951 physical `artistas/*/index.html` pages.
- 9,187 directory records in `artistas/index.json`.
- 2,764 physical pages have no matching directory record.

## Historical origin

The current repository does not contain an active generator for the V5 artist pages. The large import commit `d7aaac4c2e702a7ec9c21ec2532f5153be6e952d` (13 September 2026) introduced the V5 corpus as static HTML while integrating the older/richer frontend.

Representative imported pages include both individual entities and semicolon-separated combinations.

Examples:

- `22Gz;Kodak Black`
- `3 Doors Down;Jack Joseph Puig`
- `3LAU;Bright Lights`
- `509-E;Dexter;Afro-X`
- `A Great Big World;Christina Aguilera`
- `A-ha;Kygo`
- `A.R. Rahman;Arijit Singh;Shashaa Tirupati`
- `A1 x J1;Nemzzz`
- `Aaron Kwok;Beta Soul`

This strongly indicates that a substantial part of the extra corpus is **combined/derived entity pages**, not ordinary individual artist records.

## Heuristic grouping

A slug was considered **derived-from-an-existing-artist** when it begins with an existing directory slug followed by a hyphen.

Result:

- **1,810 / 2,764** (65.5%) have an identifiable existing artist prefix.
- **954 / 2,764** (34.5%) do not have such a prefix.

This is a discovery heuristic only. It does not establish what the URL represents.

## Content quality finding

The sampled derived pages use the same legacy V5 template as individual pages. The template can assign one voice category and reusable editorial blocks to a combined entity.

Recurring blocks include:

- generic voice-profile copy;
- generic nutrition advice;
- Bio-Hacking Vocal Kit;
- equipment recommendations;
- song/repertoire blocks.

For a combined entity this creates a semantic problem: multiple people may be presented as though they were one vocalist, with a single voice classification and generic personal/technical claims.

## Routing finding

The current `_redirects` file contains no general redirect rule for the derived artist corpus. Existing redirects cover legacy voice routes, a small number of individual artist aliases, and other site sections.

Therefore no safe bulk redirect target can currently be inferred from the routing layer.

## Important conclusion

The 2,764 URLs should remain a separate **derived/legacy URL corpus** while their semantic origin is unresolved.

They should not be added to the sitemap as a bulk set, and they should not receive mass canonical/noindex/redirect changes based only on slug shape.

## Decision framework

After the source data is reconstructed, each URL/family should be assigned to one of these states:

1. **Collaboration/repertoire page** — only where the underlying relationship is known and the page can contain unique, useful content.
2. **Individual artist profile** — only where the URL resolves to one identifiable artist and the content is genuinely about that artist.
3. **Redirect/alias** — only where there is a clear canonical entity target.
4. **Accessible legacy, non-indexed** — where the URL must remain reachable but does not merit search indexation.
5. **Retired** — where the URL has no defensible user-facing purpose and removal is safe.

No canonical, redirect, robots or noindex changes are made by this audit.
