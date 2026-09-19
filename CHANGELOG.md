# Changelog

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
