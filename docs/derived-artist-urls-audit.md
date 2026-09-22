# Audit of 2,764 derived artist URLs

## Corpus

On branch `adsense-editorial-hardening`:

- 11,951 physical `artistas/*/index.html` pages.
- 9,187 directory records in `artistas/index.json`.
- 2,764 physical pages have no matching directory record.

## Historical origin

The current repository does not contain an active generator for the V5 artist pages. The large import commit `d7aaac4c2e702a7ec9c21ec2532f5153be6e952d` (13 September 2026) introduced the V5 corpus as static HTML while integrating the older/richer frontend.

The parent tree did not contain the artist corpus, so the generation/import source is not preserved in the current repository history.

## Strong evidence for track artist-credit combinations

Several derived page names exactly match multi-artist music credits found in public music catalogs.

Examples:

- `22Gz;Kodak Black` — Spotify has the track **Up N Stuck (feat. Kodak Black)** credited to 22Gz and Kodak Black.
- `Above & Beyond;Richard Bedford` — Spotify lists multiple tracks with Above & Beyond and Richard Bedford as the artists.
- `A.R. Rahman;Arijit Singh;Shashaa Tirupati` — public music catalogs list recordings credited to these artists together.

This does not prove that Spotify was the original source of the import, but it strongly supports the hypothesis that many derived slugs were built from **multi-artist track credits**, rather than being ordinary individual-artist entities.

## Representative imported combinations

The corpus contains combinations such as:

- `22Gz;Kodak Black`
- `3 Doors Down;Jack Joseph Puig`
- `3LAU;Bright Lights`
- `509-E;Dexter;Afro-X`
- `A Great Big World;Christina Aguilera`
- `A-ha;Kygo`
- `A.R. Rahman;Arijit Singh;Shashaa Tirupati`
- `A1 x J1;Nemzzz`
- `Aaron Kwok;Beta Soul`
- `Above & Beyond;Richard Bedford`
- `Afrojack;David Guetta;Ester Dean`

The exact semicolon-separated naming pattern is consistent with storing a set of credited artists as one display entity.

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

For a combined credit this creates a semantic problem: multiple people may be presented as though they were one vocalist, with a single voice classification and generic personal/technical claims.

## Routing finding

The current `_redirects` file contains no general redirect rule for the derived artist corpus. Existing redirects cover legacy voice routes, a small number of individual artist aliases, and other site sections.

Therefore no safe bulk redirect target can currently be inferred from the routing layer.

## Recommended classification

Treat these URLs as **track-credit-derived legacy entities** unless an individual URL can be independently verified as a real single artist.

The next useful transformation is not to turn them into individual artist profiles. Instead:

1. Recover or reconstruct the underlying artist-credit relationship where possible.
2. Preserve genuine individual artists as individual profiles.
3. Treat multi-artist combinations as a separate collaboration/repertoire entity type if Harmiq wants to expose them.
4. Only index collaboration entities that can contain unique, useful content.
5. Use redirect/noindex/retirement for legacy combinations that cannot support a useful page.

## Important conclusion

The 2,764 URLs should remain a separate **derived/legacy URL corpus** while their exact source mapping is reconstructed.

They should not be added to the sitemap as a bulk set, and they should not receive mass canonical/noindex/redirect changes based only on slug shape.

No canonical, redirect, robots or noindex changes are made by this audit.
