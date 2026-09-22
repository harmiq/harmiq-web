# Audit of 2,764 derived artist URLs

## Corpus

On branch `adsense-editorial-hardening`:

- 11,951 physical `artistas/*/index.html` pages.
- 9,187 directory records in `artistas/index.json`.
- 2,764 physical pages have no matching directory record.

## Heuristic grouping

A slug was considered **derived-from-an-existing-artist** when it begins with an existing directory slug followed by a hyphen.

Result:

- **1,810 / 2,764** (65.5%) have an identifiable existing artist prefix.
- **954 / 2,764** (34.5%) do not have such a prefix.

This is a discovery heuristic only. It does not establish what the URL represents.

Examples with an existing prefix include multiple pages derived from artists such as:

- Wolfgang Amadeus Mozart
- Yuvan Shankar Raja
- Illenium
- Armin van Buuren
- Hillsong Worship
- Martin Garrix
- Above & Beyond
- Anirudh Ravichander
- A. R. Rahman
- J Balvin

Examples without a directory-prefix match include:

- 3LAU + Bright Lights
- A. R. Rahman + Arijit Singh + Shashaa Tirupati
- Aitana-related collaborations
- Afrojack collaborations
- Alka Yagnik collaborations
- Alejandro Fernández-related entries
- multiple soundtrack/cast or ensemble combinations

## Content pattern

The sampled derived pages use the legacy V5 template and contain recurring blocks such as:

- generic voice-profile copy;
- generic nutrition advice;
- Bio-Hacking Vocal Kit;
- equipment recommendations;
- song/repertoire blocks.

The page titles and canonical URLs are generated for the combined slug.

## Important conclusion

The 2,764 URLs are not safe to classify as individual artist profiles.

The current evidence supports treating them as a separate **derived/legacy URL corpus** until their origin and intended semantic type are established.

No canonical, redirect, robots or noindex changes are made by this audit.

## Next technical step

Inspect the source/generation mechanism that produced these derived pages. If no generator remains in the repository, use Git history and representative page structure to reconstruct the origin before changing SEO behavior.

Only after that should we decide whether each family becomes:

1. a real collaboration/repertoire page;
2. a redirect to an existing artist/entity;
3. an accessible but non-indexed legacy page;
4. or a retired URL.
