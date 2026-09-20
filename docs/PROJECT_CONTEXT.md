# Project context

## Why this project exists

The project started as a CEMiTool/RStudio analysis of grapevine transcriptomic data with an interest in biological differences between Cabernet Sauvignon and Pinot noir, especially processes potentially relevant to berry skin.

The scientific framing was progressively tightened to avoid an unsupported shortcut:

> Cabernet = thick skin, Pinot = thin skin, therefore every expression difference is a skin-thickness mechanism.

That inference is not valid from GSE98923 alone.

The current goal is to identify **coexpression programs whose developmental behavior differs between cultivars**, then prioritize modules/genes with skin-relevant biology and validate them externally.

## Primary source

Dataset:

- GEO: GSE98923
- BioProject: PRJNA386889
- SRA: SRP107227
- processed matrix used in the baseline: `GSE98923_RPKM_2012-2013-2014_controls.txt.gz`

Reference study: Fasoli et al., 2018, on molecular events associated with grape berry ripening onset.

The original study already used WGCNA. Therefore the novelty of this project cannot simply be "we found coexpression modules".

Potential contribution comes from:

- explicit Cabernet vs Pinot cultivar-stage contrasts;
- preservation of year/vintage;
- module-level factorial models;
- targeted skin-process prioritization;
- current annotation/reprocessing;
- external skin-only validation;
- hub-gene prioritization.

## Tissue caveat

The analyzed material is berry pericarp after seed removal.

Skin is included, but the experiment is **not skin-only**.

Therefore:

- cuticle/wax/cell-wall signals may be biologically interesting;
- they are not automatically skin-specific;
- independent skin transcriptomes are needed later.

## Exact baseline design

Balanced design:

2 cultivars × 3 stages × 3 years × 3 biological replicates = 54 samples.

Classes:

- CS_FruitSet
- CS_Veraison
- CS_Harvest
- PN_FruitSet
- PN_Veraison
- PN_Harvest

### Exact GSM selection

Cabernet Sauvignon 2012:
- FS GSM2627691-93
- V GSM2627709, GSM2627711, GSM2627713
- H GSM2627739-41

Cabernet Sauvignon 2013:
- FS GSM2627742-44
- V GSM2627754-56
- H GSM2627781-83

Cabernet Sauvignon 2014:
- FS GSM2627784-86
- V GSM2627793-95
- H GSM2627820-22

Pinot noir 2012:
- FS GSM2627823-25
- V GSM2627835-37
- H GSM2627850-52

Pinot noir 2013:
- FS GSM2627853-55
- V GSM2627862-64
- H GSM2627883-85

Pinot noir 2014:
- FS GSM2627886-88
- V GSM2627895-97
- H GSM2627919-21

Véraison is anchored by GEO samples with `day after veraison = 0`.

FruitSet and Harvest are protocol-derived stage assignments. Harvest corresponds to the terminal maturity/harvest part of the sampling protocol.

## Why 54 and not all 219 as "replicates"

The full series contains many developmental timepoints.

Those timepoints are not biological replicates of FruitSet/Veraison/Harvest.

The 219-sample trajectory may later be useful for exploratory/sensitivity temporal analysis, but it should not artificially inflate N for the main stage comparison.

## Baseline preprocessing

Current main preprocessing:

- processed GEO RPKM matrix
- `log2(RPKM + 1)`
- CEMiTool filtering enabled
- filter_pval = 0.1
- apply_vst = FALSE
- Pearson correlation
- unsigned network
- signed TOM
- merge_similar = TRUE
- min_ngen = 30
- seed = 1234

Input gene count before CEMiTool filtering: ~29,971.
Filtered network gene set: 3,050.

## Beta history

### Initial beta 7

The initial workflow used CEMiTool's force-beta behavior and selected beta 7.

This was treated as a result to audit, not as final justification.

The network was then reproduced explicitly with:

```r
set_beta = 7
force_beta = FALSE
```

Metrics:

- beta = 7
- R² = 0.549579273382905
- groups reported = 9
- biological modules = 8
- Not.Correlated = 17 genes

Module sizes:

- M1 2340
- M2 224
- M3 112
- M4 106
- M5 98
- M6 71
- M7 42
- M8 40
- Not.Correlated 17

### Beta 10

Beta 10 was then tested explicitly:

```r
set_beta = 10
force_beta = FALSE
```

Metrics:

- R² = 0.706374247063269
- groups reported = 11
- biological modules = 10
- Not.Correlated = 57 genes

Module sizes:

- M1 2167
- M2 214
- M3 131
- M4 122
- M5 108
- M6 68
- M7 54
- M8 48
- M9 42
- M10 39
- Not.Correlated 57

The beta diagnostic curve did not cleanly reach an R² = 0.8 threshold in the useful region; beta choice is therefore treated as a tradeoff between fit and connectivity, not a magic threshold.

## Beta 7 vs beta 10 preservation

Modules were compared by actual gene membership.

Best beta7 -> beta10 matches:

- M1 -> M1: 2150 shared; Jaccard 0.912; 91.88% beta7 retained
- M2 -> M2: 203 shared; Jaccard 0.864; 90.63%
- M3 -> M3: 105 shared; Jaccard 0.761; 93.75%
- M4 -> M5: 101 shared; Jaccard 0.894; 95.28%
- M5 -> M4: 91 shared; Jaccard 0.705; 92.86%
- M6 -> M8: 46 shared; Jaccard 0.630; 64.79%
- M7 -> M10: 34 shared; Jaccard 0.723; 80.95%
- M8 -> M9: 40 shared; Jaccard 0.952; 100%

This supports beta10 as the primary network while preserving beta7 as sensitivity evidence.

Module labels are not assumed homologous across runs.

## Factorial statistics

A post-CEMiTool script computes one module eigengene per beta10 module using PC1 of standardized module-gene expression.

The PC1 sign is aligned with mean module expression for easier direction interpretation.

Model:

```
Eigengene ~ Cultivar * Stage + Year
```

Type III ANOVA with sum-to-zero contrasts.
Benjamini-Hochberg FDR.

Five modules have significant Cultivar × Stage interaction:

- M5
- M10
- M2
- M3
- M1

M5 is the strongest.

Year is significant in most modules, so the additive Year correction is not the end of the robustness story.

## Scientific interpretation strategy

The intended evidence ladder is:

```
network module
    ∩
Cultivar × Stage effect
    ∩
reproducible across years
    ∩
skin-relevant functional enrichment
    ∩
hub-gene relevance
    ∩
skin-only external validation
    ∩
robustness to modern reprocessing
```

Only candidates that survive multiple layers should be highlighted strongly.

## Skin-relevant functional themes to inspect later

Examples:

- cuticle/cutin/wax biosynthesis
- epidermal development
- cell wall organization
- pectin metabolism
- cellulose/hemicellulose
- lignification
- phenylpropanoid metabolism
- flavonoids
- anthocyanins

These themes are hypotheses/prioritization targets, not predeclared conclusions.

## External validation candidates

Do not merge these into the 54-sample baseline as if they were equivalent replicates.

Possible validation sources:

- GSE72421 — berry skin; includes Cabernet/Pinot in a different experimental context
- PRJNA260535 — skin-only multi-cultivar transcriptomics at maturity-related Brix levels

Related cluster-thinning datasets such as GSE101532/GSE104316 should not be mixed into the untreated baseline because the intervention changes ripening biology.

## Longer-term strengthening

A stronger publication-grade version should consider:

- raw FASTQ reprocessing;
- count-based normalization/VST/logCPM as appropriate;
- current PN40024 annotation;
- gene-ID modernization;
- module preservation against the current RPKM baseline;
- independent skin-only validation.

## Experimental confounding caution

Cabernet and Pinot samples differ in cultivar and also in clone/rootstock/planting history in the original experimental system.

Do not present cultivar as a perfectly isolated causal treatment.

## Core philosophy

The project should prefer a slower, auditable analysis over an attractive but overinterpreted result.

Every added analysis should answer a specific methodological or biological weakness already identified.
