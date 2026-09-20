# Local project inventory

- Synchronization date: 2026-09-20 (America/Santiago)
- Original workspace: `C:/Users/jesus/OneDrive/Documentos/Cata/CEMiTool`
- Synchronization clone: `C:/Users/jesus/OneDrive/Documentos/Cata/CEMiTool_GITHUB_SYNC`
- Original files: 303
- Original size: 5,875,491,333 bytes (approximately 5.47 GiB)
- Nested Git repositories: none detected
- Secret scan: no credentials, private keys, or provider tokens detected

## Top-level historical folders detected

| Folder | Files | Approximate size |
| --- | ---: | ---: |
| `BETA 10/` | 102 | 0.720 GiB |
| `Fasoli cabernet y pinot GSE98923/` | 53 | 1.329 GiB |
| `TRY BETA 10/` | 46 | 1.348 GiB |
| `TRY BETA 7 FIXED/` | 91 | 1.415 GiB |
| `TRY BETA 7 MASTER/` | 11 | 0.659 GiB |
| `TRY BETA 7 WITH INFORM/` | 0 | 0 GiB |

All six folders were copied without internal reorganization to `history/local_workspace/`. The empty folder uses a `.gitkeep` file because Git cannot otherwise represent empty directories.

## Content summary

- Scripts and source documents (`.R`, `.Rmd`, `.py`, `.sh`, `.ps1`): 25
- Report documents (`.html`, `.pdf`, `.docx`): 50
- R objects and workspaces (`.rds`, `.RData`, `.rda`): 14
- Matrix candidates identified by filename: 19
- Common scientific formats found: `.tsv`, `.txt`, `.csv`, `.rds`, `.pdf`, `.docx`, `.html`, `.zip`, `.gz`, `.gmt`, `.xlsx`, `.R`, and `.Rmd`

Important scripts detected include the beta 7 and beta 10 master workflows, the modular scripts `00_setup.R` through `05_render_reports.R`, `06_compare_beta7_beta10.R`, and `07_module_statistics_beta10.R`. The repository already contained newer canonical copies of scripts 06 and 07 plus `08_update_report_with_module_statistics.R`; those remote versions were retained as canonical, while every local version remains in the historical archive.

The matrix inventory includes the RPKM and log2(RPKM+1) matrices, the GEO expression-set object, sample metadata and mappings. The results inventory includes beta-fit indices, module tables, eigengenes, factorial ANOVA, cultivar contrasts, diagnostics, GSEA/enrichment outputs, figures, supplementary bundles, run summaries, session information, and CEMiTool objects.

## Large files and Git LFS

Nine tracked paths over 50 MB are stored with Git LFS:

- `results/beta10/objects/cemitool.rds`
- `history/local_workspace/BETA 10/results/objects/cemitool.rds`
- `history/local_workspace/TRY BETA 10/results/objects/cemitool.rds`
- `history/local_workspace/TRY BETA 7 FIXED/results/objects/cemitool.rds`
- `history/local_workspace/Fasoli cabernet y pinot GSE98923/analisis/cemitool/objetos/GSE98923_CEMiTool_54_baseline.rds`
- `history/local_workspace/Fasoli cabernet y pinot GSE98923/.RData`
- `history/local_workspace/TRY BETA 10/.RData`
- `history/local_workspace/TRY BETA 7 FIXED/.RData`
- `history/local_workspace/TRY BETA 7 MASTER/.RData`

R was not available locally to inspect the internal objects of the four workspace images. Because their scientific uniqueness could not be ruled out, they were retained through Git LFS rather than ignored. The nine LFS paths total approximately 5.78 GiB logically and resolve to seven unique payloads totaling approximately 4.54 GiB. No non-LFS tracked file exceeds GitHub's 100 MB normal-blob limit.

## Local-only files intentionally ignored

The historical copy contains 303 physical files. Of those, 253 files (approximately 5.47 GiB) are eligible for Git tracking. Fifty local session/cache files (9,502 bytes) are deliberately excluded from Git:

- 45 files under `.Rproj.user/` (RStudio local state)
- 5 `.Rhistory` files (interactive command history)

These ignored files were not deleted or edited. They remain in both the untouched original workspace and the local synchronization copy. All four `.RData` workspace images, reproducible scientific objects, and matrices are tracked, with large R objects stored through Git LFS.

## Reports

The most recent complete technical report was found under `BETA 10/reports/` and promoted to:

- `reports/current/analysis_report.html`
- `reports/current/analysis_report.docx`
- `reports/current/analysis_report.pdf`

The beta 7 fixed report and the earlier beta 10 native/diagnostic reports were additionally copied to dated, descriptive folders under `reports/archive/`. All source copies remain in `history/local_workspace/`.

## Canonical structure selected

- `scripts/baseline/`: original and beta 7 baseline workflows
- `scripts/master/`: current beta 10 master workflow and modular scripts 00-05
- `scripts/post/`: comparison, module statistics, and report update scripts 06-08
- `data/metadata/`: sample selection, phenotypes, and GEO mappings
- `data/processed/`: processed RPKM and log2(RPKM+1) matrices
- `data/raw/`: retained reproducible GEO input artifacts
- `results/`: beta-specific outputs, comparisons, diagnostics, figures, tables, objects, and module statistics
- `reports/current/`: current principal report and its assets
- `reports/archive/`: prior generated report versions
- `reports/supplementary/`: supplementary bundle and manifest
- `manuscript/`: article draft sources and rendered formats
- `docs/`: scientific documentation, this inventory, and synchronization policy
- `history/local_workspace/`: unchanged folder-level snapshots of the local workspace

## Exclusions, upload failures, and secrets

- Secrets blocked: none
- Files omitted because of an upload failure or platform limit: none
- Intentional local-only exclusions: the 50 R/RStudio session-state files listed above
- Original files deleted or modified: none
