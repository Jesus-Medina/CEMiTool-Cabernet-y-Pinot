# Changelog

## 2026-09-22 — GitHub Pages preview deployment prepared; one-time Pages enablement pending

- Added `.github/workflows/deploy-site.yml` using the current GitHub Pages flow: canonical data export/validation, frontend checks/build, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4` and `actions/deploy-pages@v4`.
- Switched the frontend router to `HashRouter` so direct/reloaded internal routes remain compatible with static GitHub Pages hosting.
- Added `.nojekyll` to the published public assets and documented deployment/re-run instructions in `site/README.md`.
- Commit `698192e` passed the scientific data export, validation, lint, typecheck and Vite build. Deployment run `35748440288` then stopped at GitHub Pages configuration because Pages has not yet been enabled for the repository.
- Required one-time owner action: `Settings → Pages → Build and deployment → Source → GitHub Actions`. After that, the existing workflow can be re-run without code changes.
- No scientific result, model, annotation or T-008 conclusion changed.

## 2026-09-22 — WEB-004 interactive M5 Explorer completed

- Added the first full scientific explorer at `/modules/M5`, consuming only generated canonical JSON.
- Added year filtering (All/2012/2013/2014), mean ± SE trajectories, optional biological replicate points, zero reference line, accessible SVG descriptions, a visible-data table and client-side CSV export.
- Added year-specific Harvest Cabernet − Pinot contrasts with confidence intervals and global FDR values from the canonical contrast table.
- Added a searchable 108-gene M5 hub ranking, candidate cards for NAC `VIT_12s0028g00860` and CuAO `VIT_05s0020g03280`, and external-support counts computed from T-007 rows.
- Added a CHS/STS annotation-conflict panel derived from canonical v3/v5.1 conflict flags, preserving ambiguity instead of assigning an unsupported exact enzyme identity.
- Added per-artifact provenance panels for M5 trajectory, hubs and external validation with source/script links, SHA-256 hashes and repository commit.
- Used native responsive SVG for the initial trajectory chart to keep the first preview lightweight; Plotly remains available for later views needing richer zoom/selection.
- GitHub Actions run `35747710946` passed canonical export/validation, lint, typecheck and production build for commit `b940af4`.
- The roadmap now moves to the first GitHub Pages preview before WEB-006 enrichment. No scientific model, table or T-008 conclusion was changed.

## 2026-09-22 — WEB-003 canonical Home and Story completed

- Replaced the scaffold-only landing page with a data-backed Home that loads the 54-sample design, beta10 diagnostics, M5 Cultivar×Stage FDR and T-008 progress from generated canonical JSON rather than hardcoded result values.
- Added a responsive developmental-stage flow generated from metadata, plus explicit “what the evidence shows / does not show” interpretation blocks.
- Added a seven-step Story view covering the operational question, balanced design, primary network, M5 focus, functional interpretation boundaries, external skin validation separation and current T-008 status.
- Added reusable canonical-data loading, error/loading states and numeric formatting helpers; M5 Harvest direction is derived from exported stage-year contrasts.
- GitHub Actions run `35746120112` passed canonical export/validation, lint, typecheck and production build for commit `abeb5e4`.
- WEB-004 (interactive M5 Explorer) is now the next web task. No scientific model, result table or T-008 conclusion was changed.

## 2026-09-22 — WEB-002 canonical site-data layer completed

- Added a standard-library Python export layer that reads canonical metadata/results and generates ten frontend JSON datasets at build time rather than committing stale derived snapshots.
- Added source-schema checks, explicit NA handling, finite-number validation, row-count reconstruction checks and T-008 consistency checks against the 54-run manifest and per-run QC files.
- Added provenance generation with source/script paths, SHA-256 hashes, repository commit and parameters for project summary, modules, M5 trajectory, contrasts, enrichment, hubs, M5 network, external validation and T-008 progress.
- Expanded the site CI workflow so scientific source changes also trigger export, validation, lint, typecheck and production build.
- GitHub Actions run `35745653944` passed all checks and reported: `samples=54; modules=3050; hubs=361; t008=2/54`.
- WEB-003 (Home + Story consuming generated data) is now the next web task. No scientific result or statistical analysis was changed.

## 2026-09-22 — WEB-001 interactive explorer scaffold completed

- Added the initial `site/` frontend using React 19, TypeScript and Vite with the GitHub Pages base path `/CEMiTool-Cabernet-y-Pinot/`.
- Added routed placeholders for Home, Story, modules, module detail, gene detail, external validation, T-008, methods and evidence/provenance, plus a responsive global shell and provisional design tokens.
- Kept WEB-001 intentionally free of scientific result values; canonical data integration remains reserved for WEB-002.
- Added `.github/workflows/site-check.yml`; GitHub Actions run `35745067306` completed dependency installation, lint, typecheck and production build successfully.
- Updated the web implementation plan and T-010 handoff so WEB-002 is now the next task. No scientific analysis, result table, model or T-008 conclusion changed.

## 2026-09-22 — Interactive web explorer implementation plan created

- Added `docs/WEB_EXPLORER_IMPLEMENTATION_PLAN.md` as the step-by-step roadmap for a React/TypeScript/Vite scientific explorer deployed with GitHub Pages.
- Defined the site as three coordinated layers: STORY, EXPLORE and EVIDENCE, with a validated Python export layer between canonical scientific TSVs and frontend JSON.
- Planned the MVP around Home, M5 trajectories/hubs/enrichment, external skin validation, live T-008 status and per-visual provenance; later phases add networks, all-module exploration, QA and final Pages deployment.
- Added T-010 to `docs/TASK_LEDGER.md` and set WEB-001 (web scaffold) as the next implementation step.
- No scientific input, statistical model, CEMiTool result, T-008 result or interpretation was changed.

## 2026-09-22 — T-008 run/reference audit and technical pilot in progress

- Extended T-008 to a conservative full-batch workflow after user authorization: verified a second FASTQ/Salmon run (`SRR5560667`, 19,514,717 reads, 84.94% mapped), resumed a partial ENA download only with HTTP-range and final MD5 checks, added first-10,000-read quality probes, per-run exact compressed archives and a fail-stop progress ledger. The 54-sample assembler is gated on all 54 QC passes. No FASTQ is deleted, no historical input/network changed, and no modern biological conclusion is claimed at 2/54.
- Matched all 54 frozen GSE98923 GSMs through GEO SRX to 54 ENA single-end SRRs, confirming sample characteristics and pinning FASTQ URLs, sizes, MD5 and source metadata hashes. The selected runs total 140.16 GB compressed and 1.625 billion reads; no mass download began.
- Verified official Grapedia PN40024 T2T v5.1 genome, GFF3 and all-variant transcript sources by SHA-256; generated an exact 56,910-transcript-to-47,971-gene map and documented the 1,922/3,050 reciprocal legacy-gene coverage.
- Downloaded one technical pilot FASTQ and verified ENA MD5, gzip integrity, structure and all 12,724,462 records. Salmon 1.12.1 was checksum-verified; two genome-decoy index attempts failed at an unavailable `en_US.UTF-8` locale in WSL, then a user-local locale enabled a complete index with 20 genome decoys. The single-library pilot completed with 56,910 validated transcripts, 88.67% mapping and zero quantification errors; source quantification and QC are preserved. T-008 remains IN PROGRESS; no 54-sample expression matrix or preservation claims yet.
- Tested a second fragment-length prior on the same pilot library. Gene TPM top-100 overlap was 63/100 between 250/25 and 200/80; estimated-count top-100 overlap was 99/100. Documented this material TPM sensitivity and the still-unmeasured fragment-length assumption in D-016; no biological contrast or module preservation claim was made.
- Corrected a T-007 documentation error: GSE98923 berries were grown near Modesto, California, not in Italy, as the GEO sample protocol states.

## 2026-09-21 — Master audit and beginner-to-technical reconstruction

- Added a complete master documentation layer requested as a project-wide audit: project explanation, history, exhaustive canonical file catalog, script catalog, scientific table catalog, data lineage, glossary and evidence matrix.
- Audited the current remote tree (27 canonical scripts; 69 result TSV/CSV tables) and explicitly separated canonical material from preserved `history/local_workspace/` copies.
- Documented pre/post-migration path discrepancies, the superseded T-005 GO output, the current report lag behind T-004–T-007, and the unresolved M5 CHS/STS annotation conflict without changing scientific results.
- No CEMiTool rerun, network change, sample change, T-008 analysis or deletion was performed.

## 2026-09-21 — T-007 external skin-only validation completed

- Archived SHA-pinned GSE72421 matrix/annotation and PRJNA260535 published log2CPM workbook; audited 50 microarray and 84 RNA-seq skin samples without merging either source into the primary 54-sample design.
- Tested the frozen 361 M5/M10/M2 candidates and 37 top-decile hubs across six external conditions, retaining all 2,166 comparison rows, assay coverage, complete-replicate flags, Welch estimates/intervals, BH corrections and source QC. GEO's 6,936 missing cells were not imputed; absent filtered RNA-seq genes remain non-evaluable.
- Found cross-platform expression support for M5 CuAO/NAC and M2 MYB/FAR1 candidates, but limited M10 hub support and sparse RNA-seq coverage of M2. Independently recalculated two RNA-seq 24 °Brix contrasts. Documented family hybridization, reference-mapping, stage and no-skin-thickness-phenotype limits in `docs/T007_SKIN_ONLY_VALIDATION.md`.
- Four non-fatal R locale warnings and one non-fatal openpyxl workbook-extension warning occurred. No CEMiTool rerun, new network or causal claim was made.

## 2026-09-21 — T-006 internal hub prioritization completed

- Ranked all M10 (39) and M2 (214) genes by intramodular beta10 adjacency, retaining 23,532 full edges, MapMan/Pfam/PANTHER evidence, beta7 membership, year-omission sensitivities, descriptive stage-by-year gene differences and zero-rate QC.
- Independently reconstructed `kWithin` from the edges and checked source hashes, gene/annotation grain, network weights and rankings. M10 highlights a bHLH-labelled gene and potassium transporter; M2 highlights MYB/FAR1 candidates but also a material zero-expression/reference-mapping concern and sparse v5.1 coverage.
- Documented why M3/M1 were not elevated to robust candidate modules. Marked T-006 done within its internal scope and T-007 ready; no CEMiTool rerun, external validation or skin-thickness causal claim. Four non-fatal R locale warnings and non-fatal S3-method overwrite messages occurred.

## 2026-09-21 — T-006 M5 hub phase verified

- Calculated a complete 108-gene M5 hub ranking from the frozen beta10 adjacency, preserving all 5,778 within-module edges, source-backed v3/v5.1 functional evidence, QC and leave-year/sample sensitivities.
- Found eight CHS/STS-family-labelled genes among the top 11, alongside CuAO and a NAC transcription-factor candidate; no PAL-labelled gene is in the top 11. Documented the exact v3 stilbenoid versus v5.1 CHS annotation conflict and the chr16 reference interval without assigning unproven enzyme functions or a confirmed family expansion.
- Independently recomputed centrality from the edge table; the M5 profile and three-year Harvest direction persist descriptively after removing the 18 v3 stilbenoid-labelled genes. T-006 remains IN PROGRESS pending other modules; no network rerun, sample exclusion or causal skin claim was made. Four non-fatal R locale warnings occurred.

## 2026-09-21 — Preserve and verify original Grapedia GO source

- Added only the authentic PN40024 T2T v5.1 GO ZIP to the canonical reference
  directory after matching its pinned SHA-256 and inspecting its GMT member.
- Rebuilt and matched all 33.540 prepared gene–term associations against the
  raw GMT and frozen v1→v5.1 mapping; GO ORA results and conclusions did not
  change. No unverified local «Gen ontology» folder was invented or imported.

## 2026-09-21 — T-005A GO ORA and official obsolete-term correction

- Cross-checked every beta10-linked Grapedia GO ID against a SHA-pinned
  official GO ontology, archiving its compressed source and an ID-level audit.
- Found 390 obsolete terms, including 209 missed by the former name-only
  filter; repeated all ten beta10 module ORAs with complete results, QC and
  a row-level comparison to T-005 while preserving the historical files.
- Verified that the six global-FDR GO hits remain in M9 and none emerge in
  the priority modules. Independently recalculated a Fisher test and BH FDR;
  documented sparse GO coverage and the unchanged MapMan conclusions.

## 2026-09-21 — T-005 functional annotation and enrichment completed

- Added a reproducible Grapedia annotation-preparation script with pinned URLs/SHA-256 and explicit reciprocal one-to-one v1→v3/v5.1 gene mapping; kept the 128 MB original crosswalk out of Git while versioning the filtered gene–term inputs and coverage audit.
- Added module-wide hypergeometric ORA for all ten beta10 modules against MapMan v3 (primary), T2T v5.1 MapMan and T2T v5.1 GO (secondary), preserving complete terms, non-tests, BH-FDR results, QC and nine prespecified themes.
- Independently reproduced the M5 stilbenoid enrichment from gene–term pairs with Fisher's exact test and recalculated global BH FDR; documented that MapMan v3 and v5.1 assign overlapping M5 genes different functional labels.
- M10 is seasonally reproducible but has no significant MapMan v3 term at global FDR; no priority module was established as cuticle/skin-specific. T-006 is ready with these cautions; no network or original scientific output was overwritten.

## 2026-09-21 — T-004 year robustness completed

- Added a reproducible full-factorial beta10 analysis using the unchanged 54-sample eigengene table, Type III ANOVA and 90 Stage × Year Cabernet-minus-Pinot contrasts with BH FDR.
- Preserved complete result and diagnostic TSVs, ten module profile plots, explicit priority-module classification and an M5 flagged-sample sensitivity analysis under `results/year_robustness_beta10/`.
- Independently checked all 90 contrast estimates against observed cell-mean differences, recalculated the global BH correction, verified the three-way test with nested models and reviewed all ten plots.
- Documented M10 as reproducible under the prespecified rule, M5/M2/M3/M1 as year-dependent with important stable subpatterns and limitations, in `docs/T004_YEAR_ROBUSTNESS.md`.
- T-005 is now ready to start; no enrichment analysis, network rerun or sample deletion was performed. Four non-fatal R `C.UTF-8` startup warnings occurred.

## 2026-09-21 — T-003 eigengene and model QC reviewed

- Recomputed all ten beta10 module eigengenes and PC1 variance values directly from the archived network object and expression matrix; no CEMiTool network was rerun.
- Refitted the ten additive models and independently reproduced all 30 stage-specific Cabernet-minus-Pinot contrasts and both BH-FDR corrections. Preserved machine-readable module, sample-residual and contrast audit tables.
- Documented residual/influence flags in M2, M3, M5 and M9, the weak additive-model fit of M9, and interpretation distinctions for M1 and M6 in `docs/T003_QC_REVIEW.md`.
- Corrected script 07's obsolete beta10 object path to the canonical layout without changing its statistical method or rerunning it. T-004 remains unstarted.

## 2026-09-21 — T-002 completed: cumulative report regenerated

- Executed `scripts/post/08_update_report_with_module_statistics.R` from the canonical repository root and generated the current HTML, DOCX and PDF reports in `reports/current/`.
- Confirmed `analysis_report_status.tsv` reports `TRUE` for all three formats, validated required post-CEMiTool content in each, and visually reviewed the Word/PDF renderings.
- Archived the pre-update report under `reports/archive/20260921_005059_before_module_statistics/`; intermediate render versions were archived during quality fixes.
- Fixed an R `if`/`else` parse error in script 08 and repaired the report template so its 17 figures are embedded, wide matrices remain linked as machine-readable tables instead of being printed illegibly, and session information stays within page margins.
- The final report records five significant Cultivar × Stage modules (M5, M10, M2, M3, M1), nine significant stage-specific contrasts and Year effects in eight modules, with the required scientific limitations and next planned year-robustness model.
- Non-fatal R startup warnings occurred for the `C.UTF-8` locale; the final render completed without errors. T-003 remains unstarted.

## 2026-09-20 — Report updater adapted after workspace migration

- Audited `scripts/post/08_update_report_with_module_statistics.R` against the new canonical repository structure.
- Fixed stale pre-migration paths for beta comparison inputs, report outputs, archives, templates, and logs.
- Updated `reports/templates/analysis_report.Rmd` to read the canonical beta10 object, tables, parameters and session information.
- T-002 remains pending until Codex executes the updater locally and verifies HTML/DOCX/PDF rendering.

## 2026-09-20 — Complete local workspace migration

- Migrated the complete local CEMiTool workspace into a separate synchronization clone without modifying the original folder.
- Added the two-layer repository model: canonical working folders plus `history/local_workspace/` for the original local folder layout.
- Preserved all six top-level historical folders, including the otherwise empty `TRY BETA 7 WITH INFORM/` directory.
- Promoted the current beta 10 inputs, outputs, reports, manuscript, and supporting scripts into the canonical structure.
- Retained the repository's newer canonical versions of post-processing scripts 06-08; local variants remain in the historical archive.
- Configured Git LFS for nine large R-object paths (seven unique payloads), including four `.RData` workspace images whose scientific uniqueness could not be safely ruled out.
- Established `reports/current/`, `reports/archive/`, and `reports/supplementary/`; promoted the latest beta 10 report to `reports/current/`.
- Added `docs/LOCAL_PROJECT_INVENTORY.md` and `docs/SYNC_POLICY.md`.
- Replaced the previous broad ignore rules with a minimal local-state and temporary-file policy.
- Intentionally excluded only 50 unambiguous R/RStudio local-state files (`.Rhistory` and `.Rproj.user/`) from Git; they remain untouched on local disk and are documented in the inventory.
- No secrets were detected and no scientific file was omitted because of an upload or platform failure.

## 2026-09-20 — Codex handoff and persistent agent context

- Added root `AGENTS.md` with durable repository rules for Codex.
- Added `docs/CURRENT_STATE.md` as the live scientific/operational handoff.
- Added `docs/PROJECT_CONTEXT.md` with the full study context and rationale.
- Added `docs/DECISIONS.md` to record durable methodological decisions.
- Added `docs/TASK_LEDGER.md` with active, blocked and future tasks plus acceptance criteria.
- Added `docs/FUTURE_VISION.md` describing the intended evidence ladder and ChatGPT ↔ Codex workflow.
- Added `docs/CODEX_HANDOFF.md` with the exact local-PC starting procedure.
- The repository is now the shared coordination surface between ChatGPT and Codex; local Codex should pull first, read AGENTS/context files, execute locally, then update the ledger and push results.

## 2026-09-20 — Main report made cumulative

- Added scripts/post/08_update_report_with_module_statistics.R.
- The updater reads the outputs from script 07 and integrates them into the main analysis report.
- The updated report now includes:
  - beta7 vs beta10 robustness when the comparison tables are available;
  - module eigengene methodology;
  - factorial ANOVA results;
  - significant Cultivar x Stage interactions;
  - significant Cabernet vs Pinot contrasts by developmental stage;
  - Year effects;
  - interpretation limits and the next planned Year-robustness analysis.
- Before overwriting reports/analysis_report.html, .docx and .pdf, the previous version is archived under reports/archive_before_module_statistics/<timestamp>/.
- A permanent update log is written so the report history is recoverable.


## 2026-09-19 — Repository initialized and historical work consolidated

### Dataset and design
- GSE98923 established as the primary dataset.
- Balanced 54-sample baseline frozen:
  - Cabernet Sauvignon and Pinot noir
  - FruitSet, Veraison and Harvest
  - 2012, 2013 and 2014
  - 3 biological replicates per cultivar-stage-year cell
- Six CEMiTool classes, 9 samples per class.

### Baseline preprocessing
- Official processed GEO RPKM matrix.
- Transformation: log2(RPKM + 1).
- Pearson correlation.
- Unsigned network / signed TOM.
- CEMiTool filtering enabled (filter_pval = 0.1).
- apply_vst = FALSE.
- min_ngen = 30.
- seed = 1234.

### Beta 7
- Explicit beta 7 reproduction added.
- R² = 0.5495792734.
- 8 biological modules + Not.Correlated.
- 3,050 genes retained after filtering.

### Beta 10
- Explicit beta 10 analysis added.
- R² = 0.7063742471.
- 10 biological modules + Not.Correlated.
- 3,050 genes retained after filtering.

### Robustness
- Added direct gene-membership comparison beta7 vs beta10.
- Most beta7 modules retained ~81–100% of their membership in a corresponding beta10 module, except M6 (~65%).
- Working decision: beta10 primary network; beta7 sensitivity network.

### Next stage
- Added factorial module-statistics script:
  - module eigengenes/PC1
  - model: Eigengene ~ Cultivar * Stage + Year
  - Cabernet vs Pinot contrasts within each developmental stage
  - Benjamini-Hochberg FDR

### Scientific limitations retained
- Original tissue is berry pericarp, not skin-only.
- GSE98923 does not directly measure skin thickness.
- Two-cultivar contrast cannot by itself prove a thick-skin/thin-skin mechanism.
- External skin-only validation remains required.
