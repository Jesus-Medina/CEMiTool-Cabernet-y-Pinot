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

---

## D-012 — Use version-aware functional enrichment with explicit mapping coverage

**Status:** active after T-005 (2026-09-21).

**Decision:** use Grapedia MapMan v3 as the primary ORA source for legacy `VIT_` beta10 genes, with PN40024 T2T v5.1 MapMan and GO as secondary checks. Accept only reciprocal one-to-one, same-strand mappings with ≥50 % gene overlap; report coverage per module and preserve all tested/non-tested terms. Apply BH globally across module–term tests within each source.

**Reason:** v3 MapMan covers 2.608/3.050 selected genes, including 36/39 M10, whereas v5.1 MapMan covers 1.305 and v5.1 GO only 519 after mapping. Newer annotations are valuable but too sparse for absence claims in key modules. M5's v3 stilbenoid and v5.1 CHS/flavonoid labels overlap on 16 genes; these are not independent confirmations of a precise biochemical function.

**Boundary:** enrichment describes whole modules, not stage-specific drivers, hubs, isolated skin, or causality. See `docs/T005_FUNCTIONAL_ENRICHMENT.md`.

---

## D-013 — Filter GO obsolescence by official ontology ID

**Status:** active after T-005A (2026-09-21).

**Decision:** for the Grapedia GO ORA, use the SHA-pinned GO ontology release
2026-07-26 `is_obsolete` field to exclude deprecated IDs before defining the
background or calculating p-values. Do not rely only on «obsolete» in a
Grapedia term name, and do not automatically transfer an obsolete annotation
to a proposed replacement. Preserve the earlier GO output for history, but
use `results/go_ora_beta10/` for subsequent inference.

**Reason:** 209 obsolete IDs among the beta10-linked Grapedia terms lacked
an obsolete label in their supplied name. Correcting this removes 520
testable module–term combinations; the six surviving hits are all M9.

**Boundary:** GO is an exploratory secondary source with only 519/3.050
beta10 genes annotated. A null GO result in a priority module is not evidence
that its biology is absent. See `docs/T005A_GO_ORA_ONTOLOGY_AUDIT.md`.

---

## D-014 — Priorizar hubs sin convertir centralidad ni anotación en mecanismo

**Status:** active after T-006 (2026-09-21).

**Decision:** use `kWithin`, the sum of off-diagonal intramodular weights in the frozen unsigned beta10 adjacency, as the primary hub metric. Keep the complete ranking and use top-decile membership only as a descriptive shortlist. Report signed eigengene correlation, leave-one-year-out ranking, the T-003 flagged-sample sensitivity and the family-removal profile as checks, not as replacements for the primary network.

**Reason:** eight of M5's top 11 hubs carry conflicting v3 stilbenoid versus v5.1 CHS labels on the same genes. Shared CHS/STS domains and a close chr16 reference-genome interval support a family-like block but cannot identify exact enzyme activity or establish a cultivar-specific expansion. A NAC TF is also central, but coexpression does not show direct regulation.

**Boundary:** no hub is a proven causal regulator, skin-specific gene or determinant of skin thickness. See `docs/T006_M5_HUB_PRIORITIZATION.md`.

**M10/M2 extension:** use the same metric on the unchanged graph, annotate both versions where mapping allows, and treat beta7 membership and year-omission stability as **internal** checks only. M2's highly asymmetric zeros in Cabernet require read-level/reference validation before mechanistic interpretation; missing v5.1 annotations cannot be replaced with invented functions. See `docs/T006_M10_M2_HUB_PRIORITIZATION.md`.

---

## D-015 — Keep external skin evidence separate and assay-aware

**Status:** active after T-007 (2026-09-21).

**Decision:** use the frozen T-006 priority list in two skin-only sources without pooling samples with GSE98923 or with one another. Prespecify GSE72421 well-watered and PRJNA260535 24 °Brix as the main Cabernet–Pinot comparisons, with water deficit and 20/22/26 °Brix as sensitivities. Use complete replicates only; never impute GEO missing cells or interpret genes absent from the filtered RNA-seq table as expression zero. Report assay coverage and BH families of 37 hubs and 361 prioritized genes separately.

**Reason:** platforms, years, vineyard conditions and developmental measures differ. RNA-seq retains only 8/22 M2 top hubs; family-specific microarray hybridization and V1 reference mapping remain unresolved. Two sources from the Nevada research program are external to GSE98923, but not wholly independent of each other.

**Boundary:** T-007 validates expression-direction evidence in isolated skin for individual candidates, not a causal skin-thickness pathway, exact CHS/STS identity or a new beta10 network. See `docs/T007_SKIN_ONLY_VALIDATION.md`.
