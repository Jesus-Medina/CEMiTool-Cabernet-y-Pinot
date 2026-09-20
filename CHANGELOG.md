# Changelog

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
