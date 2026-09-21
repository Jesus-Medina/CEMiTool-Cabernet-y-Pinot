# T-003: audit existing beta10 eigengenes, model diagnostics and all contrasts.
# This reads the frozen beta10 network; it does not rerun CEMiTool or script 07.

run_t003_review <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  source_dir <- file.path(root, "results/module_statistics_beta10")
  read_tsv <- function(name) {
    path <- file.path(source_dir, name)
    if (!file.exists(path)) stop("Missing required input: ", path)
    read.delim(path, check.names = FALSE, stringsAsFactors = FALSE)
  }

  qc <- read_tsv("module_eigengene_qc.tsv")
  old_diag <- read_tsv("module_model_diagnostics.tsv")
  samples <- read_tsv("module_eigengenes_with_metadata_54.tsv")
  contrasts <- read_tsv("cabernet_vs_pinot_within_each_stage.tsv")
  modules <- sort(grep("^M[0-9]+$", names(samples), value = TRUE))
  stages <- c("FruitSet", "Veraison", "Harvest")
  cultivars <- c("Pinot noir", "Cabernet Sauvignon")
  years <- c("2012", "2013", "2014")

  if (length(modules) != 10L || nrow(samples) != 54L ||
      anyDuplicated(samples$SampleName) || anyNA(samples[, modules]) ||
      any(table(samples$Cultivar, samples$Stage, samples$Year) != 3L)) {
    stop("Eigengene table does not match the frozen balanced design.")
  }
  if (!setequal(qc$Module, modules) || !setequal(old_diag$Module, modules) ||
      nrow(contrasts) != 30L ||
      any(table(contrasts$Module, contrasts$Stage) != 1L) ||
      !all(contrasts$contrast == "Cabernet Sauvignon - Pinot noir")) {
    stop("QC/diagnostic/contrast coverage is incomplete or inconsistent.")
  }

  # Recompute PC1 directly from the archived expression matrix and beta10 object.
  if (!requireNamespace("CEMiTool", quietly = TRUE)) {
    stop("CEMiTool is needed to read beta10 module membership.")
  }
  cem <- readRDS(file.path(root, "results/beta10/objects/cemitool.rds"))
  expr <- readRDS(file.path(root, "data/processed/expression_log2rpkm.rds"))
  if (!identical(colnames(expr), samples$SampleName)) {
    stop("Expression-matrix sample order differs from the eigengene table.")
  }
  membership <- CEMiTool::module_genes(cem)
  module_col <- names(membership)[tolower(names(membership)) == "module"]
  if (length(module_col) == 0L) {
    module_col <- names(membership)[grepl("module", names(membership),
                                           ignore.case = TRUE)]
  }
  if (length(module_col) != 1L) stop("Cannot identify module column.")
  gene_col <- setdiff(names(membership), module_col)[1]

  samples$Cultivar <- factor(samples$Cultivar, levels = cultivars)
  samples$Stage <- factor(samples$Stage, levels = stages)
  samples$Year <- factor(as.character(samples$Year), levels = years)
  sample_rows <- list()
  module_rows <- list()
  contrast_rows <- list()

  for (m in modules) {
    genes <- as.character(membership[[gene_col]][membership[[module_col]] == m])
    genes <- intersect(genes, rownames(expr))
    x <- as.matrix(expr[genes, , drop = FALSE])
    keep <- apply(x, 1, function(v) is.finite(sd(v)) && sd(v) > 0)
    x <- x[keep, , drop = FALSE]
    pca <- prcomp(t(x), center = TRUE, scale. = TRUE)
    pc1 <- as.numeric(pca$x[, 1])
    if (cor(pc1, colMeans(x)) < 0) pc1 <- -pc1
    q <- qc[qc$Module == m, , drop = FALSE]
    var_pc1 <- 100 * summary(pca)$importance[2, 1]
    if (nrow(q) != 1L ||
        sum(membership[[module_col]] == m) != q$Genes_assigned ||
        length(genes) != q$Genes_used_for_PCA ||
        abs(var_pc1 - q$PC1_variance_percent) > 0.0011 ||
        max(abs(pc1 - samples[[m]])) > 1e-7) {
      stop("Eigengene/PC1 QC mismatch for ", m)
    }

    dat <- data.frame(Eigengene = samples[[m]],
                      Cultivar = samples$Cultivar,
                      Stage = samples$Stage,
                      Year = samples$Year)
    fit <- lm(Eigengene ~ Cultivar * Stage + Year, data = dat)
    std_resid <- rstandard(fit)
    cook <- cooks.distance(fit)
    diag_row <- old_diag[old_diag$Module == m, , drop = FALSE]
    checks <- c(N = nrow(dat), R_squared = summary(fit)$r.squared,
                Adjusted_R_squared = summary(fit)$adj.r.squared,
                Residual_SD = sd(residuals(fit)),
                Max_abs_standardized_residual = max(abs(std_resid)))
    if (nrow(diag_row) != 1L ||
        any(abs(checks - unlist(diag_row[names(checks)])) > 1e-7)) {
      stop("Stored model diagnostics mismatch for ", m)
    }

    sample_rows[[m]] <- data.frame(
      Module = m, SampleName = samples$SampleName,
      Cultivar = as.character(samples$Cultivar),
      Stage = as.character(samples$Stage),
      Year = as.character(samples$Year),
      Eigengene = samples[[m]], Fitted = fitted(fit),
      Residual = residuals(fit), Standardized_residual = std_resid,
      Cooks_D = cook, Leverage = hatvalues(fit),
      Abs_standardized_residual_over_3 = abs(std_resid) > 3,
      Cooks_D_over_4_per_N = cook > 4 / nrow(dat)
    )
    module_rows[[m]] <- data.frame(
      Module = m, Genes_used_for_PCA = nrow(x),
      PC1_variance_percent = var_pc1,
      Correlation_PC1_with_module_mean = cor(pc1, colMeans(x)),
      R_squared = summary(fit)$r.squared,
      Adjusted_R_squared = summary(fit)$adj.r.squared,
      Shapiro_W = unname(shapiro.test(residuals(fit))$statistic),
      Shapiro_p = shapiro.test(residuals(fit))$p.value,
      Max_abs_standardized_residual = max(abs(std_resid)),
      N_abs_standardized_residual_over_3 = sum(abs(std_resid) > 3),
      Max_Cooks_D = max(cook),
      N_Cooks_D_over_4_per_N = sum(cook > 4 / nrow(dat))
    )

    # Independently form each Cabernet - Pinot contrast from the fitted
    # coefficient vector and covariance matrix, without emmeans.
    for (stage in stages) {
      new_data <- data.frame(
        Cultivar = factor(cultivars, levels = cultivars),
        Stage = factor(rep(stage, 2), levels = stages),
        Year = factor(rep("2012", 2), levels = years)
      )
      mm <- model.matrix(delete.response(terms(fit)), new_data)
      delta <- mm[2, ] - mm[1, ]
      estimate <- drop(delta %*% coef(fit))
      se <- sqrt(drop(delta %*% vcov(fit) %*% delta))
      p <- 2 * pt(-abs(estimate / se), df.residual(fit))
      stored <- contrasts[contrasts$Module == m & contrasts$Stage == stage, ]
      if (nrow(stored) != 1L || abs(estimate - stored$estimate) > 1e-7 ||
          abs(se - stored$SE) > 1e-7 || abs(p - stored$p.value) > 1e-8 ||
          stored$df != df.residual(fit)) {
        stop("Contrast mismatch for ", m, " / ", stage)
      }
      contrast_rows[[paste(m, stage)]] <- data.frame(
        Module = m, Stage = stage, Estimate = estimate, SE = se,
        df = df.residual(fit), p_value = p,
        FDR_global_reported = stored$FDR_global,
        FDR_within_stage_reported = stored$FDR_within_stage
      )
    }
  }

  sample_diag <- do.call(rbind, sample_rows)
  module_summary <- do.call(rbind, module_rows)
  contrast_audit <- do.call(rbind, contrast_rows)
  rownames(sample_diag) <- rownames(module_summary) <-
    rownames(contrast_audit) <- NULL
  module_summary$Shapiro_FDR <- p.adjust(module_summary$Shapiro_p, "BH")
  contrast_audit$FDR_global_recomputed <- p.adjust(contrast_audit$p_value, "BH")
  contrast_audit$FDR_within_stage_recomputed <- ave(
    contrast_audit$p_value, contrast_audit$Stage,
    FUN = function(p) p.adjust(p, "BH")
  )
  if (max(abs(contrast_audit$FDR_global_reported -
              contrast_audit$FDR_global_recomputed)) > 1e-8 ||
      max(abs(contrast_audit$FDR_within_stage_reported -
              contrast_audit$FDR_within_stage_recomputed)) > 1e-8) {
    stop("Stored contrast FDR does not match independent BH correction.")
  }

  write_tsv <- function(x, name) {
    write.table(x, file.path(source_dir, name), sep = "\t",
                quote = FALSE, row.names = FALSE)
  }
  write_tsv(sample_diag, "t003_sample_residual_diagnostics.tsv")
  write_tsv(module_summary, "t003_module_qc_summary.tsv")
  write_tsv(contrast_audit, "t003_all_contrasts_audit.tsv")
  cat("T-003 QC review complete: ", nrow(module_summary), " modules; ",
      nrow(sample_diag), " sample-module residuals; ",
      nrow(contrast_audit), " contrasts; ",
      sum(contrast_audit$FDR_global_recomputed < 0.05),
      " global-FDR hits.\n", sep = "")
}

run_t003_review()
