# Current state

Last consolidated context update: 2026-09-20.

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

## Immediate pending work

1. Run/verify `08_update_report_with_module_statistics.R` locally so the main report includes post-CEMiTool statistics. The script/template have been audited and updated for the post-migration canonical layout (`results/comparisons`, `reports/current`, `reports/archive`, `reports/templates`, `results/beta10`).
2. Inspect the already-produced QC/statistical files:
   - `module_eigengene_qc.tsv`
   - `module_model_diagnostics.tsv`
   - `module_eigengenes_with_metadata_54.tsv`
   - `cabernet_vs_pinot_within_each_stage.tsv`
3. Build the next analysis script for year robustness:
   - `Eigengene ~ Cultivar * Stage * Year`
   - Cabernet vs Pinot within Stage × Year
4. Only after that, move to biological annotation/enrichment and hubs.

## Important boundary

No current result demonstrates skin thickness causality. The study is identifying cultivar-development transcriptional programs that may later be connected to skin-relevant biology and validated in independent skin-only datasets.
