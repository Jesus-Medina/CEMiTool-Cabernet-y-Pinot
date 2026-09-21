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

**Status:** TODO; T-004 completada, lista para iniciar con las cautelas de robustez por año.

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

---

## T-006 — Hub gene prioritization

**Status:** TODO; blocked on T-005.

**Goal:** identify central candidate genes within robust, biologically relevant modules.

**Requirements:**

- define hub metric explicitly;
- do not equate centrality with causality;
- preserve full ranking;
- cross-reference annotation and validation evidence.

---

## T-007 — Skin-only external validation

**Status:** TODO; blocked on T-005/T-006.

**Candidate datasets:**

- GSE72421
- PRJNA260535

**Goal:** test whether candidate module genes/pathways show evidence in isolated berry skin.

**Rule:** use as external validation, not as extra replicates for the GSE98923 baseline.

---

## T-008 — Modern FASTQ reprocessing

**Status:** future.

**Goal:** reprocess raw reads with a modern pipeline and current Vitis annotation, then determine whether the important modules/candidates are preserved.

**This step should compare against, not erase, the historical RPKM baseline.**

---

## T-009 — Final integrated scientific report/manuscript

**Status:** future.

**Goal:** assemble methods, diagnostics, results, validation, limitations, figures and supplementary files into a publication-quality narrative.

**No result should be promoted to a strong mechanistic conclusion unless its evidence layer has actually been completed.**
