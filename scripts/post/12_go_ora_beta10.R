# GO-only follow-up to T-005. Run from the canonical repository root.
# Uses frozen beta10 modules and Grapedia T2T v5.1 gene-GO annotations.
# An official, SHA-pinned GO ontology determines obsolescence by ID, not name.

run_go_ora_beta10 <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repository root")
  if (!requireNamespace("digest", quietly = TRUE)) stop("R package digest is required")
  ref <- file.path(root, "data/reference/grapedia_t005")
  ontology_dir <- file.path(root, "data/reference/go_2026-07-26")
  out <- file.path(root, "results/go_ora_beta10")
  dir.create(ontology_dir, recursive = TRUE, showWarnings = FALSE)
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  read_tsv <- function(path) read.delim(path, check.names = FALSE,
                                        stringsAsFactors = FALSE,
                                        fileEncoding = "UTF-8")
  write_tsv <- function(x, path) write.table(x, path, sep = "\t", quote = FALSE,
                                              row.names = FALSE, na = "NA",
                                              fileEncoding = "UTF-8")
  ontology_url <- "https://current.geneontology.org/ontology/go.obo"
  ontology_sha <- "d3593751d885ca160b2ab7baf6c7eccd88ca3c4599f79436c674bad661095ff0"
  archive <- file.path(ontology_dir, "go.obo.gz")
  plain <- tempfile(fileext = ".obo")
  on.exit(unlink(plain), add = TRUE)
  if (file.exists(archive)) {
    compressed <- readBin(archive, "raw", n = file.info(archive)$size)
    writeBin(memDecompress(compressed, type = "gzip"), plain)
  } else {
    utils::download.file(ontology_url, plain, mode = "wb", quiet = TRUE)
  }
  actual_sha <- digest::digest(file = plain, algo = "sha256")
  if (!identical(actual_sha, ontology_sha)) {
    stop("GO ontology SHA-256 differs from the pinned 2026-07-26 release")
  }
  if (!file.exists(archive)) {
    raw <- readBin(plain, "raw", n = file.info(plain)$size)
    writeBin(memCompress(raw, type = "gzip"), archive)
  }
  lines <- readLines(plain, warn = FALSE, encoding = "UTF-8")
  version <- sub("^data-version: ", "", grep("^data-version: ", lines,
                                               value = TRUE)[1])
  if (!identical(version, "releases/2026-07-26")) stop("Unexpected GO release")
  starts <- which(lines == "[Term]")
  boundaries <- which(grepl("^\\[[A-Za-z]+\\]$", lines))
  nterms <- length(starts)
  ids <- names <- namespaces <- character(nterms)
  obsolete <- logical(nterms)
  alt_list <- vector("list", nterms)
  field <- function(block, prefix) {
    x <- grep(paste0("^", prefix), block, value = TRUE)
    if (!length(x)) "" else substring(x[1], nchar(prefix) + 1L)
  }
  for (i in seq_along(starts)) {
    end <- boundaries[findInterval(starts[i], boundaries) + 1L] - 1L
    if (is.na(end)) end <- length(lines)
    block <- lines[starts[i]:end]
    ids[i] <- field(block, "id: ")
    names[i] <- field(block, "name: ")
    namespaces[i] <- field(block, "namespace: ")
    obsolete[i] <- any(block == "is_obsolete: true")
    alt_list[[i]] <- sub("^alt_id: ", "", grep("^alt_id: ", block,
                                                value = TRUE))
  }
  ontology <- data.frame(OfficialID = ids, OfficialName = names,
                         Namespace = namespaces, IsObsolete = obsolete,
                         stringsAsFactors = FALSE)
  if (anyDuplicated(ontology$OfficialID) || any(!grepl("^GO:[0-9]{7}$", ids))) {
    stop("Malformed GO ontology term IDs")
  }
  alt <- data.frame(SourceID = unlist(alt_list, use.names = FALSE),
                    OfficialID = rep(ids, lengths(alt_list)),
                    stringsAsFactors = FALSE)
  if (anyDuplicated(alt$SourceID)) stop("Ambiguous GO alt_id")

  coverage <- read_tsv(file.path(ref, "gene_coverage_audit.tsv"))
  pairs <- read_tsv(file.path(ref, "v5_go_pairs.tsv"))
  old <- read_tsv(file.path(root,
                           "results/functional_enrichment_beta10/v5_go_all_terms.tsv"))
  modules <- paste0("M", 1:10)
  if (nrow(coverage) != 3050L || anyDuplicated(coverage$V1_gene) ||
      anyNA(coverage) || !setequal(coverage$Module,
                                   c(modules, "Not.Correlated")) ||
      anyNA(pairs) || anyDuplicated(pairs[c("V1_gene", "TermID")]) ||
      !all(pairs$V1_gene %in% coverage$V1_gene)) {
    stop("Malformed frozen beta10 or Grapedia GO input")
  }
  source_terms <- unique(pairs[c("TermID", "TermName")])
  if (anyDuplicated(source_terms$TermID)) stop("Conflicting Grapedia GO labels")
  j <- match(source_terms$TermID, ontology$OfficialID)
  alias <- is.na(j)
  j[alias] <- match(alt$OfficialID[match(source_terms$TermID[alias],
                                        alt$SourceID)], ontology$OfficialID)
  source_terms$OfficialID <- ontology$OfficialID[j]
  source_terms$OfficialName <- ontology$OfficialName[j]
  source_terms$Namespace <- ontology$Namespace[j]
  source_terms$Official_is_obsolete <- ontology$IsObsolete[j]
  source_terms$Grapedia_label_says_obsolete <- grepl("obsolete", source_terms$TermName,
                                                     ignore.case = TRUE)
  source_terms$Status <- ifelse(is.na(j), "missing_from_ontology",
                        ifelse(source_terms$Official_is_obsolete,
                               "obsolete_by_ontology",
                        ifelse(source_terms$Grapedia_label_says_obsolete,
                               "obsolete_by_Grapedia_label_only",
                        ifelse(alias, "live_alt_id", "live_primary_id"))))
  source_terms$Association_pairs <- as.integer(table(factor(
    pairs$TermID, levels = source_terms$TermID)))
  source_terms <- source_terms[order(source_terms$TermID), ]
  rownames(source_terms) <- NULL
  write_tsv(source_terms, file.path(out, "go_ontology_term_audit.tsv"))
  if (any(source_terms$Status == "missing_from_ontology")) {
    warning("Some Grapedia GO IDs are absent from the pinned ontology; excluded")
  }
  live <- source_terms$Status %in% c("live_primary_id", "live_alt_id")
  valid <- source_terms[live, ]
  pairs <- pairs[pairs$TermID %in% valid$TermID, ]
  pairs$TermID <- valid$OfficialID[match(pairs$TermID, valid$TermID)]
  pairs <- unique(pairs[c("V1_gene", "TermID")])
  labels <- unique(ontology[ontology$OfficialID %in% pairs$TermID,
                            c("OfficialID", "OfficialName", "Namespace")])
  universe <- sort(unique(pairs$V1_gene))
  N <- length(universe)
  if (N < 100L || !nrow(pairs)) stop("GO annotation coverage unexpectedly low")
  term_genes <- split(pairs$V1_gene, pairs$TermID)
  K <- lengths(term_genes)
  output <- vector("list", length(modules))
  qc <- vector("list", length(modules))
  for (mi in seq_along(modules)) {
    m <- modules[mi]
    assigned <- coverage$V1_gene[coverage$Module == m]
    eligible <- intersect(assigned, universe)
    n <- length(eligible)
    rows <- lapply(seq_along(term_genes), function(i) {
      id <- names(term_genes)[i]
      hits <- intersect(term_genes[[i]], eligible)
      k <- length(hits)
      tested <- n >= 5L && K[i] >= 5L && K[i] <= 500L
      data.frame(Module = m, Aspect = labels$Namespace[
                   match(id, labels$OfficialID)],
                 TermID = id, TermName = labels$OfficialName[
                   match(id, labels$OfficialID)],
                 Background_N = N, Module_n = n,
                 Term_background_K = K[i], Overlap_k = k,
                 Expected_overlap = n * K[i] / N,
                 Fold_enrichment = if (n * K[i] > 0L) k * N / (n * K[i])
                                   else NA_real_,
                 Tested = tested,
                 Reason_if_not_tested = if (tested) "" else if (n < 5L)
                   "fewer_than_5_annotated_module_genes" else
                   "term_background_size_outside_5_to_500",
                 p_value = if (tested)
                   stats::phyper(k - 1L, K[i], N - K[i], n,
                                 lower.tail = FALSE) else NA_real_,
                 Hit_genes = paste(sort(hits), collapse = ";"),
                 stringsAsFactors = FALSE)
    })
    output[[mi]] <- do.call(rbind, rows)
    qc[[mi]] <- data.frame(Module = m, Assigned_genes = length(assigned),
                           GO_annotated_genes = n,
                           Coverage_percent = 100 * n / length(assigned),
                           Background_N = N, stringsAsFactors = FALSE)
  }
  result <- do.call(rbind, output)
  rownames(result) <- NULL
  result$FDR_within_module <- NA_real_
  for (m in modules) {
    i <- which(result$Module == m & result$Tested)
    result$FDR_within_module[i] <- p.adjust(result$p_value[i], "BH")
  }
  i <- which(result$Tested)
  result$FDR_global_module_terms <- NA_real_
  result$FDR_global_module_terms[i] <- p.adjust(result$p_value[i], "BH")
  write_tsv(result, file.path(out, "go_all_terms.tsv"))
  hits <- result[!is.na(result$FDR_global_module_terms) &
                   result$FDR_global_module_terms < 0.05, ]
  hits <- hits[order(hits$FDR_global_module_terms, hits$Module,
                     hits$TermID), ]
  write_tsv(hits, file.path(out, "go_global_FDR05_hits.tsv"))
  qc <- do.call(rbind, qc)
  qc$Terms_tested <- vapply(modules, function(m)
    sum(result$Module == m & result$Tested), 0L)
  qc$Global_FDR_hits <- vapply(modules, function(m)
    sum(hits$Module == m), 0L)
  qc$Coverage_warning <- qc$Coverage_percent < 50
  write_tsv(qc, file.path(out, "go_annotation_and_test_qc.tsv"))

  comparison <- merge(old[c("Module", "TermID", "Background_N", "Module_n",
                            "Term_background_K", "Overlap_k", "Tested",
                            "p_value", "FDR_global_module_terms")],
                      result[c("Module", "TermID", "Background_N", "Module_n",
                               "Term_background_K", "Overlap_k", "Tested",
                               "p_value", "FDR_global_module_terms")],
                      by = c("Module", "TermID"), all = TRUE,
                      suffixes = c("_T005", "_ontology_checked"))
  comparison$Change <- ifelse(is.na(comparison$Background_N_T005),
                              "new_or_normalized_ID",
                       ifelse(is.na(comparison$Background_N_ontology_checked),
                              "removed_or_normalized_ID",
                       ifelse(comparison$Background_N_T005 !=
                                comparison$Background_N_ontology_checked |
                              comparison$Module_n_T005 !=
                                comparison$Module_n_ontology_checked |
                              comparison$Term_background_K_T005 !=
                                comparison$Term_background_K_ontology_checked |
                              comparison$Overlap_k_T005 !=
                                comparison$Overlap_k_ontology_checked |
                              comparison$Tested_T005 !=
                                comparison$Tested_ontology_checked,
                              "counts_or_test_changed", "same_counts")))
  old_q <- comparison$FDR_global_module_terms_T005
  new_q <- comparison$FDR_global_module_terms_ontology_checked
  same_q <- (is.na(old_q) & is.na(new_q)) |
    (!is.na(old_q) & !is.na(new_q) & abs(old_q - new_q) < 1e-15)
  comparison$Change[comparison$Change == "same_counts" & !same_q] <-
    "FDR_only_changed"
  comparison$Global_FDR05_T005 <- !is.na(old_q) & old_q < 0.05
  comparison$Global_FDR05_ontology_checked <- !is.na(new_q) & new_q < 0.05
  comparison$Significance_changed <- comparison$Global_FDR05_T005 !=
    comparison$Global_FDR05_ontology_checked
  write_tsv(comparison, file.path(out, "go_vs_T005_comparison.tsv"))
  manifest <- data.frame(Source = c("Grapedia_GO_GMT", "GO_ontology"),
                         URL = c("https://grapedia.org/wp-content/uploads/2025/04/5.1_on_T2T_ref_GO.zip",
                                 ontology_url),
                         SHA256 = c("e262c7d4cd8c3caac89e985d5e831a91e033b619427c93dff3e07210a98739d4",
                                    ontology_sha),
                         Version = c("PN40024_T2T_v5.1", version),
                         stringsAsFactors = FALSE)
  write_tsv(manifest, file.path(ontology_dir, "go_ora_source_manifest.tsv"))
  summary <- c(
    "GO-only ORA on frozen beta10 modules; no CEMiTool rerun",
    paste0("GO_ontology_version=", version),
    paste0("GO_ontology_SHA256=", ontology_sha),
    paste0("Grapedia_GO_terms_with_selected_gene=", nrow(source_terms)),
    paste0("term_status_counts=", paste(names(table(source_terms$Status)),
                                        as.integer(table(source_terms$Status)),
                                        sep = ":", collapse = ";")),
    paste0("valid_GO_annotated_background_genes=", N),
    paste0("module_term_rows=", nrow(result)),
    paste0("tested_module_terms=", sum(result$Tested)),
    paste0("global_FDR05_hits=", nrow(hits)),
    "filter=official is_obsolete, missing ID and source-labeled obsolete; live alternate IDs normalized",
    "ORA=one-sided hypergeometric; background=beta10 selected genes with >=1 retained GO term",
    "test=term background size 5..500 and module annotated n>=5",
    "FDR=BH across all tested module-term combinations; within-module BH also reported",
    "no GO ancestor propagation; no inference of skin specificity or stage-year drivers")
  writeLines(summary, file.path(out, "analysis_summary.txt"))
  cat(paste(summary, collapse = "\n"), "\n")
  print(qc, row.names = FALSE)
}

run_go_ora_beta10()
