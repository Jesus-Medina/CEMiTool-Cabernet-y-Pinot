# Export CEMiTool results and reproducibility records

project_dir <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

cem <- readRDS(
  file.path(project_dir, "results/objects/cemitool.rds")
)

dir.create(
  file.path(project_dir, "results/tables"),
  recursive = TRUE,
  showWarnings = FALSE
)

dir.create(
  file.path(project_dir, "results/figures"),
  recursive = TRUE,
  showWarnings = FALSE
)

report_figure_dir <- file.path(
  project_dir,
  "reports/assets/figures"
)

dir.create(
  report_figure_dir,
  recursive = TRUE,
  showWarnings = FALSE
)

CEMiTool::write_files(
  cem,
  directory = file.path(project_dir, "results/tables"),
  force = TRUE
)

# Keep the original CEMiTool vector PDFs as scientific output.
CEMiTool::save_plots(
  cem,
  "all",
  directory = file.path(project_dir, "results/figures"),
  force = TRUE
)

# Word works more reliably with raster graphics. Instead of converting
# CEMiTool PDFs with Poppler, save PNG copies directly from the plot objects.
safe_name <- function(x) {
  x <- gsub("[^A-Za-z0-9_-]+", "_", x)
  x <- gsub("_+", "_", x)
  gsub("^_|_$", "", x)
}

save_plot_png <- function(plot_object, filename, width = 9, height = 6.5) {
  if (is.null(plot_object)) {
    return(FALSE)
  }

  tryCatch(
    {
      ggplot2::ggsave(
        filename = filename,
        plot = plot_object,
        width = width,
        height = height,
        units = "in",
        dpi = 300,
        bg = "white",
        limitsize = FALSE
      )
      TRUE
    },
    error = function(e) {
      warning(
        "Could not save PNG figure ",
        basename(filename),
        ": ",
        conditionMessage(e)
      )
      FALSE
    }
  )
}

plot_types <- c(
  "profile",
  "gsea",
  "ora",
  "interaction",
  "beta_r2",
  "mean_k",
  "sample_tree",
  "mean_var",
  "hist",
  "qq"
)

for (plot_type in plot_types) {
  plot_set <- tryCatch(
    CEMiTool::show_plot(cem, plot_type),
    error = function(e) NULL
  )

  if (is.null(plot_set)) {
    next
  }

  is_single_plot <- inherits(
    plot_set,
    c("ggplot", "grob", "gtable", "gg", "patchwork")
  )

  if (is_single_plot) {
    plot_set <- list(plot_set)
  } else if (!is.list(plot_set)) {
    plot_set <- list(plot_set)
  }

  plot_names <- names(plot_set)

  for (i in seq_along(plot_set)) {
    label <- if (
      !is.null(plot_names) &&
      length(plot_names) >= i &&
      !is.na(plot_names[[i]]) &&
      nzchar(plot_names[[i]])
    ) {
      safe_name(plot_names[[i]])
    } else {
      sprintf("%02d", i)
    }

    filename <- if (length(plot_set) == 1) {
      paste0(plot_type, ".png")
    } else {
      paste0(plot_type, "_", label, ".png")
    }

    dimensions <- switch(
      plot_type,
      profile = c(10, 7),
      sample_tree = c(11, 7),
      gsea = c(9, 7),
      interaction = c(9, 8),
      c(9, 6.5)
    )

    save_plot_png(
      plot_set[[i]],
      file.path(report_figure_dir, filename),
      width = dimensions[[1]],
      height = dimensions[[2]]
    )
  }
}

beta <- tryCatch(
  cem@parameters$beta,
  error = function(e) NA
)

r2 <- tryCatch(
  cem@parameters$r2,
  error = function(e) NA
)

beta_fit <- tryCatch(
  CEMiTool::fit_data(cem),
  error = function(e) NULL
)

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
    "The recorded scale-free fit for beta 7 is below 0.60. ",
    "Inspect the diagnostic report before interpreting modules."
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
    "beta_strategy=manual_set_beta_baseline_reproduction",
    "set_beta=7",
    "force_beta=FALSE",
    paste0("beta=", beta),
    paste0("r2=", r2),
    "filter=TRUE",
    "filter_pval=0.1",
    "min_module_size=30",
    "seed=1234",
    paste0("modules=", CEMiTool::nmodules(cem))
  ),
  file.path(project_dir, "logs/parameters.txt")
)

writeLines(
  c(
    "GSE98923 CEMiTool baseline",
    paste0("completed=", Sys.time()),
    paste0("modules=", CEMiTool::nmodules(cem)),
    "beta_strategy=manual_set_beta_baseline_reproduction",
    paste0("beta=", beta),
    paste0("r2=", r2)
  ),
  file.path(project_dir, "logs/run_summary.txt")
)

message("CEMiTool tables, vector figures, PNG report figures, and logs exported.")
