# Hub-core PC1 sensitivity — beta10

**Fecha:** 2026-09-23  
**Estado:** sensibilidad adicional; no reemplaza el eigengene canónico.

## Por qué se añadió

El eigengene canónico del proyecto se calcula como PC1 de todos los genes variables de cada módulo beta10. Ese método sigue siendo la definición primaria usada en T-003 y T-004.

Para evaluar cuánto depende la trayectoria del módulo de genes periféricos, se añadió una sensibilidad basada solo en hubs centrales.

## Definición

La selección de hubs replica exactamente la definición ya usada en T-006:

- red beta10 congelada;
- adyacencia unsigned;
- `kWithin` = suma de adyacencias intramodulares fuera de la diagonal;
- genes centrales = top 10% por `kWithin`;
- umbral: `Rank_kWithin <= ceiling(n_genes * 0.1)`.

Sobre ese subconjunto se calcula:

- expresión log2(RPKM+1);
- genes centrados y escalados;
- PC1;
- signo del PC1 alineado al eigengene canónico para comparación visual.

Nombre usado en la web:

**Hub-core PC1**

No se llama “nuevo eigengene canónico”.

## Qué NO cambia

Este análisis no:

- rerunea CEMiTool;
- cambia beta10;
- cambia la membresía de M1–M10;
- elimina genes de los módulos originales;
- modifica T-003;
- modifica T-004;
- recalcula ORA;
- recalcula GSEA;
- reemplaza tablas canónicas existentes.

## Comprobación contra T-006

Para M5, M10 y M2, el ranking de `kWithin` y el conjunto top-decile se contrastaron contra los rankings T-006 existentes.

Resultado:

- M5: 108/108 genes comparados; 0 discrepancias de ranking; 0 discrepancias en top decile.
- M10: 39/39 genes comparados; 0 discrepancias de ranking; 0 discrepancias en top decile.
- M2: 214/214 genes comparados; 0 discrepancias de ranking; 0 discrepancias en top decile.

Las diferencias numéricas máximas de `kWithin` fueron del orden de 1e-13, compatibles con redondeo de coma flotante.

## Resultados

| Módulo | Genes módulo | Hubs core | Correlación Hub-core vs canónico (54 muestras) | Correlación de medias de celda | Dirección igual Stage×Year |
|---|---:|---:|---:|---:|---:|
| M1 | 2167 | 217 | 0.9978 | 0.9978 | 9/9 |
| M2 | 214 | 22 | 0.9959 | 0.9964 | 8/9 |
| M3 | 131 | 14 | 0.9950 | 0.9959 | 4/9 |
| M4 | 122 | 13 | 0.9479 | 0.9490 | 7/9 |
| M5 | 108 | 11 | 0.9932 | 0.9957 | 9/9 |
| M6 | 68 | 7 | 0.9910 | 0.9917 | 7/9 |
| M7 | 54 | 6 | 0.9867 | 0.9893 | 9/9 |
| M8 | 48 | 5 | 0.9562 | 0.9663 | 7/9 |
| M9 | 42 | 5 | 0.9936 | 0.9927 | 7/9 |
| M10 | 39 | 4 | 0.9802 | 0.9820 | 7/9 |

## Interpretación

La señal global del eigengene canónico se conserva fuertemente al restringir el análisis al núcleo central en todos los módulos.

Eso no implica que todos los contrastes Stage × Year sean idénticos.

Ejemplos:

- M1, M5 y M7 mantienen la dirección en 9/9 contrastes;
- M2 cambia la dirección en 1/9;
- M3 coincide en 4/9 pese a tener una correlación global muy alta;
- M4, M6, M8, M9 y M10 coinciden en 7/9.

Por tanto, una correlación global alta no sustituye la inspección de robustez por etapa y año.

## Archivos

Script reproducible:

`scripts/post/28_hub_core_eigengene_sensitivity.R`

Resultados:

- `results/hub_core_eigengene_sensitivity_beta10/hub_core_gene_ranking.tsv`
- `results/hub_core_eigengene_sensitivity_beta10/hub_core_sample_scores.tsv`
- `results/hub_core_eigengene_sensitivity_beta10/hub_core_cell_profiles.tsv`
- `results/hub_core_eigengene_sensitivity_beta10/hub_core_stage_year_contrasts.tsv`
- `results/hub_core_eigengene_sensitivity_beta10/hub_core_module_summary.tsv`
- `results/hub_core_eigengene_sensitivity_beta10/analysis_summary.txt`

Export web:

`site/public/data/hub_core_sensitivity.json`

## Decisión

El sitio ofrece ahora dos vistas:

1. **Eigengene canónico** — PC1 de todos los genes del módulo.
2. **Hub-core PC1** — sensibilidad usando solo el top 10% por kWithin.

El canónico continúa siendo la referencia para inferencia estadística previa; Hub-core se usa para evaluar estabilidad frente a la exclusión de genes periféricos.
