# GSE98923 CEMiTool analysis
# Standalone reproducible workflow for the 54-sample baseline.

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

dirs <- c(
  "scripts",
  "data/raw/geo",
  "data/raw/images",
  "data/metadata",
  "data/processed",
  "results/objects",
  "results/tables",
  "results/figures",
  "reports/cemitool",
  "reports/diagnostics",
  "docs/reference_images",
  "logs"
)

invisible(lapply(file.path(project_dir, dirs), dir.create,
                 recursive = TRUE, showWarnings = FALSE))

if (length(list.files(project_dir, pattern = "\\.Rproj$")) == 0) {
  writeLines(
    c(
      "Version: 1.0", "",
      "RestoreWorkspace: No",
      "SaveWorkspace: No",
      "AlwaysSaveHistory: No",
      "Encoding: UTF-8"
    ),
    file.path(project_dir, "gse98923_cemitool.Rproj")
  )
}

if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager")
}

required <- c("GEOquery", "CEMiTool")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]

if (length(missing) > 0) {
  BiocManager::install(missing, ask = FALSE, update = FALSE)
}

suppressPackageStartupMessages({
  library(GEOquery)
  library(CEMiTool)
})

# Exact sample selection used in this analysis.
metadata_lines <- c(
  "SampleName\tClass\tGSM\tCultivar\tYear\tStage\tTimePoint\tReplicate\tDayAfterVeraison\tEvidence\tGEO_URL",
  "GSM2627691\tCS_FruitSet\tGSM2627691\tCabernet Sauvignon\t2012\tFruitSet\t0\t1\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627691",
  "GSM2627692\tCS_FruitSet\tGSM2627692\tCabernet Sauvignon\t2012\tFruitSet\t0\t2\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627692",
  "GSM2627693\tCS_FruitSet\tGSM2627693\tCabernet Sauvignon\t2012\tFruitSet\t0\t3\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627693",
  "GSM2627709\tCS_Veraison\tGSM2627709\tCabernet Sauvignon\t2012\tVeraison\t4\t1\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627709",
  "GSM2627711\tCS_Veraison\tGSM2627711\tCabernet Sauvignon\t2012\tVeraison\t4\t2\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627711",
  "GSM2627713\tCS_Veraison\tGSM2627713\tCabernet Sauvignon\t2012\tVeraison\t4\t3\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627713",
  "GSM2627739\tCS_Harvest\tGSM2627739\tCabernet Sauvignon\t2012\tHarvest\t12\t1\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627739",
  "GSM2627740\tCS_Harvest\tGSM2627740\tCabernet Sauvignon\t2012\tHarvest\t12\t2\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627740",
  "GSM2627741\tCS_Harvest\tGSM2627741\tCabernet Sauvignon\t2012\tHarvest\t12\t3\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627741",
  "GSM2627742\tCS_FruitSet\tGSM2627742\tCabernet Sauvignon\t2013\tFruitSet\t0\t1\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627742",
  "GSM2627743\tCS_FruitSet\tGSM2627743\tCabernet Sauvignon\t2013\tFruitSet\t0\t2\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627743",
  "GSM2627744\tCS_FruitSet\tGSM2627744\tCabernet Sauvignon\t2013\tFruitSet\t0\t3\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627744",
  "GSM2627754\tCS_Veraison\tGSM2627754\tCabernet Sauvignon\t2013\tVeraison\t4\t1\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627754",
  "GSM2627755\tCS_Veraison\tGSM2627755\tCabernet Sauvignon\t2013\tVeraison\t4\t2\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627755",
  "GSM2627756\tCS_Veraison\tGSM2627756\tCabernet Sauvignon\t2013\tVeraison\t4\t3\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627756",
  "GSM2627781\tCS_Harvest\tGSM2627781\tCabernet Sauvignon\t2013\tHarvest\t13\t1\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627781",
  "GSM2627782\tCS_Harvest\tGSM2627782\tCabernet Sauvignon\t2013\tHarvest\t13\t2\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627782",
  "GSM2627783\tCS_Harvest\tGSM2627783\tCabernet Sauvignon\t2013\tHarvest\t13\t3\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627783",
  "GSM2627784\tCS_FruitSet\tGSM2627784\tCabernet Sauvignon\t2014\tFruitSet\t0\t1\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627784",
  "GSM2627785\tCS_FruitSet\tGSM2627785\tCabernet Sauvignon\t2014\tFruitSet\t0\t2\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627785",
  "GSM2627786\tCS_FruitSet\tGSM2627786\tCabernet Sauvignon\t2014\tFruitSet\t0\t3\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627786",
  "GSM2627793\tCS_Veraison\tGSM2627793\tCabernet Sauvignon\t2014\tVeraison\t3\t1\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627793",
  "GSM2627794\tCS_Veraison\tGSM2627794\tCabernet Sauvignon\t2014\tVeraison\t3\t2\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627794",
  "GSM2627795\tCS_Veraison\tGSM2627795\tCabernet Sauvignon\t2014\tVeraison\t3\t3\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627795",
  "GSM2627820\tCS_Harvest\tGSM2627820\tCabernet Sauvignon\t2014\tHarvest\t12\t1\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627820",
  "GSM2627821\tCS_Harvest\tGSM2627821\tCabernet Sauvignon\t2014\tHarvest\t12\t2\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627821",
  "GSM2627822\tCS_Harvest\tGSM2627822\tCabernet Sauvignon\t2014\tHarvest\t12\t3\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627822",
  "GSM2627823\tPN_FruitSet\tGSM2627823\tPinot noir\t2012\tFruitSet\t0\t1\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627823",
  "GSM2627824\tPN_FruitSet\tGSM2627824\tPinot noir\t2012\tFruitSet\t0\t2\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627824",
  "GSM2627825\tPN_FruitSet\tGSM2627825\tPinot noir\t2012\tFruitSet\t0\t3\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627825",
  "GSM2627835\tPN_Veraison\tGSM2627835\tPinot noir\t2012\tVeraison\t4\t1\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627835",
  "GSM2627836\tPN_Veraison\tGSM2627836\tPinot noir\t2012\tVeraison\t4\t2\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627836",
  "GSM2627837\tPN_Veraison\tGSM2627837\tPinot noir\t2012\tVeraison\t4\t3\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627837",
  "GSM2627850\tPN_Harvest\tGSM2627850\tPinot noir\t2012\tHarvest\t9\t1\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627850",
  "GSM2627851\tPN_Harvest\tGSM2627851\tPinot noir\t2012\tHarvest\t9\t2\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627851",
  "GSM2627852\tPN_Harvest\tGSM2627852\tPinot noir\t2012\tHarvest\t9\t3\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627852",
  "GSM2627853\tPN_FruitSet\tGSM2627853\tPinot noir\t2013\tFruitSet\t0\t1\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627853",
  "GSM2627854\tPN_FruitSet\tGSM2627854\tPinot noir\t2013\tFruitSet\t0\t2\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627854",
  "GSM2627855\tPN_FruitSet\tGSM2627855\tPinot noir\t2013\tFruitSet\t0\t3\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627855",
  "GSM2627862\tPN_Veraison\tGSM2627862\tPinot noir\t2013\tVeraison\t3\t1\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627862",
  "GSM2627863\tPN_Veraison\tGSM2627863\tPinot noir\t2013\tVeraison\t3\t2\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627863",
  "GSM2627864\tPN_Veraison\tGSM2627864\tPinot noir\t2013\tVeraison\t3\t3\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627864",
  "GSM2627883\tPN_Harvest\tGSM2627883\tPinot noir\t2013\tHarvest\t10\t1\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627883",
  "GSM2627884\tPN_Harvest\tGSM2627884\tPinot noir\t2013\tHarvest\t10\t2\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627884",
  "GSM2627885\tPN_Harvest\tGSM2627885\tPinot noir\t2013\tHarvest\t10\t3\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627885",
  "GSM2627886\tPN_FruitSet\tGSM2627886\tPinot noir\t2014\tFruitSet\t0\t1\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627886",
  "GSM2627887\tPN_FruitSet\tGSM2627887\tPinot noir\t2014\tFruitSet\t0\t2\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627887",
  "GSM2627888\tPN_FruitSet\tGSM2627888\tPinot noir\t2014\tFruitSet\t0\t3\t\tProtocol-derived: sampling begins at fruit set\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627888",
  "GSM2627895\tPN_Veraison\tGSM2627895\tPinot noir\t2014\tVeraison\t3\t1\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627895",
  "GSM2627896\tPN_Veraison\tGSM2627896\tPinot noir\t2014\tVeraison\t3\t2\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627896",
  "GSM2627897\tPN_Veraison\tGSM2627897\tPinot noir\t2014\tVeraison\t3\t3\t0\tExplicit GEO: day after veraison = 0\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627897",
  "GSM2627919\tPN_Harvest\tGSM2627919\tPinot noir\t2014\tHarvest\t11\t1\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627919",
  "GSM2627920\tPN_Harvest\tGSM2627920\tPinot noir\t2014\tHarvest\t11\t2\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627920",
  "GSM2627921\tPN_Harvest\tGSM2627921\tPinot noir\t2014\tHarvest\t11\t3\t\tProtocol-derived: final time point; sampling until harvest (24.5 Brix)\thttps://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM2627921"
)

samples <- read.delim(
  text = paste(metadata_lines, collapse = "\n"),
  sep = "\t",
  header = TRUE,
  stringsAsFactors = FALSE,
  check.names = FALSE,
  colClasses = "character",
  na.strings = character(0)
)

stopifnot(
  nrow(samples) == 54,
  !anyDuplicated(samples$SampleName),
  !anyDuplicated(samples$GSM)
)

samples_file <- file.path(project_dir, "data/metadata/samples.tsv")

if (file.exists(samples_file)) {
  existing <- read.delim(
    samples_file,
    sep = "\t",
    header = TRUE,
    stringsAsFactors = FALSE,
    check.names = FALSE,
    colClasses = "character",
    na.strings = character(0)
  )

  if (!identical(existing, samples)) {
    stop("Existing sample metadata differs from the canonical 54-sample selection.")
  }
} else {
  write.table(samples, samples_file, sep = "\t", quote = FALSE,
              row.names = FALSE, na = "")
}

annot <- samples[, c("SampleName", "Class")]

write.table(
  annot,
  file.path(project_dir, "data/metadata/phenotypes.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

image_manifest <- file.path(project_dir, "data/metadata/sample_images.tsv")
if (!file.exists(image_manifest)) {
  write.table(
    data.frame(
      SampleName = samples$SampleName,
      GSM = samples$GSM,
      file = "",
      source = "",
      date = "",
      notes = "",
      stringsAsFactors = FALSE
    ),
    image_manifest,
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )
}

writeLines(
  c(
    "# Experimental design", "",
    "GEO accession: GSE98923", "",
    "- Cultivars: Cabernet Sauvignon and Pinot noir",
    "- Stages: FruitSet, Veraison, Harvest",
    "- Years: 2012, 2013, 2014",
    "- Replicates: 3 per cultivar-stage-year combination",
    "- Total samples: 54"
  ),
  file.path(project_dir, "docs/experimental_design.md")
)

# Download GEO files only when absent.
geo_dir <- file.path(project_dir, "data/raw/geo")
rpkm_pattern <- "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$"
rpkm_files <- list.files(geo_dir, pattern = rpkm_pattern,
                         full.names = TRUE, recursive = TRUE)

if (length(rpkm_files) == 0) {
  GEOquery::getGEOSuppFiles(
    "GSE98923",
    makeDirectory = TRUE,
    baseDir = geo_dir
  )

  rpkm_files <- list.files(geo_dir, pattern = rpkm_pattern,
                           full.names = TRUE, recursive = TRUE)
}

if (length(rpkm_files) != 1) {
  stop("Could not identify a unique GSE98923 RPKM file.")
}

gse_rds <- file.path(geo_dir, "gse98923_expression_set.rds")

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

gse <- readRDS(gse_rds)
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
  Description = vapply(seq_len(nrow(geo_pheno)), get_description, character(1)),
  stringsAsFactors = FALSE
)

selected_map <- geo_map[match(samples$GSM, geo_map$GSM), , drop = FALSE]

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
} else if (all(make.names(selected_map$Description) %in% make.names(expression_names))) {
  idx <- match(make.names(selected_map$Description), make.names(expression_names))
  source_columns <- expression_names[idx]
} else {
  stop("Selected samples could not be mapped safely to the RPKM matrix.")
}

expression_rpkm <- raw[, source_columns, drop = FALSE]
expression_rpkm[] <- lapply(expression_rpkm, as.numeric)
rownames(expression_rpkm) <- gene_id
colnames(expression_rpkm) <- samples$SampleName

if (anyNA(as.matrix(expression_rpkm)) ||
    any(!is.finite(as.matrix(expression_rpkm))) ||
    any(as.matrix(expression_rpkm) < 0)) {
  stop("The selected expression matrix contains invalid values.")
}

expression_log2rpkm <- log2(expression_rpkm + 1)

write_expression <- function(x, path) {
  out <- data.frame(gene_id = rownames(x), x, check.names = FALSE)
  write.table(out, path, sep = "\t", quote = FALSE, row.names = FALSE)
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

# Soft-threshold beta strategy -------------------------------------------------
#
# The automatic CEMiTool beta selector did not return a usable beta for this
# dataset. A previous diagnostic run with force_beta=TRUE selected beta=7,
# but the Beta x R2 curve showed only ~0.55 scale-free fit at beta 7.
#
# We therefore use CEMiTool's documented `set_beta` override and choose
# beta=10. In the diagnostic curve for these 54 samples, beta 10 is near the
# beginning of the R2 plateau (~0.70) while retaining substantially more mean
# connectivity than larger powers (14-20). This is a deliberate compromise
# between scale-free fit and network connectivity, and it is recorded in the
# logs below for reproducibility.
#
# IMPORTANT: this is not a universal beta. It is specific to this expression
# matrix and should be re-evaluated if the sample set, normalization or
# filtering changes.
BETA_MANUAL <- 10
BETA_STRATEGY <- "manual_set_beta_from_diagnostic_plateau"

set.seed(1234)

cem <- CEMiTool::cemitool(
  expr = as.data.frame(expression_log2rpkm, check.names = FALSE),
  annot = annot,
  filter = TRUE,
  filter_pval = 0.1,
  apply_vst = FALSE,
  cor_method = "pearson",
  network_type = "unsigned",
  tom_type = "signed",
  set_beta = BETA_MANUAL,
  force_beta = FALSE,
  merge_similar = TRUE,
  min_ngen = 30,
  plot = TRUE,
  plot_diagnostics = TRUE,
  order_by_class = TRUE,
  verbose = TRUE
)

if (CEMiTool::nmodules(cem) < 1) {
  saveRDS(cem, file.path(project_dir, "results/objects/cemitool_failed.rds"))
  stop("CEMiTool returned no modules.")
}

saveRDS(
  cem,
  file.path(project_dir, "results/objects/cemitool.rds")
)

CEMiTool::write_files(
  cem,
  directory = file.path(project_dir, "results/tables"),
  force = TRUE
)

CEMiTool::save_plots(
  cem,
  "all",
  directory = file.path(project_dir, "results/figures"),
  force = TRUE
)

try(
  CEMiTool::generate_report(
    cem,
    title = "GSE98923 CEMiTool analysis",
    directory = file.path(project_dir, "reports/cemitool"),
    force = TRUE,
    output_format = "html_document"
  ),
  silent = TRUE
)

try(
  CEMiTool::diagnostic_report(
    cem,
    title = "GSE98923 CEMiTool diagnostics",
    directory = file.path(project_dir, "reports/diagnostics"),
    force = TRUE,
    output_format = "html_document"
  ),
  silent = TRUE
)

beta <- tryCatch(cem@parameters$beta, error = function(e) NA)
r2 <- tryCatch(cem@parameters$r2, error = function(e) NA)

# Save the complete beta-vs-fit diagnostic table so the manual choice remains
# auditable and can be revisited without guessing from a plot.
beta_fit <- tryCatch(CEMiTool::fit_data(cem), error = function(e) NULL)
if (!is.null(beta_fit)) {
  write.table(
    beta_fit,
    file.path(project_dir, "results/tables/beta_fit_indices.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )
}

if (is.finite(r2) && r2 < 0.60) {
  warning(
    "The selected beta has R2 < 0.60. Inspect reports/diagnostics before interpreting modules."
  )
}

writeLines(
  capture.output(sessionInfo()),
  file.path(project_dir, "logs/session_info.txt")
)

writeLines(
  c(
    "dataset=GSE98923",
    "samples=54",
    "transform=log2(RPKM+1)",
    "correlation=pearson",
    "network_type=unsigned",
    "tom_type=signed",
    paste0("beta_strategy=", BETA_STRATEGY),
    paste0("set_beta=", BETA_MANUAL),
    "force_beta=FALSE",
    paste0("beta=", beta),
    paste0("r2=", r2),
    "min_module_size=30",
    "seed=1234",
    paste0("modules=", CEMiTool::nmodules(cem))
  ),
  file.path(project_dir, "logs/parameters.txt")
)

writeLines(
  c(
    "GSE98923 CEMiTool analysis",
    paste0("completed=", Sys.time()),
    paste0("samples=", ncol(expression_log2rpkm)),
    paste0("genes=", nrow(expression_log2rpkm)),
    paste0("modules=", CEMiTool::nmodules(cem)),
    paste0("beta_strategy=", BETA_STRATEGY),
    paste0("beta=", beta),
    paste0("r2=", r2)
  ),
  file.path(project_dir, "logs/run_summary.txt")
)

message(
  "Analysis complete: ",
  CEMiTool::nmodules(cem),
  " modules; beta=",
  beta
)
