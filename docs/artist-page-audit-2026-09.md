# Artist Page Audit — 2026-09-22

## Resultado principal

La auditoría del árbol de la rama `adsense-editorial-hardening` encontró una diferencia relevante entre el directorio y las páginas físicas:

| Fuente | Cantidad |
|---|---:|
| Registros de `artistas/index.json` | 9.187 |
| Directorios con `index.html` bajo `artistas/` | 11.951 |
| Páginas físicas sin registro correspondiente en `index.json` | 2.764 |
| Registros del directorio sin página física | 0 |

Por tanto, el número 9.187 debe entenderse como **registros del directorio**, no como número total de URLs existentes bajo `/artistas/`.

## Qué son las 2.764 páginas adicionales

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

Antes de ampliar el sitemap con las 9.187 URLs individuales hay que decidir qué hacer con las 2.764 URLs adicionales.

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
- **2.764 URLs heredadas o derivadas**

El dataset editorial no debe absorber estas 2.764 URLs por defecto.

## Estado

Esta auditoría es documental. No modifica todavía canonical, robots, noindex, redirects ni las páginas heredadas.

La siguiente intervención debería ser una auditoría específica de esas 2.764 URLs para determinar qué proporción corresponde a colaboraciones/repertorio y qué proporción son páginas que simplemente deberían retirarse o quedar fuera del índice.

## Reproducible local audit

A read-only audit script is included at `scripts/audit-artist-pages.mjs`.

Run from the repository root:

```bash
node scripts/audit-artist-pages.mjs
```

The script compares the physical `artistas/*/index.html` corpus with `artistas/index.json`, detects legacy V5 markers, and reports derived-looking URLs. It deliberately does **not** modify canonicals, robots directives, redirects, sitemap entries or files.

This is intended to make the classification reproducible before any bulk SEO action. A page being detected as legacy or derived-looking is evidence for review, not an automatic instruction to deindex it.
