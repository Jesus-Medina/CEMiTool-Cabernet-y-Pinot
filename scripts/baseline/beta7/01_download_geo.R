# Download public GEO data

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
geo_dir <- file.path(project_dir, "data/raw/geo")
dir.create(geo_dir, recursive = TRUE, showWarnings = FALSE)

rpkm_pattern <- "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$"

rpkm_files <- list.files(
  geo_dir,
  pattern = rpkm_pattern,
  full.names = TRUE,
  recursive = TRUE
)

if (length(rpkm_files) == 0) {
  GEOquery::getGEOSuppFiles(
    "GSE98923",
    makeDirectory = TRUE,
    baseDir = geo_dir
  )

  rpkm_files <- list.files(
    geo_dir,
    pattern = rpkm_pattern,
    full.names = TRUE,
    recursive = TRUE
  )
}

if (length(rpkm_files) != 1) {
  stop("Could not identify a unique GSE98923 RPKM file.")
}

gse_rds <- file.path(
  geo_dir,
  "gse98923_expression_set.rds"
)

if (!file.exists(gse_rds)) {
  gse_list <- GEOquery::getGEO(
    "GSE98923",
    GSEMatrix = TRUE,
    getGPL = FALSE
  )

  if (length(gse_list) < 1) {
    stop("GEOquery returned no ExpressionSet for GSE98923.")
  }

  saveRDS(gse_list[[1]], gse_rds)
}

message("GEO data available.")
