# T-005 source preparation. Run from the canonical repository root.
# Downloads pinned Grapedia source files only when absent from T005_SOURCE_DIR.
# Produces compact, auditable annotations for the 3,050 frozen beta10 genes.
# No network or expression analysis is rerun.

run_t005_annotation_prep <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md"))) stop("Run from repository root")
  if (!requireNamespace("data.table", quietly = TRUE) ||
      !requireNamespace("digest", quietly = TRUE)) {
    stop("R packages data.table and digest are required")
  }
  source_dir <- Sys.getenv("T005_SOURCE_DIR", unset = "")
  if (!nzchar(source_dir)) {
    source_dir <- file.path(Sys.getenv("TEMP"), "cemitool_t005_sources")
  }
  dir.create(source_dir, recursive = TRUE, showWarnings = FALSE)
  out <- file.path(root, "data/reference/grapedia_t005")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  sources <- data.frame(
    File = c("equivalences.csv", "legacy_mapman.zip", "t2t_mapman.zip",
             "t2t_go.zip"),
    URL = c(
      "https://grapedia.org/wp-content/uploads/2024/11/all_on_T2T_ref_equivalences_filtered_no_copies_symbols.csv",
      "https://grapedia.org/wp-content/uploads/2025/01/v3_on_12Xv2_mapman.zip",
      "https://grapedia.org/wp-content/uploads/2025/04/5.1_on_T2T_ref_mapman.zip",
      "https://grapedia.org/wp-content/uploads/2025/04/5.1_on_T2T_ref_GO.zip"),
    SHA256 = c(
      "1fffc87cd71a86f62f3ac016b37d59d6018968e6761da5a0bf761edde42374bc",
      "7196070be2a88133ef2f4f8584d8631fa88c8d58305b569a333e93056182750e",
      "8525e858255c8ca43aad66201c5146580c9de183adf28cd32c6607edd98c4678",
      "e262c7d4cd8c3caac89e985d5e831a91e033b619427c93dff3e07210a98739d4"),
    stringsAsFactors = FALSE)
  for (i in seq_len(nrow(sources))) {
    path <- file.path(source_dir, sources$File[i])
    if (!file.exists(path)) {
      utils::download.file(sources$URL[i], path, mode = "wb", quiet = TRUE)
    }
    actual <- digest::digest(file = path, algo = "sha256")
    if (!identical(actual, sources$SHA256[i])) {
      stop("Source SHA256 mismatch: ", sources$File[i])
    }
    sources$Bytes[i] <- file.info(path)$size
  }
  membership <- read.delim(file.path(root, "results/beta10/tables/module.tsv"),
                           check.names = FALSE, stringsAsFactors = FALSE)
  selected <- scan(file.path(root, "results/beta10/tables/selected_genes.txt"),
                   what = "", quiet = TRUE)
  if (nrow(membership) != 3050L || length(selected) != 3050L ||
      anyDuplicated(membership$genes) || anyDuplicated(selected) ||
      !setequal(membership$genes, selected) ||
      !all(grepl("^VIT_", selected))) {
    stop("Frozen beta10 membership / selected-gene universe mismatch")
  }
  x <- data.table::fread(file.path(source_dir, "equivalences.csv"),
                         sep = "\t", showProgress = FALSE,
                         select = c("query_id", "target_id", "query_origin",
                                    "target_origin", "same_strand",
                                    "min_gene_percent"))
  map_one <- function(version) {
    all_pairs <- unique(x[query_origin == "v1" & target_origin == version,
                          c("query_id", "target_id", "same_strand",
                            "min_gene_percent")])
    if (anyNA(all_pairs$query_id) || anyNA(all_pairs$target_id)) {
      stop("Missing mapping identifier in ", version)
    }
    unique_query <- all_pairs[, .N, by = query_id][N == 1L, query_id]
    unique_target <- all_pairs[, .N, by = target_id][N == 1L, target_id]
    good <- all_pairs[
      query_id %in% selected & query_id %in% unique_query &
        target_id %in% unique_target & same_strand == TRUE &
        is.finite(min_gene_percent) & min_gene_percent >= 50]
    ans <- data.frame(V1_gene = good$query_id,
                      Annotation_gene = good$target_id,
                      Min_gene_overlap_percent = good$min_gene_percent,
                      stringsAsFactors = FALSE)
    if (anyDuplicated(ans$V1_gene) || anyDuplicated(ans$Annotation_gene)) {
      stop("Non-reciprocal mapping survived filter for ", version)
    }
    ans[order(ans$V1_gene), ]
  }
  m3 <- map_one("v3")
  m5 <- map_one("5.1")
  if (nrow(m3) < 2500L || nrow(m5) < 1800L) {
    stop("Unexpected loss of annotation mappings")
  }
  write_tsv <- function(obj, name) {
    write.table(obj, file.path(out, name), sep = "\t", quote = FALSE,
                row.names = FALSE, na = "NA", fileEncoding = "UTF-8")
  }
  write_tsv(m3, "v1_to_v3_reciprocal50.tsv")
  write_tsv(m5, "v1_to_v5_reciprocal50.tsv")

  # GMT includes one term per line, followed by its annotation-version gene IDs.
  # Preserve every term-to-selected-gene association, including non-significant
  # and obsolete GO terms (the latter are excluded later from inference).
  gmt_pairs <- function(zip_name, entry, mapping, name) {
    lines <- readLines(unz(file.path(source_dir, zip_name), entry),
                       warn = FALSE, encoding = "UTF-8")
    parts <- strsplit(lines, "\t", fixed = TRUE)
    ids <- vapply(parts, function(v) v[1], "")
    labels <- vapply(parts, function(v) v[2], "")
    if (anyDuplicated(ids) || any(!nzchar(labels))) stop("Malformed GMT ", name)
    idx <- setNames(mapping$V1_gene, mapping$Annotation_gene)
    rows <- lapply(seq_along(parts), function(i) {
      genes <- unique(parts[[i]][-c(1, 2)])
      genes <- intersect(genes, names(idx))
      if (!length(genes)) return(NULL)
      data.frame(V1_gene = unname(idx[genes]),
                 Annotation_gene = genes,
                 TermID = ids[i], TermName = labels[i],
                 stringsAsFactors = FALSE)
    })
    ans <- unique(do.call(rbind, rows))
    if (!nrow(ans) || anyNA(ans)) stop("No valid annotations from ", name)
    ans <- ans[order(ans$TermID, ans$V1_gene), ]
    rownames(ans) <- NULL
    write_tsv(ans, name)
    ans
  }
  p3 <- gmt_pairs("legacy_mapman.zip", "v3_on_12Xv2_mapman.gmt", m3,
                  "v3_mapman_pairs.tsv")
  p5 <- gmt_pairs("t2t_mapman.zip", "5.1_on_T2T_ref_mapman.gmt", m5,
                  "v5_mapman_pairs.tsv")
  pg <- gmt_pairs("t2t_go.zip", "5.1_on_T2T_ref_GO.gmt", m5,
                  "v5_go_pairs.tsv")
  audit <- membership[c("genes", "modules")]
  names(audit) <- c("V1_gene", "Module")
  audit$Mapped_v3 <- audit$V1_gene %in% m3$V1_gene
  audit$MapMan_v3 <- audit$V1_gene %in% p3$V1_gene
  audit$Mapped_v5 <- audit$V1_gene %in% m5$V1_gene
  audit$MapMan_v5 <- audit$V1_gene %in% p5$V1_gene
  audit$GO_v5 <- audit$V1_gene %in% pg$V1_gene
  write_tsv(audit, "gene_coverage_audit.tsv")
  write_tsv(sources, "source_manifest.tsv")
  cat("T-005 annotation prep: ", nrow(audit), " beta10 genes; ",
      sum(audit$MapMan_v3), " v3 MapMan, ", sum(audit$MapMan_v5),
      " v5 MapMan, ", sum(audit$GO_v5), " v5 GO annotated.\n", sep = "")
}

run_t005_annotation_prep()
