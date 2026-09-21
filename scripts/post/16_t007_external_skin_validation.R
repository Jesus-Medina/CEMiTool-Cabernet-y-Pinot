# T-007: independent skin-only validation of frozen beta10 hub candidates.
# GSE72421 is a 2011 microarray; PRJNA260535 is 2012 late-ripening RNA-seq.
# These sources are never merged with GSE98923 or treated as stage/year replicates.

run_t007 <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repository root")
  if (!requireNamespace("digest", quietly = TRUE)) stop("digest required")
  ref <- file.path(root, "data/reference/external_t007")
  out <- file.path(root, "results/external_skin_validation_beta10")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  read_tsv <- function(path) read.delim(path, check.names = FALSE,
    stringsAsFactors = FALSE, fileEncoding = "UTF-8")
  write_tsv <- function(d, path) write.table(d, path, sep = "\t",
    quote = TRUE, row.names = FALSE, na = "NA", fileEncoding = "UTF-8")
  manifest <- read_tsv(file.path(ref, "source_manifest.tsv"))
  if (nrow(manifest) != 3L || anyDuplicated(manifest$File)) {
    stop("Unexpected T-007 source manifest")
  }
  for (i in seq_len(nrow(manifest))) {
    path <- file.path(ref, manifest$File[i])
    if (!file.exists(path) || file.info(path)$size != manifest$Bytes[i] ||
        digest::digest(file = path, algo = "sha256") != manifest$SHA256[i]) {
      stop("T-007 source file/hash mismatch")
    }
  }
  selected <- scan(file.path(root, "results/beta10/tables/selected_genes.txt"),
    what = "", quiet = TRUE)
  if (length(selected) != 3050L || anyDuplicated(selected)) {
    stop("Unexpected frozen beta10 gene universe")
  }
  m5 <- read_tsv(file.path(root,
    "results/hub_prioritization_beta10/m5_full_hub_ranking.tsv"))
  others <- read_tsv(file.path(root,
    "results/hub_prioritization_beta10/m10_m2_full_hub_ranking.tsv"))
  m5$Module <- "M5"
  keep <- c("Module", "Gene", "Rank_kWithin", "Top_decile_kWithin",
    "Harvest_CS_minus_PN_2012", "Harvest_CS_minus_PN_2013",
    "Harvest_CS_minus_PN_2014")
  priorities <- rbind(m5[keep], others[keep])
  priorities <- priorities[order(factor(priorities$Module,
    levels = c("M5", "M10", "M2")), priorities$Rank_kWithin), ]
  rownames(priorities) <- NULL
  if (nrow(priorities) != 361L || anyDuplicated(priorities$Gene) ||
      !all(priorities$Gene %in% selected) ||
      sum(priorities$Top_decile_kWithin) != 37L) {
    stop("Frozen priority/hub list changed")
  }
  primary_cols <- paste0("Harvest_CS_minus_PN_", 2012:2014)
  priorities$Primary_Harvest_sign_stable <- apply(
    priorities[primary_cols], 1, function(z) all(z > 0) || all(z < 0))
  priorities$Primary_Harvest_direction <- ifelse(
    priorities$Primary_Harvest_sign_stable,
    sign(rowMeans(priorities[primary_cols])), NA_real_)

  # GEO series matrix: all 50 samples and original probe IDs, no hidden subset.
  array_path <- file.path(ref, "GSE72421_series_matrix.txt.gz")
  geo_lines <- readLines(gzfile(array_path), warn = FALSE)
  begin <- which(geo_lines == "!series_matrix_table_begin")
  end <- which(geo_lines == "!series_matrix_table_end")
  if (length(begin) != 1L || length(end) != 1L ||
      end - begin - 2L != 29549L) stop("GEO matrix boundary mismatch")
  sample_line <- function(prefix) {
    x <- geo_lines[startsWith(geo_lines, prefix)]
    if (length(x) != 1L) stop(paste("GEO metadata row missing:", prefix))
    gsub('^"|"$', "", strsplit(x, "\t", fixed = TRUE)[[1]][-1])
  }
  geo_ids <- sample_line("!Sample_geo_accession")
  geo_titles <- sample_line("!Sample_title")
  if (length(geo_ids) != 50L || length(geo_titles) != 50L ||
      anyDuplicated(geo_ids)) stop("GEO sample metadata invalid")
  array <- read.delim(gzfile(array_path), skip = begin, nrows = 29549L,
    check.names = FALSE, stringsAsFactors = FALSE)
  if (nrow(array) != 29549L || ncol(array) != 51L ||
      !identical(names(array)[-1], geo_ids) ||
      anyDuplicated(array$ID_REF)) {
    stop(sprintf("GEO expression matrix QC failed: rows=%d cols=%d header_match=%s duplicate_ID=%d missing=%d",
      nrow(array), ncol(array), identical(names(array)[-1], geo_ids),
      anyDuplicated(array$ID_REF), sum(is.na(array))))
  }
  if (!all(vapply(array[-1], is.numeric, logical(1))) ||
      any(!is.finite(as.matrix(array[-1])) & !is.na(as.matrix(array[-1])))) {
    stop("GEO expression columns must be numeric, finite or source NA")
  }
  array_annot <- read.delim(gzfile(file.path(ref,
    "GSE72421_annotation.txt.gz")), check.names = FALSE,
    stringsAsFactors = FALSE)
  if (nrow(array_annot) != 29549L ||
      anyDuplicated(array_annot$ID_REF) ||
      anyDuplicated(array_annot[["New ID"]]) ||
      !setequal(array$ID_REF, array_annot$ID_REF)) {
    stop("GEO probe-to-V1 gene mapping is not one-to-one")
  }
  array$Gene <- array_annot[["New ID"]][match(array$ID_REF,
    array_annot$ID_REF)]
  geo_meta <- data.frame(SampleName = geo_ids, Title = geo_titles,
    stringsAsFactors = FALSE)
  parsed <- regexec("^Berry_skin_(CS|PN)-(WW|WD)-rep([1-6])$",
    geo_meta$Title)
  parts <- regmatches(geo_meta$Title, parsed)
  for (i in seq_along(parts)) {
    if (!length(parts[[i]]) && startsWith(geo_meta$Title[i], "Berry_skin_CS")) {
      stop("Unparsed Cabernet sample title")
    }
    if (!length(parts[[i]]) && startsWith(geo_meta$Title[i], "Berry_skin_PN")) {
      stop("Unparsed Pinot sample title")
    }
  }
  geo_meta$Cultivar <- vapply(parts, function(z) if (length(z))
    if (z[2] == "CS") "Cabernet Sauvignon" else "Pinot noir" else NA_character_, "")
  geo_meta$Treatment <- vapply(parts, function(z) if (length(z))
    z[3] else NA_character_, "")
  geo_meta$Replicate <- vapply(parts, function(z) if (length(z))
    as.integer(z[4]) else NA_integer_, 0L)
  geo_meta$Year <- 2011L
  geo_meta$Tissue <- "berry skin"
  geo_meta$Stage <- "near-harvest ~24 Brix"
  if (sum(!is.na(geo_meta$Cultivar)) != 20L ||
      !all(table(geo_meta$Cultivar, geo_meta$Treatment) == 5L)) {
    stop("GEO Cabernet/Pinot/treatment sample design invalid")
  }
  write_tsv(geo_meta, file.path(out, "gse72421_sample_audit.tsv"))

  # Independently published skin RNA-seq: only the extracted beta10 gene subset.
  rna <- read_tsv(file.path(root,
    "data/processed/external_t007/PRJNA260535_beta10_log2cpm.tsv"))
  rna_meta <- read_tsv(file.path(root,
    "data/metadata/external_t007/PRJNA260535_samples.tsv"))
  if (nrow(rna) != 2062L || ncol(rna) != 85L ||
      anyDuplicated(rna$Gene) || !all(rna$Gene %in% selected) ||
      nrow(rna_meta) != 84L || anyDuplicated(rna_meta$SampleName) ||
      !identical(names(rna)[-1], rna_meta$SampleName) || anyNA(rna) ||
      anyNA(rna_meta)) stop("RNA-seq extraction/mapping QC failed")
  for (cv in c("Cabernet Sauvignon", "Pinot noir")) {
    if (!all(table(rna_meta$Brix[rna_meta$Cultivar == cv]) == 3L)) {
      stop("RNA-seq Cabernet/Pinot/Brix sample design invalid")
    }
  }
  write_tsv(rna_meta, file.path(out, "prjna260535_sample_audit.tsv"))

  comparisons <- rbind(
    data.frame(Dataset = "GSE72421", Condition = c("WW", "WD"),
      Platform = "microarray", stringsAsFactors = FALSE),
    data.frame(Dataset = "PRJNA260535", Condition = as.character(c(20, 22, 24, 26)),
      Platform = "RNA-seq log2CPM", stringsAsFactors = FALSE))
  results <- list()
  row_idx <- 0L
  for (c in seq_len(nrow(comparisons))) {
    study <- comparisons$Dataset[c]
    condition <- comparisons$Condition[c]
    if (study == "GSE72421") {
      names_cs <- geo_meta$SampleName[!is.na(geo_meta$Cultivar) &
        geo_meta$Cultivar == "Cabernet Sauvignon" &
        geo_meta$Treatment == condition]
      names_pn <- geo_meta$SampleName[!is.na(geo_meta$Cultivar) &
        geo_meta$Cultivar == "Pinot noir" &
        geo_meta$Treatment == condition]
      source <- array
    } else {
      names_cs <- rna_meta$SampleName[rna_meta$Cultivar == "Cabernet Sauvignon" &
        rna_meta$Brix == as.integer(condition)]
      names_pn <- rna_meta$SampleName[rna_meta$Cultivar == "Pinot noir" &
        rna_meta$Brix == as.integer(condition)]
      source <- rna
    }
    expected_n <- if (study == "GSE72421") 5L else 3L
    if (length(names_cs) != expected_n || length(names_pn) != expected_n) {
      stop(sprintf("External comparison is unbalanced: %s/%s CS=%d PN=%d",
        study, condition, length(names_cs), length(names_pn)))
    }
    ix <- match(priorities$Gene, source$Gene)
    for (i in seq_len(nrow(priorities))) {
      present <- !is.na(ix[i])
      cs <- if (present) as.numeric(source[ix[i], names_cs]) else rep(NA_real_, length(names_cs))
      pn <- if (present) as.numeric(source[ix[i], names_pn]) else rep(NA_real_, length(names_pn))
      complete <- present && !anyNA(cs) && !anyNA(pn)
      test <- if (complete && stats::sd(cs) + stats::sd(pn) > 0) {
        tryCatch(stats::t.test(cs, pn, var.equal = FALSE),
          error = function(e) NULL)
      } else NULL
      delta <- if (complete) mean(cs) - mean(pn) else NA_real_
      row_idx <- row_idx + 1L
      results[[row_idx]] <- data.frame(
        Dataset = study, Condition = condition,
        Platform = comparisons$Platform[c], Module = priorities$Module[i],
        Gene = priorities$Gene[i], Rank_kWithin = priorities$Rank_kWithin[i],
        Top_decile_kWithin = priorities$Top_decile_kWithin[i],
        Primary_Harvest_CS_minus_PN_2012 = priorities[[primary_cols[1]]][i],
        Primary_Harvest_CS_minus_PN_2013 = priorities[[primary_cols[2]]][i],
        Primary_Harvest_CS_minus_PN_2014 = priorities[[primary_cols[3]]][i],
        Primary_Harvest_sign_stable = priorities$Primary_Harvest_sign_stable[i],
        Assayed = present, Complete_data = complete,
        CS_observed_replicates = sum(!is.na(cs)),
        PN_observed_replicates = sum(!is.na(pn)),
        Mean_CS = if (complete) mean(cs) else NA_real_,
        Mean_PN = if (complete) mean(pn) else NA_real_,
        Mean_CS_minus_PN = delta,
        Welch_p = if (is.null(test)) NA_real_ else test$p.value,
        Welch_CI95_lower = if (is.null(test)) NA_real_ else test$conf.int[1],
        Welch_CI95_upper = if (is.null(test)) NA_real_ else test$conf.int[2],
        Direction_matches_stable_primary = if (complete &&
          priorities$Primary_Harvest_sign_stable[i] && delta != 0)
          sign(delta) == priorities$Primary_Harvest_direction[i] else NA,
        CS_replicates = length(cs), PN_replicates = length(pn),
        CS_log2CPM_ge_0_replicates = if (study == "PRJNA260535" && present)
          sum(cs >= 0) else NA_integer_,
        PN_log2CPM_ge_0_replicates = if (study == "PRJNA260535" && present)
          sum(pn >= 0) else NA_integer_,
        stringsAsFactors = FALSE)
    }
  }
  results <- do.call(rbind, results)
  rownames(results) <- NULL
  results$BH_priority_361 <- NA_real_
  results$BH_prespecified_top37 <- NA_real_
  for (key in unique(paste(results$Dataset, results$Condition))) {
    idx <- which(paste(results$Dataset, results$Condition) == key)
    pidx <- idx[!is.na(results$Welch_p[idx])]
    hidx <- pidx[results$Top_decile_kWithin[pidx]]
    results$BH_priority_361[pidx] <- p.adjust(results$Welch_p[pidx], "BH", n = 361L)
    results$BH_prespecified_top37[hidx] <- p.adjust(results$Welch_p[hidx], "BH", n = 37L)
  }
  if (nrow(results) != 361L * 6L ||
      anyDuplicated(results[c("Dataset", "Condition", "Gene")])) {
    stop("External result grain invalid")
  }
  write_tsv(results, file.path(out, "all_priority_gene_comparisons.tsv"))

  summary_rows <- list()
  z <- 0L
  for (module in c("M5", "M10", "M2")) {
    for (c in seq_len(nrow(comparisons))) {
      q <- results[results$Module == module &
        results$Dataset == comparisons$Dataset[c] &
        results$Condition == comparisons$Condition[c], ]
      h <- q[q$Top_decile_kWithin, ]
      z <- z + 1L
      summary_rows[[z]] <- data.frame(
        Dataset = comparisons$Dataset[c], Condition = comparisons$Condition[c],
        Module = module, Module_genes = nrow(q), Assayed_genes = sum(q$Assayed),
        Complete_data_genes = sum(q$Complete_data),
        Stable_primary_assayed_genes = sum(q$Complete_data & q$Primary_Harvest_sign_stable),
        Direction_matched_stable_genes = sum(q$Direction_matches_stable_primary,
          na.rm = TRUE),
        Top_hubs = nrow(h), Assayed_top_hubs = sum(h$Assayed),
        Complete_data_top_hubs = sum(h$Complete_data),
        Direction_matched_stable_top_hubs = sum(
          h$Direction_matches_stable_primary, na.rm = TRUE),
        Top_hubs_BH37_lt_005 = sum(h$BH_prespecified_top37 < 0.05, na.rm = TRUE),
        Top_hubs_BH361_lt_005 = sum(h$BH_priority_361 < 0.05, na.rm = TRUE),
        stringsAsFactors = FALSE)
    }
  }
  summary <- do.call(rbind, summary_rows)
  write_tsv(summary, file.path(out, "module_coverage_direction_summary.tsv"))
  hub <- results[results$Top_decile_kWithin, ]
  write_tsv(hub, file.path(out, "prespecified_37_hub_comparisons.tsv"))
  primary_conditions <- hub[(hub$Dataset == "GSE72421" & hub$Condition == "WW") |
    (hub$Dataset == "PRJNA260535" & hub$Condition == "24"), ]
  write_tsv(primary_conditions,
    file.path(out, "primary_external_condition_hubs.tsv"))
  geo_priority_idx <- match(priorities$Gene, array$Gene)
  geo_priority_observed <- array[geo_priority_idx[!is.na(geo_priority_idx)], geo_ids]
  qc <- data.frame(
    Metric = c("GSE_array_probes", "GSE_unique_V1_genes", "GSE_all_samples",
      "GSE_CS_PN_samples", "RNA_source_filtered_genes",
      "RNA_beta10_extracted_genes", "RNA_all_samples", "RNA_CS_PN_samples",
      "Frozen_priority_genes", "Frozen_top_decile_hubs", "Comparison_rows",
      "GSE_array_mapping_duplicate_V1_IDs", "GSE_array_missing_expression",
      "RNA_selected_missing_expression", "GSE_assayed_priority_missing_expression",
      "GSE_assayed_priority_incomplete_genes_all_50"),
    Value = c(nrow(array), length(unique(array$Gene)), length(geo_ids),
      sum(!is.na(geo_meta$Cultivar)), 16606, nrow(rna), nrow(rna_meta),
      sum(rna_meta$Cultivar %in% c("Cabernet Sauvignon", "Pinot noir")),
      nrow(priorities), sum(priorities$Top_decile_kWithin), nrow(results),
      sum(duplicated(array$Gene)), sum(is.na(array[-c(1, ncol(array))])),
      sum(is.na(rna[-1])),
      sum(is.na(geo_priority_observed)),
      sum(rowSums(is.na(geo_priority_observed)) > 0)),
      stringsAsFactors = FALSE)
  write_tsv(qc, file.path(out, "external_source_qc.tsv"))
  writeLines(c(
    "T-007 skin-only external validation of preselected beta10 M5/M10/M2 hubs",
    "GSE72421=2011 harvest skin microarray; primary WW comparison, WD sensitivity",
    "PRJNA260535=2012 late-ripening skin RNA-seq; primary 24 Brix, 20/22/26 sensitivities",
    "37 hubs predefined as beta10 top decile before reading external matrices",
    "Welch tests are exploratory on processed data; BH within 37 hubs and all 361 priority genes per external comparison",
    "Direction comparison uses only primary Harvest genes with same CS-PN sign in 2012/2013/2014",
    "Missing RNA gene reflects source low-count filtering, not biological absence",
    "Microarray probe mapping one-to-one does not rule out probe cross-hybridization",
    "GEO matrix has source missing cells; incomplete gene-condition comparisons have no effect/test and are never imputed",
    "RNA-seq uses PN40024 V1 reference and does not resolve paralogs or cultivar-specific mapping bias",
    "No Stage/Year equivalence, pooling, or skin-thickness phenotype inference",
    "Source URL SHA and binary originals=data/reference/external_t007"
  ), file.path(out, "analysis_summary.txt"))
  cat("T-007 external skin validation complete: ", nrow(results),
    " module-gene-condition rows; ", nrow(hub), " hub-condition rows.\n",
    sep = "")
  print(summary, row.names = FALSE)
}

run_t007()
