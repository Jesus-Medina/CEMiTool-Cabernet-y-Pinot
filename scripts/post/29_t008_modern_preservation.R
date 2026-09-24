# T-008 final comparison: modern Salmon/count normalization versus the frozen
# historical log2(RPKM+1) beta10 modules. This script never reruns CEMiTool,
# changes module membership, or overwrites the historical baseline.

suppressPackageStartupMessages({
  library(data.table)
  library(car)
  library(emmeans)
  library(ggplot2)
  library(WGCNA)
})

options(stringsAsFactors = FALSE, contrasts = c("contr.sum", "contr.poly"))
set.seed(1234)

root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
if (!file.exists(file.path(root, "AGENTS.md")) || !dir.exists(file.path(root, ".git"))) {
  stop("Run from the canonical repository root")
}

result_root <- file.path(root, "results", "fastq_reprocessing_t008")
out <- Sys.getenv(
  "T008_PRESERVATION_OUTPUT_DIR",
  unset = file.path(result_root, "modern_preservation")
)
out <- normalizePath(out, winslash = "/", mustWork = FALSE)
if (!startsWith(out, paste0(normalizePath(result_root, winslash = "/"), "/"))) {
  stop("Preservation output must remain under results/fastq_reprocessing_t008")
}
tmp <- paste0(out, ".part")
if (dir.exists(out) || dir.exists(tmp)) stop("Refusing to overwrite preservation output")
dir.create(tmp, recursive = TRUE)
on.exit({ if (dir.exists(tmp)) unlink(tmp, recursive = TRUE, force = TRUE) }, add = TRUE)

read_matrix <- function(path, id_col) {
  x <- fread(path, check.names = FALSE, showProgress = FALSE)
  ids <- x[[id_col]]
  if (anyNA(ids) || anyDuplicated(ids)) stop("Invalid or duplicated matrix IDs: ", path)
  x[, (id_col) := NULL]
  m <- as.matrix(x)
  storage.mode(m) <- "double"
  rownames(m) <- ids
  if (any(!is.finite(m))) stop("Non-finite matrix value: ", path)
  m
}

pc1_score <- function(x) {
  if (nrow(x) < 2L) stop("PC1 requires at least two genes")
  keep <- apply(x, 1, sd) > 0
  if (sum(keep) < 2L) stop("Too few variable genes for PC1")
  p <- prcomp(t(x[keep, , drop = FALSE]), center = TRUE, scale. = TRUE)
  score <- p$x[, 1]
  mean_profile <- colMeans(x[keep, , drop = FALSE])
  if (cor(score, mean_profile) < 0) score <- -score
  list(score = score, variance = summary(p)$importance[2, 1], genes = sum(keep))
}

safe_cor <- function(x, y, method = "pearson") {
  if (sd(x) == 0 || sd(y) == 0) return(NA_real_)
  unname(cor(x, y, method = method))
}

signed_agreement <- function(x, y) {
  keep <- is.finite(x) & is.finite(y) & x != 0 & y != 0
  if (!any(keep)) return(NA_real_)
  mean(sign(x[keep]) == sign(y[keep]))
}

samples <- fread(file.path(root, "data", "metadata", "samples.tsv"))
stopifnot(nrow(samples) == 54L, uniqueN(samples$GSM) == 54L)
sample_ids <- samples$GSM
samples[, Cultivar := factor(Cultivar, levels = c("Cabernet Sauvignon", "Pinot noir"))]
samples[, Stage := factor(Stage, levels = c("FruitSet", "Veraison", "Harvest"))]
samples[, Year := factor(Year, levels = c("2012", "2013", "2014"))]

legacy <- read_matrix(file.path(root, "data", "processed", "expression_log2rpkm.tsv"), "gene_id")
modern <- read_matrix(file.path(result_root, "modern_gene_log2_median_ratio_counts_54.tsv.gz"), "Gene")
counts <- read_matrix(file.path(result_root, "modern_gene_estimated_counts_54.tsv.gz"), "Gene")
if (!identical(colnames(legacy), sample_ids) || !identical(colnames(modern), sample_ids) ||
    !identical(colnames(counts), sample_ids)) stop("Sample order differs across matrices/metadata")

mapping <- fread(file.path(root, "data", "reference", "grapedia_t005", "v1_to_v5_reciprocal50.tsv"))
membership <- fread(file.path(root, "results", "beta10", "tables", "module.tsv"))
setnames(membership, c("genes", "modules"), c("V1_gene", "Module"))
if (anyDuplicated(mapping$V1_gene) || anyDuplicated(mapping$Annotation_gene)) stop("Mapping is not one-to-one")
mapped <- merge(membership, mapping, by = "V1_gene", all = FALSE)
mapped <- mapped[V1_gene %in% rownames(legacy) & Annotation_gene %in% rownames(modern)]
setorder(mapped, Module, V1_gene)
if (nrow(mapped) != 1922L) stop("Expected 1,922 comparable beta10 genes; observed ", nrow(mapped))

legacy_m <- legacy[mapped$V1_gene, , drop = FALSE]
modern_m <- modern[mapped$Annotation_gene, , drop = FALSE]
rownames(modern_m) <- mapped$V1_gene
modern_count_m <- counts[mapped$Annotation_gene, , drop = FALSE]
rownames(modern_count_m) <- mapped$V1_gene

# Gene-profile concordance across the same 54 biological samples.
profile <- mapped[, .(V1_gene, V5_gene = Annotation_gene, Min_gene_overlap_percent, Module)]
profile[, Pearson_54 := vapply(seq_len(.N), function(i) safe_cor(legacy_m[i, ], modern_m[i, ]), numeric(1))]
profile[, Spearman_54 := vapply(seq_len(.N), function(i) safe_cor(legacy_m[i, ], modern_m[i, ], "spearman"), numeric(1))]
profile[, Legacy_SD := apply(legacy_m, 1, sd)]
profile[, Modern_SD := apply(modern_m, 1, sd)]

# Per-sample agreement across comparable genes is useful for detecting sample
# swaps or gross processing inconsistencies without equating platforms/scales.
sample_agreement <- copy(samples[, .(SampleName, GSM, Cultivar, Stage, Year, Replicate)])
sample_agreement[, Pearson_across_genes := vapply(seq_along(sample_ids), function(j)
  safe_cor(legacy_m[, j], modern_m[, j]), numeric(1))]
sample_agreement[, Spearman_across_genes := vapply(seq_along(sample_ids), function(j)
  safe_cor(legacy_m[, j], modern_m[, j], "spearman"), numeric(1))]

# Recompute eigengenes on the identical mapped subset in each processing layer,
# and compare them with the original all-gene canonical beta10 eigengene.
canonical <- fread(file.path(root, "results", "module_statistics_beta10", "module_eigengenes_with_metadata_54.tsv"))
if (!identical(canonical$GSM, sample_ids)) stop("Canonical eigengene sample order differs")
modules <- paste0("M", 1:10)
eig_rows <- list()
eig_long <- list()
contrast_rows <- list()
anova_rows <- list()

for (mod in modules) {
  idx <- which(mapped$Module == mod)
  if (length(idx) < 2L) stop("Too few mapped genes for ", mod)
  lp <- pc1_score(legacy_m[idx, , drop = FALSE])
  mp <- pc1_score(modern_m[idx, , drop = FALSE])
  canon <- canonical[[mod]]
  eig_rows[[mod]] <- data.table(
    Module = mod, Total_beta10_genes = sum(membership$Module == mod), Mapped_genes = length(idx),
    Mapped_fraction = length(idx) / sum(membership$Module == mod),
    Variable_mapped_genes = mp$genes, Legacy_mapped_PC1_variance = lp$variance,
    Modern_mapped_PC1_variance = mp$variance,
    Modern_vs_legacy_mapped_PC1_Pearson = safe_cor(mp$score, lp$score),
    Modern_vs_canonical_full_PC1_Pearson = safe_cor(mp$score, canon),
    Legacy_mapped_vs_canonical_full_PC1_Pearson = safe_cor(lp$score, canon)
  )
  for (source in c("Legacy_mapped", "Modern")) {
    value <- if (source == "Legacy_mapped") lp$score else mp$score
    dat <- copy(samples)
    dat[, Eigengene := value]
    eig_long[[paste(mod, source)]] <- data.table(
      GSM = sample_ids, Module = mod, Source = source, Eigengene = value,
      Cultivar = as.character(dat$Cultivar), Stage = as.character(dat$Stage), Year = as.character(dat$Year)
    )
    fit <- lm(Eigengene ~ Cultivar * Stage * Year, data = dat)
    aa <- as.data.table(car::Anova(fit, type = 3), keep.rownames = "Effect")
    setnames(aa, c("Pr(>F)"), c("P_value"), skip_absent = TRUE)
    aa <- aa[Effect != "(Intercept)", .(Module = mod, Source = source, Effect,
                                         Df, F_value = `F value`, P_value)]
    anova_rows[[paste(mod, source)]] <- aa
    em <- emmeans(fit, ~ Cultivar | Stage * Year)
    cc <- as.data.table(contrast(em, method = list(Cabernet_minus_Pinot = c(1, -1))))
    contrast_rows[[paste(mod, source)]] <- cc[, .(
      Module = mod, Source = source, Stage = as.character(Stage), Year = as.character(Year),
      Estimate_CS_minus_PN = estimate, SE, df, t_ratio = t.ratio, P_value = p.value
    )]
  }
}

eig_summary <- rbindlist(eig_rows)
eig_values <- rbindlist(eig_long)
module_contrasts <- rbindlist(contrast_rows)
module_anova <- rbindlist(anova_rows)
module_anova[, FDR_within_source_effect := p.adjust(P_value, method = "BH"), by = .(Source, Effect)]
module_contrasts[, FDR_within_source := p.adjust(P_value, method = "BH"), by = Source]

contrast_wide <- dcast(module_contrasts, Module + Stage + Year ~ Source,
                       value.var = "Estimate_CS_minus_PN")
contrast_concordance <- contrast_wide[, .(
  StageYear_contrast_Pearson = safe_cor(Legacy_mapped, Modern),
  StageYear_sign_agreement = signed_agreement(Legacy_mapped, Modern),
  Same_direction_cells = sum(sign(Legacy_mapped) == sign(Modern) & Legacy_mapped != 0 & Modern != 0),
  Compared_cells = sum(is.finite(Legacy_mapped) & is.finite(Modern))
), by = Module]
eig_summary <- merge(eig_summary, contrast_concordance, by = "Module", all.x = TRUE)

# Descriptive fixed-membership network concordance for each module.
network_rows <- list()
for (mod in modules) {
  idx <- which(mapped$Module == mod)
  lc <- cor(t(legacy_m[idx, , drop = FALSE]))
  mc <- cor(t(modern_m[idx, , drop = FALSE]))
  upper <- upper.tri(lc)
  la <- abs(lc[upper])^10
  ma <- abs(mc[upper])^10
  network_rows[[mod]] <- data.table(
    Module = mod, Comparable_genes = length(idx), Pairs = sum(upper),
    Correlation_matrix_Pearson = safe_cor(lc[upper], mc[upper]),
    Correlation_matrix_Spearman = safe_cor(lc[upper], mc[upper], "spearman"),
    Adjacency_beta10_Pearson = safe_cor(la, ma),
    Adjacency_beta10_Spearman = safe_cor(la, ma, "spearman"),
    Legacy_mean_adjacency = mean(la), Modern_mean_adjacency = mean(ma),
    Modern_to_legacy_mean_adjacency_ratio = mean(ma) / mean(la)
  )
}
network_summary <- rbindlist(network_rows)

# WGCNA's permutation-based preservation statistic supplies the conventional
# Zsummary interpretation (>10 strong, 2-10 moderate, <2 no evidence).
module_number <- setNames(seq_along(modules), modules)
colors <- unname(module_number[mapped$Module])
multi_expr <- list(Legacy = list(data = t(legacy_m)), Modern = list(data = t(modern_m)))
multi_color <- list(Legacy = colors, Modern = colors)
pres <- modulePreservation(
  multi_expr, multi_color, referenceNetworks = 1, nPermutations = 200,
  randomSeed = 1234, networkType = "unsigned", quickCor = 0,
  savePermutedStatistics = FALSE, verbose = 2
)
z <- as.data.table(pres$preservation$Z$ref.Legacy$inColumnsAlsoPresentIn.Modern,
                   keep.rownames = "Module_number")
obs <- as.data.table(pres$preservation$observed$ref.Legacy$inColumnsAlsoPresentIn.Modern,
                     keep.rownames = "Module_number")
z[, Module_number := as.integer(Module_number)]
obs[, Module_number := as.integer(Module_number)]
preservation <- merge(z, obs, by = "Module_number", suffixes = c("_Z", "_observed"))
preservation[, Module := names(module_number)[match(Module_number, module_number)]]
preservation <- preservation[!is.na(Module)]
preservation[, Preservation_class := fifelse(Zsummary.pres >= 10, "strong",
                                      fifelse(Zsummary.pres >= 2, "moderate", "not_supported"))]
setcolorder(preservation, c("Module", "Module_number", setdiff(names(preservation), c("Module", "Module_number"))))

eig_summary <- Reduce(function(x, y) merge(x, y, by = "Module", all.x = TRUE),
                      list(eig_summary, network_summary,
                           preservation[, .(Module, Zsummary_preservation = Zsummary.pres,
                                             MedianRank_preservation = medianRank.pres,
                                             Preservation_class)]))
# Some one-element correlation results retain a matrix dimension attribute;
# data.table protects those names during merge with a `.V1` suffix. Normalize
# the affected scalar-column names before downstream summaries and exports.
setnames(eig_summary, sub("\\.V1$", "", names(eig_summary)))

# Priority-gene and hub-specific direction checks.
m5 <- fread(file.path(root, "results", "hub_prioritization_beta10", "m5_full_hub_ranking.tsv"))
m10m2 <- fread(file.path(root, "results", "hub_prioritization_beta10", "m10_m2_full_hub_ranking.tsv"))
m5[, Module := "M5"]
priority_rank <- rbindlist(list(
  m5[, .(Module, Gene, Rank_kWithin, Top_decile_kWithin, V5_gene,
          Family_conflict = V3_V5_STS_CHS_label_conflict)],
  m10m2[, .(Module, Gene, Rank_kWithin, Top_decile_kWithin, V5_gene,
             Family_conflict = FALSE)]
), fill = TRUE)
priority_rank[, Mapped_for_T008 := Gene %in% mapped$V1_gene]
priority_rank <- merge(priority_rank, profile[, .(Gene = V1_gene, Pearson_54, Spearman_54)],
                       by = "Gene", all.x = TRUE)

priority_modules <- c("M5", "M10", "M2")
priority_mapped <- mapped[Module %in% priority_modules]
gene_contrast_rows <- list()
for (i in seq_len(nrow(priority_mapped))) {
  gene <- priority_mapped$V1_gene[i]
  for (stage in levels(samples$Stage)) for (year in levels(samples$Year)) {
    cs <- samples$Stage == stage & samples$Year == year & samples$Cultivar == "Cabernet Sauvignon"
    pn <- samples$Stage == stage & samples$Year == year & samples$Cultivar == "Pinot noir"
    gene_contrast_rows[[length(gene_contrast_rows) + 1L]] <- data.table(
      Module = priority_mapped$Module[i], V1_gene = gene,
      V5_gene = priority_mapped$Annotation_gene[i], Stage = stage, Year = year,
      Legacy_CS_minus_PN = mean(legacy[gene, cs]) - mean(legacy[gene, pn]),
      Modern_CS_minus_PN = mean(modern[priority_mapped$Annotation_gene[i], cs]) -
        mean(modern[priority_mapped$Annotation_gene[i], pn])
    )
  }
}
priority_contrasts <- rbindlist(gene_contrast_rows)
priority_contrasts[, Same_direction := sign(Legacy_CS_minus_PN) == sign(Modern_CS_minus_PN) &
                       Legacy_CS_minus_PN != 0 & Modern_CS_minus_PN != 0]

hub_summary <- priority_rank[, .(
  Total_genes = .N, Mapped_genes = sum(Mapped_for_T008), Mapped_fraction = mean(Mapped_for_T008),
  Median_profile_Pearson = median(Pearson_54, na.rm = TRUE),
  Top_decile_genes = sum(Top_decile_kWithin),
  Top_decile_mapped = sum(Top_decile_kWithin & Mapped_for_T008),
  Top_decile_median_profile_Pearson = median(Pearson_54[Top_decile_kWithin], na.rm = TRUE)
), by = Module]

m5_family <- priority_rank[Module == "M5" & Family_conflict == TRUE]
m5_family <- merge(m5_family, priority_contrasts[Stage == "Harvest"],
                   by.x = c("Module", "Gene", "V5_gene"),
                   by.y = c("Module", "V1_gene", "V5_gene"), all.x = TRUE)

m2_hubs <- priority_rank[Module == "M2" & Top_decile_kWithin == TRUE & Mapped_for_T008 == TRUE]
m2_zero_rows <- list()
for (i in seq_len(nrow(m2_hubs))) {
  g <- m2_hubs$Gene[i]
  v5 <- m2_hubs$V5_gene[i]
  for (stage in levels(samples$Stage)) for (year in levels(samples$Year)) for (cultivar in levels(samples$Cultivar)) {
    sel <- samples$Stage == stage & samples$Year == year & samples$Cultivar == cultivar
    m2_zero_rows[[length(m2_zero_rows) + 1L]] <- data.table(
      Gene = g, V5_gene = v5, Rank_kWithin = m2_hubs$Rank_kWithin[i],
      Cultivar = cultivar, Stage = stage, Year = year,
      Modern_exact_zero_fraction = mean(counts[v5, sel] == 0),
      Modern_mean_estimated_counts = mean(counts[v5, sel])
    )
  }
}
m2_zero <- rbindlist(m2_zero_rows)

# Modern sample-level PCA and technical-factor checks.
vars <- apply(modern, 1, var)
top <- order(vars, decreasing = TRUE)[seq_len(min(5000L, length(vars)))]
pca <- prcomp(t(modern[top, , drop = FALSE]), center = TRUE, scale. = TRUE)
pca_variance <- summary(pca)$importance[2, ]
pca_table <- cbind(samples[, .(SampleName, GSM, Cultivar = as.character(Cultivar),
                                Stage = as.character(Stage), Year = as.character(Year), Replicate)],
                   as.data.table(pca$x[, 1:10, drop = FALSE]))
sample_qc <- fread(file.path(result_root, "modern_sample_qc_54.tsv"))
sample_qc <- merge(sample_qc, sample_agreement[, .(GSM, Pearson_across_genes, Spearman_across_genes)],
                   by = "GSM", all.x = TRUE, sort = FALSE)
sample_qc <- merge(sample_qc, pca_table[, .(GSM, PC1, PC2)], by = "GSM", all.x = TRUE, sort = FALSE)

qc_models <- list(Percent_mapped = as.numeric(sample_qc$Percent_mapped),
                  log2_size_factor = log2(as.numeric(sample_qc$Median_ratio_size_factor)),
                  PC1 = sample_qc$PC1, PC2 = sample_qc$PC2)
qc_factor_rows <- list()
model_data <- copy(samples)
for (metric in names(qc_models)) {
  model_data[, Response := qc_models[[metric]][match(GSM, sample_qc$GSM)]]
  fit <- lm(Response ~ Cultivar * Stage + Year, data = model_data)
  aa <- as.data.table(car::Anova(fit, type = 3), keep.rownames = "Effect")
  setnames(aa, "Pr(>F)", "P_value")
  qc_factor_rows[[metric]] <- aa[Effect != "(Intercept)", .(
    Metric = metric, Effect, Df, F_value = `F value`, P_value
  )]
}
qc_factor <- rbindlist(qc_factor_rows)
qc_factor[, FDR_within_metric := p.adjust(P_value, method = "BH"), by = Metric]

# Output tables.
fwrite(profile, file.path(tmp, "mapped_gene_profile_concordance.tsv.gz"), sep = "\t", na = "NA")
fwrite(sample_agreement, file.path(tmp, "sample_legacy_modern_agreement.tsv"), sep = "\t", na = "NA")
fwrite(eig_summary, file.path(tmp, "module_preservation_summary.tsv"), sep = "\t", na = "NA")
fwrite(preservation, file.path(tmp, "wgcna_module_preservation_full.tsv"), sep = "\t", na = "NA")
fwrite(eig_values, file.path(tmp, "mapped_module_eigengenes_54.tsv.gz"), sep = "\t", na = "NA")
fwrite(module_anova, file.path(tmp, "modern_vs_legacy_module_anova.tsv"), sep = "\t", na = "NA")
fwrite(module_contrasts, file.path(tmp, "modern_vs_legacy_module_stage_year_contrasts.tsv"), sep = "\t", na = "NA")
fwrite(priority_rank, file.path(tmp, "priority_gene_profile_summary.tsv"), sep = "\t", na = "NA")
fwrite(hub_summary, file.path(tmp, "priority_module_hub_summary.tsv"), sep = "\t", na = "NA")
fwrite(priority_contrasts, file.path(tmp, "priority_gene_stage_year_contrasts.tsv.gz"), sep = "\t", na = "NA")
fwrite(m5_family, file.path(tmp, "m5_chs_sts_family_harvest_validation.tsv"), sep = "\t", na = "NA")
fwrite(m2_zero, file.path(tmp, "m2_hub_zero_rate_modern_validation.tsv"), sep = "\t", na = "NA")
fwrite(pca_table, file.path(tmp, "modern_sample_pca.tsv"), sep = "\t", na = "NA")
fwrite(sample_qc, file.path(tmp, "modern_sample_qc_with_concordance.tsv"), sep = "\t", na = "NA")
fwrite(qc_factor, file.path(tmp, "modern_sample_qc_factor_tests.tsv"), sep = "\t", na = "NA")
fwrite(data.table(PC = names(pca_variance), Variance_fraction = as.numeric(pca_variance)),
       file.path(tmp, "modern_sample_pca_variance.tsv"), sep = "\t")

# Figures are diagnostics, not independent inferential evidence.
p_pca <- ggplot(pca_table, aes(PC1, PC2, color = Cultivar, shape = Stage)) +
  geom_point(size = 3) + facet_wrap(~Year) + theme_bw(base_size = 11) +
  labs(title = "T-008 modern-expression PCA (top 5,000 variable genes)",
       x = sprintf("PC1 (%.1f%%)", 100 * pca_variance[1]),
       y = sprintf("PC2 (%.1f%%)", 100 * pca_variance[2]))
ggsave(file.path(tmp, "modern_sample_pca.pdf"), p_pca, width = 10, height = 5.5)
ggsave(file.path(tmp, "modern_sample_pca.png"), p_pca, width = 10, height = 5.5, dpi = 180)

p_pres <- ggplot(eig_summary, aes(reorder(Module, Zsummary_preservation), Zsummary_preservation,
                                   fill = Preservation_class)) +
  geom_col() + coord_flip() + geom_hline(yintercept = c(2, 10), linetype = "dashed") +
  theme_bw(base_size = 11) + labs(x = NULL, y = "WGCNA Zsummary", title = "Fixed beta10 module preservation")
ggsave(file.path(tmp, "module_preservation_zsummary.pdf"), p_pres, width = 7.5, height = 5.5)
ggsave(file.path(tmp, "module_preservation_zsummary.png"), p_pres, width = 7.5, height = 5.5, dpi = 180)

plot_contrasts <- module_contrasts[Module %in% priority_modules]
p_con <- ggplot(plot_contrasts, aes(Year, Estimate_CS_minus_PN, color = Source, group = Source)) +
  geom_hline(yintercept = 0, color = "grey70") + geom_point() + geom_line() +
  facet_grid(Module ~ Stage, scales = "free_y") + theme_bw(base_size = 10) +
  labs(title = "Cabernet minus Pinot: mapped-module PC1", y = "Eigengene contrast", x = "Year")
ggsave(file.path(tmp, "priority_module_stage_year_contrasts.pdf"), p_con, width = 11, height = 8)
ggsave(file.path(tmp, "priority_module_stage_year_contrasts.png"), p_con, width = 11, height = 8, dpi = 180)

qc <- data.table(
  Metric = c("Samples", "Comparable_beta10_genes", "Modules", "Priority_modules",
             "Finite_gene_profile_correlations", "WGCNA_permutations", "Output_validation"),
  Value = c(54, nrow(mapped), length(modules), length(priority_modules),
            sum(is.finite(profile$Pearson_54)), 200, "PASS")
)
fwrite(qc, file.path(tmp, "preservation_qc.tsv"), sep = "\t")

priority_text <- eig_summary[Module %in% priority_modules,
  sprintf("%s: mapped=%d/%d; Zsummary=%.3f (%s); eigengene_cor=%.3f; adjacency_spearman=%.3f; sign_agreement=%.3f",
          Module, Mapped_genes, Total_beta10_genes, Zsummary_preservation, Preservation_class,
          Modern_vs_legacy_mapped_PC1_Pearson, Adjacency_beta10_Spearman, StageYear_sign_agreement)]
summary_lines <- c(
  "T-008 modern raw-read reprocessing preservation analysis",
  "historical_baseline=unchanged log2(RPKM+1) beta10 modules",
  "modern_layer=Salmon 1.12.1 estimated counts; median-ratio factors; log2(normalized_count+1)",
  "comparable_gene_rule=audited reciprocal one-to-one legacy-to-T2T-v5.1 mapping only",
  sprintf("samples=54; comparable_beta10_genes=%d", nrow(mapped)),
  "module_preservation=WGCNA fixed-membership permutation test; unsigned; 200 permutations; seed=1234",
  "WGCNA_interpretation=Zsummary>10 strong; 2-10 moderate; <2 not supported",
  priority_text,
  sprintf("mapping_percent_range=%.3f..%.3f", min(as.numeric(sample_qc$Percent_mapped)),
          max(as.numeric(sample_qc$Percent_mapped))),
  sprintf("median_sample_spearman_across_comparable_genes=%.3f",
          median(sample_agreement$Spearman_across_genes)),
  "limits=no unmapped gene is called absent; same tissue remains pericarp; no skin-thickness phenotype; CHS/STS identity remains unresolved; module preservation is not causality"
)
writeLines(summary_lines, file.path(tmp, "analysis_summary.txt"), useBytes = TRUE)

if (!all(file.exists(file.path(tmp, c("module_preservation_summary.tsv", "preservation_qc.tsv",
                                     "analysis_summary.txt", "modern_sample_pca.pdf"))))) {
  stop("Required preservation outputs missing")
}
if (!file.rename(tmp, out)) stop("Could not atomically promote preservation output")
cat("T-008 modern preservation analysis PASS\n")
