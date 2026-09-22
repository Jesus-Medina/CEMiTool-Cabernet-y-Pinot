# Current state

Last consolidated context update: 2026-09-21.

## Repository

Canonical remote:

`Jesus-Medina/CEMiTool-Cabernet-y-Pinot`

The repository now contains the complete verified local-workspace migration in addition to the organized canonical documentation, scripts, data, results, reports, and manuscript. The migration commit is `663cbea`; concurrent remote documentation work was preserved through merge commit `9cd4899`. The original local workspace remains untouched as a separate backup.

## Scientific status

### Dataset and design

Primary dataset: **GSE98923**.

Main baseline:

- 54 samples
- Cabernet Sauvignon and Pinot noir
- FruitSet, Veraison, Harvest
- 2012, 2013, 2014
- 3 biological replicates per cultivar × stage × year cell
- 9 samples per cultivar-stage class

Expression baseline:

`log2(RPKM + 1)`

### Network status

Beta 7 explicit reproduction:

- R² = 0.549579273382905
- 8 biological modules + Not.Correlated
- 3,050 filtered genes

Beta 10:

- R² = 0.706374247063269
- 10 biological modules + Not.Correlated
- 3,050 filtered genes

Direct gene-membership comparison showed strong preservation for most modules. Working decision:

- **beta 10 = primary network**
- **beta 7 = sensitivity analysis**

Do not reopen beta tuning unless the expression matrix, sample set, normalization or network definition changes.

### Factorial module statistics

Script:

`scripts/post/07_module_statistics_beta10.R`

Model:

`Eigengene ~ Cultivar * Stage + Year`

10 biological modules were analyzed.

Significant Cultivar × Stage interactions after BH FDR:

| Module | FDR |
|---|---:|
| M5 | 5.2925472036331e-22 |
| M10 | 0.00105158773018888 |
| M2 | 0.0195129128379966 |
| M3 | 0.0195129128379966 |
| M1 | 0.0396520854992993 |

M5 is the strongest interaction by a very large margin.

Significant stage-specific Cabernet Sauvignon - Pinot noir contrasts currently recorded include:

- M5 Harvest: -22.2794
- M2 Veraison: -25.3672
- M2 Harvest: -21.8323
- M2 FruitSet: -15.5583
- M10 Harvest: -3.3557
- M3 Harvest: -6.9886
- M10 Veraison: -2.1280
- M6 FruitSet: +6.1461
- M5 Veraison: -2.4580

Negative = lower eigengene in Cabernet Sauvignon.

### Year effect

Year is significant after FDR in 8 of 10 modules under the additive model.

This means the next statistical priority is to determine whether the Cultivar × Stage pattern is robust across 2012, 2013 and 2014 rather than being driven by one vintage.

### Main report

T-002 is complete. The cumulative main report in `reports/current/analysis_report.{html,docx,pdf}` now includes the post-CEMiTool module-statistics section. `reports/current/analysis_report_status.tsv` records `TRUE` for all three formats. The preceding report is archived at `reports/archive/20260921_005059_before_module_statistics/`; subsequent intermediate renders were archived as well. The final report includes 17 embedded diagnostic figures. This report documents associations and interpretation boundaries, not skin-thickness causality.

### T-003 eigengene and model QC

T-003 is complete; the detailed record is `docs/T003_QC_REVIEW.md`. All ten beta10 eigengenes and PC1 variance values were reproduced from the frozen expression/network inputs. The 54-sample table is complete and balanced, and all 30 stage-specific Cabernet-minus-Pinot contrasts and BH adjustments were independently verified. Eight sample-module observations exceed absolute standardized residual 3 (M2, M3, M5, M9). M2 Cabernet FruitSet 2014 and M3 Cabernet Harvest 2013 show cell-level patterns; M5 includes an influential Pinot Veraison 2012 sample. These are flags for T-004, not grounds for silently removing samples or claiming an interaction is stable across years. M9 has low additive-model R² (0.255). No biological inference was promoted.

### T-004 year robustness

T-004 is complete; detailed methodology, evidence and caveats are in `docs/T004_YEAR_ROBUSTNESS.md`. Script `scripts/post/09_year_robustness_beta10.R` fit `Eigengene ~ Cultivar * Stage * Year` in all ten beta10 modules on the unchanged 54-sample design. `results/year_robustness_beta10/` contains complete Type III ANOVA (70 tests), 90 Stage × Year Cabernet-minus-Pinot contrasts with BH FDR, observed cell profiles, diagnostics, ten plots and a priority-module classification. M10 satisfies the prespecified reproducibility rule. M5, M2, M3 and M1 are classified year-dependent at module level, but M5 Harvest and M2 Veraison/Harvest each retain significant same-direction contrasts in all three years. M3 Harvest is dominated in magnitude by 2013, and M1 is not established as stable. The M5 Veraison 2012 contrast is sensitive to the flagged sample GSM2627837. No sample was removed from the primary analysis. The current cumulative report still ends with the earlier post-CEMiTool statistical layer; T-004 findings are in separate results and documentation, not yet integrated into that report.

### T-005 functional enrichment

T-005 is complete with annotation limitations documented in `docs/T005_FUNCTIONAL_ENRICHMENT.md`. Scripts 10 and 11 use pinned Grapedia sources, audited one-to-one legacy-ID equivalences, and full module-wide hypergeometric ORA with BH FDR. Versioned gene–term subsets are in `data/reference/grapedia_t005/`; full results and QC are in `results/functional_enrichment_beta10/`. MapMan v3 is primary (2.608/3.050 beta10 genes annotated); newer T2T v5.1 MapMan and GO are secondary because their mapped coverage is 1.305 and 519 genes. M5 is enriched for phenolic/stilbenoid and PAL categories under v3, including the predefined phenylpropanoid theme, but v5.1 assigns many of the same genes to CHS/flavonoid categories, so exact functional identity is unresolved. M10 has no FDR-global enrichment despite 36/39 v3 coverage. Cuticle/wax, pectin, cellulose/hemicellulose, lignin and anthocyanin themes were not established in the priority modules; epidermis was not testable in these MapMan taxonomies. Enrichment is module-wide and must not be presented as identifying the drivers of a specific year/stage contrast or skin thickness.

### T-005A Gene Ontology correction

The user-prioritized GO-only follow-up is complete. `docs/T005A_GO_ORA_ONTOLOGY_AUDIT.md` records an official `go.obo` version 2026-07-26 check of all 3.556 Grapedia GO IDs represented among beta10 genes. There are 390 obsolete IDs, 209 of which were missed by T-005's name-only filter. The corrected, complete ORA and per-ID audit are in `results/go_ora_beta10/`; this supersedes only the **GO portion** of T-005 for inference. The annotated background stays 519 genes, testable module–term combinations fall from 6.864 to 6.344, and the six global-FDR hits remain in M9. M5/M10/M2/M3/M1 have no global-FDR GO hit, but GO coverage is too sparse for negative biological conclusions. MapMan results and the M5 functional-label conflict are unchanged.

The original Grapedia GO ZIP is now preserved at `data/reference/grapedia_t005/t2t_go.zip` following a user-requested provenance check. Its pinned SHA-256 matches, and its GMT reproduces all 33.540 prepared gene–term pairs exactly using the frozen v1→v5.1 map. This adds source traceability without changing the ORA or biological conclusions.

### T-006 M5 hub phase

T-006 está **DONE** para priorización interna y se documenta en `docs/T006_M5_HUB_PRIORITIZATION.md` y `docs/T006_M10_M2_HUB_PRIORITIZATION.md`. Sobre la adyacencia beta10 congelada se calculó `kWithin` para 108 genes M5, 39 M10 y 214 M2; rankings completos, aristas, anotaciones v3/v5.1 y QC están en `results/hub_prioritization_beta10/` y `data/reference/grapedia_t006/`. En M5, ocho de 11 hubs principales pertenecen al bloque chr16 etiquetado stilbenoid en v3 y CHS en v5.1, junto a CuAO (rango 5) y NAC (rango 7); no hay PAL en top 11. M10 prioriza un bHLH anotado y un transportador HAK/KUP/KT, pero no tiene enriquecimiento global. M2 prioriza MYB y FAR1 junto a hubs poco anotados; nueve de sus 22 top genes muestran ceros exactos en al menos 7/9 muestras Cabernet Harvest, por lo que deben distinguirse expresión real, variación de copia y posible sesgo de alineamiento. La retención beta7 y la robustez anual apoyan la priorización **interna**, no identidad funcional ni causalidad. M3/M1 quedaron en menor prioridad por T-004. Al cerrar T-006 todavía no se había hecho validación en piel aislada; la red no ha cambiado y sigue sin haber validación de grosor de piel.

### T-007 external skin-only validation

T-007 está **DONE** como validación observacional de expresión; el registro reproducible es `docs/T007_SKIN_ONLY_VALIDATION.md`. Se contrastaron los 361 genes priorizados y 37 hubs congelados de M5/M10/M2 en GSE72421 (microarray de piel 2011) y PRJNA260535 (RNA-seq de piel 2012), sin añadir muestras a las 54 del diseño primario. Los resultados completos, QC y auditoría están en `results/external_skin_validation_beta10/`; las fuentes originales con hashes se conservan en `data/reference/external_t007/`. Las comparaciones principales fueron WW y 24 °Brix, respectivamente. En M5, 11/11 hubs evaluables en microarray WW y 4/7 evaluables en RNA-seq 24 °Brix pasan BH dentro de los 37 hubs; CuAO y NAC concuerdan en ambos. En M10 solo el bHLH rango 1 pasa en microarray y está filtrado del RNA-seq; no hay validación individual de los otros hubs. En M2, MYB y FAR1 concuerdan en ambos, pero el RNA-seq solo evalúa 8/22 hubs y persiste el riesgo de paralogía, variación estructural y sesgo de referencia. Las celdas faltantes del microarray no se imputaron. Ninguna fuente mide grosor de piel ni resuelve CHS frente a STS.

### T-008 raw-read audit and pilot (not completed)

T-008 está **IN PROGRESS**. El manifiesto auditado vincula los 54 GSM originales con 54 SRR single-end y verifica metadatos GEO, URL/tamaño/MD5 ENA (140,16 GB comprimidos en total). Las fuentes Grapedia T2T v5.1 y la unión exacta de 56.910 transcritos con el GFF3 están preparadas; el cruce recíproco antiguo→nuevo cubre 1.922/3.050 genes beta10. Una biblioteca técnica piloto (`SRR5560506`) pasó integridad y 12.724.462 registros; Salmon produjo 56.910 transcritos, 88,67 % de mapeo y cero errores de cuantificación validados frente a ENA y al índice. El control 250/25 versus 200/80 de longitud supuesta mostró sensibilidad material de TPM (63/100 top genes coinciden), menor en recuentos estimados (99/100), por lo que el supuesto requiere justificación antes de inferencia. **No** hay todavía matriz moderna de 54 muestras, contraste nuevo ni conclusión de preservación. El índice Salmon con 20 secuencias genómicas señuelo se completó tras resolver una locale WSL faltante. Ver `docs/T008_RAW_REPROCESSING.md` y `docs/FILES_NOT_UPLOADED.md`.

## Immediate pending work

1. Completar T-008: índice y piloto, después las 54 cuantificaciones con QC y comparación calibrada contra el baseline histórico, examinando especialmente la familia M5 y los extremos M2. La descarga masiva todavía no ha comenzado.
2. T-009: integrar las capas de análisis y límites en el informe/manuscrito. El informe acumulativo actual todavía no incorpora T-004 a T-007.

## Important boundary

No current result demonstrates skin thickness causality. The study is identifying cultivar-development transcriptional programs that may later be connected to skin-relevant biology and validated in independent skin-only datasets.
