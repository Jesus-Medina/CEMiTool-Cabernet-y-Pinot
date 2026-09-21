# AGENTS.md — CEMiTool Cabernet Sauvignon vs Pinot noir

## Purpose

This repository is both:

1. the reproducible scientific workspace for the GSE98923 CEMiTool study; and
2. the historical record of how the analysis evolved.

Preserve both goals. Do not "clean up" history at the cost of traceability.

## Required reading at the start of every task

Before changing files, read in this order:

1. `docs/CURRENT_STATE.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/DECISIONS.md`
4. `docs/TASK_LEDGER.md`
5. `docs/FUTURE_VISION.md`

Read the relevant scripts/results after that.

## Scientific invariants

- Primary dataset: GEO GSE98923.
- Main balanced design: 54 samples = 2 cultivars × 3 stages × 3 years × 3 biological replicates.
- Cultivars: Cabernet Sauvignon and Pinot noir.
- Stages: FruitSet, Veraison, Harvest.
- Years: 2012, 2013, 2014.
- Main expression baseline: log2(RPKM + 1).
- Primary network: beta = 10.
- Sensitivity network: beta = 7.
- Do not silently change samples, preprocessing, beta, network type, TOM type, filtering, or seed.
- Do not rerun CEMiTool unless the task explicitly requires it.
- The source tissue is berry pericarp, not isolated skin.
- GSE98923 does not contain a direct skin-thickness phenotype.
- Never state that a module or gene "causes thick/thin skin" from this dataset alone.
- Keep Year explicit in downstream statistics.
- Current factorial model: `Eigengene ~ Cultivar * Stage + Year`.
- Current next robustness model: `Eigengene ~ Cultivar * Stage * Year`.

## Repository preservation rules

- Never force-push.
- Never rewrite Git history unless explicitly authorized.
- Never delete historical scientific outputs merely because they can be regenerated.
- Never delete or modify the user's original local workspace as part of migration.
- Keep canonical working files organized, while preserving historical copies under `history/local_workspace/` when that migration is completed.
- The repo is public: never commit secrets, tokens, credentials, private keys, `.env`, or `.Renviron` contents containing secrets.
- Inspect files larger than 100 MB before staging; use Git LFS when appropriate.
- Do not treat local Windows paths as secrets by themselves.

## Canonical working layout

Prefer:

- `scripts/baseline/` — baseline/historical reproducible workflows
- `scripts/master/` — complete master workflows
- `scripts/post/` — post-CEMiTool analyses
- `data/metadata/`
- `data/processed/`
- `results/`
- `reports/current/` — latest main report
- `reports/archive/` — older report versions
- `manuscript/`
- `docs/`
- `history/local_workspace/` — intact historical local folders after migration

Do not dump old workspace folders directly in the repository root.

## Task protocol

At the beginning of a task:

1. inspect `git status`;
2. read the required context files;
3. identify the active task in `docs/TASK_LEDGER.md`;
4. inspect exact input files before making scientific claims.

During work:

- prefer new versioned scripts over destructive edits to historical scripts;
- keep outputs machine-readable;
- log parameters and important decisions;
- archive a previous main report before overwriting it.

At completion:

1. run the relevant validation/checks;
2. update `docs/TASK_LEDGER.md`;
3. update `docs/CURRENT_STATE.md` when the scientific state changed;
4. update `docs/DECISIONS.md` when a methodological decision changed;
5. update `CHANGELOG.md`;
6. leave the workspace in a reproducible state;
7. report files changed, commands run, outputs created, and any unresolved issue.

## R analysis expectations

- Do not fabricate missing values or silently coerce malformed metadata.
- Fail loudly when required input files are missing.
- Keep factor level/reference choices explicit.
- Use Benjamini-Hochberg FDR unless a task explicitly changes the correction.
- Preserve full result tables, not only significant hits.
- Save QC and diagnostics alongside inferential outputs.
- Treat module names as run-specific labels; match modules across runs by gene membership, not by name alone.

## Reports

The native CEMiTool report and the post-CEMiTool statistical report are different layers.

The main report should eventually integrate:

1. dataset/design;
2. preprocessing;
3. beta diagnostics;
4. beta7 vs beta10 robustness;
5. module eigengenes;
6. factorial statistics;
7. year robustness;
8. functional enrichment;
9. hub genes;
10. external skin-only validation;
11. limitations.

Never present an unfinished downstream layer as if it were already validated.

## Communication

Use clear Spanish for user-facing summaries unless asked otherwise.
For scientific output, prefer precise language over overclaiming.
