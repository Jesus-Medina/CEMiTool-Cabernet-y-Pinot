# Compare CEMiTool module assignments between beta = 7 and beta = 10
# GSE98923, 54-sample baseline
#
# Run this script as-is. It DOES NOT rerun CEMiTool.
# It only reads the two existing cemitool.rds objects and compares
# gene-to-module assignments between the beta 7 and beta 10 analyses.

suppressPackageStartupMessages({
  library(CEMiTool)
})

# -------------------------------------------------------------------------
# 1. PROJECT PATHS
# -------------------------------------------------------------------------
# These match the folders shown in your RStudio runs.
# Edit ONLY these two lines if your folder names are different.

beta7_dir  <- "C:/Users/jesus/OneDrive/Documentos/Cata/CEMiTool/TRY BETA 7 FIXED"
beta10_dir <- "C:/Users/jesus/OneDrive/Documentos/Cata/CEMiTool/BETA 10"

beta7_rds  <- file.path(beta7_dir,  "results/objects/cemitool.rds")
beta10_rds <- file.path(beta10_dir, "results/objects/cemitool.rds")

out_dir <- file.path(beta10_dir, "results/beta7_vs_beta10")
dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)

if (!file.exists(beta7_rds)) {
  stop("Beta 7 object not found: ", beta7_rds)
}
if (!file.exists(beta10_rds)) {
  stop("Beta 10 object not found: ", beta10_rds)
}

# -------------------------------------------------------------------------
# 2. LOAD EXISTING CEMITOOL OBJECTS
# -------------------------------------------------------------------------

cem7  <- readRDS(beta7_rds)
cem10 <- readRDS(beta10_rds)

cat("Loaded beta 7 object:", beta7_rds, "\n")
cat("Loaded beta 10 object:", beta10_rds, "\n\n")

# -------------------------------------------------------------------------
# 3. EXTRACT GENE -> MODULE TABLE ROBUSTLY
# -------------------------------------------------------------------------

extract_membership <- function(cem, suffix) {
  x <- CEMiTool::module_genes(cem)

  if (!is.data.frame(x) || ncol(x) < 2) {
    stop("module_genes(cem) did not return the expected data.frame.")
  }

  module_col <- names(x)[tolower(names(x)) == "module"]
  if (length(module_col) == 0) {
    module_col <- names(x)[grepl("module", names(x), ignore.case = TRUE)][1]
  }
  if (is.na(module_col) || length(module_col) == 0) {
    stop("Could not identify the module column.")
  }

  gene_candidates <- setdiff(names(x), module_col)
  gene_col <- gene_candidates[1]

  out <- data.frame(
    Gene = as.character(x[[gene_col]]),
    Module = as.character(x[[module_col]]),
    stringsAsFactors = FALSE
  )

  names(out)[2] <- paste0("Module_", suffix)

  if (anyDuplicated(out$Gene)) {
    stop("Duplicated gene identifiers found in module membership table.")
  }

  out
}

m7  <- extract_membership(cem7,  "beta7")
m10 <- extract_membership(cem10, "beta10")

membership <- merge(m7, m10, by = "Gene", all = TRUE)

write.table(
  membership,
  file.path(out_dir, "gene_module_membership_beta7_vs_beta10.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# -------------------------------------------------------------------------
# 4. MODULE SIZES
# -------------------------------------------------------------------------

sizes7 <- as.data.frame(table(m7$Module_beta7), stringsAsFactors = FALSE)
names(sizes7) <- c("Module", "Genes_beta7")

sizes10 <- as.data.frame(table(m10$Module_beta10), stringsAsFactors = FALSE)
names(sizes10) <- c("Module", "Genes_beta10")

all_modules <- merge(sizes7, sizes10, by = "Module", all = TRUE)
all_modules$Genes_beta7[is.na(all_modules$Genes_beta7)] <- 0
all_modules$Genes_beta10[is.na(all_modules$Genes_beta10)] <- 0

write.table(
  all_modules,
  file.path(out_dir, "module_sizes_beta7_vs_beta10.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# -------------------------------------------------------------------------
# 5. OVERLAP MATRIX
# -------------------------------------------------------------------------

shared <- membership[
  !is.na(membership$Module_beta7) &
  !is.na(membership$Module_beta10),
  ,
  drop = FALSE
]

overlap_counts <- table(shared$Module_beta7, shared$Module_beta10)

write.table(
  as.data.frame.matrix(overlap_counts),
  file.path(out_dir, "module_overlap_counts.tsv"),
  sep = "\t",
  quote = FALSE,
  col.names = NA
)

# Row-normalized percentage:
# For each beta-7 module, where did its genes go in beta 10?
overlap_pct_from_beta7 <- prop.table(overlap_counts, margin = 1) * 100

write.table(
  round(as.data.frame.matrix(overlap_pct_from_beta7), 3),
  file.path(out_dir, "module_overlap_percent_from_beta7.tsv"),
  sep = "\t",
  quote = FALSE,
  col.names = NA
)

# Column-normalized percentage:
# For each beta-10 module, where did its genes come from in beta 7?
overlap_pct_to_beta10 <- prop.table(overlap_counts, margin = 2) * 100

write.table(
  round(as.data.frame.matrix(overlap_pct_to_beta10), 3),
  file.path(out_dir, "module_overlap_percent_to_beta10.tsv"),
  sep = "\t",
  quote = FALSE,
  col.names = NA
)

# -------------------------------------------------------------------------
# 6. JACCARD SIMILARITY BETWEEN MODULES
# -------------------------------------------------------------------------
# Module labels are arbitrary between independent runs.
# Therefore, M3 at beta 7 is NOT assumed to equal M3 at beta 10.
# Jaccard similarity compares actual gene membership.

mods7 <- sort(unique(m7$Module_beta7))
mods10 <- sort(unique(m10$Module_beta10))

jaccard_rows <- list()
k <- 1

for (a in mods7) {
  genes_a <- m7$Gene[m7$Module_beta7 == a]

  for (b in mods10) {
    genes_b <- m10$Gene[m10$Module_beta10 == b]

    inter <- length(intersect(genes_a, genes_b))
    uni <- length(union(genes_a, genes_b))
    jac <- if (uni == 0) NA_real_ else inter / uni

    jaccard_rows[[k]] <- data.frame(
      Module_beta7 = a,
      Module_beta10 = b,
      Genes_beta7 = length(genes_a),
      Genes_beta10 = length(genes_b),
      Shared_genes = inter,
      Jaccard = jac,
      Percent_beta7_retained = if (length(genes_a) == 0) NA_real_ else 100 * inter / length(genes_a),
      Percent_beta10_from_beta7 = if (length(genes_b) == 0) NA_real_ else 100 * inter / length(genes_b),
      stringsAsFactors = FALSE
    )
    k <- k + 1
  }
}

jaccard <- do.call(rbind, jaccard_rows)

write.table(
  jaccard,
  file.path(out_dir, "module_pairwise_jaccard.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# Best beta-10 match for each beta-7 module
best_matches <- do.call(
  rbind,
  lapply(
    split(jaccard, jaccard$Module_beta7),
    function(d) {
      d <- d[order(-d$Jaccard, -d$Shared_genes), , drop = FALSE]
      d[1, , drop = FALSE]
    }
  )
)

rownames(best_matches) <- NULL

write.table(
  best_matches,
  file.path(out_dir, "best_module_matches_beta7_to_beta10.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# -------------------------------------------------------------------------
# 7. SIMPLE CONSOLE SUMMARY
# -------------------------------------------------------------------------

cat("\n================ BETA 7 ================\n")
print(sort(table(m7$Module_beta7), decreasing = TRUE))

cat("\n================ BETA 10 ===============\n")
print(sort(table(m10$Module_beta10), decreasing = TRUE))

cat("\n=========== BEST MODULE MATCHES =========\n")
print(
  best_matches[
    ,
    c(
      "Module_beta7",
      "Module_beta10",
      "Shared_genes",
      "Jaccard",
      "Percent_beta7_retained"
    )
  ],
  row.names = FALSE
)

# -------------------------------------------------------------------------
# 8. SAVE A SHORT SUMMARY TXT
# -------------------------------------------------------------------------

summary_lines <- c(
  "GSE98923 beta 7 vs beta 10 module comparison",
  paste0("completed=", Sys.time()),
  paste0("genes_beta7=", nrow(m7)),
  paste0("genes_beta10=", nrow(m10)),
  paste0("shared_genes=", nrow(shared)),
  paste0("groups_beta7_including_Not.Correlated=", length(unique(m7$Module_beta7))),
  paste0("groups_beta10_including_Not.Correlated=", length(unique(m10$Module_beta10))),
  "",
  "Interpretation note:",
  "Module labels (M1, M2, ...) are arbitrary between independent runs.",
  "Use gene overlap/Jaccard similarity rather than matching modules only by label."
)

writeLines(
  summary_lines,
  file.path(out_dir, "comparison_summary.txt")
)

cat(
  "\nFinished.\nResults saved in:\n",
  normalizePath(out_dir, winslash = "/", mustWork = TRUE),
  "\n"
)
