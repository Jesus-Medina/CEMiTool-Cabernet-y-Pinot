# T-004: year robustness of the frozen beta10 module eigengenes.
# Run from the canonical repository root with
# source("scripts/post/09_year_robustness_beta10.R")
# This script does not rerun CEMiTool or change the 54-sample baseline.

run_t004 <- function() {
  root <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
  if (!file.exists(file.path(root, "AGENTS.md")) ||
      !file.exists(file.path(root, "docs/TASK_LEDGER.md"))) {
    stop("Run T-004 from the canonical repository root.")
  }
  input <- file.path(root, "results/module_statistics_beta10",
                         "module_eigengenes_with_metadata_54.tsv")
  if (!file.exists(input)) stop("Missing audited eigengene input: ", input)
  for (pkg in c("car", "emmeans")) {
    if (!requireNamespace(pkg, quietly = TRUE)) stop("Missing R package: ", pkg)
  }
  dat <- read.delim(input, check.names = FALSE, stringsAsFactors = FALSE)
  modules <- paste0("M", 1:10)
  priority <- c("M5", "M10", "M2", "M3", "M1")
  stages <- c("FruitSet", "Veraison", "Harvest")
  years <- c("2012", "2013", "2014")
  cultivars <- c("Pinot noir", "Cabernet Sauvignon")
  needed <- c("SampleName", "Cultivar", "Stage", "Year", modules)
  if (!all(needed %in% names(dat)) || nrow(dat) != 54L ||
      anyDuplicated(dat$SampleName) || anyNA(dat[needed]) ||
      !setequal(as.character(dat$Cultivar), cultivars) ||
      !setequal(as.character(dat$Stage), stages) ||
      !setequal(as.character(dat$Year), years) ||
      any(table(dat$Cultivar, dat$Stage, dat$Year) != 3L)) {
    stop("Input is not the complete balanced 54-sample beta10 design.")
  }
  for (m in modules) {
    if (!is.numeric(dat[[m]]) || any(!is.finite(dat[[m]]))) {
      stop("Non-finite or non-numeric eigengene in ", m)
    }
  }
  dat$Cultivar <- factor(dat$Cultivar, levels = cultivars)
  dat$Stage <- factor(dat$Stage, levels = stages)
  dat$Year <- factor(as.character(dat$Year), levels = years)
  out <- file.path(root, "results/year_robustness_beta10")
  dir.create(out, recursive = TRUE, showWarnings = FALSE)
  plot_dir <- file.path(out, "profiles")
  dir.create(plot_dir, recursive = TRUE, showWarnings = FALSE)
  write_tsv <- function(x, name) {
    write.table(x, file.path(out, name), sep = "\t", quote = FALSE,
                row.names = FALSE, na = "NA")
  }

  old_options <- options("contrasts")
  on.exit(options(old_options), add = TRUE)
  options(contrasts = c("contr.sum", "contr.poly"))
  anova_rows <- list()
  contrast_rows <- list()
  profile_rows <- list()
  diagnostic_rows <- list()
  effects <- c("Cultivar", "Stage", "Year", "Cultivar:Stage",
               "Cultivar:Year", "Stage:Year", "Cultivar:Stage:Year")

  for (m in modules) {
    d <- dat[c("SampleName", "Cultivar", "Stage", "Year", m)]
    names(d)[5] <- "Eigengene"
    fit <- lm(Eigengene ~ Cultivar * Stage * Year, data = d)
    if (qr(fit)$rank != 18L || df.residual(fit) != 36L) {
      stop("Full factorial model is not estimable for ", m)
    }
    a <- as.data.frame(car::Anova(fit, type = 3))
    a$Effect <- rownames(a)
    a <- a[a$Effect %in% effects, , drop = FALSE]
    names(a)[grep("^Pr\\(", names(a))] <- "p_value"
    a$Module <- m
    a <- a[c("Module", "Effect", "Sum Sq", "Df", "F value", "p_value")]
    names(a)[3:5] <- c("Sum_Sq", "Df", "F_value")
    anova_rows[[m]] <- a

    emm <- emmeans::emmeans(fit, ~ Cultivar | Stage * Year)
    ctab <- as.data.frame(emmeans::contrast(emm, "revpairwise", adjust = "none"))
    if (nrow(ctab) != 9L ||
        !all(ctab$contrast == "Cabernet Sauvignon - Pinot noir")) {
      stop("Unexpected Stage x Year contrast structure for ", m)
    }
    ctab$Module <- m
    ctab$CI_low_unadjusted <- ctab$estimate -
      qt(0.975, ctab$df) * ctab$SE
    ctab$CI_high_unadjusted <- ctab$estimate +
      qt(0.975, ctab$df) * ctab$SE
    ctab <- ctab[c("Module", "Stage", "Year", "contrast", "estimate",
                   "SE", "df", "t.ratio", "p.value", "CI_low_unadjusted",
                   "CI_high_unadjusted")]
    contrast_rows[[m]] <- ctab

    p <- aggregate(Eigengene ~ Cultivar + Stage + Year, data = d,
                   FUN = function(x) c(mean = mean(x), sd = sd(x), n = length(x)))
    profile_rows[[m]] <- data.frame(
      Module = m, Cultivar = as.character(p$Cultivar),
      Stage = as.character(p$Stage), Year = as.character(p$Year),
      Mean = p$Eigengene[, "mean"], SD = p$Eigengene[, "sd"],
      N = p$Eigengene[, "n"],
      SE = p$Eigengene[, "sd"] / sqrt(p$Eigengene[, "n"]))
    diagnostic_rows[[m]] <- data.frame(
      Module = m, N = nobs(fit), Residual_df = df.residual(fit),
      R_squared = summary(fit)$r.squared,
      Adjusted_R_squared = summary(fit)$adj.r.squared,
      Residual_SD = sigma(fit),
      Max_abs_standardized_residual = max(abs(rstandard(fit))),
      N_abs_standardized_residual_over_3 = sum(abs(rstandard(fit)) > 3),
      Max_Cooks_D = max(cooks.distance(fit)),
      Shapiro_p = shapiro.test(residuals(fit))$p.value)
  }

  anova <- do.call(rbind, anova_rows)
  contrasts <- do.call(rbind, contrast_rows)
  profiles <- do.call(rbind, profile_rows)
  diagnostics <- do.call(rbind, diagnostic_rows)
  rownames(anova) <- rownames(contrasts) <- rownames(profiles) <-
    rownames(diagnostics) <- NULL
  anova$FDR_by_effect <- ave(anova$p_value, anova$Effect,
                              FUN = function(p) p.adjust(p, "BH"))
  contrasts$FDR_global_90 <- p.adjust(contrasts$p.value, "BH")
  contrasts$FDR_within_stage_year_10 <- ave(
    contrasts$p.value, interaction(contrasts$Stage, contrasts$Year),
    FUN = function(p) p.adjust(p, "BH"))
  contrasts$FDR_within_module_9 <- ave(
    contrasts$p.value, contrasts$Module,
    FUN = function(p) p.adjust(p, "BH"))
  diagnostics$Shapiro_FDR <- p.adjust(diagnostics$Shapiro_p, "BH")
  if (nrow(anova) != 70L || nrow(contrasts) != 90L ||
      nrow(profiles) != 180L || nrow(diagnostics) != 10L ||
      anyNA(anova$FDR_by_effect) || anyNA(contrasts$FDR_global_90)) {
    stop("Incomplete T-004 result tables.")
  }

  # Explicit stage-level evidence. BH across all 90 contrasts is the primary
  # discovery threshold; unadjusted intervals are descriptive only.
  stage_rows <- list()
  for (m in modules) for (s in stages) {
    z <- contrasts[contrasts$Module == m & contrasts$Stage == s, ]
    z <- z[match(years, as.character(z$Year)), ]
    est <- z$estimate
    hit <- z$FDR_global_90 < 0.05
    same_sign <- all(est > 0) || all(est < 0)
    peak <- which.max(abs(est))
    magnitude_dominant <- hit[peak] &&
      abs(est[peak]) > 2 * max(abs(est[-peak]))
    dominant <- sum(hit) == 1L && magnitude_dominant
    stage_rows[[paste(m, s)]] <- data.frame(
      Module = m, Stage = s,
      Estimate_2012 = est[1], Estimate_2013 = est[2],
      Estimate_2014 = est[3],
      Global_FDR_hits = sum(hit),
      Same_direction_all_years = same_sign,
      Sign_reversal = !same_sign,
      Single_year_dominant = dominant,
      Dominant_year = if (dominant) as.character(z$Year[peak]) else NA_character_,
      Magnitude_dominated_by_one_year = magnitude_dominant,
      Magnitude_dominant_year = if (magnitude_dominant) {
        as.character(z$Year[peak])
      } else NA_character_)
  }
  stage_summary <- do.call(rbind, stage_rows)
  rownames(stage_summary) <- NULL

  class_rows <- list()
  for (m in priority) {
    a <- anova[anova$Module == m, ]
    three <- a$FDR_by_effect[a$Effect == "Cultivar:Stage:Year"]
    cy <- a$FDR_by_effect[a$Effect == "Cultivar:Year"]
    z <- stage_summary[stage_summary$Module == m, ]
    # The hierarchy is prespecified: statistical year interactions or
    # single-year-dominant/sign-reversing detected contrasts => year-dependent.
    # Without those, replicated direction and global-FDR detection in >=2
    # years in at least one stage => reproducible. Otherwise partial/unresolved.
    detected_reversal <- any(z$Sign_reversal & z$Global_FDR_hits > 0L)
    year_dep <- three < 0.05 || cy < 0.05 ||
      any(z$Single_year_dominant) || detected_reversal
    replicated <- any(z$Same_direction_all_years & z$Global_FDR_hits >= 2L)
    category <- if (year_dep) "year-dependent" else if (replicated) {
      "reproducible"
    } else "partially reproducible"
    class_rows[[m]] <- data.frame(
      Module = m, Classification = category,
      Three_way_FDR = three, Cultivar_Year_FDR = cy,
      Stages_with_2plus_year_FDR_hits = paste(z$Stage[
        z$Same_direction_all_years & z$Global_FDR_hits >= 2L],
        collapse = ","),
      Single_year_dominant_stages = paste(z$Stage[z$Single_year_dominant],
                                           collapse = ","),
      Magnitude_dominated_stages = paste(z$Stage[
        z$Magnitude_dominated_by_one_year], collapse = ","),
      Detected_direction_reversal = detected_reversal,
      Note = if (category == "partially reproducible") {
        "Insufficient year-replicated detection; this does not establish robustness"
      } else if (category == "year-dependent") {
        "Year dependence can coexist with a repeated contrast direction"
      } else "At least one stage has repeated detection and consistent direction")
  }
  classification <- do.call(rbind, class_rows)
  rownames(classification) <- NULL

  # Sensitivity for the one T-003 single-sample flag in a priority module.
  # Whole-cell M2/M3 flags are displayed through cell profiles, not deleted.
  leave_sample <- "GSM2627837"
  reduced <- dat[dat$SampleName != leave_sample, ]
  reduced$Eigengene <- reduced$M5
  m5_loo <- lm(Eigengene ~ Cultivar * Stage * Year, data = reduced)
  m5_loo_emm <- emmeans::emmeans(m5_loo, ~ Cultivar | Stage * Year)
  m5_loo_ctr <- as.data.frame(emmeans::contrast(m5_loo_emm, "revpairwise",
                                                 adjust = "none"))
  m5_loo_a <- as.data.frame(car::Anova(m5_loo, type = 3))
  m5_loo_a$Effect <- rownames(m5_loo_a)
  names(m5_loo_a)[grep("^Pr\\(", names(m5_loo_a))] <- "p_value"
  m5_sensitivity <- merge(
    contrasts[contrasts$Module == "M5",
              c("Stage", "Year", "estimate", "p.value")],
    m5_loo_ctr[c("Stage", "Year", "estimate", "p.value")],
    by = c("Stage", "Year"), suffixes = c("_full", "_without_GSM2627837"))
  m5_sensitivity$Removed_sample <- leave_sample
  m5_sensitivity$Three_way_p_full <- anova$p_value[
    anova$Module == "M5" & anova$Effect == "Cultivar:Stage:Year"]
  m5_sensitivity$Three_way_p_without_sample <- m5_loo_a$p_value[
    m5_loo_a$Effect == "Cultivar:Stage:Year"]

  # Three panels per module, shared y-axis. Error bars show mean +/- SE of
  # biological replicates, not uncertainty for the fitted contrast.
  for (m in modules) {
    p <- profiles[profiles$Module == m, ]
    lim <- range(p$Mean - p$SE, p$Mean + p$SE)
    pad <- max(1, diff(lim) * 0.08)
    grDevices::png(file.path(plot_dir, paste0(m, "_stage_by_year.png")),
                   width = 1500, height = 500, res = 130)
    old_par <- par(no.readonly = TRUE)
    par(mfrow = c(1, 3), mar = c(5, 4.5, 3, 1), oma = c(0, 0, 2, 0))
    for (y in years) {
      plot(1:3, rep(NA_real_, 3), xlim = c(0.8, 3.2),
           ylim = lim + c(-pad, pad), xaxt = "n", xlab = "Stage",
           ylab = "Eigengene PC1", main = y)
      axis(1, at = 1:3, labels = stages)
      for (i in seq_along(cultivars)) {
        q <- p[p$Year == y & p$Cultivar == cultivars[i], ]
        q <- q[match(stages, q$Stage), ]
        x <- 1:3 + if (i == 1L) -0.05 else 0.05
        col <- c("#2456A6", "#B03B35")[i]
        lines(x, q$Mean, col = col, lwd = 2)
        points(x, q$Mean, col = col, pch = c(16, 17)[i], cex = 1.2)
        arrows(x, q$Mean - q$SE, x, q$Mean + q$SE,
               angle = 90, code = 3, length = 0.045, col = col)
      }
      if (y == years[1]) legend("topleft", legend = cultivars,
                                col = c("#2456A6", "#B03B35"),
                                lty = 1, pch = c(16, 17), bty = "n", cex = 0.8)
    }
    mtext(paste0(m, " | beta10 | mean +/- SE (n=3 per cell)"),
          outer = TRUE, cex = 1.1)
    par(old_par)
    grDevices::dev.off()
  }

  write_tsv(anova, "full_factorial_typeIII_ANOVA.tsv")
  write_tsv(contrasts, "cabernet_vs_pinot_by_stage_year.tsv")
  write_tsv(profiles, "cell_profiles.tsv")
  write_tsv(diagnostics, "full_model_diagnostics.tsv")
  write_tsv(stage_summary, "stage_year_consistency.tsv")
  write_tsv(classification, "priority_module_classification.tsv")
  write_tsv(m5_sensitivity, "m5_flagged_sample_sensitivity.tsv")
  writeLines(c(
    "T-004 beta10 year robustness",
    paste0("completed=", Sys.time()),
    "input=results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv",
    "samples=54; balanced_cells=18; replicates_per_cell=3",
    "model=Eigengene ~ Cultivar * Stage * Year",
    "ANOVA=Type III with sum-to-zero contrasts; BH separately across ten modules for each effect",
    "contrasts=Cabernet Sauvignon minus Pinot noir within each Stage x Year",
    "contrast_FDR_primary=BH across all 90 module x Stage x Year tests",
    "contrast_FDR_secondary=BH within each Stage x Year (10 tests) and module (9 tests)",
    "classification=year-dependent if three-way or Cultivar:Year BH FDR<0.05, single-year-dominant detected contrast, or detected sign reversal; otherwise reproducible if >=2 global-FDR detections in one stage with same direction in all years; otherwise partially reproducible/unresolved",
    "single_year_dominant=exactly one global-FDR hit and its absolute estimate exceeds twice each other year's estimate",
    "magnitude_dominated_by_one_year=largest absolute estimate has global-FDR<0.05 and exceeds twice both other-year absolute estimates; descriptive flag even when another year is detected",
    "plots=observed cell mean +/- biological-replicate SE; not inferential contrast CI",
    "sensitivity=M5 leave GSM2627837 out only; no sample excluded from primary analysis",
    paste0("R=", R.version.string),
    paste0("car=", as.character(utils::packageVersion("car"))),
    paste0("emmeans=", as.character(utils::packageVersion("emmeans")))
  ), file.path(out, "analysis_summary.txt"))
  cat("T-004 complete: ", nrow(anova), " ANOVA rows; ",
      nrow(contrasts), " contrasts; ", nrow(profiles),
      " cell profiles; ", length(modules), " plots.\n", sep = "")
  print(classification, row.names = FALSE)
}

run_t004()
