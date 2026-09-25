# 30_t009_integrated_report.R
# Render the integrated technical report and manuscript from canonical T-004--T-008 evidence.
# Run from the canonical repository root:
# source("scripts/post/30_t009_integrated_report.R")

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
if (!file.exists(file.path(project_dir, "AGENTS.md")) ||
    !file.exists(file.path(project_dir, "docs", "TASK_LEDGER.md"))) {
  stop("Run this script from the canonical repository root.")
}

required_packages <- c("rmarkdown", "knitr")
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages)) {
  stop("Missing required R packages: ", paste(missing_packages, collapse = ", "))
}

if (!rmarkdown::pandoc_available("2.8")) {
  bundled_pandoc_dir <- "C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
  if (!file.exists(file.path(bundled_pandoc_dir, "pandoc.exe"))) {
    stop("Pandoc >=2.8 is required; the existing RStudio Pandoc runtime was not found.")
  }
  Sys.setenv(RSTUDIO_PANDOC = bundled_pandoc_dir)
  rmarkdown::find_pandoc()
}
if (!rmarkdown::pandoc_available("2.8")) stop("Pandoc >=2.8 is unavailable.")

required_inputs <- c(
  "reports/templates/analysis_report_updated.Rmd",
  "manuscript/article_draft.Rmd",
  "manuscript/references.bib",
  "results/module_statistics_beta10/significant_cultivar_stage_interactions_FDR05.tsv",
  "results/year_robustness_beta10/priority_module_classification.tsv",
  "results/year_robustness_beta10/profiles/M5_stage_by_year.png",
  "results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv",
  "results/go_ora_beta10/go_annotation_and_test_qc.tsv",
  "results/go_ora_beta10/go_global_FDR05_hits.tsv",
  "results/hub_prioritization_beta10/m5_focus_genes.tsv",
  "results/hub_prioritization_beta10/m10_m2_focus_genes.tsv",
  "results/external_skin_validation_beta10/primary_external_condition_hubs.tsv",
  "results/fastq_reprocessing_t008/modern_matrix_qc.tsv",
  "results/fastq_reprocessing_t008/modern_preservation/module_preservation_summary.tsv",
  "results/fastq_reprocessing_t008/modern_preservation/module_preservation_zsummary.png"
)
required_paths <- file.path(project_dir, required_inputs)
if (any(!file.exists(required_paths))) {
  stop("Missing required T-009 inputs:\n", paste(required_inputs[!file.exists(required_paths)], collapse = "\n"))
}

read_tsv <- function(path) read.delim(
  file.path(project_dir, path), sep = "\t", stringsAsFactors = FALSE, check.names = FALSE
)

interactions <- read_tsv("results/module_statistics_beta10/significant_cultivar_stage_interactions_FDR05.tsv")
year_class <- read_tsv("results/year_robustness_beta10/priority_module_classification.tsv")
go_qc <- read_tsv("results/go_ora_beta10/go_annotation_and_test_qc.tsv")
external <- read_tsv("results/external_skin_validation_beta10/primary_external_condition_hubs.tsv")
modern_qc <- read_tsv("results/fastq_reprocessing_t008/modern_matrix_qc.tsv")
preservation <- read_tsv("results/fastq_reprocessing_t008/modern_preservation/module_preservation_summary.tsv")

stopifnot(
  nrow(interactions) == 5L,
  interactions$Module[which.min(interactions$FDR)] == "M5",
  year_class$Classification[year_class$Module == "M10"] == "reproducible",
  sum(go_qc$Global_FDR_hits) == 6L,
  modern_qc$Value[modern_qc$Metric == "Validation"] == "PASS"
)

priority_preservation <- preservation[preservation$Module %in% c("M5", "M10", "M2"), ]
if (!all(priority_preservation$Preservation_class == "moderate")) {
  stop("Expected moderate preservation for mapped cores of M5, M10 and M2.")
}
if (preservation$Mapped_fraction[preservation$Module == "M2"] >= 0.5) {
  stop("M2 coverage boundary changed; review the integrated wording before rendering.")
}

report_dir <- file.path(project_dir, "reports", "current")
report_archive <- file.path(project_dir, "reports", "archive")
manuscript_dir <- file.path(project_dir, "manuscript")
manuscript_archive <- file.path(manuscript_dir, "archive")
result_dir <- file.path(project_dir, "results", "integrated_report_t009")
dir.create(report_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(report_archive, recursive = TRUE, showWarnings = FALSE)
dir.create(manuscript_archive, recursive = TRUE, showWarnings = FALSE)
dir.create(result_dir, recursive = TRUE, showWarnings = FALSE)

stamp <- format(Sys.time(), "%Y%m%d_%H%M%S")
archive_files <- function(files, destination) {
  existing <- files[file.exists(files)]
  if (!length(existing)) return(character())
  dir.create(destination, recursive = TRUE, showWarnings = FALSE)
  copied <- file.copy(existing, destination, overwrite = FALSE, copy.date = TRUE)
  if (!all(copied)) stop("Could not archive all previous deliverables in ", destination)
  file.path(destination, basename(existing))
}

existing_report_archives <- list.dirs(report_archive, recursive = FALSE, full.names = TRUE)
existing_report_archives <- existing_report_archives[grepl("_before_t009_integration$", existing_report_archives)]
existing_manuscript_archives <- list.dirs(manuscript_archive, recursive = FALSE, full.names = TRUE)
existing_manuscript_archives <- existing_manuscript_archives[grepl("_before_t009_integration$", existing_manuscript_archives)]

if (length(existing_report_archives)) {
  report_archive_dir <- sort(existing_report_archives, decreasing = TRUE)[1]
  archived_report <- list.files(report_archive_dir, full.names = TRUE)
} else {
  report_archive_dir <- file.path(report_archive, paste0(stamp, "_before_t009_integration"))
  archived_report <- archive_files(file.path(report_dir, c(
    "analysis_report.html", "analysis_report.docx", "analysis_report.pdf",
    "analysis_report_status.tsv", "latest_report_update.txt"
  )), report_archive_dir)
}

if (length(existing_manuscript_archives)) {
  manuscript_archive_dir <- sort(existing_manuscript_archives, decreasing = TRUE)[1]
  archived_manuscript <- list.files(manuscript_archive_dir, full.names = TRUE)
} else {
  manuscript_archive_dir <- file.path(manuscript_archive, paste0(stamp, "_before_t009_integration"))
  archived_manuscript <- archive_files(file.path(manuscript_dir, c(
    "article_draft.html", "article_draft.docx", "article_draft.pdf", "article_render_status.tsv"
  )), manuscript_archive_dir)
}

# Keep the repository template mirror synchronized with the canonical manuscript source.
template_mirror <- file.path(project_dir, "reports", "templates", "article_draft.Rmd")
if (!file.copy(file.path(manuscript_dir, "article_draft.Rmd"), template_mirror, overwrite = TRUE)) {
  stop("Could not synchronize reports/templates/article_draft.Rmd")
}

old_project_env <- Sys.getenv("CEMITOOL_PROJECT_DIR", unset = NA_character_)
on.exit({
  if (is.na(old_project_env)) Sys.unsetenv("CEMITOOL_PROJECT_DIR") else Sys.setenv(CEMITOOL_PROJECT_DIR = old_project_env)
}, add = TRUE)
Sys.setenv(CEMITOOL_PROJECT_DIR = project_dir)

render_one <- function(input, format, output_file, output_dir) {
  tryCatch({
    rmarkdown::render(
      input = input,
      output_format = format,
      output_file = output_file,
      output_dir = output_dir,
      envir = new.env(parent = globalenv()),
      clean = TRUE,
      quiet = TRUE
    )
    target <- file.path(output_dir, output_file)
    file.exists(target) && file.info(target)$size > 1000
  }, error = function(e) {
    warning("Render failed for ", output_file, ": ", conditionMessage(e))
    FALSE
  })
}

report_template <- file.path(project_dir, "reports", "templates", "analysis_report_updated.Rmd")
manuscript_source <- file.path(manuscript_dir, "article_draft.Rmd")

report_status <- data.frame(
  format = c("html", "docx", "pdf"),
  success = c(
    render_one(report_template, "html_document", "analysis_report.html", report_dir),
    render_one(report_template, "word_document", "analysis_report.docx", report_dir),
    render_one(report_template, "pdf_document", "analysis_report.pdf", report_dir)
  )
)

manuscript_status <- data.frame(
  format = c("html", "docx", "pdf"),
  success = c(
    render_one(manuscript_source, "html_document", "article_draft.html", manuscript_dir),
    render_one(manuscript_source, "word_document", "article_draft.docx", manuscript_dir),
    render_one(manuscript_source, "pdf_document", "article_draft.pdf", manuscript_dir)
  )
)

write.table(report_status, file.path(report_dir, "analysis_report_status.tsv"), sep = "\t", quote = FALSE, row.names = FALSE)
write.table(manuscript_status, file.path(manuscript_dir, "article_render_status.tsv"), sep = "\t", quote = FALSE, row.names = FALSE)

if (!all(report_status$success) || !all(manuscript_status$success)) {
  stop("One or more T-009 formats failed. Inspect the status TSV files and warnings.")
}

claim_evidence <- data.frame(
  Claim_ID = c("C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09"),
  Calibrated_claim = c(
    "Five beta10 modules have an FDR-significant Cultivar x Stage interaction; M5 is strongest.",
    "M10 meets the prespecified module-level year-reproducibility rule.",
    "M5 Harvest and M2 Veraison/Harvest retain same-direction global-FDR contrasts in all three years.",
    "M5 has global MapMan v3 enrichment for phenolic, stilbenoid and PAL categories.",
    "The corrected GO layer has six global-FDR hits in M9 and sparse coverage in priority modules.",
    "M5 hub ranking prioritizes a chromosome-16 family plus CuAO- and NAC-labeled candidates without resolving CHS versus STS.",
    "Skin-only datasets support a subset of predefined hubs but do not test skin thickness.",
    "Modern processing moderately preserves the mapped cores of M5, M10 and M2.",
    "M2 whole-module preservation is not established because only 81 of 214 genes map reciprocally."
  ),
  Evidence_file = c(
    "results/module_statistics_beta10/significant_cultivar_stage_interactions_FDR05.tsv",
    "results/year_robustness_beta10/priority_module_classification.tsv",
    "results/year_robustness_beta10/stage_year_consistency.tsv",
    "results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv",
    "results/go_ora_beta10/go_annotation_and_test_qc.tsv; results/go_ora_beta10/go_global_FDR05_hits.tsv",
    "results/hub_prioritization_beta10/m5_focus_genes.tsv",
    "results/external_skin_validation_beta10/primary_external_condition_hubs.tsv",
    "results/fastq_reprocessing_t008/modern_preservation/module_preservation_summary.tsv",
    "results/fastq_reprocessing_t008/modern_preservation/module_preservation_summary.tsv"
  ),
  Boundary = c(
    "Association, not phenotype causality.",
    "Reproducibility applies to the module-level rule.",
    "Year-dependent global effects can coexist with repeated stage contrasts.",
    "Module-wide enrichment does not identify contrast drivers.",
    "No-hit priority modules cannot be interpreted as biological absence.",
    "Hub rank and domain labels do not prove enzyme identity or regulation.",
    "External experiments differ in year, condition, stage and platform.",
    "Preservation is restricted to reciprocal one-to-one mapped genes.",
    "Unmapped genes are not called absent."
  ),
  stringsAsFactors = FALSE
)
write.table(claim_evidence, file.path(result_dir, "claim_evidence_matrix.tsv"), sep = "\t", quote = TRUE, row.names = FALSE)

supplement_roots <- c(
  "results/year_robustness_beta10",
  "results/functional_enrichment_beta10",
  "results/go_ora_beta10",
  "results/hub_prioritization_beta10",
  "results/external_skin_validation_beta10",
  "results/fastq_reprocessing_t008/modern_preservation"
)
supplement_files <- unlist(lapply(file.path(project_dir, supplement_roots), function(path) {
  list.files(path, recursive = TRUE, full.names = TRUE)
}), use.names = FALSE)
supplement_files <- supplement_files[file.info(supplement_files)$isdir %in% FALSE]
relative <- substring(normalizePath(supplement_files, winslash = "/"), nchar(project_dir) + 2L)
manifest <- data.frame(
  Relative_path = relative,
  Bytes = file.info(supplement_files)$size,
  MD5 = unname(tools::md5sum(supplement_files)),
  stringsAsFactors = FALSE
)
manifest <- manifest[order(manifest$Relative_path), ]
write.table(manifest, file.path(result_dir, "supplementary_manifest.tsv"), sep = "\t", quote = TRUE, row.names = FALSE)

report_text <- paste(readLines(file.path(report_dir, "analysis_report.html"), warn = FALSE, encoding = "UTF-8"), collapse = "\n")
manuscript_text <- paste(readLines(file.path(manuscript_dir, "article_draft.html"), warn = FALSE, encoding = "UTF-8"), collapse = "\n")
shared_required_phrases <- c("M5", "M10", "M2", "CHS", "STS", "skin thickness", "47,971")
phrase_checks <- vapply(shared_required_phrases, function(x) {
  grepl(x, report_text, fixed = TRUE) && grepl(x, manuscript_text, fixed = TRUE)
}, logical(1))
phrase_checks <- c(
  report_integrated_heading = grepl("Integrated evidence[[:space:]]+from T-004 through T-008", report_text),
  phrase_checks
)

qc <- data.frame(
  Check = c(
    "canonical_root", "required_inputs", "five_interaction_modules", "m5_strongest_interaction",
    "m10_reproducible", "go_global_hits_six", "modern_matrix_pass",
    "priority_mapped_cores_moderate", "m2_coverage_below_half",
    "report_all_formats", "manuscript_all_formats", "required_phrases",
    "previous_report_archived", "previous_manuscript_archived"
  ),
  Pass = c(
    TRUE, TRUE, nrow(interactions) == 5L,
    interactions$Module[which.min(interactions$FDR)] == "M5",
    year_class$Classification[year_class$Module == "M10"] == "reproducible",
    sum(go_qc$Global_FDR_hits) == 6L,
    modern_qc$Value[modern_qc$Metric == "Validation"] == "PASS",
    all(priority_preservation$Preservation_class == "moderate"),
    preservation$Mapped_fraction[preservation$Module == "M2"] < 0.5,
    all(report_status$success), all(manuscript_status$success), all(phrase_checks),
    length(archived_report) > 0L, length(archived_manuscript) > 0L
  ),
  Detail = c(
    project_dir,
    paste(length(required_inputs), "inputs"),
    nrow(interactions),
    interactions$Module[which.min(interactions$FDR)],
    year_class$Classification[year_class$Module == "M10"],
    sum(go_qc$Global_FDR_hits),
    modern_qc$Value[modern_qc$Metric == "Validation"],
    paste(priority_preservation$Module, priority_preservation$Preservation_class, collapse = "; "),
    sprintf("%.1f%%", 100 * preservation$Mapped_fraction[preservation$Module == "M2"]),
    paste(report_status$format[report_status$success], collapse = ","),
    paste(manuscript_status$format[manuscript_status$success], collapse = ","),
    paste(names(phrase_checks)[phrase_checks], collapse = "; "),
    report_archive_dir,
    manuscript_archive_dir
  ),
  stringsAsFactors = FALSE
)
write.table(qc, file.path(result_dir, "integration_qc.tsv"), sep = "\t", quote = TRUE, row.names = FALSE)
if (!all(qc$Pass)) stop("T-009 integration QC failed.")

summary_lines <- c(
  "T-009 integrated report and manuscript",
  paste0("completed=", Sys.time()),
  "primary_question=cultivar-associated developmental coexpression programs in berry pericarp",
  "primary_network=historical beta10; beta7 sensitivity retained",
  "report_formats=html,docx,pdf",
  "manuscript_formats=html,docx,pdf",
  paste0("supplementary_files_indexed=", nrow(manifest)),
  paste0("claims_traced=", nrow(claim_evidence)),
  "leading_program=M5",
  "year_reproducible_module=M10",
  "m2_boundary=mapped core only; whole-module preservation not established",
  "causality_boundary=no skin-thickness phenotype and no causal claim"
)
writeLines(summary_lines, file.path(result_dir, "analysis_summary.txt"))
writeLines(summary_lines, file.path(report_dir, "latest_report_update.txt"))

cat("\nT-009 INTEGRATION PASS\n")
cat("Technical report:", report_dir, "\n")
cat("Manuscript:", manuscript_dir, "\n")
cat("Evidence package:", result_dir, "\n")
cat("Archived report:", report_archive_dir, "\n")
cat("Archived manuscript:", manuscript_archive_dir, "\n")
