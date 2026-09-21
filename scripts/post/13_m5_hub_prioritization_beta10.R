# T-006, M5 phase. Read the frozen beta10 adjacency; never rerun CEMiTool.
# kWithin is the sum of off-diagonal unsigned beta10 adjacency within M5.
# Functional labels are annotation evidence, not experimentally proven activity.

run_m5_hubs <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repo root")
  if (!requireNamespace("digest", quietly = TRUE)) stop("digest is required")
  out <- file.path(root, "results/hub_prioritization_beta10")
  ref <- file.path(root, "data/reference/grapedia_t006")
  oldref <- file.path(root, "data/reference/grapedia_t005")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  dir.create(ref, recursive = TRUE, showWarnings = FALSE)
  read_tsv <- function(path) read.delim(path, check.names = FALSE,
                                        stringsAsFactors = FALSE,
                                        fileEncoding = "UTF-8")
  write_tsv <- function(x, path) write.table(x, path, sep = "\t", quote = TRUE,
                                              row.names = FALSE, na = "NA",
                                              fileEncoding = "UTF-8")
  sources <- data.frame(
    File = c("legacy_function.zip", "t2t_function.zip"),
    URL = c(
      "https://grapedia.org/wp-content/uploads/2024/07/v3_on_12Xv2_functional_annotation_summary.zip",
      "https://grapedia.org/wp-content/uploads/2024/07/5.1_on_T2T_ref_functional_annotation_summary_with_coordinates.zip"),
    SHA256 = c(
      "d9bf3ce0654974ec8e47406523a73e12759aaad2f2d0b1d982d1de8d54de4061",
      "53e831878b5288cf0cda5ad78a9bac0402920ae2a000fdc645c8d29a18b00f71"),
    Entry = c("v3_on_12Xv2_functional_annotation_summary.tsv",
              "5.1_on_T2T_ref_functional_annotation_summary_with_coordinates.tsv"),
    stringsAsFactors = FALSE)
  source_dir <- Sys.getenv("T006_SOURCE_DIR", unset = "")
  if (!nzchar(source_dir)) {
    source_dir <- file.path(Sys.getenv("TEMP"), "cemitool_t005_sources")
  }
  dir.create(source_dir, recursive = TRUE, showWarnings = FALSE)
  function_tables <- vector("list", nrow(sources))
  for (i in seq_len(nrow(sources))) {
    path <- file.path(source_dir, sources$File[i])
    if (!file.exists(path)) {
      utils::download.file(sources$URL[i], path, mode = "wb", quiet = TRUE)
    }
    if (!identical(digest::digest(file = path, algo = "sha256"),
                   sources$SHA256[i])) stop("Functional source hash mismatch")
    zi <- utils::unzip(path, list = TRUE)
    if (nrow(zi) != 1L || !identical(zi$Name[1], sources$Entry[i])) {
      stop("Functional source ZIP has unexpected entries")
    }
    function_tables[[i]] <- read.delim(unz(path, sources$Entry[i]),
                                        check.names = FALSE, quote = "",
                                        stringsAsFactors = FALSE)
    if (anyDuplicated(function_tables[[i]]$gene)) {
      stop("Duplicate functional-summary gene ID")
    }
    sources$Bytes[i] <- file.info(path)$size
  }
  names(function_tables) <- c("v3", "v5")
  write_tsv(sources, file.path(ref, "source_manifest.tsv"))

  membership <- read_tsv(file.path(root, "results/beta10/tables/module.tsv"))
  selected <- scan(file.path(root, "results/beta10/tables/selected_genes.txt"),
                   what = "", quiet = TRUE)
  if (nrow(membership) != 3050L || anyDuplicated(membership$genes) ||
      length(selected) != 3050L || !setequal(selected, membership$genes)) {
    stop("Frozen beta10 gene universe mismatch")
  }
  genes <- membership$genes[membership$modules == "M5"]
  if (length(genes) != 108L) stop("Unexpected M5 membership")
  cem <- readRDS(file.path(root, "results/beta10/objects/cemitool.rds"))
  all_adj <- slot(cem, "adjacency")
  if (!is.matrix(all_adj) || !identical(dim(all_adj), c(3050L, 3050L)) ||
      !identical(rownames(all_adj), colnames(all_adj)) ||
      !setequal(rownames(all_adj), selected)) {
    stop("Frozen beta10 adjacency is not aligned with selected genes")
  }
  expr <- readRDS(file.path(root, "data/processed/expression_log2rpkm.rds"))
  meta <- read_tsv(file.path(root, "data/metadata/samples.tsv"))
  eig <- read_tsv(file.path(root,
    "results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv"))
  if (ncol(expr) != 54L || !identical(colnames(expr), meta$SampleName) ||
      !identical(eig$SampleName, meta$SampleName) ||
      !all(genes %in% rownames(expr)) || anyNA(expr[genes, ]) ||
      anyNA(eig$M5)) stop("M5 expression/eigengene sample alignment failed")
  x <- as.matrix(expr[genes, , drop = FALSE])
  signed_cor <- stats::cor(t(x))
  frozen <- all_adj[genes, genes, drop = FALSE]
  if (anyNA(frozen) || max(abs(frozen - t(frozen))) > 1e-12 ||
      any(frozen < 0 | frozen > 1) ||
      max(abs(diag(frozen) - 1)) > 1e-12 ||
      max(abs(frozen - abs(signed_cor)^10)) > 1e-10) {
    stop("Frozen M5 adjacency does not match unsigned Pearson beta10")
  }
  adj <- frozen
  diag(adj) <- 0
  k <- rowSums(adj)
  kme <- as.numeric(stats::cor(t(x), eig$M5))
  names(kme) <- genes

  v3map <- read_tsv(file.path(oldref, "v1_to_v3_reciprocal50.tsv"))
  v5map <- read_tsv(file.path(oldref, "v1_to_v5_reciprocal50.tsv"))
  v3 <- read_tsv(file.path(oldref, "v3_mapman_pairs.tsv"))
  v5 <- read_tsv(file.path(oldref, "v5_mapman_pairs.tsv"))
  if (anyDuplicated(v3map$V1_gene) || anyDuplicated(v5map$V1_gene) ||
      anyDuplicated(v3[c("V1_gene", "TermID")]) ||
      anyDuplicated(v5[c("V1_gene", "TermID")])) {
    stop("Functional mapping or gene-term grain is not unique")
  }
  has_term <- function(tab, term) genes %in%
    tab$V1_gene[tab$TermID == term]
  sts <- has_term(v3, "9.2.3")
  pal3 <- has_term(v3, "9.2.1.1")
  pal5 <- has_term(v5, "9.2.1.1")
  flav5 <- has_term(v5, "9.2.2")
  chs5 <- has_term(v5, "9.2.2.2.1")
  tf3 <- has_term(v3, "15.5")
  tf5 <- has_term(v5, "15.5")
  nac3 <- has_term(v3, "15.5.17")
  nac5 <- has_term(v5, "15.5.7.1")
  family <- genes[sts]
  other <- genes[!sts]
  if (length(family) != 18L || sum(chs5) != 16L ||
      sum(sts & chs5) != 16L) stop("Unexpected M5 annotation overlap")

  id3 <- v3map$Annotation_gene[match(genes, v3map$V1_gene)]
  id5 <- v5map$Annotation_gene[match(genes, v5map$V1_gene)]
  f3 <- function_tables$v3[match(id3, function_tables$v3$gene), , drop = FALSE]
  f5 <- function_tables$v5[match(id5, function_tables$v5$gene), , drop = FALSE]
  if (any(!is.na(id3) & is.na(f3$gene)) ||
      any(!is.na(id5) & is.na(f5$gene))) {
    stop("Mapped genes are absent from functional summary")
  }
  aggregate_terms <- function(tab, field) {
    out <- vapply(genes, function(g) {
      values <- unique(tab[[field]][tab$V1_gene == g])
      if (!length(values)) return(NA_character_)
      paste(values, collapse = "; ")
    }, "")
    unname(out)
  }
  evidence <- data.frame(
    Gene = genes, V3_gene = id3, V5_gene = id5,
    V3_MapMan_terms = aggregate_terms(v3, "TermName"),
    V5_MapMan_terms = aggregate_terms(v5, "TermName"),
    V3_Pfam = f3$Pfam, V3_PANTHER = f3$PANTHER,
    V5_Chr = f5$chromosome, V5_GeneStart = f5$gene_start,
    V5_GeneEnd = f5$gene_end,
    V5_Pfam = f5$Pfam, V5_PANTHER = f5$PANTHER,
    V5_OtherDomains = f5$other_domain_databases,
    stringsAsFactors = FALSE)
  write_tsv(evidence, file.path(ref, "m5_function_evidence.tsv"))
  pfam_pks <- grepl("PF00195|PF02797", f5$Pfam)
  pfam_nac <- grepl("PF02365", f5$Pfam)
  rank_all <- rank(-k, ties.method = "min")
  k_family <- rowSums(adj[, family, drop = FALSE])
  k_other <- rowSums(adj[, other, drop = FALSE])
  negative_weight <- vapply(seq_along(genes), function(i) {
    sum(adj[i, signed_cor[i, ] < 0])
  }, 0.0)
  ranks <- data.frame(
    Gene = genes, Rank_kWithin = as.integer(rank_all),
    kWithin = unname(k), kWithin_per_possible_edge = unname(k) / 107,
    kWithin_to_v3_stilbenoid_group = unname(k_family),
    kWithin_to_other_M5 = unname(k_other),
    Fraction_kWithin_to_v3_stilbenoid_group = unname(k_family / k),
    Fraction_kWithin_from_negative_correlations = unname(negative_weight / k),
    kME_signed = unname(kme), abs_kME = unname(abs(kme)),
    Rank_abs_kME = as.integer(rank(-abs(kme), ties.method = "min")),
    Top_decile_kWithin = rank_all <= ceiling(length(genes) * 0.1),
    V3_mapped = !is.na(id3), V5_mapped = !is.na(id5),
    V3_MapMan_annotated = genes %in% v3$V1_gene,
    V5_MapMan_annotated = genes %in% v5$V1_gene,
    V3_PAL_label = pal3, V5_PAL_label = pal5,
    V3_stilbenoid_label = sts, V5_flavonoid_label = flav5,
    V5_CHS_label = chs5, V3_TF_label = tf3, V5_TF_label = tf5,
    V3_NAC_label = nac3, V5_NAC_label = nac5,
    V5_Pfam_CHS_STS_shared_domain = pfam_pks,
    V5_Pfam_NAC_domain = pfam_nac,
    V3_V5_STS_CHS_label_conflict = sts & chs5,
    V3_gene = id3, V5_gene = id5,
    V5_Chr = f5$chromosome, V5_GeneStart = f5$gene_start,
    V5_GeneEnd = f5$gene_end,
    stringsAsFactors = FALSE)
  if (sum(ranks$V3_NAC_label & ranks$V5_NAC_label &
          ranks$V5_Pfam_NAC_domain) < 1L) {
    stop("NAC domain/category cross-check failed")
  }
  for (y in sort(unique(meta$Year))) {
    cs <- meta$SampleName[meta$Year == y & meta$Stage == "Harvest" &
                           meta$Cultivar == "Cabernet Sauvignon"]
    pn <- meta$SampleName[meta$Year == y & meta$Stage == "Harvest" &
                           meta$Cultivar == "Pinot noir"]
    if (length(cs) != 3L || length(pn) != 3L) stop("Unbalanced Harvest cell")
    ranks[[paste0("Harvest_CS_minus_PN_", y)]] <-
      rowMeans(x[, cs, drop = FALSE]) - rowMeans(x[, pn, drop = FALSE])
  }
  harvest_cols <- grep("^Harvest_CS_minus_PN_", names(ranks), value = TRUE)
  ranks$Harvest_same_direction_all_years <-
    apply(ranks[harvest_cols], 1, function(z) all(z > 0) || all(z < 0))

  score <- function(q) {
    a <- abs(stats::cor(t(q)))^10
    diag(a) <- 0
    rowSums(a)
  }
  sensitivity <- data.frame(Gene = genes, Rank_primary = as.integer(rank_all),
                            stringsAsFactors = FALSE)
  summaries <- list()
  primary_top <- genes[rank_all <= ceiling(length(genes) * 0.1)]
  for (y in sort(unique(meta$Year))) {
    keep <- meta$Year != y
    s <- score(x[, keep, drop = FALSE])
    sensitivity[[paste0("Rank_without_", y)]] <-
      as.integer(rank(-s, ties.method = "min"))
    summaries[[paste0("without_", y)]] <- c(
      Spearman = stats::cor(k, s, method = "spearman"),
      Top11_overlap = length(intersect(primary_top,
        genes[rank(-s, ties.method = "min") <= length(primary_top)])))
  }
  flagged <- "GSM2627837"
  if (!flagged %in% colnames(x)) stop("Flagged T-003 sample missing")
  s <- score(x[, colnames(x) != flagged, drop = FALSE])
  sensitivity$Rank_without_GSM2627837 <-
    as.integer(rank(-s, ties.method = "min"))
  summaries$without_GSM2627837 <- c(
    Spearman = stats::cor(k, s, method = "spearman"),
    Top11_overlap = length(intersect(primary_top,
      genes[rank(-s, ties.method = "min") <= length(primary_top)])))
  write_tsv(sensitivity[order(sensitivity$Rank_primary), ],
            file.path(out, "m5_hub_rank_sensitivity.tsv"))

  ranks <- ranks[order(ranks$Rank_kWithin, ranks$Gene), ]
  rownames(ranks) <- NULL
  write_tsv(ranks, file.path(out, "m5_full_hub_ranking.tsv"))
  focus <- ranks[ranks$Top_decile_kWithin | ranks$V3_TF_label |
                   ranks$V5_TF_label | ranks$V3_PAL_label, ]
  focus$Selection_reason <- vapply(seq_len(nrow(focus)), function(i) {
    paste(c(if (focus$Top_decile_kWithin[i]) "top_decile_kWithin",
            if (focus$V3_TF_label[i] || focus$V5_TF_label[i]) "TF_label",
            if (focus$V3_PAL_label[i]) "v3_PAL_label"), collapse = ";")
  }, "")
  write_tsv(focus, file.path(out, "m5_focus_genes.tsv"))

  edge_index <- which(upper.tri(adj), arr.ind = TRUE)
  edges <- data.frame(Gene1 = genes[edge_index[, 1]],
                      Gene2 = genes[edge_index[, 2]],
                      Pearson_r = signed_cor[edge_index],
                      Beta10_unsigned_adjacency = adj[edge_index],
                      Pair_group = ifelse(sts[edge_index[, 1]] &
                                            sts[edge_index[, 2]], "family_family",
                                   ifelse(sts[edge_index[, 1]] |
                                            sts[edge_index[, 2]], "family_other",
                                          "other_other")),
                      stringsAsFactors = FALSE)
  write_tsv(edges, file.path(out, "m5_all_intramodular_edges.tsv"))

  rest_pc1 <- stats::prcomp(t(x[other, , drop = FALSE]),
                            center = TRUE, scale. = TRUE)$x[, 1]
  if (stats::cor(rest_pc1, eig$M5) < 0) rest_pc1 <- -rest_pc1
  sample_sensitivity <- data.frame(
    SampleName = meta$SampleName, Cultivar = meta$Cultivar,
    Stage = meta$Stage, Year = meta$Year,
    M5_original_PC1 = eig$M5,
    M5_without_v3_stilbenoid_genes_PC1 = as.numeric(rest_pc1),
    stringsAsFactors = FALSE)
  write_tsv(sample_sensitivity,
            file.path(out, "m5_eigengene_without_family_sensitivity.tsv"))
  harvest_pc1 <- lapply(sort(unique(meta$Year)), function(y) {
    d <- sample_sensitivity[sample_sensitivity$Year == y &
                              sample_sensitivity$Stage == "Harvest", ]
    cs <- d$Cultivar == "Cabernet Sauvignon"
    pn <- d$Cultivar == "Pinot noir"
    data.frame(Year = y,
      Original_CS_minus_PN_SD =
        (mean(d$M5_original_PC1[cs]) - mean(d$M5_original_PC1[pn])) /
        stats::sd(sample_sensitivity$M5_original_PC1),
      Without_family_CS_minus_PN_SD =
        (mean(d$M5_without_v3_stilbenoid_genes_PC1[cs]) -
         mean(d$M5_without_v3_stilbenoid_genes_PC1[pn])) /
        stats::sd(sample_sensitivity$M5_without_v3_stilbenoid_genes_PC1),
      stringsAsFactors = FALSE)
  })
  harvest_pc1 <- do.call(rbind, harvest_pc1)
  write_tsv(harvest_pc1,
            file.path(out, "m5_harvest_without_family_sensitivity.tsv"))

  cluster <- ranks[ranks$V5_CHS_label,
                   c("Gene", "V5_gene", "V5_Chr", "V5_GeneStart",
                     "V5_GeneEnd")]
  if (nrow(cluster) != 16L || anyNA(cluster) ||
      !all(cluster$V5_Chr == "chr16")) {
    stop("V5 CHS-labeled positional cluster is incomplete")
  }
  qc <- data.frame(
    Metric = c("M5_genes", "Frozen_adjacency_max_abs_error_vs_abs_cor_power10",
      "V3_stilbenoid_labeled_genes", "V5_CHS_labeled_genes",
      "V3_STS_and_V5_CHS_overlap", "V3_PAL_labeled_genes",
      "V5_PAL_labeled_genes", "V3_TF_labeled_genes",
      "V5_TF_labeled_genes", "Top_decile_genes",
      "Top_decile_v3_stilbenoid_labeled", "V5_CHS_cluster_min_start_chr16",
      "V5_CHS_cluster_max_end_chr16", "V5_CHS_cluster_span_bp",
      "Mean_adjacency_family_family", "Mean_adjacency_family_other",
      "Mean_adjacency_other_other", "Original_vs_without_family_PC1_r",
      paste0("Spearman_", names(summaries)),
      paste0("Top11_overlap_", names(summaries))),
    Value = c(length(genes), max(abs(frozen - abs(signed_cor)^10)),
      sum(sts), sum(chs5), sum(sts & chs5), sum(pal3), sum(pal5),
      sum(tf3), sum(tf5), length(primary_top), sum(sts[match(primary_top, genes)]),
      min(cluster$V5_GeneStart), max(cluster$V5_GeneEnd),
      max(cluster$V5_GeneEnd) - min(cluster$V5_GeneStart) + 1,
      mean(edges$Beta10_unsigned_adjacency[edges$Pair_group == "family_family"]),
      mean(edges$Beta10_unsigned_adjacency[edges$Pair_group == "family_other"]),
      mean(edges$Beta10_unsigned_adjacency[edges$Pair_group == "other_other"]),
      stats::cor(eig$M5, rest_pc1),
      vapply(summaries, function(z) z["Spearman"], 0.0),
      vapply(summaries, function(z) z["Top11_overlap"], 0.0)),
    stringsAsFactors = FALSE)
  write_tsv(qc, file.path(out, "m5_hub_qc.tsv"))
  writeLines(c(
    "T-006 M5-focused hub prioritization on frozen beta10 network",
    "primary_hub_metric=sum of off-diagonal intramodular unsigned Pearson adjacency abs(r)^10",
    "top_decile=11 of 108; descriptive threshold, not a statistical claim",
    "secondary_metric=absolute correlation to existing M5 PC1 eigengene (kME)",
    "functional_labels=v3/v5 Grapedia MapMan plus v3/v5 functional summaries",
    "v3_stilbenoid_and_v5_CHS_labels_for_same_genes_are_not_independent_functional_proof",
    "Pfam_PF00195_PF02797_identifies_shared_CHS_STS_family_not_precise_enzyme_activity",
    "NAC_PF02365_is_domain_evidence_not_regulatory_causality",
    "source_expression=unchanged_54_sample_log2RPKM_plus_1",
    "no_CEMiTool_rerun_no_sample_exclusion",
    "Harvest_gene_differences_are_descriptive_not_gene_level_significance_tests",
    "family_removal_and_leave_year_out_are_sensitivity_only_not_new_primary_network",
    "pericarp_not_isolated_skin_no_skin_thickness_phenotype",
    "functional_source_URL_SHA=data/reference/grapedia_t006/source_manifest.tsv"
  ), file.path(out, "analysis_summary.txt"))
  cat("M5 hub prioritization complete: ", nrow(ranks), " ranked genes, ",
      nrow(edges), " within-module pairs.\n", sep = "")
  print(qc, row.names = FALSE)
}

run_m5_hubs()
