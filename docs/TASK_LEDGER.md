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

**Status:** IN PROGRESS (2026-09-21); fase M5 ejecutada y verificada. Faltan otros módulos priorizados.

**Goal:** identify central candidate genes within robust, biologically relevant modules.

**Requirements:**

- define hub metric explicitly;
- do not equate centrality with causality;
- preserve full ranking;
- cross-reference annotation and validation evidence.

**M5 phase verification:** `scripts/post/13_m5_hub_prioritization_beta10.R` calculó `kWithin` en la matriz beta10 congelada (108 genes, 5.778 pares) y guardó el ranking completo, aristas, anotaciones v3/v5.1 con URL/SHA-256, QC y sensibilidades. Ocho de los 11 hubs principales pertenecen al bloque etiquetado stilbenoid en v3/CHS en v5.1; los otros incluyen CuAO, un NAC y un gen sin función verificada. Ningún PAL está en el top 11. La comparación de pesos de arista, un recálculo independiente de `kWithin` y las comprobaciones de membresía/anotación pasaron. La retirada exploratoria de los 18 genes de familia no elimina el perfil M5 ni el contraste Harvest repetido. La discordancia CHS/STS, la posible expansión de familia, la estabilidad imperfecta del rango al omitir años y la ausencia de evidencia causal se detallan en `docs/T006_M5_HUB_PRIORITIZATION.md`. **No marcar DONE** hasta priorizar también hubs de otros módulos robustos/relevantes (al menos M10 y M2) y cruzar evidencia de validación disponible.

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
