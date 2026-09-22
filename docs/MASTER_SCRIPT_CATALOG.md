# Catálogo maestro de scripts

## Convenciones

“Canónico” significa que el archivo vive en `scripts/`. “Histórico” significa que hay copias de estados anteriores bajo `history/local_workspace/`. No todos los scripts canónicos son portables posmigración: varios conservan rutas/estructura de la corrida original y eso se señala abajo.

Hay 27 scripts canónicos `.R`/`.py`.

## Baseline beta7

### `scripts/baseline/beta7/00_setup.R`
**Objetivo:** crear estructura de proyecto, instalar/cargar dependencias y fijar utilidades.
**Input:** entorno R.
**Output:** directorios/plantillas/archivos auxiliares.
**Rol:** bootstrap histórico de beta7.

### `01_download_geo.R`
**Objetivo:** descargar/asegurar GSE98923 RPKM y ExpressionSet GEO.
**Input:** GEO.
**Output:** `data/raw/geo/`.
**Riesgo controlado:** aborta si no obtiene archivos esperados.

### `02_prepare_data.R`
**Objetivo:** mapear las 54 muestras al RPKM, validar IDs/valores y crear RPKM/log2RPKM.
**Input:** `samples.tsv`, GEO metadata, RPKM.
**Output:** matrices procesadas y `sample_geo_map.tsv`.

### `03_run_cemitool.R`
**Objetivo:** correr CEMiTool beta7.
**Parámetros centrales:** Pearson, unsigned, signed TOM, filter=TRUE, filter_pval=0.1, VST=FALSE, min_ngen=30, seed=1234.
**Output:** objeto `cemitool.rds`.

### `04_export_results.R`
**Objetivo:** exportar tablas, figuras, fit de beta, logs.
**Output:** tablas CEMiTool, PDFs/PNGs, parámetros, sessionInfo.

### `05_render_reports.R`
**Objetivo:** reportes nativos, técnico y manuscrito scaffold.
**Output:** HTML/DOCX/PDF y paquete suplementario.

### `scripts/baseline/run_all_gse98923_initial_baseline.R`
**Objetivo:** runner monolítico del baseline inicial.
**Estado:** histórico; útil para reconstruir cómo nació la primera corrida.

## Master beta10

### `scripts/master/00_setup.R`
Equivalente funcional al setup beta7.

### `01_download_geo.R`
Descarga/asegura fuentes GEO.

### `02_prepare_data.R`
Selecciona las 54 muestras y crea `expression_rpkm.tsv`, `expression_log2rpkm.tsv`, `expression_log2rpkm.rds`.

### `03_run_cemitool.R`
Corre beta10 explícito:
`set_beta=10`, `force_beta=FALSE`, Pearson, unsigned, signed TOM, seed 1234.

**Discrepancia de estructura:** escribe a `results/objects/`, ruta de la corrida original. El objeto canónico promovido vive en `results/beta10/objects/`.

### `04_export_results.R`
Llama `write_files`, `save_plots`, exporta fit de beta y logs.

**Discrepancia:** usa `results/tables/` y `reports/assets/figures/`; el estado promovido está en `results/beta10/tables/` y `reports/current/assets/figures/`.

### `05_render_reports.R`
Genera reportes CEMiTool, diagnóstico, informe consolidado, manuscrito y zip suplementario.

**Discrepancia:** refleja layout pre-migración (`templates/`, `reports/`). Es reproducibilidad histórica, no runner posmigración listo sin adaptación.

### `run_all_gse98923_MASTER_beta10_COMPLETE.R`
Runner monolítico beta10 que encapsula la secuencia completa original.

### `run_all_gse98923_MASTER_beta7_COMPLETE.R`
Runner monolítico equivalente para beta7 explícito.

## Post-CEMiTool

### 06 — `scripts/post/06_compare_beta7_beta10.R`
**Objetivo:** comparar memberships sin rerun.
**Inputs:** objetos beta7/beta10.
**Proceso:** extrae módulo por gen, tamaños, matriz de solapamiento, porcentajes y Jaccard.
**Outputs:** `results/comparisons/`.
**Error detectado:** duplicados, objetos ausentes.
**Discrepancia:** mantiene rutas absolutas del workspace original. Los resultados canónicos ya existen, pero para rerun portable hay que parametrizar rutas.

### 07 — `07_module_statistics_beta10.R`
**Objetivo:** PC1 por módulo + `Eigengene ~ Cultivar*Stage + Year`.
**Inputs:** beta10 object, log2RPKM, samples.
**Paquetes:** CEMiTool, car, emmeans.
**Funciones clave:** `prcomp`, `lm`, `car::Anova(type=3)`, `emmeans`, `p.adjust(BH)`.
**Outputs:** eigengenes, QC, ANOVA, 30 contrastes, diagnósticos, hits.
**Decisión:** signo PC1 orientado por media del módulo.
**Errores:** orden de muestras, genes insuficientes, faltantes.

### 08 — `08_update_report_with_module_statistics.R`
**Objetivo:** integrar resultados post-CEMiTool al informe.
**Inputs:** T-007 estadística, comparación beta, plantilla.
**Outputs:** `reports/current/analysis_report.{html,docx,pdf}`, status, logs; archiva versión previa.
**Estado:** adaptado al layout migrado.

### 08a — `08a_review_module_qc_beta10.R`
**Objetivo:** auditoría T-003.
**Proceso:** recomputa PC1/modelos/contrastes y compara con archivos guardados.
**Outputs:** tablas `t003_*.tsv`.
**Principio:** no borra muestras por outliers.

### 09 — `09_year_robustness_beta10.R`
**Objetivo:** `Eigengene ~ Cultivar*Stage*Year`.
**Outputs:** ANOVA completa, 90 contrastes, perfiles, diagnósticos, clasificación, sensibilidad M5.
**Decisión:** FDR global sobre 90 contrastes como inferencia principal.
**Limitación:** n=3 por celda.

### 10 — `10_prepare_vitis_annotations_beta10.R`
**Objetivo:** preparar anotaciones Grapedia reproducibles.
**Proceso:** descarga fuentes con hashes, construye mapeos v1→v3/v5.1 recíprocos one-to-one, misma hebra y ≥50% overlap.
**Outputs:** `data/reference/grapedia_t005/`.
**Error:** aborta ante hash/mapa inesperado.

### 11 — `11_functional_enrichment_beta10.R`
**Objetivo:** ORA de los 10 módulos.
**Proceso:** hipergeométrica unilateral, términos 5–500, fondos anotados, BH por módulo y global, temas predefinidos.
**Outputs:** `results/functional_enrichment_beta10/`.
**Principal:** MapMan v3 por cobertura.

### 12 — `12_go_ora_beta10.R`
**Objetivo:** corregir componente GO con ontología oficial.
**Proceso:** audita cada GO ID, excluye `is_obsolete`, no propaga ancestros, rehace ORA.
**Outputs:** `results/go_ora_beta10/`.
**Resultado metodológico:** 390 obsoletos, 209 no detectables por nombre.

### 13 — `13_m5_hub_prioritization_beta10.R`
**Objetivo:** ranking de hubs M5 sobre adyacencia congelada.
**Métrica:** `kWithin=sum(adjacencies off-diagonal)`.
**Validación:** comprueba adyacencia contra `|Pearson r|^10`.
**Outputs:** ranking 108 genes, 5.778 aristas, anotación, sensibilidades.
**Análisis especial:** quitar 18 v3-stilbenoid y comparar PC1.

### 14 — `14_m10_m2_hub_prioritization_beta10.R`
**Objetivo:** cerrar T-006 en M10/M2.
**Outputs:** ranking 253 genes, 23.532 pares, anotaciones, leave-year-out, zeros, evidencia beta7/T-004.
**Cautela:** diferencias por gen son descriptivas, no FDR gen-level.

### 15 — `15_prepare_t007_external_skin.py`
**Objetivo:** extraer de workbook PRJNA260535 solo genes beta10 sin alterar valores.
**Paquete:** openpyxl.
**Validación:** hashes, dimensiones 16.606 genes×84 muestras, balance 3×4×7, sin faltantes.
**Outputs:** `PRJNA260535_beta10_log2cpm.tsv` y metadata.

### 16 — `16_t007_external_skin_validation.R`
**Objetivo:** validar 361 genes/37 hubs en dos datasets de piel.
**Inputs:** GSE72421, PRJNA260535, rankings T-006.
**Proceso:** cobertura, medias, Cabernet−Pinot, IC, Welch exploratorio, BH en familias preespecificadas.
**Outputs:** `results/external_skin_validation_beta10/`.
**Principio:** no mezcla datasets externos con las 54 muestras.

## Orden lógico de ejecución

```
01/02 preparación
→ 03 CEMiTool
→ 04 export
→ 05 report
→ 06 beta comparison
→ 07 factorial
→ 08/08a report + QC
→ 09 year robustness
→ 10 annotations
→ 11 ORA
→ 12 GO audit
→ 13/14 hubs
→ 15/16 skin validation
```

T-008 no existe aún como pipeline ejecutado.
