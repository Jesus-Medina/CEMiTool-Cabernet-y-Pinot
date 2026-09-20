# Prepare sample mapping and expression matrices

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

samples <- read.delim(
  file.path(project_dir, "data/metadata/samples.tsv"),
  sep = "\t",
  header = TRUE,
  stringsAsFactors = FALSE,
  check.names = FALSE
)

gse <- readRDS(
  file.path(project_dir, "data/raw/geo/gse98923_expression_set.rds")
)

geo_pheno <- Biobase::pData(gse)

geo_gsm <- if ("geo_accession" %in% names(geo_pheno)) {
  as.character(geo_pheno$geo_accession)
} else {
  rownames(geo_pheno)
}

description_cols <- grep(
  "description",
  names(geo_pheno),
  ignore.case = TRUE,
  value = TRUE
)

if (length(description_cols) == 0) {
  stop("No GEO description column was found.")
}

get_description <- function(i) {
  x <- as.character(geo_pheno[i, description_cols, drop = TRUE])
  x <- x[!is.na(x) & nzchar(x)]
  if (length(x) == 0) NA_character_ else x[[1]]
}

geo_map <- data.frame(
  GSM = geo_gsm,
  Description = vapply(
    seq_len(nrow(geo_pheno)),
    get_description,
    character(1)
  ),
  stringsAsFactors = FALSE
)

selected_map <- geo_map[
  match(samples$GSM, geo_map$GSM),
  ,
  drop = FALSE
]

if (anyNA(selected_map$GSM)) {
  stop("At least one selected GSM accession was not found in GEO metadata.")
}

write.table(
  cbind(samples, GEO_Description = selected_map$Description),
  file.path(project_dir, "data/metadata/sample_geo_map.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

rpkm_files <- list.files(
  file.path(project_dir, "data/raw/geo"),
  pattern = "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$",
  full.names = TRUE,
  recursive = TRUE
)

if (length(rpkm_files) != 1) {
  stop("Could not identify a unique GSE98923 RPKM file.")
}

raw <- read.delim(
  gzfile(rpkm_files[[1]]),
  sep = "\t",
  header = TRUE,
  check.names = FALSE,
  stringsAsFactors = FALSE
)

gene_id <- as.character(raw[[1]])

if (anyNA(gene_id) || any(!nzchar(gene_id)) || anyDuplicated(gene_id)) {
  stop("Invalid or duplicated gene identifiers in the RPKM matrix.")
}

expression_names <- names(raw)[-1]

if (all(samples$GSM %in% expression_names)) {
  source_columns <- samples$GSM
} else if (all(selected_map$Description %in% expression_names)) {
  source_columns <- selected_map$Description
} else if (
  all(make.names(selected_map$Description) %in% make.names(expression_names))
) {
  idx <- match(
    make.names(selected_map$Description),
    make.names(expression_names)
  )
  source_columns <- expression_names[idx]
} else {
  stop("Selected samples could not be mapped safely to the RPKM matrix.")
}

expression_rpkm <- raw[, source_columns, drop = FALSE]
expression_rpkm[] <- lapply(expression_rpkm, as.numeric)

rownames(expression_rpkm) <- gene_id
colnames(expression_rpkm) <- samples$SampleName

if (
  anyNA(as.matrix(expression_rpkm)) ||
  any(!is.finite(as.matrix(expression_rpkm))) ||
  any(as.matrix(expression_rpkm) < 0)
) {
  stop("The selected expression matrix contains invalid values.")
}

expression_log2rpkm <- log2(expression_rpkm + 1)

write_expression <- function(x, path) {
  out <- data.frame(
    gene_id = rownames(x),
    x,
    check.names = FALSE
  )

  write.table(
    out,
    path,
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )
}

write_expression(
  expression_rpkm,
  file.path(project_dir, "data/processed/expression_rpkm.tsv")
)

write_expression(
  expression_log2rpkm,
  file.path(project_dir, "data/processed/expression_log2rpkm.tsv")
)

saveRDS(
  expression_log2rpkm,
  file.path(project_dir, "data/processed/expression_log2rpkm.rds")
)

message(
  "Expression matrices prepared: ",
  nrow(expression_log2rpkm),
  " genes x ",
  ncol(expression_log2rpkm),
  " samples."
)
