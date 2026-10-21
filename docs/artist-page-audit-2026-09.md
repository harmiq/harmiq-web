# Artist Page Audit — 2026-09-22

## Resultado principal

La auditoría del árbol de la rama `adsense-editorial-hardening` encontró una diferencia relevante entre el directorio y las páginas físicas:

| Fuente | Cantidad |
|---|---:|
| Registros de `artistas/index.json` | 9.187 |
| Directorios con `index.html` bajo `artistas/` | 11.931 |
| Páginas físicas sin registro correspondiente en `index.json` | 2.744 |
| Registros del directorio sin página física | 0 |

Por tanto, el número 9.187 debe entenderse como **registros del directorio**, no como número total de URLs existentes bajo `/artistas/`.

## Qué son las 2.744 páginas adicionales

Una muestra de estas URLs muestra nombres compuestos o colaboraciones, por ejemplo:

- `22gz-kodak-black`
- `a-great-big-world-christina-aguilera`
- `aitana-ana-guerra-greeicy-tini`
- `above-beyond-richard-bedford`

La estructura de estas páginas sigue el patrón antiguo **Perfil Vocal V5**, aunque el nombre de la URL puede representar una combinación de artistas o una entidad derivada de repertorio/colaboración.

La muestra revisada contiene:

- título V5;
- clasificación vocal aplicada a la entidad compuesta;
- bloque de Bio-Hacking Vocal;
- recomendaciones de equipo;
- nutrición genérica;
- gadgets;
- contenido repetitivo;
- canonical específico de la URL;
- **sin meta robots noindex** en la muestra.

Esto significa que estas páginas no deben tratarse automáticamente como perfiles editoriales de artistas individuales.

## Muestra estructural

Se revisaron fichas V5 existentes y tres pilotos V6.

Las fichas V5 revisadas comparten una estructura altamente repetitiva:

- Perfil Biomecánico;
- afirmación genérica sobre el tipo de voz;
- dos equipos;
- nutrición vocal;
- Vocal Bio-Hacking Kit;
- repertorio;
- CTA.

Los tres pilotos V6 ya no utilizan esa estructura.

## Decisión recomendada

Separar tres conceptos:

### A. Registro de directorio

Fuente: `artistas/index.json`.

Representa un artista individual que forma parte del directorio.

### B. Perfil editorial

Fuente: `artistas/editorial-profiles.json`.

Solo incluye artistas revisados editorialmente y con nivel 1 o 2.

### C. URL heredada/derivada

Páginas físicas que no tienen correspondencia en `artistas/index.json`.

No deben recibir automáticamente el tratamiento SEO de un perfil individual.

## Implicación SEO

Antes de ampliar el sitemap con las 9.187 URLs individuales hay que decidir qué hacer con las 2.744 URLs adicionales.

Opciones a evaluar:

1. reconstruirlas como contenido editorial diferenciado cuando exista una entidad real que lo justifique;
2. convertirlas en páginas de repertorio/colaboración si ese concepto tiene valor propio;
3. redirigirlas cuando exista una URL canónica equivalente;
4. aplicar `noindex` temporalmente si deben seguir accesibles pero no aportan suficiente valor para buscadores;
5. eliminar/retirar URLs sin utilidad real.

No se recomienda tomar esta decisión automáticamente solo por el nombre de la URL.

## Regla para la siguiente fase

No ampliar masivamente la indexación hasta haber separado:

- **9.187 registros de artistas**
- **perfiles editoriales 1/2**
- **2.744 URLs heredadas o derivadas**

El dataset editorial no debe absorber estas 2.744 URLs por defecto.

## Estado

Esta auditoría es documental. No modifica todavía canonical, robots, noindex, redirects ni las páginas heredadas.

La siguiente intervención debería ser una auditoría específica de esas 2.744 URLs para determinar qué proporción corresponde a colaboraciones/repertorio y qué proporción son páginas que simplemente deberían retirarse o quedar fuera del índice.

## Reproducible local audit

A read-only audit script is included at `scripts/audit-artist-pages.mjs`.

Run from the repository root:

```bash
node scripts/audit-artist-pages.mjs
```

The script compares the physical `artistas/*/index.html` corpus with `artistas/index.json`, detects legacy V5 markers, and reports derived-looking URLs. It deliberately does **not** modify canonicals, robots directives, redirects, sitemap entries or files.

This is intended to make the classification reproducible before any bulk SEO action. A page being detected as legacy or derived-looking is evidence for review, not an automatic instruction to deindex it.

## Auditoría adicional del corpus V5 (23 de septiembre de 2026)

El árbol de la rama contiene **11.931** páginas físicas `artistas/*/index.html`.

Un análisis estructural por tamaño de archivo muestra:

- 11.065 páginas entre 7,5 KB y 9 KB.
- 873 páginas por debajo de 7,5 KB.
- 13 páginas por encima de 9 KB.

El tamaño no se utiliza como criterio SEO por sí solo: sirve únicamente para localizar familias de plantillas y priorizar muestreo.

Se revisaron ejemplos de varias familias:

- `22gz`, `0to8`, `10-feet`, `Adele`: plantilla V5 con “Perfil Vocal V5”, Bio-Hacking y contenido nutricional genérico.
- `22gz-kodak-black`, `a-r-rahman-arijit-singh-shashaa-tirupati`, `aaron-smith-krono-luvli`: combinaciones de entidades con la misma plantilla V5.
- `artista-especial-220`: página V5 claramente genérica, sin una identidad artística verificable en el contenido revisado.
- `Ed Sheeran`, `Ariana Grande`, `Bad Bunny`: perfiles piloto ya migrados a un formato editorial diferenciado, con fuentes y objetivos técnicos.

### Implicación

No es seguro tratar las 11.931 páginas como un único conjunto. El corpus debe dividirse, como mínimo, en:

1. registros individuales del directorio;
2. entidades combinadas/derivadas;
3. páginas genéricas o placeholders;
4. perfiles editoriales revisados.

La siguiente intervención debe ser **clasificación + estrategia de indexación**, no una reescritura automática de las 11.931 páginas.


## Controlled cleanup — 2026-09-23

The 20 confirmed generated placeholders `artista-especial-220` through `artista-especial-239` were removed from the branch and their URL variants (with and without trailing slash) return HTTP 410 via `_redirects`. No redirect target was invented for these synthetic pages.


## Follow-up corpus classification — 2026-10-14

A read-only corpus audit was run after the exact-template directory remediation (GitHub Actions run [38559700015](https://github.com/harmiq/harmiq-web/actions/runs/38559700015)). The full fingerprint, content, classification, and claim reports are available as the [artist corpus audit artifact](https://github.com/harmiq/harmiq-web/actions/runs/38559700015/artifacts/11891912510).

The current physical corpus remains 11,931 pages: 9,187 directory records and 2,744 pages with no matching directory record. The classifier separates the latter into:

| Classification | Count | What the audit establishes |
|---|---:|---|
| Legacy-derived candidate | 2,525 | Legacy V5 markers plus a derived-looking URL/title signal |
| Generic candidate | 219 | Generic/unfinished V5 content signals |
| **Total outside the directory** | **2,744** | No match in `artistas/index.json` |

These are audit classes, not editorial or SEO decisions. Across the full corpus, the audit found zero pages with a robots noindex directive and zero pages missing a canonical.

A manual structural spot-check of `3lau-bright-lights`, `22gz-kodak-black`, and `above-beyond-richard-bedford-nox-vahn` confirmed compound H1/title names, the legacy V5 profile and bio-hacking modules, and page-specific canonicals. Each sampled page has no robots noindex directive. The first two contain the generic equipment/nutrition structure; the third also contains generic “Top Hit” labels. This confirms that the sampled pages represent compound or derived entities, but does not establish the right canonical target or whether each entity merits a standalone page.

### Indexing decision

The artist URLs are still excluded from `sitemap.xml`; only the directory landing page and the three explicit editorial profiles are listed. Keep that separation while these 2,744 URLs remain unreviewed. No mass noindex, redirect, or deletion is justified by the current classifier alone.

### Next review

The next useful unit is a human review of candidate groups by concrete URL/title and source provenance. Confirm whether an entity is a collaboration, a catalog/repertoire record, or a duplicate of an individual artist before selecting a canonical destination or changing its indexability. The classifier and title punctuation are evidence for that review, not an automatic action.


### Residual directory pages after the exact-template batch

The post-remediation audit still finds 854 directory-class pages with V5 markers. These were not part of the 8,329-page exact-template batch because their content structure does not satisfy the batch's whole-block replacement rules.

For example, `artistas/0to8/index.html` is a directory record with a page-specific canonical and the old V5 title, but its content grid contains only the “Vocal Bio-Hacking Kit” and “Mejores Interpretaciones” sections. It does not match the batch's required biomechanical/nutrition sections or its allowlisted generic voice copy. Replacing its entire grid with the standard directory card would therefore require a separate, reviewed rule for this variant.

Treat these 854 pages as a distinct follow-up cohort. First group them by actual markup and source-backed content, then remediate only a verified repeated structure. Do not infer that every remaining V5 marker means the same claims or that the pages should receive the same replacement.


### Internal-linking spot-check

The `/artistas/` directory fetches `/artistas/index.json` in client-side JavaScript and renders cards in batches of 48. Further records are added only when the user activates “load more”; the initial HTML does not contain links to all directory pages. This makes the current listing useful for visitors but does not provide a complete static link graph. Before adding thousands of individual URLs to the sitemap, provide crawlable pagination or another static route to the intended indexable profiles and verify the rendered links.


## Follow-up content remediation — 2026-10-21

Two reviewed directory-page families were updated on `adsense-editorial-hardening`:

- 25 pages had unsupported artist-specific equipment and nutrition claims plus generic `Top Hit 1/2` placeholders removed. Their directory voice labels remain clearly scoped as Harmiq classifications, and the generic preparation guidance remains.
- 11 pages had unsupported equipment and nutrition claims removed. Their named song links were retained.

All 36 pages retained exactly one page-specific canonical; opening and closing `div` counts balance. Existing AdSense code was not changed (these pages contained no AdSense loader or publisher ID). No sitemap, robots, redirect, or deletion changes were made in this batch.

The read-only corpus workflow passed on commit `17c34b7666feac2eaa3aea2737e19118e13a2069` (run [39585535823](https://github.com/harmiq/harmiq-web/actions/runs/39585535823)). It now reports **70 legacy directory pages** across **14 structural families**, down from 81 after the preceding batch. The remediation workflow passed in run [39585535996](https://github.com/harmiq/harmiq-web/actions/runs/39585535996).

These changes do not classify or alter the 2,744 physical pages outside `artistas/index.json`; their content and indexing decision remain pending human review.


## Affiliate link audit — 2026-10-21

Reviewed `recursos/index.html`, the LALAL.AI and Udemy landing pages, `recursos/daw/index.html`, and all 13 DAW detail pages.

- The referral URLs on the LALAL.AI page (`fp_ref`) and Udemy page (`trk.udemy.com`) already use `rel="sponsored noopener"`.
- The resources index links to those local landing pages; its other external destinations point directly to vendor/product sites without referral parameters in their URLs.
- The DAW detail pages link to official vendor destinations and contain no affiliate tracking parameters.
- No missing `rel="sponsored"` was found among the referral links in this reviewed resource section. This is a code-level URL audit; it does not establish whether a direct vendor link is covered by a separate commercial agreement.


## Voice category cleanup — 2026-10-21

Updated the six category pages under `tipo-de-voz/` on `adsense-editorial-hardening`:

- Removed the repeated generic “Vocal Bio-Hacking Kit” Amazon module and unsupported “Tu Dieta Vocal” food/avoidance claims.
- Removed malformed wrapper markup and duplicate document closing tags. On the mezzosoprano and baritone pages, moved the existing SEO feed stylesheet into `<head>` and its content back inside `<body>`; on tenor, discarded an orphaned fragment after the document close.
- Postflight confirms one canonical per page, balanced `<div>` tags, one `</body>` and `</html>`, and no change to AdSense signatures. The six pages contained no AdSense loader or publisher code.

Commit: `2ed21785393e9069ccecf9ae8bd9074e21ef3edf`. Both corpus audit and directory-remediation preview passed (runs [39628406919](https://github.com/harmiq/harmiq-web/actions/runs/39628406919) and [39628406948](https://github.com/harmiq/harmiq-web/actions/runs/39628406948)).

This removes generic health/product claims but does not complete the factual review of the individual vocal-history, physiology, and artist examples on these pages.


## Additional voice-guide claim cleanup — 2026-10-21

A follow-up review removed several unsupported or internally inconsistent claims from the voice-category guides:

- `contralto/index.html`: removed the conflicting “2%” / “1 in 10,000” prevalence claims.
- `tenor/index.html`: removed the unsupported Pavarotti anecdote and view-count claim.
- `soprano/index.html`: replaced unsupported vocal-fold measurements and anatomy claims with a classification caveat.
- `baritono/index.html`: removed unverified range, research-institute, and technique claims about Freddie Mercury.
- `bajo/index.html`: removed the unsupported Tom Waits biography/range anecdote.

These edits preserve one canonical and balanced `div` markup; AdSense signatures are unchanged. The pages still need a fuller factual review of their remaining artist examples, ranges, and voice-type descriptions.

