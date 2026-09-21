# T-006 — Priorización de hubs de M5 (fase M5)

Fecha: 2026-09-21. Esta fase responde a la pregunta de qué genes concretos dominan la conectividad de M5 y si se trata sólo de genes de una misma familia. **No cierra todavía T-006 para los demás módulos.**

## Datos y método

- Red beta10 primaria congelada: 3.050 genes, 54 muestras de GSE98923, expresión `log2(RPKM+1)`. M5 contiene 108 genes. No se volvió a ejecutar CEMiTool, no se excluyó ninguna muestra y no se cambiaron las membresías.
- Métrica primaria `kWithin`: suma de las 107 adyacencias intramodulares fuera de la diagonal para cada gen. La matriz archivada se verificó contra `|correlación de Pearson|^10` (error absoluto máximo 7,77 × 10⁻¹⁵). La red es **no signada**; los pesos no codifican activación ni dirección reguladora. Se informa también `kME` (correlación con el eigengene M5), pero no sustituye la métrica primaria.
- «Top decil» = los 11 primeros de 108, un corte descriptivo y **no** una prueba de significación. El ranking completo y las 5.778 aristas están preservados en `results/hub_prioritization_beta10/`.
- Las etiquetas funcionales provienen de MapMan Grapedia v3 y T2T v5.1, usando los mapeos recíprocos uno-a-uno ya auditados en T-005. Se consultaron además los resúmenes funcionales originales de ambas versiones (URL, SHA-256 y tamaño en `data/reference/grapedia_t006/source_manifest.tsv`). Las coordenadas son del genoma de referencia PN40024 T2T, no de los genomas de Cabernet Sauvignon ni Pinot noir. Fuente oficial: https://grapedia.org/files-download/.

## Hubs concretos

| Rango | Gen legado | kWithin | Evidencia funcional disponible |
|---:|---|---:|---|
| 1 | `VIT_16s0100g00780` | 43,659 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 2 | `VIT_16s0100g00750` | 42,222 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 3 | `VIT_16s0100g00770` | 41,838 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 4 | `VIT_16s0100g01100` | 41,488 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 5 | `VIT_05s0020g03280` | 40,839 | CuAO / degradación de poliaminas en ambas versiones, dominios CuAO |
| 6 | `VIT_16s0100g00910` | 40,770 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 7 | `VIT_12s0028g00860` | 40,282 | factor de transcripción NAC en ambas versiones; dominio NAC `PF02365` |
| 8 | `VIT_16s0100g01140` | 40,197 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 9 | `VIT_06s0004g02010` | 39,320 | sin función asignable con las fuentes verificadas |
| 10 | `VIT_16s0100g01150` | 39,197 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |
| 11 | `VIT_16s0100g01070` | 38,826 | v3 stilbenoid / v5 CHS; dominio CHS/STS compartido |

Ocho de los 11 hubs principales están etiquetados como biosíntesis de estilbenoides en v3 y como CHS/flavonoides en v5.1. Son **los mismos genes**, no dos confirmaciones independientes de identidad enzimática. `PF00195`/`PF02797` reconocen una familia compartida de sintasas de chalconas/estilbenos: estos dominios no distinguen CHS de STS ni prueban qué producto cataliza cada copia; no son dominios PAL. Hay siete genes con etiqueta PAL v3 (seis en v5.1), pero ninguno entra en el top 11; sus rangos v3 son 28, 30, 36, 47, 51, 56 y 85. «Fenilpropanoides» es una vía amplia, no una identidad puntual de cada hub.

Los 16 genes con etiquetas v3-stilbenoid/v5-CHS y coordenadas v5.1 ocupan un intervalo de 494.159 pb en cromosoma 16 de PN40024 T2T (21.022.017–21.516.175). Esto es **compatible** con un bloque de genes cercanos de la familia CHS/STS y justifica investigar expansión/duplicación. Sin análisis de secuencia, filogenia, sintenia y copias en los dos cultivares, no demuestra una expansión concreta ni que cada señal de RNA-seq distinga inequívocamente paralogos.

## ¿Sólo un bloque de familia o también un núcleo interesante?

No es sólo un conjunto aislado de copias CHS/STS: dentro de los 11 hubs hay CuAO (rango 5), NAC (rango 7) y un gen sin función verificada (rango 9). El peso medio de aristas entre los 18 genes etiquetados v3-stilbenoid es 0,606; entre éstos y los otros 90 genes de M5 es 0,267, frente a 0,177 entre los otros 90. En los principales hubs de la familia, la mayoría de la conectividad ponderada va hacia genes **fuera** de esos 18; no forman una camarilla aislada.

El candidato regulador prioritario es `VIT_12s0028g00860` (NAC), por centralidad (7/108) y concordancia de categoría/dominio funcional. Los otros factores de transcripción etiquetados, C2H2-ZF, MYB y WRKY, ocupan rangos 69, 91 y 93. CuAO es otro hub no perteneciente a CHS/STS, pero la coexpresión no permite decidir su papel mecánico. No hay evidencia aquí de que NAC regule directamente los genes CHS/STS, ni de que explique grosor de piel.

Como sensibilidad descriptiva, al retirar los 18 genes v3-stilbenoid y calcular PC1 de los 90 restantes (sin cambiar la red primaria), la correlación con el eigengene M5 original es 0,9991. Los contrastes estandarizados Cabernet–Pinot en Harvest mantienen signo negativo en 2012, 2013 y 2014: -2,650, -2,256 y -2,315 frente a -2,684, -2,243 y -2,239 en el módulo original. La señal del módulo, por tanto, no depende **exclusivamente** de las 18 copias anotadas; los 90 genes restantes siguen siendo coexpresados y esto no es validación independiente.

La estabilidad del ranking merece cautela: al omitir cada año, la correlación de Spearman con el ranking completo es 0,925–0,939 y persisten 6–8 de los 11 primeros. Para NAC, el rango cambia a 3, 7 o 14 según el año omitido. Al omitir la muestra marcada en T-003 (`GSM2627837`), la correlación es 0,997 y persisten 10/11 hubs. Las diferencias de expresión individuales por año en el ranking son **descriptivas**, no pruebas gen a gen con FDR.

## Control y límites

Se contrastó por separado la suma de pesos de las 5.778 aristas con cada `kWithin`, los 108 IDs y rangos únicos, las 8/11 etiquetas de familia, los siete PAL, los cuatro TF y el rango 7 de NAC. El script aborta si cambian el universo, la membresía, el orden de las muestras, los hashes de fuente, el mapeo o la matriz de adyacencia esperada. Archivos principales: `scripts/post/13_m5_hub_prioritization_beta10.R`, `results/hub_prioritization_beta10/m5_full_hub_ranking.tsv`, `results/hub_prioritization_beta10/m5_hub_qc.tsv` y `data/reference/grapedia_t006/m5_function_evidence.tsv`.

M5 es dependiente del año **a nivel de módulo** según T-004, aunque el contraste Harvest Cabernet–Pinot se repite en los tres años. La red proviene de pericarpio mixto, no de piel aislada; no hay fenotipo de grosor de piel. La coexpresión puede reflejar etapa, cultivar, año o regulación compartida, pero no demuestra dirección causal. Las etiquetas v3/v5.1 y los dominios compartidos no resuelven experimentalmente CHS frente a STS. La siguiente comprobación biológica razonable es secuencia/filogenia del bloque CHS/STS, seguida de validación en piel aislada y pruebas funcionales del NAC candidato; no se hicieron en esta fase.

T-006 permanece **IN PROGRESS** hasta aplicar el mismo criterio a otros módulos priorizados (al menos M10 y M2) y contrastar sus candidatos con evidencia de validación disponible. T-007 continúa pendiente y no se ha iniciado.
