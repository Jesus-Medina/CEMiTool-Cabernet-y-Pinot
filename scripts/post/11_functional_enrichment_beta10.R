# T-005: module-wide over-representation analysis (ORA) on frozen beta10 genes.
# Run after script 10, from the canonical repository root.
# MapMan v3 is primary because legacy VIT IDs retain high coverage; PN40024
# T2T v5.1 MapMan/GO are versioned secondary checks with coverage warnings.

run_t005_enrichment <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repository root")
  ref <- file.path(root, "data/reference/grapedia_t005")
  out <- file.path(root, "results/functional_enrichment_beta10")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  read_tsv <- function(name) {
    path <- file.path(ref, name)
    if (!file.exists(path)) stop("Missing prepared T-005 input: ", path)
    read.delim(path, check.names = FALSE, stringsAsFactors = FALSE,
               fileEncoding = "UTF-8")
  }
  write_tsv <- function(x, name) {
    write.table(x, file.path(out, name), sep = "\t", quote = FALSE,
                row.names = FALSE, na = "NA", fileEncoding = "UTF-8")
  }
  coverage <- read_tsv("gene_coverage_audit.tsv")
  modules <- paste0("M", 1:10)
  if (nrow(coverage) != 3050L || anyDuplicated(coverage$V1_gene) ||
      anyNA(coverage) || !setequal(coverage$Module,
                                    c(modules, "Not.Correlated"))) {
    stop("Prepared beta10 gene coverage is malformed")
  }
  sources <- list(
    v3_mapman = read_tsv("v3_mapman_pairs.tsv"),
    v5_mapman = read_tsv("v5_mapman_pairs.tsv"),
    v5_go = read_tsv("v5_go_pairs.tsv"))
  # Dataset selection, including obsolete GO filtering, precedes all p-values.
  sources$v5_go <- sources$v5_go[
    !grepl("obsolete", sources$v5_go$TermName, ignore.case = TRUE), ]
  term_tables <- list()
  qc_rows <- list()
  for (source_name in names(sources)) {
    pairs <- sources[[source_name]]
    if (anyNA(pairs) || anyDuplicated(pairs[c("V1_gene", "TermID")]) ||
        !all(pairs$V1_gene %in% coverage$V1_gene)) {
      stop("Invalid gene-term grain in ", source_name)
    }
    labels <- unique(pairs[c("TermID", "TermName")])
    if (anyDuplicated(labels$TermID)) stop("Term names conflict in ", source_name)
    universe <- sort(unique(pairs$V1_gene))
    N <- length(universe)
    term_genes <- split(pairs$V1_gene, pairs$TermID)
    K <- lengths(term_genes)
    source_rows <- list()
    for (m in modules) {
      in_module <- coverage$V1_gene[coverage$Module == m]
      annotated_module <- intersect(in_module, universe)
      n <- length(annotated_module)
      rows <- lapply(seq_along(term_genes), function(i) {
        id <- names(term_genes)[i]
        hits <- intersect(term_genes[[i]], annotated_module)
        k <- length(hits)
        tested <- n >= 5L && K[i] >= 5L && K[i] <= 500L
        p <- if (tested) {
          stats::phyper(k - 1L, K[i], N - K[i], n, lower.tail = FALSE)
        } else NA_real_
        data.frame(Source = source_name, Module = m,
                   TermID = id,
                   TermName = labels$TermName[match(id, labels$TermID)],
                   Background_N = N, Module_n = n,
                   Term_background_K = K[i], Overlap_k = k,
                   Expected_overlap = n * K[i] / N,
                   Fold_enrichment = if (n * K[i] > 0L) {
                     k * N / (n * K[i])
                   } else NA_real_,
                   Tested = tested,
                   Reason_if_not_tested = if (tested) "" else if (n < 5L) {
                     "fewer_than_5_annotated_module_genes"
                   } else "term_background_size_outside_5_to_500",
                   p_value = p,
                   Hit_genes = paste(sort(hits), collapse = ";"),
                   stringsAsFactors = FALSE)
      })
      source_rows[[m]] <- do.call(rbind, rows)
      qc_rows[[paste(source_name, m)]] <- data.frame(
        Source = source_name, Module = m,
        Assigned_module_genes = length(in_module),
        Annotated_module_genes = n,
        Coverage_percent = 100 * n / length(in_module),
        Background_annotated_genes = N,
        Terms_with_any_selected_gene = length(term_genes),
        stringsAsFactors = FALSE)
    }
    result <- do.call(rbind, source_rows)
    rownames(result) <- NULL
    result$FDR_within_module <- NA_real_
    for (m in modules) {
      i <- which(result$Module == m & result$Tested)
      result$FDR_within_module[i] <- p.adjust(result$p_value[i], "BH")
    }
    i <- which(result$Tested)
    result$FDR_global_module_terms <- NA_real_
    result$FDR_global_module_terms[i] <- p.adjust(result$p_value[i], "BH")
    term_tables[[source_name]] <- result
    write_tsv(result, paste0(source_name, "_all_terms.tsv"))
  }

  qc <- do.call(rbind, qc_rows)
  rownames(qc) <- NULL
  qc$Terms_tested <- vapply(seq_len(nrow(qc)), function(i) {
    z <- term_tables[[qc$Source[i]]]
    sum(z$Module == qc$Module[i] & z$Tested)
  }, 0L)
  qc$Global_FDR_hits <- vapply(seq_len(nrow(qc)), function(i) {
    z <- term_tables[[qc$Source[i]]]
    sum(z$Module == qc$Module[i] & !is.na(z$FDR_global_module_terms) &
          z$FDR_global_module_terms < 0.05)
  }, 0L)
  qc$Coverage_warning <- qc$Coverage_percent < 50
  write_tsv(qc, "annotation_and_test_qc.tsv")

  # Prespecified broad themes. A theme is the union of every matching
  # MapMan category; it does NOT isolate genes contributing to a particular
  # stage/year contrast. Empty themes are retained as untestable rows.
  theme_patterns <- c(
    cuticle_cutin_wax = "cutin|suberin|cuticular|wax",
    epidermis = "epiderm",
    cell_wall = "Cell wall organisation",
    pectin = "Cell wall organisation[.]pectin",
    cellulose_hemicellulose = "cellulose|hemicellulose",
    lignin_lignification = "lignin|monolignol",
    phenylpropanoid = "phenylpropanoid|p-coumaroyl",
    flavonoid = "flavonoid",
    anthocyanin = "anthocyanin|proanthocyanidin")
  theme_tables <- list()
  for (source_name in c("v3_mapman", "v5_mapman")) {
    pairs <- sources[[source_name]]
    universe <- unique(pairs$V1_gene)
    N <- length(universe)
    terms <- unique(pairs[c("TermID", "TermName")])
    rows <- list()
    for (theme in names(theme_patterns)) {
      ids <- terms$TermID[grepl(theme_patterns[[theme]], terms$TermName,
                                ignore.case = TRUE)]
      genes <- sort(unique(pairs$V1_gene[pairs$TermID %in% ids]))
      K <- length(genes)
      for (m in modules) {
        assigned <- coverage$V1_gene[coverage$Module == m]
        eligible <- intersect(assigned, universe)
        n <- length(eligible)
        hits <- intersect(eligible, genes)
        k <- length(hits)
        tested <- length(ids) > 0L && K >= 5L && n >= 5L
        rows[[paste(theme, m)]] <- data.frame(
          Source = source_name, Theme = theme, Module = m,
          Matched_MapMan_terms = length(ids),
          Background_N = N, Module_n = n, Theme_background_K = K,
          Overlap_k = k, Expected_overlap = n * K / N,
          Fold_enrichment = if (n * K > 0L) k * N / (n * K) else NA_real_,
          Tested = tested,
          Reason_if_not_tested = if (tested) "" else if (!length(ids)) {
            "theme_absent_from_taxonomy"
          } else if (K < 5L) "fewer_than_5_background_genes" else {
            "fewer_than_5_annotated_module_genes"
          },
          p_value = if (tested) {
            stats::phyper(k - 1L, K, N - K, n, lower.tail = FALSE)
          } else NA_real_,
          Hit_genes = paste(sort(hits), collapse = ";"),
          stringsAsFactors = FALSE)
      }
    }
    result <- do.call(rbind, rows)
    rownames(result) <- NULL
    result$FDR_global_themes <- NA_real_
    i <- which(result$Tested)
    result$FDR_global_themes[i] <- p.adjust(result$p_value[i], "BH")
    result$Coverage_warning <- qc$Coverage_warning[
      match(paste(result$Source, result$Module),
            paste(qc$Source, qc$Module))]
    theme_tables[[source_name]] <- result
    write_tsv(result, paste0(source_name, "_prespecified_themes.tsv"))
  }

  # A compact, non-cherry-picked hit table for browsing; the all-term files
  # remain authoritative for inference and include every tested null result.
  primary <- term_tables$v3_mapman
  hits <- primary[!is.na(primary$FDR_global_module_terms) &
                    primary$FDR_global_module_terms < 0.05, ]
  hits <- hits[order(hits$FDR_global_module_terms, hits$Module,
                     hits$TermID), ]
  write_tsv(hits, "v3_mapman_global_FDR05_hits.tsv")
  writeLines(c(
    "T-005 beta10 functional enrichment",
    paste0("completed=", Sys.time()),
    "gene_universe=3050 frozen beta10 filtered genes; Not.Correlated excluded from module tests",
    "primary=v3 MapMan, verified Grapedia annotation, direct reciprocal one-to-one v1 mapping, same strand, >=50% gene overlap",
    "secondary=PN40024 T2T v5.1 MapMan and GO with the same mapping rule",
    "ORA=one-sided hypergeometric overrepresentation; background=all selected genes with >=1 valid source annotation",
    "full_term_tests=term background size 5..500, module annotated n>=5; zero-hit terms included",
    "GO=obsolete-labeled terms excluded before testing",
    "FDR=BH within module and globally across all module-term tests per source; global FDR primary",
    "themes=prespecified unions of matching MapMan categories; BH across all testable module-theme combinations per source",
    "a_module_term_enrichment_does_not_identify_stage_specific_drivers_or_skin_specificity",
    "source_hashes_and_urls=data/reference/grapedia_t005/source_manifest.tsv"
  ), file.path(out, "analysis_summary.txt"))
  cat("T-005 enrichment complete: ", nrow(primary),
      " v3 module-term rows; ", nrow(hits),
      " v3 global-FDR hits; themes retained for every module.\n", sep = "")
  print(qc[qc$Module %in% c("M10", "M5", "M2"),
           c("Source", "Module", "Coverage_percent", "Terms_tested",
             "Global_FDR_hits")], row.names = FALSE)
}

run_t005_enrichment()
