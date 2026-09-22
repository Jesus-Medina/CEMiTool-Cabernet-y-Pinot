# Catálogo maestro de archivos

Auditoría del árbol GitHub actual. Total: **535 archivos**, de los cuales **281 canónicos** y **254 históricos** bajo `history/`.

El catálogo enumera todos los archivos canónicos del árbol. El subárbol `history/local_workspace/` contiene copias históricas preservadas y no se duplica línea por línea aquí; su función es trazabilidad, no fuente vigente.

## Cómo interpretar columnas

- **Ruta:** ubicación exacta.
- **Bytes:** tamaño Git del blob; punteros LFS pueden mostrar tamaño de puntero, no payload real.
- **Rol:** clasificación funcional.
- **Estado:** vigencia/uso.

## .gitattributes/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `.gitattributes` | 1097 | configuración/raíz | canónico |

## .gitignore/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `.gitignore` | 140 | configuración/raíz | canónico |

## AGENTS.md/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `AGENTS.md` | 4700 | configuración/raíz | canónico |

## CHANGELOG.md/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `CHANGELOG.md` | 13456 | configuración/raíz | canónico |

## README.md/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `README.md` | 7413 | configuración/raíz | canónico |

## data/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `data/metadata/external_t007/PRJNA260535_samples.tsv` | 3515 | metadata | canónico |
| `data/metadata/phenotypes.tsv` | 1241 | metadata | canónico |
| `data/metadata/sample_geo_map.tsv` | 10599 | metadata | canónico |
| `data/metadata/sample_images.tsv` | 1442 | metadata | canónico |
| `data/metadata/samples.tsv` | 9902 | metadata | canónico |
| `data/processed/expression_log2rpkm.rds` | 9656439 | dato procesado | canónico |
| `data/processed/expression_log2rpkm.tsv` | 21772309 | dato procesado | canónico |
| `data/processed/expression_rpkm.tsv` | 11128956 | dato procesado | canónico |
| `data/processed/external_t007/PRJNA260535_beta10_log2cpm.tsv` | 1121481 | dato procesado | canónico |
| `data/raw/geo/gse98923_expression_set.rds` | 16049 | fuente primaria/raw | canónico |
| `data/raw/geo/GSE98923/GSE98923_RPKM_2012-2013-2014_controls.txt.gz` | 18257506 | fuente primaria/raw | canónico |
| `data/reference/external_t007/GSE72421_annotation.txt.gz` | 332442 | referencia/anotación externa | canónico |
| `data/reference/external_t007/GSE72421_series_matrix.txt.gz` | 8126367 | referencia/anotación externa | canónico |
| `data/reference/external_t007/PRJNA260535_additional_file_2_log2CPM.xlsx` | 12099162 | referencia/anotación externa | canónico |
| `data/reference/external_t007/source_manifest.tsv` | 863 | referencia/anotación externa | canónico |
| `data/reference/go_2026-07-26/go_ora_source_manifest.tsv` | 435 | referencia/anotación externa | canónico |
| `data/reference/go_2026-07-26/go.obo.gz` | 4906338 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/gene_coverage_audit.tsv` | 147359 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/source_manifest.tsv` | 697 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/t2t_go.zip` | 1584493 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/v1_to_v3_reciprocal50.tsv` | 95696 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/v1_to_v5_reciprocal50.tsv` | 86150 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/v3_mapman_pairs.tsv` | 725401 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/v5_go_pairs.tsv` | 2904900 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t005/v5_mapman_pairs.tsv` | 832427 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t006/m5_function_evidence.tsv` | 125309 | referencia/anotación externa | canónico |
| `data/reference/grapedia_t006/source_manifest.tsv` | 559 | referencia/anotación externa | canónico |

## docs/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `docs/01_pregunta_y_alcance.md` | 1810 | documentación | canónico |
| `docs/02_dataset_y_diseno.md` | 2440 | documentación | canónico |
| `docs/03_bitacora_metodologica.md` | 3044 | documentación | canónico |
| `docs/04_beta7_vs_beta10.md` | 2173 | documentación | canónico |
| `docs/05_limitaciones_y_validacion.md` | 2214 | documentación | canónico |
| `docs/06_roadmap.md` | 1913 | documentación | canónico |
| `docs/07_bitacora_cronologica_detallada.md` | 3230 | documentación | canónico |
| `docs/08_fuentes_y_datasets.md` | 1814 | documentación | canónico |
| `docs/09_reportes_generados.md` | 1659 | documentación | canónico |
| `docs/10_como_actualizar_repo.md` | 2012 | documentación | canónico |
| `docs/11_resultados_modelo_factorial_beta10.md` | 4457 | documentación | canónico |
| `docs/CODEX_HANDOFF.md` | 1439 | documentación | canónico |
| `docs/CURRENT_STATE.md` | 10222 | documentación | canónico |
| `docs/DECISIONS.md` | 9309 | documentación | canónico |
| `docs/experimental_design.md` | 314 | documentación | canónico |
| `docs/FUTURE_VISION.md` | 2932 | documentación | canónico |
| `docs/LOCAL_PROJECT_INVENTORY.md` | 5569 | documentación | canónico |
| `docs/MASTER_DATA_LINEAGE.md` | 4390 | documentación | canónico |
| `docs/MASTER_PROJECT_EXPLANATION.md` | 23918 | documentación | canónico |
| `docs/MASTER_PROJECT_HISTORY.md` | 5727 | documentación | canónico |
| `docs/MASTER_SCRIPT_CATALOG.md` | 7509 | documentación | canónico |
| `docs/PROJECT_CONTEXT.md` | 7649 | documentación | canónico |
| `docs/SYNC_POLICY.md` | 2753 | documentación | canónico |
| `docs/T003_QC_REVIEW.md` | 6381 | documentación | canónico |
| `docs/T004_YEAR_ROBUSTNESS.md` | 6856 | documentación | canónico |
| `docs/T005_FUNCTIONAL_ENRICHMENT.md` | 7795 | documentación | canónico |
| `docs/T005A_GO_ORA_ONTOLOGY_AUDIT.md` | 6481 | documentación | canónico |
| `docs/T006_M10_M2_HUB_PRIORITIZATION.md` | 6527 | documentación | canónico |
| `docs/T006_M5_HUB_PRIORITIZATION.md` | 7295 | documentación | canónico |
| `docs/T007_SKIN_ONLY_VALIDATION.md` | 7188 | documentación | canónico |
| `docs/TASK_LEDGER.md` | 15883 | documentación | canónico |

## manuscript/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `manuscript/article_draft.docx` | 12542 | manuscrito | canónico |
| `manuscript/article_draft.pdf` | 31403 | manuscrito | canónico |
| `manuscript/article_draft.Rmd` | 4061 | manuscrito | canónico |
| `manuscript/article_render_status.tsv` | 34 | manuscrito | canónico |
| `manuscript/references.bib` | 95 | manuscrito | canónico |

## reports/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `reports/archive/2026-09-19_beta10_initial/cemitool/report.html` | 4052433 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta10_initial/diagnostics/diagnostics.html` | 970689 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/analysis_report_status.tsv` | 44 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/analysis_report.docx` | 33646 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/analysis_report.html` | 1070733 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/analysis_report.pdf` | 73972 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/beta_r2.png` | 70869 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/gsea.png` | 70794 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/hist.png` | 36655 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/mean_k.png` | 61503 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/mean_var.png` | 101917 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M1.png` | 1665420 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M2.png` | 1067847 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M3.png` | 813469 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M4.png` | 656070 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M5.png` | 773210 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M6.png` | 583487 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M7.png` | 268598 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_M8.png` | 333333 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/profile_Not_Correlated.png` | 185506 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/assets/figures/qq.png` | 33861 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/cemitool/report.html` | 3270175 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/diagnostics/diagnostics.html` | 974731 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/native_report_status.tsv` | 100 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/README.md` | 668 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/supplementary/gse98923_supplementary_files.zip` | 28405021 | reporte archivado | histórico |
| `reports/archive/2026-09-19_beta7_fixed/supplementary/manifest.tsv` | 2230 | reporte archivado | histórico |
| `reports/archive/20260921_005059_before_module_statistics/analysis_report_status.tsv` | 44 | reporte archivado | histórico |
| `reports/archive/20260921_005059_before_module_statistics/analysis_report.docx` | 36007 | reporte archivado | histórico |
| `reports/archive/20260921_005059_before_module_statistics/analysis_report.html` | 1083723 | reporte archivado | histórico |
| `reports/archive/20260921_005059_before_module_statistics/analysis_report.pdf` | 77923 | reporte archivado | histórico |
| `reports/archive/20260921_005807_before_module_statistics/analysis_report_status.tsv` | 44 | reporte archivado | histórico |
| `reports/archive/20260921_005807_before_module_statistics/analysis_report.docx` | 39232 | reporte archivado | histórico |
| `reports/archive/20260921_005807_before_module_statistics/analysis_report.html` | 1096410 | reporte archivado | histórico |
| `reports/archive/20260921_005807_before_module_statistics/analysis_report.pdf` | 86389 | reporte archivado | histórico |
| `reports/archive/20260921_005938_before_module_statistics/analysis_report_status.tsv` | 44 | reporte archivado | histórico |
| `reports/archive/20260921_005938_before_module_statistics/analysis_report.docx` | 24996 | reporte archivado | histórico |
| `reports/archive/20260921_005938_before_module_statistics/analysis_report.html` | 1023402 | reporte archivado | histórico |
| `reports/archive/20260921_005938_before_module_statistics/analysis_report.pdf` | 71029 | reporte archivado | histórico |
| `reports/archive/20260921_010249_before_module_statistics/analysis_report_status.tsv` | 44 | reporte archivado | histórico |
| `reports/archive/20260921_010249_before_module_statistics/analysis_report.docx` | 8078586 | reporte archivado | histórico |
| `reports/archive/20260921_010249_before_module_statistics/analysis_report.html` | 12167680 | reporte archivado | histórico |
| `reports/archive/20260921_010249_before_module_statistics/analysis_report.pdf` | 8176381 | reporte archivado | histórico |
| `reports/current/analysis_report_status.tsv` | 44 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/analysis_report.docx` | 8078566 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/analysis_report.html` | 12167474 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/analysis_report.pdf` | 8176338 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/beta_r2.png` | 71381 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/gsea.png` | 78199 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/hist.png` | 36655 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/mean_k.png` | 61503 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/mean_var.png` | 101917 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M1.png` | 1749179 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M10.png` | 290712 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M2.png` | 1188758 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M3.png` | 958925 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M4.png` | 898361 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M5.png` | 662542 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M6.png` | 435784 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M7.png` | 574290 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M8.png` | 449372 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_M9.png` | 350601 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/profile_Not_Correlated.png` | 415654 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/assets/figures/qq.png` | 33861 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/cemitool/report.html` | 4050321 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/diagnostics/diagnostics.html` | 974989 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/latest_report_update.txt` | 479 | reporte vigente/asset | vigente para la capa reportada |
| `reports/current/native_report_status.tsv` | 100 | reporte vigente/asset | vigente para la capa reportada |
| `reports/README.md` | 668 | reporte/plantilla/suplemento | canónico |
| `reports/supplementary/gse98923_supplementary_files.zip` | 28995357 | reporte/plantilla/suplemento | canónico |
| `reports/supplementary/manifest.tsv` | 2233 | reporte/plantilla/suplemento | canónico |
| `reports/templates/analysis_report_updated.Rmd` | 13628 | reporte/plantilla/suplemento | canónico |
| `reports/templates/analysis_report.Rmd` | 7861 | reporte/plantilla/suplemento | canónico |
| `reports/templates/article_draft.Rmd` | 4061 | reporte/plantilla/suplemento | canónico |

## results/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `results/beta10/figures/beta_r2.pdf` | 5718 | resultado/diagnóstico | canónico |
| `results/beta10/figures/gsea.pdf` | 9481 | resultado/diagnóstico | canónico |
| `results/beta10/figures/hist.pdf` | 5105 | resultado/diagnóstico | canónico |
| `results/beta10/figures/mean_k.pdf` | 5468 | resultado/diagnóstico | canónico |
| `results/beta10/figures/mean_var.pdf` | 173388 | resultado/diagnóstico | canónico |
| `results/beta10/figures/profile.pdf` | 715657 | resultado/diagnóstico | canónico |
| `results/beta10/figures/qq.pdf` | 1392120 | resultado/diagnóstico | canónico |
| `results/beta10/figures/sample_tree.pdf` | 6798 | resultado/diagnóstico | canónico |
| `results/beta10/objects/cemitool.rds` | 134 | resultado/diagnóstico | canónico |
| `results/beta10/parameters.txt` | 272 | resultado/diagnóstico | canónico |
| `results/beta10/run_summary.txt` | 141 | resultado/diagnóstico | canónico |
| `results/beta10/session_info.txt` | 5767 | resultado/diagnóstico | canónico |
| `results/beta10/tables.zip` | 60587 | resultado/diagnóstico | canónico |
| `results/beta10/tables/beta_fit_indices.tsv` | 2511 | resultado/diagnóstico | canónico |
| `results/beta10/tables/enrichment_es.tsv` | 1262 | resultado/diagnóstico | canónico |
| `results/beta10/tables/enrichment_nes.tsv` | 1202 | resultado/diagnóstico | canónico |
| `results/beta10/tables/enrichment_padj.tsv` | 1325 | resultado/diagnóstico | canónico |
| `results/beta10/tables/module.tsv` | 76991 | resultado/diagnóstico | canónico |
| `results/beta10/tables/modules_genes.gmt` | 72613 | resultado/diagnóstico | canónico |
| `results/beta10/tables/parameters.tsv` | 235 | resultado/diagnóstico | canónico |
| `results/beta10/tables/selected_genes.txt` | 54900 | resultado/diagnóstico | canónico |
| `results/beta10/tables/summary_eigengene.tsv` | 12081 | resultado/diagnóstico | canónico |
| `results/beta10/tables/summary_mean.tsv` | 10881 | resultado/diagnóstico | canónico |
| `results/beta10/tables/summary_median.tsv` | 10059 | resultado/diagnóstico | canónico |
| `results/beta7/parameters.txt` | 284 | resultado/diagnóstico | canónico |
| `results/beta7/run_summary.txt` | 154 | resultado/diagnóstico | canónico |
| `results/comparisons/best_module_matches_beta7_to_beta10.tsv` | 718 | resultado/diagnóstico | canónico |
| `results/comparisons/beta7_vs_beta10_summary.tsv` | 355 | resultado/diagnóstico | canónico |
| `results/comparisons/comparison_summary.txt` | 387 | resultado/diagnóstico | canónico |
| `results/comparisons/gene_module_membership_beta7_vs_beta10.tsv` | 74159 | resultado/diagnóstico | canónico |
| `results/comparisons/module_overlap_counts.tsv` | 304 | resultado/diagnóstico | canónico |
| `results/comparisons/module_overlap_percent_from_beta7.tsv` | 436 | resultado/diagnóstico | canónico |
| `results/comparisons/module_overlap_percent_to_beta10.tsv` | 448 | resultado/diagnóstico | canónico |
| `results/comparisons/module_pairwise_jaccard.tsv` | 4222 | resultado/diagnóstico | canónico |
| `results/comparisons/module_sizes_beta7_vs_beta10.tsv` | 153 | resultado/diagnóstico | canónico |
| `results/diagnostics/beta_fit_indices.tsv` | 2510 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/all_priority_gene_comparisons.tsv` | 529253 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/analysis_summary.txt` | 1027 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/external_source_qc.tsv` | 512 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/gse72421_sample_audit.tsv` | 4780 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/module_coverage_direction_summary.tsv` | 1248 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/prespecified_37_hub_comparisons.tsv` | 55594 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/primary_external_condition_hubs.tsv` | 19800 | resultado/diagnóstico | canónico |
| `results/external_skin_validation_beta10/prjna260535_sample_audit.tsv` | 4031 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/analysis_summary.txt` | 977 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/annotation_and_test_qc.tsv` | 1858 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/v3_mapman_all_terms.tsv` | 2627658 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv` | 14420 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/v3_mapman_prespecified_themes.tsv` | 12714 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/v5_go_all_terms.tsv` | 5286471 | resultado/diagnóstico | histórico para GO; superseded por results/go_ora_beta10/ |
| `results/functional_enrichment_beta10/v5_mapman_all_terms.tsv` | 3400227 | resultado/diagnóstico | canónico |
| `results/functional_enrichment_beta10/v5_mapman_prespecified_themes.tsv` | 13149 | resultado/diagnóstico | canónico |
| `results/futuros_analisis/.gitkeep` | 40 | resultado/diagnóstico | canónico |
| `results/go_ora_beta10/analysis_summary.txt` | 851 | resultado/diagnóstico | vigente para GO |
| `results/go_ora_beta10/go_all_terms.tsv` | 5151668 | resultado/diagnóstico | vigente para GO |
| `results/go_ora_beta10/go_annotation_and_test_qc.tsv` | 514 | resultado/diagnóstico | vigente para GO |
| `results/go_ora_beta10/go_global_FDR05_hits.tsv` | 1832 | resultado/diagnóstico | vigente para GO |
| `results/go_ora_beta10/go_ontology_term_audit.tsv` | 524953 | resultado/diagnóstico | vigente para GO |
| `results/go_ora_beta10/go_vs_T005_comparison.tsv` | 3100652 | resultado/diagnóstico | vigente para GO |
| `results/history/initial_force_beta7_parameters.txt` | 300 | resultado/diagnóstico | canónico |
| `results/history/initial_force_beta7_run_summary.txt` | 1696 | resultado/diagnóstico | canónico |
| `results/history/sessionInfo_baseline.txt` | 5974 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/analysis_summary.txt` | 962 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_all_intramodular_edges.tsv` | 1944451 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_analysis_summary.txt` | 783 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_focus_genes.tsv` | 14575 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_full_hub_ranking.tsv` | 100367 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_hub_qc.tsv` | 1351 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_hub_rank_sensitivity.tsv` | 9879 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_mapman_evidence.tsv` | 116042 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m10_m2_year_evidence.tsv` | 509 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_all_intramodular_edges.tsv` | 524740 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_eigengene_without_family_sensitivity.tsv` | 4479 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_focus_genes.tsv` | 9112 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_full_hub_ranking.tsv` | 41357 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_harvest_without_family_sensitivity.tsv` | 188 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_hub_qc.tsv` | 967 | resultado/diagnóstico | canónico |
| `results/hub_prioritization_beta10/m5_hub_rank_sensitivity.tsv` | 3888 | resultado/diagnóstico | canónico |
| `results/logs/report_update_module_statistics_20260921_005059.txt` | 479 | resultado/diagnóstico | canónico |
| `results/logs/report_update_module_statistics_20260921_005807.txt` | 479 | resultado/diagnóstico | canónico |
| `results/logs/report_update_module_statistics_20260921_005938.txt` | 478 | resultado/diagnóstico | canónico |
| `results/logs/report_update_module_statistics_20260921_010249.txt` | 479 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/analysis_summary.txt` | 443 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/cabernet_vs_pinot_within_each_stage.tsv` | 4763 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/module_eigengene_qc.tsv` | 448 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/module_eigengenes_54.tsv` | 10156 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv` | 19525 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/module_factorial_ANOVA_typeIII.tsv` | 3523 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/module_model_diagnostics.tsv` | 837 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv` | 1531 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/significant_cultivar_stage_interactions_FDR05.tsv` | 511 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/t003_all_contrasts_audit.tsv` | 4428 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/t003_module_qc_summary.tsv` | 1870 | resultado/diagnóstico | canónico |
| `results/module_statistics_beta10/t003_sample_residual_diagnostics.tsv` | 88312 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/analysis_summary.txt` | 1358 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv` | 19592 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/cell_profiles.tsv` | 15645 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/full_factorial_typeIII_ANOVA.tsv` | 6376 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/full_model_diagnostics.tsv` | 1532 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/m5_flagged_sample_sensitivity.tsv` | 1361 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/priority_module_classification.tsv` | 904 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M1_stage_by_year.png` | 12435 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M10_stage_by_year.png` | 13282 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M2_stage_by_year.png` | 10787 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M3_stage_by_year.png` | 10375 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M4_stage_by_year.png` | 13457 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M5_stage_by_year.png` | 12243 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M6_stage_by_year.png` | 11411 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M7_stage_by_year.png` | 12556 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M8_stage_by_year.png` | 11178 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/profiles/M9_stage_by_year.png` | 12234 | resultado/diagnóstico | canónico |
| `results/year_robustness_beta10/stage_year_consistency.tsv` | 3112 | resultado/diagnóstico | canónico |

## scripts/

| Ruta | Bytes | Rol | Estado |
|---|---:|---|---|
| `scripts/baseline/beta7/00_setup.R` | 14604 | script | canónico |
| `scripts/baseline/beta7/01_download_geo.R` | 1081 | script | canónico |
| `scripts/baseline/beta7/02_prepare_data.R` | 3703 | script | canónico |
| `scripts/baseline/beta7/03_run_cemitool.R` | 1508 | script | canónico |
| `scripts/baseline/beta7/04_export_results.R` | 4568 | script | canónico |
| `scripts/baseline/beta7/05_render_reports.R` | 8417 | script | canónico |
| `scripts/baseline/run_all_gse98923_initial_baseline.R` | 20091 | script | canónico |
| `scripts/master/00_setup.R` | 14604 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/01_download_geo.R` | 1081 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/02_prepare_data.R` | 3703 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/03_run_cemitool.R` | 1474 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/04_export_results.R` | 4540 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/05_render_reports.R` | 8419 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/run_all_gse98923_MASTER_beta10_COMPLETE.R` | 64431 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/master/run_all_gse98923_MASTER_beta7_COMPLETE.R` | 64484 | script | canónico histórico; varias rutas reflejan layout pre-migración |
| `scripts/post/06_compare_beta7_beta10.R` | 8309 | script | canónico histórico; contiene rutas absolutas originales |
| `scripts/post/07_module_statistics_beta10.R` | 12274 | script | canónico |
| `scripts/post/08_update_report_with_module_statistics.R` | 12551 | script | canónico |
| `scripts/post/08a_review_module_qc_beta10.R` | 8231 | script | canónico |
| `scripts/post/09_year_robustness_beta10.R` | 14291 | script | canónico |
| `scripts/post/10_prepare_vitis_annotations_beta10.R` | 6951 | script | canónico |
| `scripts/post/11_functional_enrichment_beta10.R` | 9947 | script | canónico |
| `scripts/post/12_go_ora_beta10.R` | 15602 | script | canónico |
| `scripts/post/13_m5_hub_prioritization_beta10.R` | 16946 | script | canónico |
| `scripts/post/14_m10_m2_hub_prioritization_beta10.R` | 14155 | script | canónico |
| `scripts/post/15_prepare_t007_external_skin.py` | 4605 | script | canónico |
| `scripts/post/16_t007_external_skin_validation.R` | 15702 | script | canónico |

## Histórico

`history/local_workspace/` conserva 254 archivos históricos. No debe usarse como fuente canónica cuando exista una versión promovida fuera de `history/`.

## Discrepancias relevantes

1. `scripts/post/06_compare_beta7_beta10.R` conserva rutas absolutas antiguas.
2. Parte de `scripts/master/` usa layout pre-migración.
3. `docs/09_reportes_generados.md` describe una política antigua de binarios.
4. GO histórico T-005 está superseded por T-005A.
5. `reports/current/` todavía no integra T-004–T-007.
