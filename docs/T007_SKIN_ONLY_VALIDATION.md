# T-007 — Validación externa en piel aislada

Estado: completada el 2026-09-21 como **validación observacional de expresión de genes candidatos**, no como prueba de causalidad, identidad enzimática exacta ni grosor de piel.

## Pregunta y diseño

Se congelaron antes de examinar las matrices externas los 361 genes de M5 (108), M10 (39) y M2 (214) y sus 37 hubs del decil superior de `kWithin` definidos en T-006. Se preguntó si las diferencias Cabernet Sauvignon − Pinot noir de Harvest que mantuvieron signo en 2012, 2013 y 2014 en el pericarpio GSE98923 tienen una dirección concordante en piel aislada. Las muestras externas nunca se añadieron al diseño primario de 54 muestras ni a la red beta10.

Fuentes originales, URL, tamaño y SHA-256: `data/reference/external_t007/source_manifest.tsv`. Los tres binarios originales se conservan allí. `scripts/post/15_prepare_t007_external_skin.py` extrae la porción beta10 del libro RNA-seq sin cambiar valores. `scripts/post/16_t007_external_skin_validation.R` verifica los hashes y genera los resultados completos en `results/external_skin_validation_beta10/`.

| Fuente | Diseño usado | Comparación principal prefijada | Sensibilidad |
|---|---|---|---|
| GSE72421 | Microarray de piel, 2011, cerca de 24 °Brix; 5 Cabernet y 5 Pinot por tratamiento | WW, mismo tratamiento | WD |
| PRJNA260535 | RNA-seq de piel, 2012; 3 Cabernet y 3 Pinot por cultivar × °Brix | 24 °Brix | 20, 22 y 26 °Brix |

Ambas fuentes proceden de trabajos del grupo de Nevada en años diferentes: constituyen dos ensayos externos al pericarpio italiano de GSE98923, pero no dos cohortes totalmente independientes entre sí. °Brix/near-harvest no es una conversión de FruitSet/Veraison/Harvest. No se dispone de medición de grosor de piel en estas comparaciones.

## Auditoría y método

- GSE72421: 29.549 sondas, 50 muestras, mapeo unívoco de identificador de sonda a identificador de gen V1 según el archivo suplementario, 20 muestras Cabernet/Pinot para la comparación. Hay 6.936 celdas faltantes en toda la matriz y 165 entre las sondas de genes prioritarios realmente mapeados; 52 genes prioritarios mapeados tienen al menos una celda faltante al considerar las 50 muestras. Un gen-condición incompleto **no** recibe efecto, prueba ni imputación. La unicidad nominal de sonda→gen no descarta hibridación cruzada de familias similares.
- PRJNA260535: 16.606 genes V1 filtrados en el archivo publicado, 84 muestras balanceadas, sin valores faltantes; 2.062/3.050 genes beta10 figuran en esa tabla. No estar en el archivo filtrado es **no evaluable**, no expresión cero. La alineación a PN40024 V1 no resuelve por sí sola paralogía, variación de copia o sesgo de referencia entre cultivares.
- Para cada uno de los 361 genes × 6 condiciones se conserva cobertura, número de réplicas observadas, medias, diferencia, intervalo de confianza y prueba t de Welch exploratoria. Se aplica BH por separado dentro de los 37 hubs preseleccionados (`n=37`) y dentro de los 361 genes prioritarios (`n=361`) para cada comparación, contando en el tamaño de familia también los genes no evaluables. Concordancia de dirección solo se marca cuando los tres Harvest primarios tenían el mismo signo; no es un test de replicación ni una inferencia de interacción.
- La extracción del libro comprobó dimensiones, encabezados, 84 nombres de muestra, balance 3×4×7, unicidad de los 16.606 genes y 0 celdas faltantes. Los archivos de auditoría de muestras y `external_source_qc.tsv` permiten revisar el denominador. Una suma independiente de las tres réplicas a 24 °Brix reprodujo Cabernet − Pinot ≈ −2,093 para `VIT_05s0020g03280` y ≈ −10,415 para `VIT_16s0039g01920`.

## Resultados principales

| Módulo | GSE WW: hubs evaluables / 37-hub FDR < 0,05 | RNA-seq 24 °Brix: hubs evaluables / 37-hub FDR < 0,05 | Lectura |
|---|---:|---:|---|
| M5 | 11/11; 11 | 7/11; 4 | Concordancia de dirección en los 11 y los 7 evaluables, respectivamente. Señal de expresión en piel, con identidad CHS/STS no resuelta. |
| M10 | 4/4; 1 | 3/4; 0 | Apoyo limitado, no validación del conjunto de hubs. El bHLH rango 1 es significativo en microarray WW pero no está en el RNA-seq filtrado. |
| M2 | 22/22; 18 | 8/22; 7 | Señal entre los evaluables, pero cobertura RNA-seq especialmente baja y gran riesgo de interpretar ceros/mapeo como biología. |

En M5, `VIT_05s0020g03280` (CuAO, rango 5) y `VIT_12s0028g00860` (NAC, rango 7) tienen dirección Cabernet < Pinot en ambos ensayos principales y BH de 37 hubs < 0,05 en ambos. Dos miembros del bloque chr16 ambiguamente etiquetado CHS/STS también pasan ese umbral a 24 °Brix (`VIT_16s0100g00750` y `VIT_16s0100g01100`), mientras que otros miembros están filtrados o no alcanzan ese umbral. Esto apoya la presencia de una señal transcripcional en piel, **no** demuestra que un núcleo regulador controle la familia ni aclara CHS frente a STS.

En M10, el bHLH rango 1 (`VIT_07s0005g01700`) concuerda y tiene FDR < 0,05 en GSE WW, pero falta en la tabla RNA-seq filtrada; el transportador rango 2 y el segundo bHLH rango 4 no son significativos en ninguno de los dos ensayos principales. No se debe elevar M10 a mecanismo cuticular ni confundir su robustez de módulo en T-004 con validación individual de sus hubs.

En M2, MYB rango 2 (`VIT_16s0039g01920`) y FAR1 rango 8 (`VIT_18s0117g00140`) concuerdan y pasan FDR de 37 hubs en ambos ensayos principales. Sus diferencias RNA-seq a 24 °Brix son ≈ −10,415 y −3,883, respectivamente. Las magnitudes muy grandes y la ausencia de 14/22 hubs M2 en la tabla RNA-seq filtrada obligan a revisar lecturas, multimapeo, variación estructural y referencia antes de una interpretación mecanística; no prueban ausencia específica de expresión en Cabernet ni grosor de piel.

Los resultados de WD y de 20/22/26 °Brix son análisis de sensibilidad separados, no réplicas adicionales de la comparación principal. Las tablas completas, incluidos genes sin prueba y comparaciones discordantes, están en `all_priority_gene_comparisons.tsv`, `prespecified_37_hub_comparisons.tsv`, `primary_external_condition_hubs.tsv` y `module_coverage_direction_summary.tsv`.

## Límites y siguiente paso

La prueba Welch sobre datos procesados y con n=5 o n=3 por grupo es exploratoria; la FDR dentro de una lista priorizada no corrige la selección previa de módulos/hubs sobre el conjunto primario. Diferencias de tejido, año, cultivo, plataforma, tratamiento y maduración impiden un metaanálisis directo. Las sondas de microarray pueden hibridar con parálogos; la tabla RNA-seq filtrada y la referencia V1 pueden ocultar o confundir miembros de familias. La validación externa apoya **patrones de expresión** de candidatos concretos, no actividad enzimática, regulación directa ni fenotipo de grosor.

T-008 deberá revisar lecturas FASTQ con referencia/anotación moderna, en especial la familia M5 y los extremos de M2, comparando contra —sin sustituir— el baseline histórico. T-009 deberá integrar las capas y estas reservas en el informe/manuscrito; el informe acumulativo actual todavía no incorpora T-004 a T-007.
