# Artist Editorial Levels — Harmiq

## Objetivo

Evitar que las fichas de artista se conviertan en páginas repetitivas o en contenido generado con datos no respaldados.

La fuente actual `artistas/index.json` contiene únicamente:

- `n`: nombre
- `s`: slug
- `v`: clasificación vocal

Por tanto, esos tres campos **no autorizan** a inferir biografía, rango vocal, tesitura, canciones, equipo, género musical, país, técnicas o hábitos del artista.

## Niveles

### Nivel 3 — Ficha de directorio

Usar cuando solo existe información mínima fiable.

Contenido permitido:

- nombre del artista;
- clasificación vocal de Harmiq, presentada como orientativa;
- enlace a la ficha/directorio;
- contexto general sobre qué significa un tipo de voz;
- CTA al analizador.

No debe contener:

- biografía inventada;
- rango exacto sin fuente;
- canciones atribuidas como repertorio recomendado sin criterio;
- equipo atribuido al artista;
- nutrición o consejos médicos;
- bloques genéricos repetidos para llenar espacio.

### Nivel 2 — Perfil analítico

Usar cuando existen fuentes suficientes para aportar análisis específico, pero no para justificar un perfil editorial completo.

Requisitos mínimos recomendados:

1. clasificación vocal con criterio o fuente;
2. al menos un rasgo vocal concreto respaldado por una fuente o análisis claramente etiquetado;
3. repertorio identificable;
4. al menos una observación técnica útil;
5. fuentes visibles.

El texto debe distinguir:

- dato documentado;
- clasificación Harmiq;
- análisis editorial;
- recomendación para el cantante.

### Nivel 1 — Perfil editorial completo

Reservado para artistas con suficiente material fiable y valor educativo.

Requisitos:

1. fuentes identificables;
2. clasificación vocal contextualizada;
3. análisis de rasgos vocales específicos;
4. repertorio seleccionado con objetivos técnicos;
5. estrategia de estudio;
6. comparación con la propia voz mediante Harmiq;
7. producción/equipo solo cuando esté documentado o se presente explícitamente como recomendación editorial;
8. ausencia de afirmaciones médicas o nutricionales no necesarias.

## Reglas de evidencia

- No convertir una clasificación de base en un hecho anatómico.
- No publicar rangos extremos como oficiales si proceden de estimaciones externas.
- En música popular, no tratar las categorías clásicas como diagnósticos rígidos.
- Si las fuentes discrepan, mostrar la discrepancia y explicar qué criterio utiliza Harmiq.
- Nunca presentar una recomendación de equipo como equipo utilizado por el artista salvo fuente verificable.
- No rellenar una página con consejos universales solo para aumentar longitud.
- Una página corta y honesta es preferible a una página larga y repetitiva.

## Indexación

La existencia de una ficha en el dataset no implica que deba indexarse individualmente.

Antes de añadir las 9.000+ URLs al sitemap se debe definir:

- qué niveles son indexables;
- qué valor diferencial mínimo exige una URL indexable;
- qué fichas permanecen accesibles desde el directorio pero fuera del sitemap;
- cómo se evita crear miles de páginas casi idénticas.

## Fuente de verdad

Hasta que exista un dataset editorial específico, `artistas/index.json` debe considerarse únicamente un índice de nombre + slug + voz.

Los datos editoriales adicionales deben vivir en una estructura separada y explícita, no mezclarse silenciosamente con el índice básico.
