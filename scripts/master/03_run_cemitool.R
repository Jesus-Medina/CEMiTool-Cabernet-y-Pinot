# Run CEMiTool

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

expression_log2rpkm <- readRDS(
  file.path(project_dir, "data/processed/expression_log2rpkm.rds")
)

annot <- read.delim(
  file.path(project_dir, "data/metadata/phenotypes.tsv"),
  sep = "\t",
  header = TRUE,
  stringsAsFactors = FALSE,
  check.names = FALSE
)

stopifnot(
  identical(colnames(expression_log2rpkm), annot$SampleName)
)

# Automatic beta selection failed for this baseline.
# Beta 10 is fixed explicitly for the 54-sample analysis.
# Re-evaluate this value if the sample set, normalization, or filtering changes.
BETA_MANUAL <- 10
BETA_STRATEGY <- "manual_set_beta_beta10"

set.seed(1234)

cem <- CEMiTool::cemitool(
  expr = as.data.frame(
    expression_log2rpkm,
    check.names = FALSE
  ),
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
  saveRDS(
    cem,
    file.path(project_dir, "results/objects/cemitool_failed.rds")
  )
  stop("CEMiTool returned no modules.")
}

saveRDS(
  cem,
  file.path(project_dir, "results/objects/cemitool.rds")
)

message(
  "CEMiTool complete: ",
  CEMiTool::nmodules(cem),
  " modules; beta=",
  BETA_MANUAL
)
