# Current state

Last consolidated context update: 2026-09-21.

## Repository

Canonical remote:

`Jesus-Medina/CEMiTool-Cabernet-y-Pinot`

The repository now contains the complete verified local-workspace migration in addition to the organized canonical documentation, scripts, data, results, reports, and manuscript. The migration commit is `663cbea`; concurrent remote documentation work was preserved through merge commit `9cd4899`. The original local workspace remains untouched as a separate backup.

## Scientific status

### Dataset and design

Primary dataset: **GSE98923**.

Main baseline:

- 54 samples
- Cabernet Sauvignon and Pinot noir
- FruitSet, Veraison, Harvest
- 2012, 2013, 2014
- 3 biological replicates per cultivar × stage × year cell
- 9 samples per cultivar-stage class

Expression baseline:

`log2(RPKM + 1)`

### Network status

Beta 7 explicit reproduction:

- R² = 0.549579273382905
- 8 biological modules + Not.Correlated
- 3,050 filtered genes

Beta 10:

- R² = 0.706374247063269
- 10 biological modules + Not.Correlated
- 3,050 filtered genes

Direct gene-membership comparison showed strong preservation for most modules. Working decision:

- **beta 10 = primary network**
- **beta 7 = sensitivity analysis**

Do not reopen beta tuning unless the expression matrix, sample set, normalization or network definition changes.

### Factorial module statistics

Script:

`scripts/post/07_module_statistics_beta10.R`

Model:

`Eigengene ~ Cultivar * Stage + Year`

10 biological modules were analyzed.

Significant Cultivar × Stage interactions after BH FDR:

| Module | FDR |
|---|---:|
| M5 | 5.2925472036331e-22 |
| M10 | 0.00105158773018888 |
| M2 | 0.0195129128379966 |
| M3 | 0.0195129128379966 |
| M1 | 0.0396520854992993 |

M5 is the strongest interaction by a very large margin.

Significant stage-specific Cabernet Sauvignon - Pinot noir contrasts currently recorded include:

- M5 Harvest: -22.2794
- M2 Veraison: -25.3672
- M2 Harvest: -21.8323
- M2 FruitSet: -15.5583
- M10 Harvest: -3.3557
- M3 Harvest: -6.9886
- M10 Veraison: -2.1280
- M6 FruitSet: +6.1461
- M5 Veraison: -2.4580

Negative = lower eigengene in Cabernet Sauvignon.

### Year effect

Year is significant after FDR in 8 of 10 modules under the additive model.

This means the next statistical priority is to determine whether the Cultivar × Stage pattern is robust across 2012, 2013 and 2014 rather than being driven by one vintage.

### Main report

T-002 is complete. The cumulative main report in `reports/current/analysis_report.{html,docx,pdf}` now includes the post-CEMiTool module-statistics section. `reports/current/analysis_report_status.tsv` records `TRUE` for all three formats. The preceding report is archived at `reports/archive/20260921_005059_before_module_statistics/`; subsequent intermediate renders were archived as well. The final report includes 17 embedded diagnostic figures. This report documents associations and interpretation boundaries, not skin-thickness causality.

### T-003 eigengene and model QC

T-003 is complete; the detailed record is `docs/T003_QC_REVIEW.md`. All ten beta10 eigengenes and PC1 variance values were reproduced from the frozen expression/network inputs. The 54-sample table is complete and balanced, and all 30 stage-specific Cabernet-minus-Pinot contrasts and BH adjustments were independently verified. Eight sample-module observations exceed absolute standardized residual 3 (M2, M3, M5, M9). M2 Cabernet FruitSet 2014 and M3 Cabernet Harvest 2013 show cell-level patterns; M5 includes an influential Pinot Veraison 2012 sample. These are flags for T-004, not grounds for silently removing samples or claiming an interaction is stable across years. M9 has low additive-model R² (0.255). No biological inference was promoted.

### T-004 year robustness

T-004 is complete; detailed methodology, evidence and caveats are in `docs/T004_YEAR_ROBUSTNESS.md`. Script `scripts/post/09_year_robustness_beta10.R` fit `Eigengene ~ Cultivar * Stage * Year` in all ten beta10 modules on the unchanged 54-sample design. `results/year_robustness_beta10/` contains complete Type III ANOVA (70 tests), 90 Stage × Year Cabernet-minus-Pinot contrasts with BH FDR, observed cell profiles, diagnostics, ten plots and a priority-module classification. M10 satisfies the prespecified reproducibility rule. M5, M2, M3 and M1 are classified year-dependent at module level, but M5 Harvest and M2 Veraison/Harvest each retain significant same-direction contrasts in all three years. M3 Harvest is dominated in magnitude by 2013, and M1 is not established as stable. The M5 Veraison 2012 contrast is sensitive to the flagged sample GSM2627837. No sample was removed from the primary analysis. The current cumulative report still ends with the earlier post-CEMiTool statistical layer; T-004 findings are in separate results and documentation, not yet integrated into that report.

### T-005 functional enrichment

T-005 is complete with annotation limitations documented in `docs/T005_FUNCTIONAL_ENRICHMENT.md`. Scripts 10 and 11 use pinned Grapedia sources, audited one-to-one legacy-ID equivalences, and full module-wide hypergeometric ORA with BH FDR. Versioned gene–term subsets are in `data/reference/grapedia_t005/`; full results and QC are in `results/functional_enrichment_beta10/`. MapMan v3 is primary (2.608/3.050 beta10 genes annotated); newer T2T v5.1 MapMan and GO are secondary because their mapped coverage is 1.305 and 519 genes. M5 is enriched for phenolic/stilbenoid and PAL categories under v3, including the predefined phenylpropanoid theme, but v5.1 assigns many of the same genes to CHS/flavonoid categories, so exact functional identity is unresolved. M10 has no FDR-global enrichment despite 36/39 v3 coverage. Cuticle/wax, pectin, cellulose/hemicellulose, lignin and anthocyanin themes were not established in the priority modules; epidermis was not testable in these MapMan taxonomies. Enrichment is module-wide and must not be presented as identifying the drivers of a specific year/stage contrast or skin thickness.

## Immediate pending work

1. T-006: hub-gene prioritization within the robust or repeated module components, with the M5 v3/v5 functional-label conflict and T-004 seasonal caveats explicit.
2. Then T-007 skin-only external validation. T-008 modern reprocessing and T-009 integrated report/manuscript remain future work. The current cumulative report has not yet integrated T-004/T-005.

## Important boundary

No current result demonstrates skin thickness causality. The study is identifying cultivar-development transcriptional programs that may later be connected to skin-relevant biology and validated in independent skin-only datasets.
