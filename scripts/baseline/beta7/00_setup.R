# Project setup

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

dirs <- c(
  "scripts",
  "templates",
  "data/raw/geo",
  "data/raw/images",
  "data/metadata",
  "data/processed",
  "results/objects",
  "results/tables",
  "results/figures",
  "reports/cemitool",
  "reports/diagnostics",
  "reports/assets/figures",
  "reports/supplementary",
  "manuscript",
  "docs/reference_images",
  "logs"
)

invisible(lapply(
  file.path(project_dir, dirs),
  dir.create,
  recursive = TRUE,
  showWarnings = FALSE
))

if (length(list.files(project_dir, pattern = "\\.Rproj$")) == 0) {
  writeLines(
    c(
      "Version: 1.0",
      "",
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

bioc_packages <- c("GEOquery", "CEMiTool")
missing_bioc <- bioc_packages[
  !vapply(bioc_packages, requireNamespace, logical(1), quietly = TRUE)
]

if (length(missing_bioc) > 0) {
  BiocManager::install(missing_bioc, ask = FALSE, update = FALSE)
}

cran_packages <- c(
  "rmarkdown",
  "knitr",
  "tinytex",
  "zip"
)

missing_cran <- cran_packages[
  !vapply(cran_packages, requireNamespace, logical(1), quietly = TRUE)
]

if (length(missing_cran) > 0) {
  install.packages(missing_cran)
}

suppressPackageStartupMessages({
  library(GEOquery)
  library(CEMiTool)
})

# Exact 54-sample selection used by this baseline.
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
    stop(
      "data/metadata/samples.tsv differs from the canonical ",
      "54-sample selection embedded in the workflow."
    )
  }
} else {
  write.table(
    samples,
    samples_file,
    sep = "\t",
    quote = FALSE,
    row.names = FALSE,
    na = ""
  )
}

phenotypes <- samples[, c("SampleName", "Class")]

write.table(
  phenotypes,
  file.path(project_dir, "data/metadata/phenotypes.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

image_manifest <- file.path(
  project_dir,
  "data/metadata/sample_images.tsv"
)

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
    "# Experimental design",
    "",
    "GEO accession: GSE98923",
    "",
    "- Cultivars: Cabernet Sauvignon and Pinot noir",
    "- Developmental stages: FruitSet, Veraison, Harvest",
    "- Years: 2012, 2013, 2014",
    "- Replicates: 3 per cultivar-stage-year combination",
    "- Total samples: 54",
    "",
    "The canonical sample selection is embedded in the analysis scripts."
  ),
  file.path(project_dir, "docs/experimental_design.md")
)

references_file <- file.path(project_dir, "manuscript/references.bib")
if (!file.exists(references_file)) {
  writeLines(
    c(
      "% Add verified bibliographic references here.",
      "% Do not add unverified citations automatically."
    ),
    references_file
  )
}

message("Project setup complete.")
