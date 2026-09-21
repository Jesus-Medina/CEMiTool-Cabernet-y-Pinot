# 08_update_report_with_module_statistics.R
# Integrates post-CEMiTool beta10 statistics into the main report.
# Run from the canonical Git repository root:
# source("scripts/post/08_update_report_with_module_statistics.R")
#
# IMPORTANT:
# This script uses the post-migration canonical repository layout.

project_dir <- normalizePath(getwd(), winslash="/", mustWork=TRUE)
stats_dir <- file.path(project_dir, "results", "module_statistics_beta10")
cmp_dir <- file.path(project_dir, "results", "comparisons")
report_root <- file.path(project_dir, "reports")
report_dir <- file.path(report_root, "current")
archive_root <- file.path(report_root, "archive")
template_dir <- file.path(report_root, "templates")
log_dir <- file.path(project_dir, "results", "logs")

dir.create(report_dir, recursive=TRUE, showWarnings=FALSE)
dir.create(archive_root, recursive=TRUE, showWarnings=FALSE)
dir.create(template_dir, recursive=TRUE, showWarnings=FALSE)
dir.create(log_dir, recursive=TRUE, showWarnings=FALSE)

for (pkg in c("rmarkdown","knitr")) {
  if (!requireNamespace(pkg, quietly=TRUE)) install.packages(pkg)
}

required <- c(
  file.path(stats_dir, "analysis_summary.txt"),
  file.path(stats_dir, "module_factorial_ANOVA_typeIII.tsv"),
  file.path(stats_dir, "significant_cultivar_stage_interactions_FDR05.tsv"),
  file.path(stats_dir, "significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv")
)
if (any(!file.exists(required))) {
  stop("Missing outputs from 07_module_statistics_beta10.R:\n",
       paste(required[!file.exists(required)], collapse="\n"))
}

read_tsv <- function(x) read.delim(
  x, sep="\t", header=TRUE, stringsAsFactors=FALSE, check.names=FALSE
)

anova <- read_tsv(file.path(stats_dir, "module_factorial_ANOVA_typeIII.tsv"))
inter <- read_tsv(file.path(stats_dir, "significant_cultivar_stage_interactions_FDR05.tsv"))
contr <- read_tsv(file.path(stats_dir, "significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv"))

n_modules <- length(unique(anova$Module))
n_inter <- nrow(inter)
n_contr <- nrow(contr)
year <- anova[anova$Effect=="Year", , drop=FALSE]
n_year <- sum(!is.na(year$FDR) & year$FDR < 0.05)
strongest <- if (n_inter) inter$Module[which.min(inter$FDR)] else "none"

stamp <- format(Sys.time(), "%Y%m%d_%H%M%S")
archive_dir <- file.path(
  archive_root,
  paste0(stamp, "_before_module_statistics")
)
old <- file.path(report_dir, c(
  "analysis_report.html",
  "analysis_report.docx",
  "analysis_report.pdf",
  "analysis_report_status.tsv"
))
old <- old[file.exists(old)]
if (length(old)) {
  dir.create(archive_dir, recursive=TRUE, showWarnings=FALSE)
  file.copy(old, archive_dir, overwrite=TRUE)
  message("Previous report archived in: ", archive_dir)
}

base_template <- file.path(template_dir, "analysis_report.Rmd")
if (!file.exists(base_template)) {
  stop("Missing base template: ", base_template,
       "\nRun the beta10 MASTER workflow first.")
}

rpath <- function(x) gsub("\\\\", "/", normalizePath(x, winslash="/", mustWork=FALSE))
fence <- strrep(intToUtf8(96), 3)

appendix <- c(
  "",
  "<!-- BEGIN POST_CEMITOOL_MODULE_STATISTICS -->",
  "",
  "# Post-CEMiTool module statistics",
  "",
  "This section is an additional statistical layer performed after construction of the beta-10 CEMiTool network. It is not part of the native CEMiTool report and is not stored inside the CEMiTool object.",
  "",
  paste0(fence, "{r post-cemitool-load, echo=FALSE, message=FALSE, warning=FALSE}"),
  paste0('stats_dir <- "', rpath(stats_dir), '"'),
  paste0('cmp_dir <- "', rpath(cmp_dir), '"'),
  'rd <- function(x) read.delim(x, sep="\\t", header=TRUE, stringsAsFactors=FALSE, check.names=FALSE)',
  'anova <- rd(file.path(stats_dir, "module_factorial_ANOVA_typeIII.tsv"))',
  'inter <- rd(file.path(stats_dir, "significant_cultivar_stage_interactions_FDR05.tsv"))',
  'contr <- rd(file.path(stats_dir, "significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv"))',
  'contr$Direction <- ifelse(contr$estimate > 0, "Cabernet Sauvignon > Pinot noir", "Cabernet Sauvignon < Pinot noir")',
  'year <- anova[anova$Effect == "Year", , drop=FALSE]',
  'year_sig <- year[!is.na(year$FDR) & year$FDR < 0.05, , drop=FALSE]',
  'wide <- reshape(anova[,c("Module","Effect","FDR")], idvar="Module", timevar="Effect", direction="wide")',
  'names(wide) <- sub("^FDR\\\\.", "FDR_", names(wide))',
  'wide <- wide[order(wide$Module),,drop=FALSE]',
  'match_file <- file.path(cmp_dir, "best_module_matches_beta7_to_beta10.tsv")',
  'matches <- if (file.exists(match_file)) rd(match_file) else NULL',
  fence,
  "",
  "## Network calibration and sensitivity",
  "",
  "Beta 10 is the primary network and beta 7 is retained as a sensitivity analysis. Module labels are arbitrary across runs, so robustness is evaluated using shared genes rather than matching labels by name.",
  "",
  paste0(fence, "{r beta-robustness, echo=FALSE, results='asis'}"),
  'if (!is.null(matches)) {',
  '  keep <- intersect(c("Module_beta7","Module_beta10","Shared_genes","Jaccard","Percent_beta7_retained"), names(matches))',
  '  x <- matches[,keep,drop=FALSE]',
  '  if ("Jaccard" %in% names(x)) x$Jaccard <- round(x$Jaccard,3)',
  '  if ("Percent_beta7_retained" %in% names(x)) x$Percent_beta7_retained <- round(x$Percent_beta7_retained,1)',
  '  print(knitr::kable(x, caption="Best beta7-to-beta10 matches based on gene membership."))',
  '} else cat("Beta7-vs-beta10 comparison table was not available at render time.\\n")',
  fence,
  "",
  "## Module eigengene model",
  "",
  "For each beta-10 biological module, PC1 of standardized module-gene expression was used as the module eigengene. PC1 sign was oriented to correlate positively with mean module expression.",
  "",
  "Model:",
  "",
  paste0(fence, "text"),
  "Eigengene ~ Cultivar * Stage + Year",
  fence,
  "",
  "Type III ANOVA used sum-to-zero contrasts and Benjamini-Hochberg FDR.",
  "",
  "## FDR overview by module",
  "",
  paste0(fence, "{r fdr-overview, echo=FALSE, results='asis'}"),
  'for (nm in names(wide)[vapply(wide,is.numeric,logical(1))]) wide[[nm]] <- signif(wide[[nm]],4)',
  'print(knitr::kable(wide, caption="FDR by module and model effect."))',
  fence,
  "",
  "## Significant Cultivar x Stage interactions",
  "",
  paste0(fence, "{r interaction-table, echo=FALSE, results='asis'}"),
  'if (nrow(inter)==0) {',
  '  cat("No module passed FDR < 0.05 for Cultivar x Stage.\\n")',
  '} else {',
  '  s <- inter[which.min(inter$FDR),,drop=FALSE]',
  '  cat(paste0("**",nrow(inter)," of ",length(unique(anova$Module))," modules** passed FDR < 0.05. Strongest: **",s$Module,"** (FDR=",format(s$FDR,scientific=TRUE,digits=3),").\\n\\n"))',
  '  x <- inter',
  '  x$p_value <- format(x$p_value, scientific=TRUE, digits=3)',
  '  x$FDR <- format(x$FDR, scientific=TRUE, digits=3)',
  '  keep <- intersect(c("Module","F value","p_value","FDR"), names(x))',
  '  print(knitr::kable(x[,keep,drop=FALSE], caption="Significant Cultivar x Stage interactions."))',
  '}',
  fence,
  "",
  "A significant interaction means that the Cabernet-versus-Pinot difference changes with developmental stage. It does not by itself demonstrate a causal relationship with skin thickness.",
  "",
  "## Cabernet Sauvignon vs Pinot noir within stage",
  "",
  "The contrast is Cabernet Sauvignon minus Pinot noir. Negative estimates therefore indicate a lower module eigengene in Cabernet Sauvignon.",
  "",
  paste0(fence, "{r stage-contrasts, echo=FALSE, results='asis'}"),
  'if (nrow(contr)==0) {',
  '  cat("No stage-specific contrast passed global FDR < 0.05.\\n")',
  '} else {',
  '  x <- contr',
  '  x$estimate <- round(x$estimate,3)',
  '  x$p.value <- format(x$p.value, scientific=TRUE, digits=3)',
  '  x$FDR_global <- format(x$FDR_global, scientific=TRUE, digits=3)',
  '  keep <- intersect(c("Module","Stage","estimate","Direction","p.value","FDR_global"), names(x))',
  '  print(knitr::kable(x[,keep,drop=FALSE], caption="Significant cultivar contrasts within stage."))',
  '}',
  fence,
  "",
  "## Year effect",
  "",
  paste0(fence, "{r year-effect, echo=FALSE, results='asis'}"),
  'cat(paste0("Year passed FDR < 0.05 in **",nrow(year_sig)," of ",nrow(year)," modules**.\\n\\n"))',
  'if (nrow(year_sig)) {',
  '  x <- year_sig[,c("Module","p_value","FDR"),drop=FALSE]',
  '  x$p_value <- format(x$p_value, scientific=TRUE, digits=3)',
  '  x$FDR <- format(x$FDR, scientific=TRUE, digits=3)',
  '  print(knitr::kable(x, caption="Modules with significant Year effect."))',
  '}',
  fence,
  "",
  "This supports keeping 2012, 2013 and 2014 explicit. The current additive model adjusts for Year but does not yet test whether the Cultivar x Stage pattern itself is stable across years.",
  "",
  "## Interpretation boundaries and next step",
  "",
  "- GSE98923 is berry pericarp, not isolated skin.",
  "- There is no direct skin-thickness phenotype in this dataset.",
  "- Only two cultivars are compared.",
  "- Several modules have a significant Year effect.",
  "- The baseline uses the historical GEO RPKM matrix.",
  "",
  "The next planned statistical test is:",
  "",
  paste0(fence, "text"),
  "Eigengene ~ Cultivar * Stage * Year",
  fence,
  "",
  "followed by Cabernet-versus-Pinot contrasts within each Stage x Year combination. Modules that remain robust can then proceed to functional annotation, hub-gene prioritization and skin-only validation.",
  "",
  "<!-- END POST_CEMITOOL_MODULE_STATISTICS -->"
)

updated_template <- file.path(template_dir, "analysis_report_updated.Rmd")
writeLines(c(readLines(base_template, warn=FALSE, encoding="UTF-8"), appendix),
           updated_template, useBytes=TRUE)

render_one <- function(fmt, filename) {
  tryCatch({
    old_project_env <- Sys.getenv("CEMITOOL_PROJECT_DIR", unset = NA_character_)
    on.exit({
      if (is.na(old_project_env)) {
        Sys.unsetenv("CEMITOOL_PROJECT_DIR")
      } else {
        Sys.setenv(CEMITOOL_PROJECT_DIR = old_project_env)
      }
    }, add = TRUE)

    Sys.setenv(CEMITOOL_PROJECT_DIR = project_dir)

    rmarkdown::render(
      updated_template,
      output_format = fmt,
      output_file = filename,
      output_dir = report_dir,
      envir = new.env(parent = globalenv()),
      quiet = TRUE
    )
    message("Created: ", file.path(report_dir, filename))
    TRUE
  }, error=function(e) {
    warning("Could not render ", filename, ": ", conditionMessage(e))
    FALSE
  })
}

ensure_latex <- function() {
  if (nzchar(Sys.which("xelatex"))) return(TRUE)
  if (!requireNamespace("tinytex", quietly=TRUE)) try(install.packages("tinytex"), silent=TRUE)
  if (requireNamespace("tinytex", quietly=TRUE) && tinytex::is_tinytex()) return(TRUE)
  if (requireNamespace("tinytex", quietly=TRUE)) try(tinytex::install_tinytex(), silent=TRUE)
  nzchar(Sys.which("xelatex")) ||
    (requireNamespace("tinytex", quietly=TRUE) && tinytex::is_tinytex())
}

status <- data.frame(format=c("html","docx","pdf"), success=FALSE)
status$success[1] <- render_one("html_document", "analysis_report.html")
status$success[2] <- render_one("word_document", "analysis_report.docx")
if (ensure_latex()) {
  status$success[3] <- render_one("pdf_document", "analysis_report.pdf")
} else {
  warning("PDF skipped: no working LaTeX/TinyTeX installation.")
}

write.table(status, file.path(report_dir,"analysis_report_status.tsv"),
            sep="\t", quote=FALSE, row.names=FALSE)

log_lines <- c(
  "GSE98923 main report update",
  paste0("completed=",Sys.time()),
  "primary_network_beta=10",
  paste0("modules_in_factorial_model=",n_modules),
  paste0("significant_cultivar_stage_interactions_FDR05=",n_inter),
  paste0("significant_stage_specific_contrasts_global_FDR05=",n_contr),
  paste0("modules_with_year_effect_FDR05=",n_year),
  paste0("strongest_interaction_module=",strongest),
  paste0("previous_report_archive=",ifelse(dir.exists(archive_dir),archive_dir,"none")),
  paste0("html_success=",status$success[1]),
  paste0("docx_success=",status$success[2]),
  paste0("pdf_success=",status$success[3])
)
writeLines(log_lines, file.path(log_dir,paste0("report_update_module_statistics_",stamp,".txt")))
writeLines(log_lines, file.path(report_dir,"latest_report_update.txt"))

cat("\nMAIN REPORT UPDATED\n")
cat("Modules:",n_modules,"\n")
cat("Cultivar x Stage FDR<0.05:",n_inter,"\n")
cat("Strongest interaction:",strongest,"\n")
cat("Stage-specific contrasts:",n_contr,"\n")
cat("Year FDR<0.05:",n_year,"\n\n")
print(status, row.names=FALSE)
cat("\nCurrent reports are in:",report_dir,"\n")
if (dir.exists(archive_dir)) cat("Previous version archived in:",archive_dir,"\n")
