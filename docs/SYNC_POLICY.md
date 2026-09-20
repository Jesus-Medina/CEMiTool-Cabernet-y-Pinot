# Synchronization policy

GitHub is the primary versioned source for CEMiTool work from this migration forward. The original local folder remains an untouched backup until its owner decides otherwise.

## Two-layer organization

1. `history/local_workspace/` preserves the important local workspace folders as they existed at synchronization time. Historical copies are not reorganized or cleaned, and apparent duplicates are retained for traceability.
2. The canonical folders (`scripts/`, `data/`, `results/`, `reports/`, `manuscript/`, and `docs/`) are the working structure for current and future analysis.

A scientifically relevant file may exist in both layers. This duplication is intentional: the historical path records provenance, while the canonical path provides a stable working location.

## Working workflow

Before starting analysis:

```bash
git pull origin main
```

Work from the canonical structure in RStudio. After generating or updating scripts, data products, results, reports, or manuscript files:

```bash
git status
git add <reviewed-paths>
git commit -m "describe the analysis update"
git push origin main
```

ChatGPT/Codex should work directly in a fresh clone or managed worktree of this repository, not in the original backup folder.

## Reports

- `reports/current/` always contains the current principal report as `analysis_report.html`, `analysis_report.docx`, and `analysis_report.pdf` when those formats are available.
- Before replacing a current report, copy the prior version to a descriptive or dated folder under `reports/archive/`.
- Supplementary report artifacts belong in `reports/supplementary/`.
- Historical source locations remain preserved under `history/local_workspace/`.

## Data, results, and large files

- Scientific `.tsv`, `.txt`, `.csv`, `.rds`, `.pdf`, `.docx`, `.html`, `.zip`, and related artifacts are not excluded merely because they are generated or duplicated.
- Large scientific objects are reviewed individually and use Git LFS when appropriate.
- A normal Git blob must never exceed GitHub's 100 MB limit.
- If a relevant file cannot be uploaded, keep it on disk and record its path, size, and reason in `docs/FILES_NOT_UPLOADED.md`.
- Publicly downloadable raw data may still be retained when it is useful for exact reproducibility; no local raw data is deleted as part of synchronization.

## Safety rules

- Never force-push or rewrite the shared history.
- Never delete the historical layer to make the repository look cleaner.
- Never commit credentials, tokens, private keys, `.env`, or `.Renviron` files.
- Review `git status`, Git LFS tracking, large files, and staged changes before every push.
- Pull before new work and commit plus push after producing durable results.

