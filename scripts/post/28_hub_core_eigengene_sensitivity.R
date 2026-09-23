# 28_hub_core_eigengene_sensitivity.R
#
# Sensitivity analysis for the frozen beta10 network.
#
# This script DOES NOT rerun CEMiTool, change module membership, replace the
# canonical module eigengene, or alter any primary statistical result.
#
# Hub definition intentionally matches T-006:
#   top decile by kWithin, where kWithin is the sum of off-diagonal unsigned
#   beta10 adjacency within a frozen module.
#
# The sensitivity score ("Hub-core PC1") is PC1 of standardized expression
# for those top-decile hub genes only. PC1 sign is aligned to the canonical
# all-gene eigengene for direct visual comparison.

run_hub_core_sensitivity <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repository root")

  read_tsv <- function(path) {
    read.delim(path, sep = "\t", check.names = FALSE,
               stringsAsFactors = FALSE, fileEncoding = "UTF-8")
  }
  write_tsv <- function(x, path) {
    write.table(x, path, sep = "\t", quote = FALSE,
                row.names = FALSE, na = "NA", fileEncoding = "UTF-8")
  }

  out <- file.path(root, "results/hub_core_eigengene_sensitivity_beta10")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)

  membership <- read_tsv(file.path(root, "results/beta10/tables/module.tsv"))
  meta <- read_tsv(file.path(root, "data/metadata/samples.tsv"))
  canonical <- read_tsv(file.path(
    root, "results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv"
  ))
  expr <- readRDS(file.path(root, "data/processed/expression_log2rpkm.rds"))
  cem <- readRDS(file.path(root, "results/beta10/objects/cemitool.rds"))

  stopifnot(
    nrow(meta) == 54L,
    identical(colnames(expr), meta$SampleName),
    identical(canonical$SampleName, meta$SampleName),
    nrow(membership) == 3050L,
    !anyDuplicated(membership$genes)
  )

  all_adj <- methods::slot(cem, "adjacency")
  if (!is.matrix(all_adj) ||
      !identical(rownames(all_adj), colnames(all_adj)) ||
      !setequal(rownames(all_adj), membership$genes)) {
    stop("Frozen beta10 adjacency is not aligned with module membership")
  }

  modules <- paste0("M", 1:10)
  if (!all(modules %in% membership$modules)) stop("M1-M10 are required")

  ranking_list <- list()
  score_list <- list()
  profile_list <- list()
  contrast_list <- list()
  summary_list <- list()

  for (module in modules) {
    genes <- membership$genes[membership$modules == module]
    if (!all(genes %in% rownames(expr))) stop("Expression is missing genes in ", module)

    x <- as.matrix(expr[genes, , drop = FALSE])
    adj <- all_adj[genes, genes, drop = FALSE]
    if (anyNA(adj) || max(abs(adj - t(adj))) > 1e-12) {
      stop("Invalid frozen adjacency in ", module)
    }
    diag(adj) <- 0

    k <- rowSums(adj)
    rank_k <- rank(-k, ties.method = "min")
    top_n <- ceiling(length(genes) * 0.1)
    selected <- rank_k <= top_n
    hub_genes <- genes[selected]

    if (length(hub_genes) < 2L) stop("Fewer than two hub-core genes in ", module)

    pca <- stats::prcomp(
      t(x[hub_genes, , drop = FALSE]),
      center = TRUE,
      scale. = TRUE
    )
    hub_pc1 <- as.numeric(pca$x[, 1])
    canonical_score <- canonical[[module]]

    score_cor <- suppressWarnings(stats::cor(
      hub_pc1, canonical_score, use = "pairwise.complete.obs"
    ))
    if (!is.finite(score_cor)) stop("Non-finite canonical correlation in ", module)
    if (score_cor < 0) {
      hub_pc1 <- -hub_pc1
      score_cor <- -score_cor
    }

    ranking_list[[module]] <- data.frame(
      Module = module,
      Gene = genes,
      Rank_kWithin = as.integer(rank_k),
      kWithin = unname(k),
      kWithin_per_possible_edge = unname(k) / (length(genes) - 1L),
      Hub_core_selected = selected,
      stringsAsFactors = FALSE
    )

    score_list[[module]] <- data.frame(
      SampleName = meta$SampleName,
      Module = module,
      Cultivar = meta$Cultivar,
      Stage = meta$Stage,
      Year = as.integer(meta$Year),
      Canonical_eigengene = canonical_score,
      Hub_core_PC1 = hub_pc1,
      stringsAsFactors = FALSE
    )

    module_profiles <- list()
    module_contrasts <- list()

    for (cultivar in c("Cabernet Sauvignon", "Pinot noir")) {
      for (stage in c("FruitSet", "Veraison", "Harvest")) {
        for (year in c(2012L, 2013L, 2014L)) {
          idx <- meta$Cultivar == cultivar &
                 meta$Stage == stage &
                 as.integer(meta$Year) == year
          if (sum(idx) != 3L) stop("Unbalanced cell in ", module)

          can <- canonical_score[idx]
          hub <- hub_pc1[idx]

          module_profiles[[length(module_profiles) + 1L]] <- data.frame(
            Module = module,
            Cultivar = cultivar,
            Stage = stage,
            Year = year,
            N = sum(idx),
            Canonical_Mean = mean(can),
            Canonical_SD = stats::sd(can),
            Canonical_SE = stats::sd(can) / sqrt(sum(idx)),
            HubCore_Mean = mean(hub),
            HubCore_SD = stats::sd(hub),
            HubCore_SE = stats::sd(hub) / sqrt(sum(idx)),
            stringsAsFactors = FALSE
          )
        }
      }
    }

    direction_matches <- logical(0)
    for (stage in c("FruitSet", "Veraison", "Harvest")) {
      for (year in c(2012L, 2013L, 2014L)) {
        cs <- meta$Stage == stage & as.integer(meta$Year) == year &
              meta$Cultivar == "Cabernet Sauvignon"
        pn <- meta$Stage == stage & as.integer(meta$Year) == year &
              meta$Cultivar == "Pinot noir"
        if (sum(cs) != 3L || sum(pn) != 3L) stop("Unbalanced contrast cell")

        can_est <- mean(canonical_score[cs]) - mean(canonical_score[pn])
        hub_est <- mean(hub_pc1[cs]) - mean(hub_pc1[pn])
        same <- (can_est > 0 && hub_est > 0) ||
                (can_est < 0 && hub_est < 0) ||
                (can_est == 0 && hub_est == 0)
        direction_matches <- c(direction_matches, same)

        module_contrasts[[length(module_contrasts) + 1L]] <- data.frame(
          Module = module,
          Stage = stage,
          Year = year,
          Canonical_CS_minus_PN = can_est,
          HubCore_CS_minus_PN = hub_est,
          Same_direction = same,
          stringsAsFactors = FALSE
        )
      }
    }

    ptab <- do.call(rbind, module_profiles)
    ctab <- do.call(rbind, module_contrasts)
    profile_list[[module]] <- ptab
    contrast_list[[module]] <- ctab

    summary_list[[module]] <- data.frame(
      Module = module,
      Genes_in_module = length(genes),
      Hub_core_genes = length(hub_genes),
      Hub_core_fraction = length(hub_genes) / length(genes),
      HubCore_PC1_variance_percent =
        100 * summary(pca)$importance[2, 1],
      Correlation_HubCore_vs_Canonical_54samples = score_cor,
      Correlation_cell_means = stats::cor(
        ptab$HubCore_Mean, ptab$Canonical_Mean
      ),
      Same_direction_stage_year_contrasts = sum(direction_matches),
      Total_stage_year_contrasts = length(direction_matches),
      Direction_match_fraction = mean(direction_matches),
      stringsAsFactors = FALSE
    )
  }

  rankings <- do.call(rbind, ranking_list)
  scores <- do.call(rbind, score_list)
  profiles <- do.call(rbind, profile_list)
  contrasts <- do.call(rbind, contrast_list)
  summaries <- do.call(rbind, summary_list)
  rownames(rankings) <- rownames(scores) <- rownames(profiles) <-
    rownames(contrasts) <- rownames(summaries) <- NULL

  stopifnot(
    nrow(rankings) == sum(membership$modules %in% modules),
    nrow(scores) == 10L * 54L,
    nrow(profiles) == 10L * 2L * 3L * 3L,
    nrow(contrasts) == 10L * 3L * 3L,
    nrow(summaries) == 10L
  )

  write_tsv(rankings, file.path(out, "hub_core_gene_ranking.tsv"))
  write_tsv(scores, file.path(out, "hub_core_sample_scores.tsv"))
  write_tsv(profiles, file.path(out, "hub_core_cell_profiles.tsv"))
  write_tsv(contrasts, file.path(out, "hub_core_stage_year_contrasts.tsv"))
  write_tsv(summaries, file.path(out, "hub_core_module_summary.tsv"))

  writeLines(
    c(
      "GSE98923 beta10 hub-core eigengene sensitivity",
      "method=PC1 of top-decile kWithin genes within each frozen beta10 module",
      "hub_definition=Top_decile_kWithin using frozen unsigned beta10 adjacency",
      "hub_threshold=rank_kWithin <= ceiling(module_gene_count * 0.1)",
      "samples=54",
      "years=2012,2013,2014",
      "modules=M1-M10",
      "expression=log2(RPKM+1)",
      "pc1_preprocessing=centered_and_scaled_genes",
      "pc1_sign=aligned_to_positive_correlation_with_canonical_module_eigengene",
      "canonical_eigengene=unchanged PC1 of all variable genes in each module",
      "network_rerun=FALSE",
      "module_membership_changed=FALSE",
      "purpose=sensitivity analysis; Hub-core PC1 does not replace canonical eigengene"
    ),
    file.path(out, "analysis_summary.txt")
  )

  message(
    "Hub-core sensitivity complete: ",
    nrow(rankings), " ranked genes; ",
    nrow(profiles), " profiles; ",
    nrow(contrasts), " contrasts."
  )

  invisible(list(
    rankings = rankings,
    scores = scores,
    profiles = profiles,
    contrasts = contrasts,
    summary = summaries
  ))
}

if (identical(environment(), globalenv())) {
  run_hub_core_sensitivity()
}
