# Task ledger

Use this as the operational queue for Codex and ChatGPT.

Status values:

- TODO
- IN PROGRESS
- BLOCKED
- DONE
- SUPERSEDED

Do not mark a task DONE unless its acceptance criteria were actually checked.

---

## T-001 — Full local workspace synchronization

**Status:** DONE (2026-09-20).

**Owner:** Codex on the user's PC.

**Goal:** safely import the full historical local workspace into the existing GitHub repository while preserving the current remote history and leaving the repository organized.

**Source local workspace:**

`C:/Users/jesus/OneDrive/Documentos/Cata/CEMiTool`

**Target remote:**

`Jesus-Medina/CEMiTool-Cabernet-y-Pinot`

**Required behavior:**

- never force-push;
- never delete/move the original local workspace;
- inspect files and secrets first;
- use Git LFS when necessary;
- preserve historical local folders under `history/local_workspace/`;
- keep a canonical structure at repo root;
- promote current report to `reports/current/`;
- retain older reports in `reports/archive/` or historical workspace;
- generate `docs/LOCAL_PROJECT_INVENTORY.md`;
- generate/update `docs/SYNC_POLICY.md`;
- update README and CHANGELOG.

**Acceptance criteria:**

- origin/main == local HEAD after push;
- working tree clean;
- no scientific files unintentionally left untracked;
- no secret committed;
- no normal Git blob over GitHub's size limit;
- historical workspace visible remotely;
- canonical scripts/results/reports/docs visible remotely;
- excluded/unuploaded files explicitly listed.

**After completion:** update this entry with final commit SHA, import counts, exclusions and any unresolved file.

**Completion record:**

- Migration commit: `663cbea` (`sync: complete local workspace migration`).
- Concurrent remote work preserved by merge commit: `9cd4899`.
- Source inventory: 303 files, 5,875,491,333 bytes (approximately 5.47 GiB).
- Historical import: 253 source files tracked under `history/local_workspace/`, plus one `.gitkeep` for the empty `TRY BETA 7 WITH INFORM/` folder.
- Canonical promotion: 118 source-derived file copies.
- Git LFS: 9 tracked paths, 7 unique payloads, approximately 4.54 GiB unique storage.
- Intentional exclusions: 45 `.Rproj.user/` files and 5 `.Rhistory` files (9,502 bytes total); all remain on local disk.
- Secrets blocked: none; scans found no credentials, provider tokens, or private keys.
- Files not uploaded because of failure or platform limits: none.
- Normal Git blobs over 100 MB: none.
- Verification: local `HEAD` matched `origin/main`, working tree was clean, required canonical and historical paths existed in the remote tree, and the repository plus current report and inventory were checked directly on GitHub.
- Unresolved migration issues: none.

---

## T-002 — Integrate post-CEMiTool statistics into the main report

**Status:** DONE (2026-09-21).

**Script:**

`scripts/post/08_update_report_with_module_statistics.R`

**Migration-path audit (2026-09-20):**
- comparison input now points to `results/comparisons/`;
- report outputs now target `reports/current/`;
- previous current report is archived under `reports/archive/<timestamp>_before_module_statistics/`;
- report template now lives under `reports/templates/`;
- canonical beta10 object/tables/parameters/session paths are used;
- this audit was completed before asking Codex to execute T-002.

**Goal:** archive the prior report and regenerate HTML/DOCX/PDF with:

- beta7 vs beta10 robustness;
- eigengene method;
- factorial ANOVA;
- significant Cultivar × Stage modules;
- stage-specific Cabernet vs Pinot contrasts;
- Year effects;
- limitations;
- next-step year robustness.

**Acceptance criteria:**

- `reports/current/analysis_report.html` successfully generated;
- `reports/current/analysis_report.docx` successfully generated;
- `reports/current/analysis_report.pdf` successfully generated;
- previous report archived;
- render status saved;
- latest report present in `reports/current/` in the canonical migrated layout.

**Completion verification (2026-09-21):**

- Ran `source("scripts/post/08_update_report_with_module_statistics.R")` from the canonical repository root after verifying the required input/output directories and canonical paths.
- `reports/current/analysis_report_status.tsv` records `TRUE` for HTML, DOCX and PDF; all three outputs opened and their required post-CEMiTool content was checked.
- Confirmed beta7 vs beta10, `Eigengene ~ Cultivar * Stage + Year`, M5/M10/M2/M3/M1 interactions, stage-specific Cabernet-versus-Pinot contrasts, Year effect, interpretation boundaries, and the planned `Eigengene ~ Cultivar * Stage * Year` test.
- The prior report is preserved in `reports/archive/20260921_005059_before_module_statistics/`. Additional intermediate report versions were also archived during visual-quality repairs; the final current report supersedes them.
- Corrected the updater's R `if`/`else` syntax and the report template's figure embedding and wide-table presentation. Final render includes 17 figures in HTML/DOCX, and visual inspection confirmed the post-CEMiTool section in DOCX/PDF. No scientific inputs, models or conclusions were changed.
- R reported four non-fatal `C.UTF-8` locale warnings. Final rendering completed with no errors.

---

## T-003 — Review module eigengene QC and full contrast tables

**Status:** DONE (2026-09-21), with diagnostic caveats documented in `docs/T003_QC_REVIEW.md`.

**Inputs expected from script 07:**

- `module_eigengene_qc.tsv`
- `module_model_diagnostics.tsv`
- `module_eigengenes_with_metadata_54.tsv`
- `cabernet_vs_pinot_within_each_stage.tsv`

**Goal:** verify that current factorial conclusions are not being interpreted before basic QC/model diagnostics are reviewed.

**Acceptance criteria:**

- PC1 variance documented for every module;
- model diagnostic table reviewed;
- obvious residual/outlier problems flagged;
- all contrasts reviewed, not only significant subset;
- per-sample eigengene table available for year analysis.

**Completion verification:** Recomputed PC1 from the frozen beta10 object and expression matrix for all ten modules; independently refitted all ten additive models and all 30 Cabernet-minus-Pinot stage contrasts; matched stored diagnostics and both BH-FDR corrections. Confirmed the balanced 54-sample table has no missing eigengenes. Flagged residual/influence issues in M2, M3, M5 and M9, plus low M9 model R². See `docs/T003_QC_REVIEW.md` and the three `t003_*.tsv` audit tables in `results/module_statistics_beta10/`. No samples were excluded and no existing statistical estimates were changed.

---

## T-004 — Year robustness analysis

**Status:** DONE (2026-09-21), con cautelas científicas detalladas en `docs/T004_YEAR_ROBUSTNESS.md`.

**Script:**

`scripts/post/09_year_robustness_beta10.R`

**Primary model:**

`Eigengene ~ Cultivar * Stage * Year`

**Outputs include:**

- full Type III ANOVA including higher-order interaction;
- Cabernet vs Pinot contrasts within each Stage × Year;
- FDR corrections;
- per-module interaction/profile plots;
- summary of direction consistency across 2012/2013/2014;
- explicit identification of patterns driven by a single year.

**Priority modules:**

- M5
- M10
- M2
- M3
- M1

M6 is secondary because its current Cultivar × Stage FDR is ~0.10 despite a significant FruitSet contrast.

**Acceptance criteria:**

- every priority module classified as reproducible / partially reproducible / year-dependent based on explicit evidence;
- no biological enrichment interpretation presented as robust before this step is reviewed.

**Completion verification:** Se ajustaron diez modelos factoriales completos con 54 muestras y 36 grados de libertad residuales. Se guardaron 70 pruebas ANOVA tipo III, 90 contrastes Cabernet menos Pinot por Stage × Year con FDR, 180 perfiles de celda, diagnósticos, diez gráficos y una sensibilidad para la muestra M5 marcada en T-003. Los 90 contrastes se cotejaron con diferencias directas de medias (error máximo 4,62×10⁻¹⁴); se verificaron el FDR BH, el contraste de modelos anidados para la interacción de tres vías y los errores estándar. Se inspeccionaron los diez gráficos. La regla explícita clasifica M10 como reproducible y M5/M2/M3/M1 como dependientes del año, con subpatrones repetidos de M5 Harvest y M2 Veraison/Harvest; M1 depende de evidencia descriptiva, no de una interacción estacional con FDR <0,05. El análisis no presenta enriquecimiento biológico ni causalidad de grosor de piel. T-005 puede comenzar con esas cautelas.

---

## T-005 — Functional annotation and enrichment of robust modules

**Status:** DONE (2026-09-21), con límites de cobertura y discordancia de anotación documentados en `docs/T005_FUNCTIONAL_ENRICHMENT.md`.

**Goal:** determine what robust modules represent biologically.

**Target themes include:**

- cutin/cuticle/wax
- epidermis
- cell wall
- pectin
- cellulose/hemicellulose
- lignification
- phenylpropanoids
- flavonoids
- anthocyanins

**Requirements:**

- use current/verified Vitis annotation where feasible;
- preserve complete enrichment tables;
- correct multiple testing;
- distinguish module-wide enrichment from hand-picked genes.

**Completion verification:** Se fijaron URL y SHA-256 de cuatro fuentes oficiales de Grapedia, se auditó el mapeo recíproco v1→v3/v5.1 de los 3.050 genes y se preservaron anotaciones gen–término y cobertura por módulo. Se ejecutó ORA hipergeométrico para los diez módulos sobre MapMan v3 (principal), MapMan T2T v5.1 y GO T2T v5.1 (secundarios), con tablas completas, BH por módulo y global, QC y nueve temas predefinidos incluidos los no significativos/no evaluables. Una prueba de Fisher independiente reprodujo el hallazgo M5 `9.2.3` y se recalculó el BH global. M5 muestra enriquecimiento de metabolismo fenólico bajo v3, pero v5.1 etiqueta muchos de los mismos genes como CHS/flavonoide; M10 no tiene enriquecimiento global pese a alta cobertura v3. Los resultados se interpretan junto con T-004, sin convertir enriquecimiento de módulo en efecto específico de Harvest ni en causalidad de piel.

---

## T-005A — GO ORA with ontology-based obsolete-term audit

**Status:** DONE (2026-09-21), high-priority user request; details in
`docs/T005A_GO_ORA_ONTOLOGY_AUDIT.md`.

**Goal:** independently check the Grapedia GO annotations against an official
GO ontology, remove obsolete IDs and repeat beta10 module-wide ORA, comparing
it with the GO portion of T-005.

**Acceptance verification:** The pinned `go.obo` release 2026-07-26 marked
390/3.556 GO IDs obsolete, including 209 not identified by Grapedia's term
names. All 390 were excluded before testing. The GO-annotated background
remained 519 genes, while tested module–term combinations fell from 6.864 to
6.344. Six global-FDR hits remained, all in M9; none of the five priority
modules gained a significant GO term. Full results, per-ID audit, QC and
old/new comparison were saved without replacing historical T-005 outputs.
An independent Fisher calculation reproduced M9/GO:0010431 and global BH
was independently recalculated. Low GO mapping coverage remains a major
interpretation limit. No CEMiTool run or scientific input was changed.
As a user-requested provenance follow-up, the original 1.584.493-byte
Grapedia GO ZIP was added to the reference directory only after its pinned
SHA-256 and single GMT member were checked; all 33.540 prepared gene–term
pairs were then matched exactly against the raw GMT and frozen gene map.

---

## T-006 — Hub gene prioritization

**Status:** DONE (2026-09-21), para la priorización interna de M5/M10/M2; la validación en piel aislada pertenece a T-007.

**Goal:** identify central candidate genes within robust, biologically relevant modules.

**Requirements:**

- define hub metric explicitly;
- do not equate centrality with causality;
- preserve full ranking;
- cross-reference annotation and validation evidence.

**M5 phase verification:** `scripts/post/13_m5_hub_prioritization_beta10.R` calculó `kWithin` en la matriz beta10 congelada (108 genes, 5.778 pares) y guardó el ranking completo, aristas, anotaciones v3/v5.1 con URL/SHA-256, QC y sensibilidades. Ocho de los 11 hubs principales pertenecen al bloque etiquetado stilbenoid en v3/CHS en v5.1; los otros incluyen CuAO, un NAC y un gen sin función verificada. Ningún PAL está en el top 11. El recálculo independiente de `kWithin` y las comprobaciones de membresía/anotación pasaron. La retirada exploratoria de los 18 genes de familia no elimina el perfil M5 ni el contraste Harvest repetido. Ver `docs/T006_M5_HUB_PRIORITIZATION.md`.

**M10/M2 completion verification:** `scripts/post/14_m10_m2_hub_prioritization_beta10.R` calculó rankings completos para 39 genes M10 y 214 genes M2, preservó 23.532 aristas y cotejó etiquetas MapMan/Pfam/PANTHER v3/v5.1, retención de membresía beta7, evidencia anual T-004 y sensibilidades leave-one-year-out. Los hashes funcionales y la adyacencia congelada se comprobaron. Una suma independiente de las aristas reprodujo todos los `kWithin` y verificó los 741/22.791 pares, rangos y retención beta7. M10 tiene un bHLH anotado en rango 1 y un transportador HAK/KUP/KT en rango 2, pero no enriquecimiento global; M2 tiene MYB en rango 2 y FAR1 en rango 8, junto a numerosos hubs poco anotados y una alerta de expresión cero/mapeo en Cabernet. M3/M1 no fueron elevados a prioridad robusta por T-004. Interpretación y límites en `docs/T006_M10_M2_HUB_PRIORITIZATION.md`. Se cumplen la métrica explícita, el ranking completo y el cruce de anotación/validación **interna**. No se hizo validación externa, inferencia causal ni nueva red.

---

## T-007 — Skin-only external validation

**Status:** DONE (2026-09-21), validación externa observacional de candidatos; no validación de grosor ni mecanismo.

**Candidate datasets:**

- GSE72421
- PRJNA260535

**Goal:** test whether candidate module genes/pathways show evidence in isolated berry skin.

**Rule:** use as external validation, not as extra replicates for the GSE98923 baseline.

**Acceptance verification:** Se archivaron con URL/SHA-256 los originales de GSE72421 y PRJNA260535, se auditaron 50 muestras de microarray y 84 de RNA-seq, y se congelaron los 361 genes M5/M10/M2 y 37 hubs de T-006 antes de las comparaciones. `scripts/post/15_prepare_t007_external_skin.py` y `scripts/post/16_t007_external_skin_validation.R` producen 2.166 filas completas de comparación, 222 filas hub-condición, QC y auditoría de muestras. Se prefijaron GSE WW y RNA-seq 24 °Brix como condiciones principales; WD y 20/22/26 °Brix son sensibilidades. Las 6.936 celdas faltantes de GEO no se imputaron y los genes ausentes del RNA-seq filtrado se marcan no evaluables. M5 muestra apoyo de expresión en piel para CuAO/NAC y parte del bloque familiar; M10 tiene apoyo individual limitado; MYB/FAR1 M2 concuerdan, pero cobertura/mapeo limitan interpretación. Se reprodujeron independientemente dos diferencias de RNA-seq. Métodos, resultados, discrepancias y límites en `docs/T007_SKIN_ONLY_VALIDATION.md` y `results/external_skin_validation_beta10/`. La red primaria y sus 54 muestras permanecen intactas.

---

## T-008 — Modern FASTQ reprocessing

**Status:** IN PROGRESS (2026-09-22); source/run/reference audit and 2/54 verified FASTQ/quantifications. No 54-sample matrix or module-preservation result yet.

**Goal:** reprocess raw reads with a modern pipeline and current Vitis annotation, then determine whether the important modules/candidates are preserved.

**This step should compare against, not erase, the historical RPKM baseline.**

**Preparation record:** `scripts/post/17_t008_audit_raw_run_manifest.py` matched all 54 frozen GSM to 54 single-end SRR via GEO SRX and ENA, checked original sample characteristics, and pinned FASTQ URLs, sizes and MD5. The selected compressed data total 140.160.608.633 bytes and 1.625.172.664 reads. `scripts/post/18_t008_prepare_t2t_reference.py` verified Grapedia T2T v5.1 genome/GFF3/all-transcript FASTA by SHA-256 and matched 56.910 transcript IDs to 47.971 genes; the old→new reciprocal crosswalk covers 1.922/3.050 beta10 genes. The smallest FASTQ (`SRR5560506`) passed size, MD5, gzip, record-structure and exact read-count QC. A Salmon 1.12.1 full-genome-decoy index completed after resolving a missing WSL `en_US.UTF-8` locale. The single-library quantification passed transcript, read-count, TPM and index-hash QC (88.67% mapped; zero quantification errors). A second prior for fragment length found material TPM sensitivity, less for gene estimated counts; see D-016 and `docs/T008_RAW_REPROCESSING.md`. Do **not** mark DONE until the full 54-run and preservation criteria there are met.

**Full-batch checkpoint:** the user authorized continuing through completion while preserving source data. `SRR5560667` joined the pilot as a second independently verified run (19.514.717 reads, 84.94% mapped); an interrupted download was resumed and accepted only after complete ENA MD5. Scripts 19/20/25/26 implement resumable verified retrieval, read-quality probe, per-run Salmon QC/archive and fail-stop checkpointed processing. Script 27 is prepared to assemble modern matrices **only after** all 54 PASS. No raw FASTQ is deleted; T-008 is not DONE.

---

## T-009 — Final integrated scientific report/manuscript

**Status:** future.

**Goal:** assemble methods, diagnostics, results, validation, limitations, figures and supplementary files into a publication-quality narrative.

**No result should be promoted to a strong mechanistic conclusion unless its evidence layer has actually been completed.**


---

## T-010 — Interactive web explorer / GitHub Pages

**Status:** IN PROGRESS (2026-09-22); planning completed, implementation not started.

**Master plan:** `docs/WEB_EXPLORER_IMPLEMENTATION_PLAN.md`

**Goal:** build an interactive, auditable, static scientific website that presents the Cabernet–Pinot project as a paper/story, exploratory dashboard and evidence browser while reading canonical repository results and preserving the existing scientific pipeline.

**Architecture decision:**

- React + TypeScript + Vite;
- Plotly.js for scientific plots;
- Cytoscape.js for coexpression networks;
- Python exporter from canonical TSVs to validated frontend data;
- GitHub Actions + GitHub Pages;
- no backend;
- no CEMiTool/model re-execution in the browser.

**Scientific boundaries:**

- website is a visualization layer, not a new inference layer;
- no hand-entered replacement for canonical result tables when machine-readable sources exist;
- preserve the pericarp/skin-thickness, hub/causality, CHS/STS, external-validation and T-008 interpretation limits;
- T-008 progress must remain explicitly incomplete until the 54-run criteria are actually satisfied.

**Implementation phases:** WEB-000 through WEB-012 are tracked in the master plan.

**WEB-001 completion (2026-09-22):** scaffold creado en `site/` con React 19 + TypeScript + Vite, routing para Home/Story/Modules/ModuleDetail/Gene/Validation/T-008/Methods/Evidence, layout responsive, variables visuales provisionales y base `/CEMiTool-Cabernet-y-Pinot/`. Se añadió `.github/workflows/site-check.yml`. GitHub Actions run `35745067306` pasó install, lint, typecheck y build. Commit principal: `f0c0c38`.

**WEB-002 completion (2026-09-22):** se añadieron `site/scripts/export_site_data.py`, `validate_site_data.py` y `build_provenance_manifest.py`. La capa genera en build-time diez JSON desde TSV canónicos, convierte NA explícitamente, valida esquemas/row counts/valores finitos, cruza el progreso T-008 con archivos `SRR*_run_qc.tsv` y registra SHA-256 + commit para provenance. Los JSON quedan ignorados por Git para evitar snapshots web obsoletos. GitHub Actions run `35745653944` verificó `54` muestras, `3050` genes de módulos, `361` hubs y `2/54` runs T-008 validados, y completó export, validation, lint, typecheck y build con éxito. Commit principal: `1cad93d`.

**WEB-003 completion (2026-09-22):** Home y Story ya consumen los JSON generados por WEB-002. La portada muestra diseño, beta principal, M5 y T-008 desde fuentes canónicas; el flujo de etapas se construye desde metadata y la narrativa diferencia resultados apoyados de conclusiones no demostradas. Se añadieron estados de carga/error, layout responsive y una Story de siete pasos con T-008 dinámico. GitHub Actions run `35746120112` pasó export, validation, lint, typecheck y build. Commit principal: `abeb5e4`.

**WEB-004 completion (2026-09-22):** se implementó el explorador interactivo M5 en `/modules/M5`. La trayectoria permite Todos/2012/2013/2014, muestra media±SE, réplicas opcionales, línea cero, tabla de datos y descarga CSV del subconjunto visible. Se añadieron contrastes Harvest por año, ranking buscable de 108 hubs, tarjetas NAC `VIT_12s0028g00860` y CuAO `VIT_05s0020g03280` con apoyo externo derivado de T-007, panel CHS/STS basado en `V3_V5_STS_CHS_label_conflict` y provenance con fuentes/scripts/SHA-256/commit. La gráfica usa SVG nativo para mantener peso y accesibilidad; no recalcula estadística. GitHub Actions run `35747710946` pasó export, validation, lint, typecheck y build. Commit principal: `b940af4`.

**GitHub Pages preview live (2026-09-22):** tras habilitar Pages con GitHub Actions, se reejecutó el run `35748440288` (attempt 2). El job `build` pasó export canónico, validation, lint, typecheck, Vite build, `configure-pages` y upload del artifact; el job `deploy` finalizó con `success`. GitHub reportó la environment URL `https://jesus-medina.github.io/CEMiTool-Cabernet-y-Pinot/`. La preview usa `HashRouter` y se reconstruye desde resultados canónicos en cada deployment relevante.

**WEB-006 completion (2026-09-22):** se añadió una capa de exportación específica de enriquecimiento que reúne únicamente términos testados vigentes de MapMan v3, MapMan v5.1 y GO T-005A, más QC de cobertura y temas preespecificados. La vista `/enrichment` permite seleccionar fuente/módulo, alternar hits FDR<0,05 vs todos los tests, buscar términos, inspeccionar barras −log10(FDR), fold/overlap, warnings de cobertura, temas MapMan y el estado de auditoría GO. El GO histórico T-005 se mantiene solo como trazabilidad y no alimenta la vista vigente. CI run `35749918846` validó `enrichment_terms=11104` y pasó export/validation/lint/typecheck/build; Pages run `35749918954` desplegó con éxito. Commit principal: `126fead`.

**WEB-008 completion (2026-09-22):** se añadió `site/scripts/export_external_validation.py` y se amplió `external_validation.json` a schema v2 con 74 filas de hubs de las dos condiciones externas primarias, resumen de cobertura por módulo/condición, QC de fuente y resúmenes de auditoría de muestras. La página `/validation` mantiene GSE72421 (microarray, WW) y PRJNA260535 (RNA-seq, 24 °Brix) visualmente separadas, incluye scatter de concordancia direccional, filtros, FDR BH37/BH361, estados evaluable/no evaluable, límites de plataforma y provenance. La media 2012/13/14 del eje baseline es únicamente una métrica descriptiva de visualización y se etiqueta como tal; no se comparan magnitudes entre plataformas. CI run `35751143173` reportó `external_hubs=74` y pasó export/validation/lint/typecheck/build. Pages run `35751143153` desplegó con éxito. Commit principal: `839c7db`.

**Immediate next step:** WEB-009 T-008 live status dashboard driven entirely by the canonical T-008 progress/QC files.

**Acceptance criteria for T-010 DONE:**

- site builds reproducibly from the repository;
- canonical TSV/result sources feed generated frontend data;
- major scientific figures expose provenance;
- Home, M5 explorer, enrichment, external validation, T-008 status and evidence browser are implemented;
- scientific limitations are visible in the UI;
- automated checks pass;
- GitHub Pages deployment is active;
- README links to the deployed site;
- final scientific and visual QA is recorded.
