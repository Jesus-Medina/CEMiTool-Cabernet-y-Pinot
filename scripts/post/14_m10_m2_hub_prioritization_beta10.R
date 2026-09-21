# T-006 completion phase: prioritize M10 and M2 using the frozen beta10 graph.
# Centrality and functional labels do not establish causality or skin specificity.

run_hubs <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repository root")
  oldref <- file.path(root, "data/reference/grapedia_t005")
  funref <- file.path(root, "data/reference/grapedia_t006")
  out <- file.path(root, "results/hub_prioritization_beta10")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  if (!requireNamespace("digest", quietly = TRUE)) stop("digest is required")
  read_tsv <- function(path) read.delim(path, check.names = FALSE,
    stringsAsFactors = FALSE, fileEncoding = "UTF-8")
  write_tsv <- function(d, path) write.table(d, path, sep = "\t",
    quote = TRUE, row.names = FALSE, na = "NA", fileEncoding = "UTF-8")

  membership <- read_tsv(file.path(root, "results/beta10/tables/module.tsv"))
  selected <- scan(file.path(root, "results/beta10/tables/selected_genes.txt"),
    what = "", quiet = TRUE)
  if (nrow(membership) != 3050L || anyDuplicated(membership$genes) ||
      length(selected) != 3050L || !setequal(membership$genes, selected)) {
    stop("Frozen beta10 gene universe mismatch")
  }
  cem <- readRDS(file.path(root, "results/beta10/objects/cemitool.rds"))
  all_adj <- slot(cem, "adjacency")
  if (!is.matrix(all_adj) ||
      !identical(dim(all_adj), c(3050L, 3050L)) ||
      !identical(rownames(all_adj), colnames(all_adj)) ||
      !setequal(rownames(all_adj), selected)) {
    stop("Frozen adjacency is missing or misaligned")
  }
  expr <- readRDS(file.path(root, "data/processed/expression_log2rpkm.rds"))
  meta <- read_tsv(file.path(root, "data/metadata/samples.tsv"))
  eig <- read_tsv(file.path(root,
    "results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv"))
  if (ncol(expr) != 54L ||
      !identical(colnames(expr), meta$SampleName) ||
      !identical(eig$SampleName, meta$SampleName) ||
      anyNA(expr) || anyDuplicated(rownames(expr))) {
    stop("Expression/metadata/eigengene alignment failed")
  }
  yr <- read_tsv(file.path(root,
    "results/year_robustness_beta10/priority_module_classification.tsv"))
  if (anyDuplicated(yr$Module) ||
      !all(c("M10", "M2") %in% yr$Module)) stop("Year evidence missing")
  beta_compare <- read_tsv(file.path(root,
    "results/comparisons/gene_module_membership_beta7_vs_beta10.tsv"))
  if (anyDuplicated(beta_compare$Gene) ||
      !setequal(beta_compare$Gene, selected) ||
      !identical(beta_compare$Module_beta10[
        match(membership$genes, beta_compare$Gene)], membership$modules)) {
    stop("Beta7/beta10 comparison is not aligned with the frozen modules")
  }

  map3 <- read_tsv(file.path(oldref, "v1_to_v3_reciprocal50.tsv"))
  map5 <- read_tsv(file.path(oldref, "v1_to_v5_reciprocal50.tsv"))
  ann3 <- read_tsv(file.path(oldref, "v3_mapman_pairs.tsv"))
  ann5 <- read_tsv(file.path(oldref, "v5_mapman_pairs.tsv"))
  if (anyDuplicated(map3$V1_gene) || anyDuplicated(map5$V1_gene) ||
      anyDuplicated(ann3[c("V1_gene", "TermID")]) ||
      anyDuplicated(ann5[c("V1_gene", "TermID")])) {
    stop("Nonunique gene mapping or gene-term association")
  }
  source_manifest <- read_tsv(file.path(funref, "source_manifest.tsv"))
  if (!identical(source_manifest$File,
      c("legacy_function.zip", "t2t_function.zip"))) {
    stop("Unexpected functional source manifest")
  }
  source_dir <- Sys.getenv("T006_SOURCE_DIR", unset = "")
  if (!nzchar(source_dir)) {
    source_dir <- file.path(Sys.getenv("TEMP"), "cemitool_t005_sources")
  }
  function_tables <- vector("list", 2L)
  for (i in 1:2) {
    path <- file.path(source_dir, source_manifest$File[i])
    if (!file.exists(path)) {
      dir.create(source_dir, recursive = TRUE, showWarnings = FALSE)
      utils::download.file(source_manifest$URL[i], path, mode = "wb", quiet = TRUE)
    }
    if (!identical(digest::digest(file = path, algo = "sha256"),
        source_manifest$SHA256[i])) stop("Functional source hash mismatch")
    zi <- utils::unzip(path, list = TRUE)
    if (nrow(zi) != 1L ||
        !identical(zi$Name[1], source_manifest$Entry[i])) {
      stop("Unexpected functional source ZIP entry")
    }
    function_tables[[i]] <- read.delim(unz(path, source_manifest$Entry[i]),
      check.names = FALSE, quote = "", stringsAsFactors = FALSE)
    if (anyDuplicated(function_tables[[i]]$gene)) {
      stop("Duplicate functional-summary gene ID")
    }
  }
  names(function_tables) <- c("v3", "v5")
  leaf_terms <- function(tab, gene) {
    rows <- tab[tab$V1_gene == gene, c("TermID", "TermName")]
    if (!nrow(rows)) return(NA_character_)
    ids <- as.character(rows$TermID)
    leaf <- !vapply(seq_along(ids), function(i) {
      any(startsWith(ids[-i], paste0(ids[i], ".")))
    }, FALSE)
    paste(unique(rows$TermName[leaf]), collapse = "; ")
  }
  score <- function(x) {
    a <- abs(stats::cor(t(x)))^10
    diag(a) <- 0
    rowSums(a)
  }
  all_rank <- list()
  all_annotations <- list()
  all_edges <- list()
  all_sensitivity <- list()
  all_qc <- list()
  for (module in c("M10", "M2")) {
    genes <- membership$genes[membership$modules == module]
    n_expected <- if (module == "M10") 39L else 214L
    if (length(genes) != n_expected || !all(genes %in% rownames(expr)) ||
        anyNA(eig[[module]])) stop("Unexpected module input")
    x <- as.matrix(expr[genes, , drop = FALSE])
    cor_signed <- stats::cor(t(x))
    frozen <- all_adj[genes, genes, drop = FALSE]
    error <- max(abs(frozen - abs(cor_signed)^10))
    if (anyNA(frozen) || error > 1e-10 ||
        max(abs(frozen - t(frozen))) > 1e-12 ||
        max(abs(diag(frozen) - 1)) > 1e-12 ||
        any(frozen < 0 | frozen > 1)) {
      stop("Frozen module adjacency differs from Pearson beta10")
    }
    adj <- frozen
    diag(adj) <- 0
    k <- rowSums(adj)
    rank_k <- rank(-k, ties.method = "min")
    kme <- as.numeric(stats::cor(t(x), eig[[module]]))
    top_n <- ceiling(length(genes) * 0.1)
    id3 <- map3$Annotation_gene[match(genes, map3$V1_gene)]
    id5 <- map5$Annotation_gene[match(genes, map5$V1_gene)]
    beta7_module <- beta_compare$Module_beta7[
      match(genes, beta_compare$Gene)]
    beta7_expected <- if (module == "M10") "M7" else "M2"
    f3 <- function_tables$v3[match(id3, function_tables$v3$gene), , drop = FALSE]
    f5 <- function_tables$v5[match(id5, function_tables$v5$gene), , drop = FALSE]
    if (any(!is.na(id3) & is.na(f3$gene)) ||
        any(!is.na(id5) & is.na(f5$gene))) {
      stop("Mapped gene missing from functional summary")
    }
    leaf3 <- vapply(genes, function(g) leaf_terms(ann3, g), "")
    leaf5 <- vapply(genes, function(g) leaf_terms(ann5, g), "")
    tf3 <- vapply(genes, function(g) {
      ids <- ann3$TermID[ann3$V1_gene == g]
      any(ids == "15.5" | startsWith(ids, "15.5."))
    }, FALSE)
    tf5 <- vapply(genes, function(g) {
      ids <- ann5$TermID[ann5$V1_gene == g]
      any(ids == "15.5" | startsWith(ids, "15.5."))
    }, FALSE)
    rank_table <- data.frame(
      Module = module, Gene = genes, Rank_kWithin = as.integer(rank_k),
      kWithin = unname(k),
      kWithin_per_possible_edge = unname(k) / (length(genes) - 1L),
      kME_signed = kme, abs_kME = abs(kme),
      Rank_abs_kME = as.integer(rank(-abs(kme), ties.method = "min")),
      Fraction_kWithin_from_negative_correlations =
        vapply(seq_along(genes), function(i) {
          sum(adj[i, cor_signed[i, ] < 0]) / k[i]
        }, 0.0),
      Top_decile_kWithin = rank_k <= top_n,
      Beta7_module = beta7_module,
      In_best_matching_beta7_module = beta7_module == beta7_expected,
      V3_gene = id3, V5_gene = id5,
      V3_MapMan_annotated = genes %in% ann3$V1_gene,
      V5_MapMan_annotated = genes %in% ann5$V1_gene,
      V3_TF_label = tf3, V5_TF_label = tf5,
      V3_leaf_terms = unname(leaf3), V5_leaf_terms = unname(leaf5),
      stringsAsFactors = FALSE)
    for (stage in c("Veraison", "Harvest")) {
      cs_stage <- meta$SampleName[meta$Stage == stage &
        meta$Cultivar == "Cabernet Sauvignon"]
      pn_stage <- meta$SampleName[meta$Stage == stage &
        meta$Cultivar == "Pinot noir"]
      if (length(cs_stage) != 9L || length(pn_stage) != 9L) {
        stop("Unbalanced stage-cultivar sample set")
      }
      rank_table[[paste0(stage, "_CS_exact_zero_fraction")]] <-
        rowMeans(x[, cs_stage, drop = FALSE] == 0)
      rank_table[[paste0(stage, "_PN_exact_zero_fraction")]] <-
        rowMeans(x[, pn_stage, drop = FALSE] == 0)
      for (year in sort(unique(meta$Year))) {
        cs <- meta$SampleName[meta$Stage == stage & meta$Year == year &
          meta$Cultivar == "Cabernet Sauvignon"]
        pn <- meta$SampleName[meta$Stage == stage & meta$Year == year &
          meta$Cultivar == "Pinot noir"]
        if (length(cs) != 3L || length(pn) != 3L) {
          stop("Unbalanced cultivar-stage-year cell")
        }
        rank_table[[paste0(stage, "_CS_minus_PN_", year)]] <-
          rowMeans(x[, cs, drop = FALSE]) -
          rowMeans(x[, pn, drop = FALSE])
      }
      cols <- grep(paste0("^", stage, "_CS_minus_PN_"),
        names(rank_table), value = TRUE)
      rank_table[[paste0(stage, "_same_direction_all_years")]] <-
        apply(rank_table[cols], 1, function(z) all(z > 0) || all(z < 0))
    }
    all_rank[[module]] <- rank_table[order(rank_table$Rank_kWithin), ]
    all_annotations[[module]] <- data.frame(
      Module = module, Gene = genes, V3_gene = id3, V5_gene = id5,
      V3_all_term_ids = vapply(genes, function(g) paste(
        ann3$TermID[ann3$V1_gene == g], collapse = "; "), ""),
      V3_all_term_names = vapply(genes, function(g) paste(
        ann3$TermName[ann3$V1_gene == g], collapse = "; "), ""),
      V5_all_term_ids = vapply(genes, function(g) paste(
        ann5$TermID[ann5$V1_gene == g], collapse = "; "), ""),
      V5_all_term_names = vapply(genes, function(g) paste(
        ann5$TermName[ann5$V1_gene == g], collapse = "; "), ""),
      V3_Pfam = f3$Pfam, V3_PANTHER = f3$PANTHER,
      V5_Pfam = f5$Pfam, V5_PANTHER = f5$PANTHER,
      V5_Chr = f5$chromosome,
      V5_GeneStart = f5$gene_start,
      V5_GeneEnd = f5$gene_end,
      stringsAsFactors = FALSE)
    index <- which(upper.tri(adj), arr.ind = TRUE)
    all_edges[[module]] <- data.frame(
      Module = module, Gene1 = genes[index[, 1]],
      Gene2 = genes[index[, 2]], Pearson_r = cor_signed[index],
      Beta10_unsigned_adjacency = adj[index],
      stringsAsFactors = FALSE)
    s <- data.frame(Module = module, Gene = genes,
      Rank_primary = as.integer(rank_k), stringsAsFactors = FALSE)
    top_primary <- genes[rank_k <= top_n]
    qc <- data.frame(
      Module = module,
      Metric = c("Module_genes", "All_intramodular_pairs",
        "Frozen_adjacency_max_abs_error", "V3_mapped", "V5_mapped",
        "V3_MapMan_annotated", "V5_MapMan_annotated",
        "V3_TF_labeled", "V5_TF_labeled", "Top_decile_genes",
        "Genes_in_best_matching_beta7_module",
        "Top_decile_in_best_matching_beta7_module"),
      Value = c(length(genes), nrow(all_edges[[module]]), error,
        sum(!is.na(id3)), sum(!is.na(id5)),
        sum(rank_table$V3_MapMan_annotated),
        sum(rank_table$V5_MapMan_annotated), sum(tf3), sum(tf5), top_n,
        sum(rank_table$In_best_matching_beta7_module),
        sum(rank_table$Top_decile_kWithin &
          rank_table$In_best_matching_beta7_module)),
      stringsAsFactors = FALSE)
    for (year in sort(unique(meta$Year))) {
      without <- score(x[, meta$Year != year, drop = FALSE])
      variant_rank <- rank(-without, ties.method = "min")
      s[[paste0("Rank_without_", year)]] <- as.integer(variant_rank)
      qc <- rbind(qc, data.frame(Module = module,
        Metric = c(paste0("Spearman_without_", year),
          paste0("Top_decile_overlap_without_", year)),
        Value = c(stats::cor(k, without, method = "spearman"),
          length(intersect(top_primary, genes[variant_rank <= top_n])))))
    }
    all_sensitivity[[module]] <- s[order(s$Rank_primary), ]
    all_qc[[module]] <- qc
  }
  ranks <- do.call(rbind, all_rank)
  rownames(ranks) <- NULL
  annotations <- do.call(rbind, all_annotations)
  rownames(annotations) <- NULL
  edges <- do.call(rbind, all_edges)
  rownames(edges) <- NULL
  sensitivity <- do.call(rbind, all_sensitivity)
  rownames(sensitivity) <- NULL
  qc <- do.call(rbind, all_qc)
  rownames(qc) <- NULL
  write_tsv(ranks, file.path(out, "m10_m2_full_hub_ranking.tsv"))
  write_tsv(ranks[ranks$Top_decile_kWithin | ranks$V3_TF_label |
    ranks$V5_TF_label, ], file.path(out, "m10_m2_focus_genes.tsv"))
  write_tsv(annotations, file.path(out, "m10_m2_mapman_evidence.tsv"))
  write_tsv(edges, file.path(out, "m10_m2_all_intramodular_edges.tsv"))
  write_tsv(sensitivity, file.path(out, "m10_m2_hub_rank_sensitivity.tsv"))
  write_tsv(qc, file.path(out, "m10_m2_hub_qc.tsv"))
  write_tsv(yr[match(c("M10", "M2"), yr$Module), ],
    file.path(out, "m10_m2_year_evidence.tsv"))
  writeLines(c(
    "T-006 M10/M2 hub prioritization on frozen beta10 adjacency",
    "primary_metric=sum of off-diagonal intramodular unsigned adjacency |Pearson r|^10",
    "top_decile=descriptive shortlist, not inferential significance",
    "annotation=v3/v5 MapMan pairs with reciprocal one-to-one v1 mapping from T-005",
    "source_URL_SHA=data/reference/grapedia_t005/source_manifest.tsv",
    "functional_summary_source_URL_SHA=data/reference/grapedia_t006/source_manifest.tsv",
    "year_evidence=T-004 priority_module_classification, not gene-level validation",
    "beta7_evidence=gene membership in best-matching beta7 module, not beta7 hub rank",
    "stage_year_gene_differences=descriptive, no gene-level FDR claim",
    "leave_year_out=sensitivity only, original graph unchanged",
    "no_CEMiTool_rerun_no_sample_exclusion_no_skin_specific_or_causal_claim"
  ), file.path(out, "m10_m2_analysis_summary.txt"))
  cat("M10/M2 hub prioritization complete: ", nrow(ranks),
    " ranked genes, ", nrow(edges), " pairs.\n", sep = "")
  print(qc, row.names = FALSE)
}

run_hubs()
