# T-006 — Hubs de M10 y M2; cierre de la priorización interna

Fecha: 2026-09-21. Esta fase complementa `docs/T006_M5_HUB_PRIORITIZATION.md` y cierra **la priorización interna de T-006**, no la validación externa de T-007.

## Alcance y método

Se examinaron M10 (39 genes), el módulo clasificado como reproducible en T-004, y M2 (214 genes), dependiente del año a nivel de módulo pero con contrastes Veraison/Harvest repetidos. M3 y M1 no se promueven a la misma prioridad: M3 Harvest está dominado en magnitud por 2013 y M1 no mostró un patrón estable según T-004. Sus membresías y resultados históricos quedan preservados; no se dice que carezcan de interés biológico.

La métrica primaria vuelve a ser `kWithin`: suma de adyacencias intramodulares fuera de la diagonal en la red beta10 no signada congelada. Los top deciles son 4/39 (M10) y 22/214 (M2), cortes descriptivos sin p-valor. Se conservan ranking completo, las 23.532 aristas, `kME`, sensibilidad al omitir cada año, diferencias directas de medias Cabernet–Pinot por Stage × Year, tasas de cero exacto y anotaciones MapMan/Pfam/PANTHER. Las diferencias por gen **no** son contrastes inferenciales ni tienen FDR. El script `scripts/post/14_m10_m2_hub_prioritization_beta10.R` comprueba universo, orden de muestras, membresías, matriz `|r|^10`, mapeos uno-a-uno y SHA-256 de los resúmenes funcionales. Usa las fuentes Grapedia ya fijadas en T-005/T-006; no reejecuta CEMiTool ni elimina muestras.

La evidencia de validación interna usada aquí es T-004 (patrón del módulo por año), la permanencia de cada gen en el mejor módulo correspondiente de beta7 y la estabilidad descriptiva del ranking al omitir años. **Permanecer en beta7 no significa conservar el mismo rango de hub en beta7.** Ninguna de estas comprobaciones sustituye la validación en piel aislada de T-007.

## M10: candidatos y cautelas

| Rango | Gen | kWithin | Evidencia funcional y límite |
|---:|---|---:|---|
| 1 | `VIT_07s0005g01700` | 8,936 | MapMan v3: bHLH; v5.1: anotación tipo UPBEAT/bHLH ligada a homeostasis redox de superficie celular. No se detectó dominio Pfam bHLH en el resumen consultado: función específica no confirmada. |
| 2 | `VIT_17s0000g01930` | 8,331 | Transportador de potasio HAK/KUP/KT en v3 y v5.1, con dominio transportador `PF02705`. |
| 3 | `VIT_17s0000g05580` | 8,302 | Sin mapeo/anotación funcional verificable en estas fuentes. |
| 4 | `VIT_17s0000g00430` | 7,507 | v3: bHLH/CIB; dominio bHLH `PF00010` en v3, sin mapeo v5.1; ausente del módulo beta7 M7. |

M10 tiene 36/39 genes con MapMan v3, pero sólo 10/39 con MapMan v5.1 y **ningún término enriquecido con FDR global** en T-005. Por eso el rótulo de «módulo bHLH» o «módulo de pared celular» sería injustificado. El gen de rango 1 conserva rango 1, 3 y 1 al omitir respectivamente 2012, 2013 y 2014; 3/4 top genes permanecen en beta7 M7. Los cuatro primeros no tienen un mismo patrón de diferencia por gen en todos los años y etapas: sólo tres mantienen dirección en Veraison y dos en Harvest. La reproducibilidad de la señal **del módulo** no valida automáticamente cada gen.

## M2: candidatos y cautela de mapeo

| Rango | Gen | kWithin | Evidencia funcional y límite |
|---:|---|---:|---|
| 1 | `VIT_19s0014g05360` | 61,442 | MapMan v3 sin función asignada; resumen v3 con dominio `PF08646` tipo replication factor-A C-terminal. Sin mapeo v5.1. No se le asigna función cuticular. |
| 2 | `VIT_16s0039g01920` | 61,160 | MapMan v3: factor MYB; dominio Myb-like `PF13921` en v3 y v5.1, aunque sin etiqueta MapMan v5.1. Candidato regulador, no diana/causa demostrada. |
| 3 | `VIT_19s0014g03420` | 60,953 | Sin MapMan verificable; dominio v5.1 `PF06830` tipo root cap. No se transfiere ese rótulo directamente a biología de baya. |
| 4 | `VIT_19s0014g05370` | 60,400 | Sin anotación funcional verificable en MapMan/Pfam consultados. |
| 5 | `VIT_19s0014g05380` | 60,170 | v3: oxidoreductasa EC 1.6; dominio `PF07992` de unión FAD/NAD(P), sin mapeo v5.1. |
| 8 | `VIT_18s0117g00140` | 58,275 | v3: FAR1; v5.1: FRS/FRF; dominio FAR1 DNA-binding `PF03101` en v5.1. Segundo candidato TF, no prueba regulatoria. |

Los 22 genes del top decil de M2 permanecen en beta7 M2 y conservan la misma **dirección descriptiva** Cabernet–Pinot en Veraison y Harvest de 2012, 2013 y 2014. El ranking es relativamente estable al omitir años (Spearman 0,972–0,984; 19–21 de 22 top genes retenidos). Esto no resuelve identidad molecular ni causalidad.

La calidad de la anotación limita especialmente M2: sólo 40/214 genes y 2/22 top genes tienen MapMan v5.1. Nueve de los 22 top genes tienen expresión `log2(RPKM+1)` exactamente cero en al menos 7/9 muestras Cabernet de Harvest. Por ejemplo, `VIT_19s0014g05370` es cero en las nueve muestras Cabernet de Veraison y Harvest, mientras no es cero en las correspondientes muestras Pinot. Tres genes top consecutivos en la nomenclatura legado (`VIT_19s0014g05360/70/80`) comparten ese patrón, pero sus IDs adyacentes **no demuestran** proximidad física ni duplicación. Diferencias reales de expresión, variantes estructurales, especificidad de copia y sesgo de alineamiento a referencia son explicaciones alternativas que el RPKM histórico no distingue. No descartamos ni corregimos genes sin datos de lecturas/alineamientos; se conserva el resultado y se rebaja la confianza mecanística.

## Comprobaciones y conclusión

El recálculo independiente de `kWithin` desde cada tabla de aristas reproduce todos los valores; se comprobaron 39/214 genes, 741/22.791 pares, rangos únicos y las cuentas de cobertura/retención beta7. El error máximo entre adyacencia archivada y `|r|^10` es 2,94 × 10⁻¹⁵ en M10 y 1,33 × 10⁻¹⁴ en M2. Los cuatro primeros de M10 retienen 2–4 lugares top según el año omitido; M2 retiene 19–21/22. GO corregido en T-005A no aporta enriquecimiento global a M10/M2 y su escasa cobertura no autoriza un resultado negativo biológico.

La priorización interna queda: M5 — bloque CHS/STS ambiguo y NAC/CuAO; M10 — bHLH anotado y transportador HAK/KUP/KT, sin enriquecimiento global; M2 — MYB/FAR1 y varios hubs sin anotación, con una alerta fuerte de ceros/mapeo. Son **candidatos**, no genes de grosor de piel. La prueba decisiva siguiente es T-007 en piel aislada; para M2, una verificación de lecturas y copias/genoma de cultivar en T-008 será particularmente importante. Ningún dato de piel aislada ni fenotipo de grosor fue añadido en T-006.
