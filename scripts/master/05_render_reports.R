# Render native CEMiTool reports, technical reports, and manuscript draft

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

required <- c(
  "rmarkdown",
  "knitr",
  "tinytex",
  "zip"
)

missing <- required[
  !vapply(required, requireNamespace, logical(1), quietly = TRUE)
]

if (length(missing) > 0) {
  install.packages(missing)
}

report_dir <- file.path(project_dir, "reports")
cemitool_report_dir <- file.path(report_dir, "cemitool")
diagnostic_report_dir <- file.path(report_dir, "diagnostics")
assets_dir <- file.path(report_dir, "assets/figures")
supp_dir <- file.path(report_dir, "supplementary")
manuscript_dir <- file.path(project_dir, "manuscript")

dirs <- c(
  report_dir,
  cemitool_report_dir,
  diagnostic_report_dir,
  assets_dir,
  supp_dir,
  manuscript_dir
)

invisible(lapply(
  dirs,
  dir.create,
  recursive = TRUE,
  showWarnings = FALSE
))

cem <- readRDS(
  file.path(project_dir, "results/objects/cemitool.rds")
)

# Native CEMiTool reports
native_report_status <- data.frame(
  report = c("cemitool", "diagnostics"),
  success = c(FALSE, FALSE),
  message = c("", ""),
  stringsAsFactors = FALSE
)

native_report_status$success[1] <- tryCatch(
  {
    CEMiTool::generate_report(
      cem,
      title = "GSE98923 CEMiTool analysis - beta 10",
      directory = cemitool_report_dir,
      force = TRUE,
      output_format = "html_document"
    )
    native_report_status$message[1] <- "Generated successfully"
    TRUE
  },
  error = function(e) {
    native_report_status$message[1] <- conditionMessage(e)
    warning(
      "Could not generate the native CEMiTool report: ",
      conditionMessage(e)
    )
    FALSE
  }
)

native_report_status$success[2] <- tryCatch(
  {
    CEMiTool::diagnostic_report(
      cem,
      title = "GSE98923 CEMiTool diagnostics - beta 10",
      directory = diagnostic_report_dir,
      force = TRUE,
      output_format = "html_document"
    )
    native_report_status$message[2] <- "Generated successfully"
    TRUE
  },
  error = function(e) {
    native_report_status$message[2] <- conditionMessage(e)
    warning(
      "Could not generate the native CEMiTool diagnostic report: ",
      conditionMessage(e)
    )
    FALSE
  }
)

write.table(
  native_report_status,
  file.path(report_dir, "native_report_status.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# PNG figures are created directly from R plot objects in 04_export_results.R.
png_figures <- list.files(
  assets_dir,
  pattern = "\\.(png|jpg|jpeg)$",
  full.names = TRUE,
  recursive = TRUE,
  ignore.case = TRUE
)

if (length(png_figures) == 0) {
  warning(
    "No report-compatible PNG figures were found in reports/assets/figures/. ",
    "The reports will still render, but their figure section may be empty."
  )
}

# Supplementary manifest
supp_files <- unique(c(
  list.files(
    file.path(project_dir, "data/metadata"),
    full.names = TRUE,
    recursive = TRUE
  ),
  list.files(
    file.path(project_dir, "data/processed"),
    full.names = TRUE,
    recursive = TRUE
  ),
  list.files(
    file.path(project_dir, "results/tables"),
    full.names = TRUE,
    recursive = TRUE
  ),
  list.files(
    file.path(project_dir, "results/figures"),
    full.names = TRUE,
    recursive = TRUE
  ),
  list.files(
    cemitool_report_dir,
    full.names = TRUE,
    recursive = TRUE
  ),
  list.files(
    diagnostic_report_dir,
    full.names = TRUE,
    recursive = TRUE
  ),
  file.path(project_dir, "logs/parameters.txt"),
  file.path(project_dir, "logs/session_info.txt"),
  file.path(project_dir, "logs/run_summary.txt"),
  file.path(report_dir, "native_report_status.tsv")
))

supp_files <- supp_files[
  file.exists(supp_files) &
  !dir.exists(supp_files)
]

relative_path <- function(path) {
  normalized <- normalizePath(
    path,
    winslash = "/",
    mustWork = TRUE
  )

  prefix <- paste0(
    normalizePath(
      project_dir,
      winslash = "/",
      mustWork = TRUE
    ),
    "/"
  )

  substring(
    normalized,
    nchar(prefix) + 1
  )
}

manifest <- data.frame(
  file = vapply(
    supp_files,
    relative_path,
    character(1)
  ),
  bytes = as.numeric(file.info(supp_files)$size),
  md5 = unname(tools::md5sum(supp_files)),
  stringsAsFactors = FALSE
)

manifest <- manifest[order(manifest$file), ]

write.table(
  manifest,
  file.path(supp_dir, "manifest.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

supp_zip <- file.path(
  supp_dir,
  "gse98923_supplementary_files.zip"
)

if (file.exists(supp_zip)) {
  file.remove(supp_zip)
}

old_wd <- getwd()
setwd(project_dir)
on.exit(setwd(old_wd), add = TRUE)

zip::zipr(
  zipfile = supp_zip,
  files = manifest$file
)

# Consolidated technical report
ensure_latex <- function() {
  has_xelatex <- nzchar(Sys.which("xelatex"))

  if (!has_xelatex && !tinytex::is_tinytex()) {
    message(
      "No LaTeX installation was found. Installing TinyTeX once for PDF output."
    )

    try(
      tinytex::install_tinytex(),
      silent = TRUE
    )
  }

  nzchar(Sys.which("xelatex")) || tinytex::is_tinytex()
}

render_one <- function(input, format, output_file, output_dir) {
  tryCatch(
    {
      rmarkdown::render(
        input = input,
        output_format = format,
        output_file = output_file,
        output_dir = output_dir,
        envir = new.env(parent = globalenv()),
        quiet = TRUE
      )

      message(
        "Created: ",
        file.path(output_dir, output_file)
      )

      TRUE
    },
    error = function(e) {
      warning(
        "Could not render ",
        output_file,
        ": ",
        conditionMessage(e)
      )

      FALSE
    }
  )
}

analysis_template <- file.path(
  project_dir,
  "templates/analysis_report.Rmd"
)

analysis_status <- data.frame(
  format = c("html", "docx", "pdf"),
  success = c(FALSE, FALSE, FALSE),
  stringsAsFactors = FALSE
)

analysis_status$success[1] <- render_one(
  analysis_template,
  "html_document",
  "analysis_report.html",
  report_dir
)

analysis_status$success[2] <- render_one(
  analysis_template,
  "word_document",
  "analysis_report.docx",
  report_dir
)

if (ensure_latex()) {
  analysis_status$success[3] <- render_one(
    analysis_template,
    "pdf_document",
    "analysis_report.pdf",
    report_dir
  )
} else {
  warning(
    "PDF report was skipped because no working LaTeX installation is available."
  )
}

write.table(
  analysis_status,
  file.path(report_dir, "analysis_report_status.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# Scientific manuscript scaffold
article_source <- file.path(
  project_dir,
  "templates/article_draft.Rmd"
)

article_copy <- file.path(
  manuscript_dir,
  "article_draft.Rmd"
)

file.copy(
  article_source,
  article_copy,
  overwrite = TRUE
)

article_status <- data.frame(
  format = c("docx", "pdf"),
  success = c(FALSE, FALSE),
  stringsAsFactors = FALSE
)

article_status$success[1] <- render_one(
  article_copy,
  "word_document",
  "article_draft.docx",
  manuscript_dir
)

if (ensure_latex()) {
  article_status$success[2] <- render_one(
    article_copy,
    "pdf_document",
    "article_draft.pdf",
    manuscript_dir
  )
}

write.table(
  article_status,
  file.path(manuscript_dir, "article_render_status.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# Human-readable report index
writeLines(
  c(
    "# Report index",
    "",
    "## Native CEMiTool reports",
    "",
    "- reports/cemitool/: native CEMiTool analysis report",
    "- reports/diagnostics/: native CEMiTool diagnostic report",
    "",
    "## Consolidated technical report",
    "",
    "- reports/analysis_report.html",
    "- reports/analysis_report.docx",
    "- reports/analysis_report.pdf",
    "",
    "## Scientific manuscript scaffold",
    "",
    "- manuscript/article_draft.Rmd",
    "- manuscript/article_draft.docx",
    "- manuscript/article_draft.pdf",
    "",
    "## Supplementary material",
    "",
    "- reports/supplementary/manifest.tsv",
    "- reports/supplementary/gse98923_supplementary_files.zip",
    "",
    "The native CEMiTool reports, consolidated report, and manuscript draft",
    "serve different purposes and are intentionally kept together."
  ),
  file.path(report_dir, "README.md")
)

message(
  "Report generation complete: native CEMiTool reports, consolidated ",
  "HTML/Word/PDF report, manuscript draft, and supplementary package."
)
