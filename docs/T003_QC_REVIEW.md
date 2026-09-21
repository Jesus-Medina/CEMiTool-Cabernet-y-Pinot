# T-003 — Beta10 eigengene and model QC review

Reviewed 2026-09-21. This is a diagnostic audit of the existing 54-sample
`Eigengene ~ Cultivar * Stage + Year` analysis, not a new biological or
year-robustness result. The checks are reproducible with
`source("scripts/post/08a_review_module_qc_beta10.R")` from the repository root.
The audit does not rerun CEMiTool or overwrite script 07 results.

## Coverage and integrity

- All 54 sample IDs are unique, match the beta10 expression matrix in order,
  and cover all 18 cultivar × stage × year cells with three replicates each.
- Ten beta10 biological modules have complete eigengenes and QC entries. All
  assigned genes used for each PCA have nonzero variance.
- Recomputing PC1 from the archived beta10 object and expression matrix
  reproduced the stored eigengenes and PC1 variance (within recorded precision).
- Refitting all ten additive models reproduced the stored N, R², adjusted R²,
  residual SD and maximum standardized residual.
- All 30 Cabernet Sauvignon minus Pinot noir contrasts (10 modules × 3 stages)
  were recomputed from the model coefficients and covariance matrix, without
  `emmeans`. Estimates, standard errors, p-values, global BH FDR and within-stage
  BH FDR agree with the stored table within numerical precision. Nine contrasts
  pass global FDR < 0.05.
- The 54-row sample/eigengene/metadata table is available for the planned
  Stage × Year analysis. `DayAfterVeraison` is intentionally absent for the
  36 FruitSet/Harvest samples; there are no missing module eigengenes.

## Module-level QC

| Module | Genes in PCA | PC1 variance (%) | PC1–module mean r | Model R² | Max abs standardized residual | Shapiro BH FDR |
|---|---:|---:|---:|---:|---:|---:|
| M1 | 2167 | 73.101 | 0.995 | 0.987 | 2.547 | 0.662 |
| M10 | 39 | 75.432 | 0.996 | 0.960 | 2.139 | 0.583 |
| M2 | 214 | 68.006 | 0.778 | 0.881 | 3.309 | 0.000006 |
| M3 | 131 | 66.767 | 0.999 | 0.884 | 3.084 | 0.000210 |
| M4 | 122 | 67.845 | 0.996 | 0.951 | 2.085 | 0.180 |
| M5 | 108 | 80.542 | 0.999 | 0.964 | 3.487 | 0.0142 |
| M6 | 68 | 74.568 | 0.993 | 0.718 | 2.364 | 0.180 |
| M7 | 54 | 76.926 | 0.995 | 0.624 | 2.287 | 0.173 |
| M8 | 48 | 71.259 | 0.999 | 0.472 | 2.834 | 0.0171 |
| M9 | 42 | 71.032 | 0.999 | 0.255 | 3.977 | 0.000004 |

PC1 captures 66.767–80.542% of within-module standardized-gene variance.
M2 has the lowest correlation between its oriented PC1 and mean expression
(0.778); this does not invalidate its eigengene, but direction should not be
equated with the average of every gene. The Shapiro test is a screening check,
not proof of a specific biological cause or a substitute for the year model.

## Residual and influence flags

The audit flags absolute standardized residual > 3 and Cook's D > 4/54
(a screening heuristic, not an automatic exclusion rule). Eight sample-module
observations exceed the residual threshold:

| Module | Sample(s) | Design cell | Observation |
|---|---|---|---|
| M2 | GSM2627784, GSM2627785 | Cabernet FruitSet 2014 | standardized residuals +3.287, +3.309; all three replicates in this cell exceed Cook's D 4/54 |
| M3 | GSM2627781–GSM2627783 | Cabernet Harvest 2013 | all three standardized residuals about −3.01 to −3.08 |
| M5 | GSM2627837 | Pinot Veraison 2012 | standardized residual +3.487; Cook's D 0.264 |
| M9 | GSM2627742, GSM2627854 | FruitSet 2013 (one sample per cultivar) | standardized residuals +3.118, +3.977; the latter has Cook's D 0.344 |

The M2 and M3 patterns involve whole cultivar–stage–year cells, not merely
isolated random-looking observations. This is consistent with the additive
Year model potentially missing year-dependent interaction structure; T-004
must test that possibility before claims of seasonal robustness. M5 remains
the strongest aggregate interaction, but the flagged Pinot Veraison sample
requires an influence/sensitivity check when interpreting its stage pattern.
M9 has the weakest additive-model fit (R² = 0.255) and the largest single
Cook's D. No sample was removed or altered during this review.

## All stage-specific cultivar contrasts

Each cell shows the Cabernet-minus-Pinot estimate followed by global BH FDR.
The full 30-row table, including standard errors, degrees of freedom and
within-stage FDR, is preserved in `t003_all_contrasts_audit.tsv`.

| Module | FruitSet estimate / FDR | Veraison estimate / FDR | Harvest estimate / FDR |
|---|---:|---:|---:|
| M1 | +3.621 / 0.290 | +4.213 / 0.190 | −4.384 / 0.178 |
| M10 | +0.094 / 0.894 | −2.128 / 0.00136 | −3.356 / 0.00000107 |
| M2 | −15.558 / 0.0000000180 | −25.367 / 1.20e−14 | −21.832 / 1.28e−12 |
| M3 | −0.083 / 0.959 | −1.051 / 0.760 | −6.989 / 0.000381 |
| M4 | +1.192 / 0.437 | +1.330 / 0.424 | +0.424 / 0.814 |
| M5 | +0.565 / 0.760 | −2.458 / 0.0293 | −22.279 / 8.56e−27 |
| M6 | +6.146 / 0.00899 | +2.264 / 0.437 | −0.431 / 0.894 |
| M7 | −0.368 / 0.894 | −4.349 / 0.104 | −2.455 / 0.437 |
| M8 | −0.469 / 0.894 | −1.124 / 0.788 | −1.040 / 0.789 |
| M9 | −1.809 / 0.714 | +2.277 / 0.575 | +1.329 / 0.788 |

M1 has a global Cultivar × Stage interaction at FDR 0.0397 but no individual
stage contrast passes global FDR 0.05; those statements address different
tests and must not be conflated. M6 has a significant FruitSet simple contrast
but its overall interaction FDR is approximately 0.104, so M6 is not one of
the five interaction-positive priority modules. The nine significant simple
contrasts comprise M10 (2), M2 (3), M3 (1), M5 (2) and M6 (1).

## Interpretation and next step

T-003 acceptance criteria are met: PC1 variance is documented for all
modules; diagnostics and every contrast were reviewed; residual/influence
flags are recorded with sample IDs; and the per-sample eigengene table is
available. This supports proceeding to T-004, **not** treating the current
aggregate interactions as year-robust. T-004 should inspect the flagged
design cells, influence of individual samples, and
`Eigengene ~ Cultivar * Stage * Year` with Stage × Year cultivar contrasts.
The source is pericarp, not isolated skin, and there is no direct
skin-thickness phenotype or causal evidence here.

Machine-readable audit outputs are in `results/module_statistics_beta10/`:
`t003_module_qc_summary.tsv`, `t003_sample_residual_diagnostics.tsv`, and
`t003_all_contrasts_audit.tsv`.
