# Decisions ledger

This file records durable methodological decisions and why they were made.

## D-001 — Use a balanced 54-sample main design

**Status:** active.

**Decision:** use 2 cultivars × 3 stages × 3 years × 3 biological replicates.

**Reason:** maintain a clean balanced factorial comparison while preserving vintage.

**Rejected alternative:** treat nearby temporal samples from the 219-sample series as extra replicates.

**Why rejected:** they are different developmental timepoints, not equivalent biological replicates.

---

## D-002 — Keep Year rather than average it away

**Status:** active.

**Decision:** retain 2012/2013/2014 in downstream models.

**Reason:** vintage is biologically meaningful and later analysis showed a significant Year effect in 8/10 beta10 modules.

---

## D-003 — Use GEO RPKM + log2(RPKM+1) as the current baseline, not as the final strongest pipeline

**Status:** active baseline; future upgrade planned.

**Reason:** it enables reproducible analysis of the published processed dataset.

**Limitation:** RPKM and historical annotation are not the strongest modern choice for final publication-grade reanalysis.

**Future:** reprocess FASTQ and compare preservation.

---

## D-004 — Beta10 primary, beta7 sensitivity

**Status:** active/frozen.

**Reason:**

- beta7 R² ≈ 0.5496
- beta10 R² ≈ 0.7064
- beta10 retains the majority of beta7 module membership
- beta10 yields more module resolution without replacing the network with an unrelated structure

**Rule:** do not continue tuning beta unless upstream data/network definition changes.

---

## D-005 — Compare modules across beta runs by genes, not names

**Status:** active.

**Reason:** M1/M2/etc. are run-specific labels.

**Implementation:** overlap counts, percentages and Jaccard similarity.

---

## D-006 — Treat post-CEMiTool statistics as a separate analysis layer

**Status:** active.

**Decision:** do not pretend the factorial model is native CEMiTool output.

**Model:** `Eigengene ~ Cultivar * Stage + Year`.

**Reason:** CEMiTool class enrichment alone does not control Year or estimate the desired factorial interaction.

---

## D-007 — Do not interpret cultivar differences as direct skin-thickness effects

**Status:** active.

**Reason:**

- tissue is mixed pericarp, not isolated skin;
- no direct skin-thickness phenotype;
- only two cultivars;
- other cultivar-linked confounders exist.

**Allowed interpretation:** cultivar-development module differences and skin-relevant candidate processes.

---

## D-008 — Require seasonal robustness before strong biological prioritization

**Status:** active; tested in T-004 on 2026-09-21.

**Decision:** test `Cultivar * Stage * Year` and stage-by-year cultivar contrasts.

**Reason:** Year is significant in most modules and a strong aggregate interaction could still be driven by one season.

**Result:** Keep the full Stage × Year contrasts and their FDR visible when prioritizing biology. M10 meets the prespecified reproducibility rule. M5 Harvest and M2 Veraison/Harvest recur across years, although other parts of those modules vary by year. M3 Harvest is magnitude-dominated by 2013; M1 is not established as a stable pattern. See `docs/T004_YEAR_ROBUSTNESS.md`; these findings do not establish skin specificity or causality.

---

## D-009 — Preserve project history in GitHub

**Status:** active; migration completed 2026-09-20.

**Decision:** repository should contain both canonical organized files and historical snapshots.

**Historical location:** `history/local_workspace/`.

**Implementation:** all six original top-level workspace folders were copied there without internal reorganization. Large R objects and workspace images are retained with Git LFS; only unambiguous local R/RStudio state (`.Rhistory` and `.Rproj.user/`) is excluded from Git and remains on disk.

**Rule:** never discard an earlier scientific state simply because a newer one exists.

---

## D-010 — Repository is public

**Status:** active.

**Decision:** scan for credentials/secrets before sync.

**Rule:** scientific paths/logs are okay; actual credentials/tokens/private keys are not.

---

## D-011 — Main report is cumulative

**Status:** active.

**Decision:** the report should grow as validated layers are completed.

**Current intended sequence:**

1. CEMiTool/network diagnostics
2. beta robustness
3. factorial module statistics
4. year robustness
5. enrichment
6. hubs
7. skin-only validation
8. modern FASTQ reprocessing

Previous report versions should be archived, not destroyed.
