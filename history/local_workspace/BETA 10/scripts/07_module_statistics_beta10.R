# 07_module_statistics_beta10.R
# GSE98923 - Beta 10 primary network
#
# Purpose:
# 1) Compute one eigengene (PC1) per CEMiTool module for each of the 54 samples.
# 2) Merge module activity with Cultivar, Stage and Year metadata.
# 3) Test: Eigengene ~ Cultivar * Stage + Year
# 4) Run stage-specific Cabernet vs Pinot contrasts.
#
# This script DOES NOT rerun CEMiTool and DOES NOT modify the beta-10 network.

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

required_cran <- c("car", "emmeans")
missing_cran <- required_cran[
  !vapply(required_cran, requireNamespace, logical(1), quietly = TRUE)
]

if (length(missing_cran) > 0) {
  install.packages(missing_cran)
}

suppressPackageStartupMessages({
  library(CEMiTool)
})

# -------------------------------------------------------------------------
# 1. INPUTS
# -------------------------------------------------------------------------

cem_file <- file.path(project_dir, "results/objects/cemitool.rds")
expr_file <- file.path(project_dir, "data/processed/expression_log2rpkm.rds")
meta_file <- file.path(project_dir, "data/metadata/samples.tsv")

stopifnot(
  file.exists(cem_file),
  file.exists(expr_file),
  file.exists(meta_file)
)

cem <- readRDS(cem_file)
expr <- readRDS(expr_file)

meta <- read.delim(
  meta_file,
  sep = "\t",
  header = TRUE,
  stringsAsFactors = FALSE,
  check.names = FALSE
)

if (!identical(colnames(expr), meta$SampleName)) {
  stop("Sample order differs between expression matrix and metadata.")
}

# -------------------------------------------------------------------------
# 2. MODULE MEMBERSHIP
# -------------------------------------------------------------------------

mods <- CEMiTool::module_genes(cem)

module_col <- names(mods)[tolower(names(mods)) == "module"]
if (length(module_col) == 0) {
  module_col <- names(mods)[grepl("module", names(mods), ignore.case = TRUE)][1]
}

gene_col <- setdiff(names(mods), module_col)[1]

membership <- data.frame(
  Gene = as.character(mods[[gene_col]]),
  Module = as.character(mods[[module_col]]),
  stringsAsFactors = FALSE
)

membership <- membership[membership$Module != "Not.Correlated", , drop = FALSE]

modules <- sort(unique(membership$Module))

# -------------------------------------------------------------------------
# 3. COMPUTE MODULE EIGENGENES
# -------------------------------------------------------------------------
# For each module:
# - use genes present in the beta-10 expression matrix
# - standardize genes across samples
# - PC1 across samples = module eigengene
# - flip PC1 sign if needed so it correlates positively with mean module expression
#
# The sign of a PCA component is mathematically arbitrary; sign alignment only
# makes interpretation easier and does not change statistical significance.

eigengenes <- matrix(
  NA_real_,
  nrow = ncol(expr),
  ncol = length(modules),
  dimnames = list(colnames(expr), modules)
)

eigengene_qc <- list()

for (m in modules) {
  genes <- membership$Gene[membership$Module == m]
  genes <- intersect(genes, rownames(expr))

  if (length(genes) < 2) {
    warning("Skipping ", m, ": fewer than 2 genes found in expression matrix.")
    next
  }

  x <- as.matrix(expr[genes, , drop = FALSE])

  # Remove zero-variance genes before PCA.
  gene_sd <- apply(x, 1, sd, na.rm = TRUE)
  keep <- is.finite(gene_sd) & gene_sd > 0
  x <- x[keep, , drop = FALSE]

  if (nrow(x) < 2) {
    warning("Skipping ", m, ": fewer than 2 variable genes remain.")
    next
  }

  pca <- prcomp(
    t(x),
    center = TRUE,
    scale. = TRUE
  )

  pc1 <- as.numeric(pca$x[, 1])

  mean_expr <- colMeans(x, na.rm = TRUE)
  sign_cor <- suppressWarnings(cor(pc1, mean_expr, use = "pairwise.complete.obs"))

  if (is.finite(sign_cor) && sign_cor < 0) {
    pc1 <- -pc1
    sign_cor <- -sign_cor
  }

  eigengenes[, m] <- pc1

  eigengene_qc[[m]] <- data.frame(
    Module = m,
    Genes_assigned = sum(membership$Module == m),
    Genes_used_for_PCA = nrow(x),
    PC1_variance_percent = 100 * summary(pca)$importance[2, 1],
    Correlation_PC1_with_module_mean = sign_cor,
    stringsAsFactors = FALSE
  )
}

eigengene_qc <- do.call(rbind, eigengene_qc)

eigengene_df <- data.frame(
  SampleName = rownames(eigengenes),
  eigengenes,
  check.names = FALSE,
  stringsAsFactors = FALSE
)

# -------------------------------------------------------------------------
# 4. MERGE WITH EXPERIMENTAL DESIGN
# -------------------------------------------------------------------------

analysis_df <- merge(
  meta,
  eigengene_df,
  by = "SampleName",
  all.x = TRUE,
  sort = FALSE
)

analysis_df <- analysis_df[
  match(meta$SampleName, analysis_df$SampleName),
  ,
  drop = FALSE
]

analysis_df$Cultivar <- factor(
  analysis_df$Cultivar,
  levels = c("Pinot noir", "Cabernet Sauvignon")
)

analysis_df$Stage <- factor(
  analysis_df$Stage,
  levels = c("FruitSet", "Veraison", "Harvest")
)

analysis_df$Year <- factor(
  analysis_df$Year,
  levels = c("2012", "2013", "2014")
)

# -------------------------------------------------------------------------
# 5. OUTPUT DIRECTORIES
# -------------------------------------------------------------------------

out_dir <- file.path(project_dir, "results/module_statistics_beta10")
dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)

write.table(
  eigengene_df,
  file.path(out_dir, "module_eigengenes_54.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  analysis_df,
  file.path(out_dir, "module_eigengenes_with_metadata_54.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  eigengene_qc,
  file.path(out_dir, "module_eigengene_qc.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# -------------------------------------------------------------------------
# 6. FACTORIAL MODEL: Cultivar * Stage + Year
# -------------------------------------------------------------------------
# Sum-to-zero contrasts make Type III tests interpretable for the balanced
# factorial design. Year is included as a blocking/adjustment factor.

old_contrasts <- options("contrasts")
on.exit(options(old_contrasts), add = TRUE)
options(contrasts = c("contr.sum", "contr.poly"))

anova_results <- list()
stage_contrasts <- list()
model_diagnostics <- list()

for (m in modules) {
  if (!m %in% names(analysis_df)) {
    next
  }

  dat <- analysis_df[
    ,
    c("SampleName", "Cultivar", "Stage", "Year", m),
    drop = FALSE
  ]

  names(dat)[5] <- "Eigengene"
  dat <- dat[complete.cases(dat), , drop = FALSE]

  fit <- lm(
    Eigengene ~ Cultivar * Stage + Year,
    data = dat
  )

  a3 <- car::Anova(fit, type = 3)
  a3_df <- as.data.frame(a3)
  a3_df$Effect <- rownames(a3_df)
  rownames(a3_df) <- NULL
  a3_df$Module <- m

  p_col <- grep("^Pr\\(", names(a3_df), value = TRUE)
  if (length(p_col) == 1) {
    names(a3_df)[names(a3_df) == p_col] <- "p_value"
  }

  keep_effects <- c("Cultivar", "Stage", "Year", "Cultivar:Stage")
  a3_df <- a3_df[a3_df$Effect %in% keep_effects, , drop = FALSE]

  anova_results[[m]] <- a3_df

  # Stage-specific cultivar contrasts:
  # Cabernet Sauvignon - Pinot noir within each stage.
  emm <- emmeans::emmeans(
    fit,
    ~ Cultivar | Stage
  )

  ctr <- as.data.frame(
    emmeans::contrast(
      emm,
      method = "revpairwise",
      adjust = "none"
    )
  )

  ctr$Module <- m
  stage_contrasts[[m]] <- ctr

  # Basic model diagnostics.
  res <- residuals(fit)
  fitted_vals <- fitted(fit)

  model_diagnostics[[m]] <- data.frame(
    Module = m,
    N = nrow(dat),
    R_squared = summary(fit)$r.squared,
    Adjusted_R_squared = summary(fit)$adj.r.squared,
    Residual_SD = sd(res),
    Max_abs_standardized_residual = max(abs(rstandard(fit))),
    stringsAsFactors = FALSE
  )
}

anova_table <- do.call(rbind, anova_results)
stage_contrast_table <- do.call(rbind, stage_contrasts)
diagnostic_table <- do.call(rbind, model_diagnostics)

# -------------------------------------------------------------------------
# 7. FDR CORRECTION
# -------------------------------------------------------------------------
# Adjust across modules separately for each model effect.

anova_table$FDR <- NA_real_

for (effect in unique(anova_table$Effect)) {
  idx <- anova_table$Effect == effect
  anova_table$FDR[idx] <- p.adjust(
    anova_table$p_value[idx],
    method = "BH"
  )
}

# For the stage-specific Cabernet-vs-Pinot contrasts, adjust across all
# module x stage tests together, and also provide within-stage FDR.

stage_contrast_table$FDR_global <- p.adjust(
  stage_contrast_table$p.value,
  method = "BH"
)

stage_contrast_table$FDR_within_stage <- NA_real_

for (stage in unique(stage_contrast_table$Stage)) {
  idx <- stage_contrast_table$Stage == stage
  stage_contrast_table$FDR_within_stage[idx] <- p.adjust(
    stage_contrast_table$p.value[idx],
    method = "BH"
  )
}

# -------------------------------------------------------------------------
# 8. SAVE STATISTICAL RESULTS
# -------------------------------------------------------------------------

write.table(
  anova_table,
  file.path(out_dir, "module_factorial_ANOVA_typeIII.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  stage_contrast_table,
  file.path(out_dir, "cabernet_vs_pinot_within_each_stage.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  diagnostic_table,
  file.path(out_dir, "module_model_diagnostics.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

interaction_hits <- anova_table[
  anova_table$Effect == "Cultivar:Stage" &
  !is.na(anova_table$FDR) &
  anova_table$FDR < 0.05,
  ,
  drop = FALSE
]

interaction_hits <- interaction_hits[
  order(interaction_hits$FDR),
  ,
  drop = FALSE
]

write.table(
  interaction_hits,
  file.path(out_dir, "significant_cultivar_stage_interactions_FDR05.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

stage_hits <- stage_contrast_table[
  !is.na(stage_contrast_table$FDR_global) &
  stage_contrast_table$FDR_global < 0.05,
  ,
  drop = FALSE
]

stage_hits <- stage_hits[
  order(stage_hits$FDR_global),
  ,
  drop = FALSE
]

write.table(
  stage_hits,
  file.path(out_dir, "significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# -------------------------------------------------------------------------
# 9. CONSOLE SUMMARY
# -------------------------------------------------------------------------

cat("\n====================================================\n")
cat("BETA 10 MODULE STATISTICS COMPLETE\n")
cat("====================================================\n\n")

cat("Modules analyzed:", length(modules), "\n")
cat("Samples:", nrow(analysis_df), "\n")
cat("Model: Eigengene ~ Cultivar * Stage + Year\n\n")

cat("Significant Cultivar x Stage interactions (FDR < 0.05):\n")
if (nrow(interaction_hits) == 0) {
  cat("  None at FDR < 0.05\n")
} else {
  print(
    interaction_hits[, c("Module", "Effect", "p_value", "FDR")],
    row.names = FALSE
  )
}

cat("\nSignificant Cabernet vs Pinot contrasts within stages (global FDR < 0.05):\n")
if (nrow(stage_hits) == 0) {
  cat("  None at global FDR < 0.05\n")
} else {
  print(
    stage_hits[
      ,
      c(
        "Module",
        "Stage",
        "contrast",
        "estimate",
        "SE",
        "df",
        "p.value",
        "FDR_global"
      )
    ],
    row.names = FALSE
  )
}

cat(
  "\nFiles saved in:\n",
  normalizePath(out_dir, winslash = "/", mustWork = TRUE),
  "\n"
)

# -------------------------------------------------------------------------
# 10. REPRODUCIBILITY NOTE
# -------------------------------------------------------------------------

writeLines(
  c(
    "GSE98923 beta-10 module statistics",
    paste0("completed=", Sys.time()),
    "primary_network_beta=10",
    "samples=54",
    paste0("modules_analyzed=", length(modules)),
    "eigengene_method=PC1 of standardized module gene expression",
    "eigengene_sign=aligned_to_positive_correlation_with_module_mean",
    "model=Eigengene ~ Cultivar * Stage + Year",
    "ANOVA=Type III with sum-to-zero contrasts",
    "multiple_testing=Benjamini-Hochberg FDR",
    "simple_contrasts=Cabernet Sauvignon vs Pinot noir within each Stage"
  ),
  file.path(out_dir, "analysis_summary.txt")
)
