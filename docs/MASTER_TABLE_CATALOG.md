# Catálogo maestro de tablas científicas

Se detectaron **69 TSV/CSV canónicos bajo `results/`**. Todas se enumeran abajo. Para las tablas inferenciales principales se documenta además la semántica.

## Tablas inferenciales principales

### `results/module_statistics_beta10/module_factorial_ANOVA_typeIII.tsv`
Unidad: módulo × efecto. Columnas centrales: Module, Effect, estadístico F, p_value y FDR. Responde si Cultivar, Stage, Year o Cultivar:Stage explican variación del eigengene.

### `results/module_statistics_beta10/cabernet_vs_pinot_within_each_stage.tsv`
Unidad: módulo × etapa. estimate = Cabernet Sauvignon − Pinot noir. Negativo significa eigengene menor en Cabernet. Incluye error estándar, df, t, p, FDR_global y FDR_within_stage.

### `results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv`
Contiene 90 contrastes = 10 módulos × 3 etapas × 3 años. FDR_global es la corrección principal conjunta.

### `results/year_robustness_beta10/full_factorial_typeIII_ANOVA.tsv`
Contiene 70 pruebas = 10 módulos × 7 efectos del factorial completo. Cultivar:Stage:Year evalúa heterogeneidad entre años.

### `results/functional_enrichment_beta10/*all_terms.tsv`
Unidad: módulo × término funcional. Incluye tamaños de fondo/módulo, hits, p hipergeométrico, FDR dentro de módulo/global y genes solapados.

### `results/go_ora_beta10/go_all_terms.tsv`
Versión GO vigente después de filtrar IDs obsoletos. Supersede el GO de T-005 para inferencia, no MapMan.

### Rankings de hubs
`m5_full_hub_ranking.tsv` tiene 108 genes M5. `m10_m2_full_hub_ranking.tsv` contiene 39 M10 + 214 M2. Top-decil es priorización descriptiva, no significancia.

### Validación externa
`all_priority_gene_comparisons.tsv` contiene 361 genes × 6 condiciones = 2.166 filas según la auditoría T-007. Las tablas de 37 hubs y condiciones principales son subconjuntos preespecificados.

## Índice completo de TSV/CSV en results/

| Ruta | Bytes | Productor principal | Unidad aproximada | Estado |
|---|---:|---|---|---|
| `results/beta10/tables/beta_fit_indices.tsv` | 2511 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/enrichment_es.tsv` | 1262 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/enrichment_nes.tsv` | 1202 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/enrichment_padj.tsv` | 1325 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/module.tsv` | 76991 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/parameters.tsv` | 235 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/summary_eigengene.tsv` | 12081 | 04_export_results.R / CEMiTool | módulo | canónico |
| `results/beta10/tables/summary_mean.tsv` | 10881 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/beta10/tables/summary_median.tsv` | 10059 | 04_export_results.R / CEMiTool | según tabla | canónico |
| `results/comparisons/best_module_matches_beta7_to_beta10.tsv` | 718 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/beta7_vs_beta10_summary.tsv` | 355 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/gene_module_membership_beta7_vs_beta10.tsv` | 74159 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/module_overlap_counts.tsv` | 304 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/module_overlap_percent_from_beta7.tsv` | 436 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/module_overlap_percent_to_beta10.tsv` | 448 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/module_pairwise_jaccard.tsv` | 4222 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/comparisons/module_sizes_beta7_vs_beta10.tsv` | 153 | 06_compare_beta7_beta10.R | según tabla | canónico |
| `results/diagnostics/beta_fit_indices.tsv` | 2510 | varios | según tabla | canónico |
| `results/external_skin_validation_beta10/all_priority_gene_comparisons.tsv` | 529253 | 16_t007_external_skin_validation.R | según tabla | canónico |
| `results/external_skin_validation_beta10/external_source_qc.tsv` | 512 | 16_t007_external_skin_validation.R | según tabla | canónico |
| `results/external_skin_validation_beta10/gse72421_sample_audit.tsv` | 4780 | 16_t007_external_skin_validation.R | entidad auditada | canónico |
| `results/external_skin_validation_beta10/module_coverage_direction_summary.tsv` | 1248 | 16_t007_external_skin_validation.R | módulo/fuente | canónico |
| `results/external_skin_validation_beta10/prespecified_37_hub_comparisons.tsv` | 55594 | 16_t007_external_skin_validation.R | según tabla | canónico |
| `results/external_skin_validation_beta10/primary_external_condition_hubs.tsv` | 19800 | 16_t007_external_skin_validation.R | según tabla | canónico |
| `results/external_skin_validation_beta10/prjna260535_sample_audit.tsv` | 4031 | 16_t007_external_skin_validation.R | entidad auditada | canónico |
| `results/functional_enrichment_beta10/annotation_and_test_qc.tsv` | 1858 | 11_functional_enrichment_beta10.R | según tabla | canónico |
| `results/functional_enrichment_beta10/v3_mapman_all_terms.tsv` | 2627658 | 11_functional_enrichment_beta10.R | módulo × término | canónico |
| `results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv` | 14420 | 11_functional_enrichment_beta10.R | según tabla | canónico |
| `results/functional_enrichment_beta10/v3_mapman_prespecified_themes.tsv` | 12714 | 11_functional_enrichment_beta10.R | módulo × tema | canónico |
| `results/functional_enrichment_beta10/v5_go_all_terms.tsv` | 5286471 | 11_functional_enrichment_beta10.R | módulo × término | histórico para GO; superseded por results/go_ora_beta10/ |
| `results/functional_enrichment_beta10/v5_mapman_all_terms.tsv` | 3400227 | 11_functional_enrichment_beta10.R | módulo × término | canónico |
| `results/functional_enrichment_beta10/v5_mapman_prespecified_themes.tsv` | 13149 | 11_functional_enrichment_beta10.R | módulo × tema | canónico |
| `results/go_ora_beta10/go_all_terms.tsv` | 5151668 | 12_go_ora_beta10.R | módulo × término | vigente para GO |
| `results/go_ora_beta10/go_annotation_and_test_qc.tsv` | 514 | 12_go_ora_beta10.R | según tabla | vigente para GO |
| `results/go_ora_beta10/go_global_FDR05_hits.tsv` | 1832 | 12_go_ora_beta10.R | según tabla | vigente para GO |
| `results/go_ora_beta10/go_ontology_term_audit.tsv` | 524953 | 12_go_ora_beta10.R | entidad auditada | vigente para GO |
| `results/go_ora_beta10/go_vs_T005_comparison.tsv` | 3100652 | 12_go_ora_beta10.R | según tabla | vigente para GO |
| `results/hub_prioritization_beta10/m10_m2_all_intramodular_edges.tsv` | 1944451 | 14_m10_m2_hub_prioritization_beta10.R | par de genes | canónico |
| `results/hub_prioritization_beta10/m10_m2_focus_genes.tsv` | 14575 | 14_m10_m2_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m10_m2_full_hub_ranking.tsv` | 100367 | 14_m10_m2_hub_prioritization_beta10.R | gen | canónico |
| `results/hub_prioritization_beta10/m10_m2_hub_qc.tsv` | 1351 | 14_m10_m2_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m10_m2_hub_rank_sensitivity.tsv` | 9879 | 14_m10_m2_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m10_m2_mapman_evidence.tsv` | 116042 | 14_m10_m2_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m10_m2_year_evidence.tsv` | 509 | 14_m10_m2_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m5_all_intramodular_edges.tsv` | 524740 | 13_m5_hub_prioritization_beta10.R | par de genes | canónico |
| `results/hub_prioritization_beta10/m5_eigengene_without_family_sensitivity.tsv` | 4479 | 13_m5_hub_prioritization_beta10.R | módulo | canónico |
| `results/hub_prioritization_beta10/m5_focus_genes.tsv` | 9112 | 13_m5_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m5_full_hub_ranking.tsv` | 41357 | 13_m5_hub_prioritization_beta10.R | gen | canónico |
| `results/hub_prioritization_beta10/m5_harvest_without_family_sensitivity.tsv` | 188 | 13_m5_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m5_hub_qc.tsv` | 967 | 13_m5_hub_prioritization_beta10.R | según tabla | canónico |
| `results/hub_prioritization_beta10/m5_hub_rank_sensitivity.tsv` | 3888 | 13_m5_hub_prioritization_beta10.R | según tabla | canónico |
| `results/module_statistics_beta10/cabernet_vs_pinot_within_each_stage.tsv` | 4763 | 07_module_statistics_beta10.R | módulo/gen × contraste | canónico |
| `results/module_statistics_beta10/module_eigengene_qc.tsv` | 448 | 07_module_statistics_beta10.R | módulo | canónico |
| `results/module_statistics_beta10/module_eigengenes_54.tsv` | 10156 | 07_module_statistics_beta10.R | muestra | canónico |
| `results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv` | 19525 | 07_module_statistics_beta10.R | muestra | canónico |
| `results/module_statistics_beta10/module_factorial_ANOVA_typeIII.tsv` | 3523 | 07_module_statistics_beta10.R | módulo × efecto | canónico |
| `results/module_statistics_beta10/module_model_diagnostics.tsv` | 837 | 07_module_statistics_beta10.R | según tabla | canónico |
| `results/module_statistics_beta10/significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv` | 1531 | 07_module_statistics_beta10.R | módulo/gen × contraste | canónico |
| `results/module_statistics_beta10/significant_cultivar_stage_interactions_FDR05.tsv` | 511 | 07_module_statistics_beta10.R | según tabla | canónico |
| `results/module_statistics_beta10/t003_all_contrasts_audit.tsv` | 4428 | 08a_review_module_qc_beta10.R | módulo/gen × contraste | canónico |
| `results/module_statistics_beta10/t003_module_qc_summary.tsv` | 1870 | 08a_review_module_qc_beta10.R | según tabla | canónico |
| `results/module_statistics_beta10/t003_sample_residual_diagnostics.tsv` | 88312 | 08a_review_module_qc_beta10.R | muestra | canónico |
| `results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv` | 19592 | 09_year_robustness_beta10.R | módulo/gen × contraste | canónico |
| `results/year_robustness_beta10/cell_profiles.tsv` | 15645 | 09_year_robustness_beta10.R | según tabla | canónico |
| `results/year_robustness_beta10/full_factorial_typeIII_ANOVA.tsv` | 6376 | 09_year_robustness_beta10.R | módulo × efecto | canónico |
| `results/year_robustness_beta10/full_model_diagnostics.tsv` | 1532 | 09_year_robustness_beta10.R | según tabla | canónico |
| `results/year_robustness_beta10/m5_flagged_sample_sensitivity.tsv` | 1361 | 09_year_robustness_beta10.R | muestra | canónico |
| `results/year_robustness_beta10/priority_module_classification.tsv` | 904 | 09_year_robustness_beta10.R | según tabla | canónico |
| `results/year_robustness_beta10/stage_year_consistency.tsv` | 3112 | 09_year_robustness_beta10.R | según tabla | canónico |

## Reglas de lectura

- Un archivo hits es un filtro; la tabla completa es evidencia primaria.
- No significancia con cobertura baja no equivale a ausencia biológica.
- Sensibilidades no sustituyen el análisis primario.
- Centralidad no demuestra regulación.
