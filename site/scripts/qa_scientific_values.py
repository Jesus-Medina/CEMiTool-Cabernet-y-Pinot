#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import math
from pathlib import Path
from typing import Any

SITE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = SITE_DIR.parent
DATA_DIR = SITE_DIR / "public" / "data"


def rows(path: str) -> list[dict[str, str]]:
    with (REPO_ROOT / path).open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter="\t"))


def payload(name: str) -> Any:
    with (DATA_DIR / name).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def numeric(value: str | None) -> float | None:
    if value is None or value.strip() in {"", "NA", "NaN"}:
        return None
    return float(value)


def close(actual: float | None, expected: float | None, label: str, tol: float = 1e-10) -> None:
    if actual is None or expected is None:
        if actual != expected:
            raise AssertionError(f"{label}: {actual!r} != {expected!r}")
        return
    if not math.isclose(float(actual), float(expected), rel_tol=tol, abs_tol=tol):
        raise AssertionError(f"{label}: {actual} != {expected}")


def main() -> None:
    project = payload("project_summary.json")
    modules = payload("modules.json")
    contrasts = payload("module_contrasts.json")
    m5 = payload("m5_trajectory.json")
    hubs = payload("hubs.json")
    external = payload("external_validation.json")
    t008 = payload("t008_progress.json")

    samples = rows("data/metadata/samples.tsv")
    if len(samples) != 54 or project["design"]["sample_count"] != 54:
        raise AssertionError("QA design: baseline must contain exactly 54 samples")
    if sorted(project["design"]["cultivars"]) != ["Cabernet Sauvignon", "Pinot noir"]:
        raise AssertionError("QA design: cultivar labels changed")
    if sorted(project["design"]["years"]) != [2012, 2013, 2014]:
        raise AssertionError("QA design: years changed")
    if set(project["design"]["stages"]) != {"FruitSet", "Veraison", "Harvest"}:
        raise AssertionError("QA design: stages changed")

    beta_rows = rows("results/beta10/tables/beta_fit_indices.tsv")
    beta10 = next(row for row in beta_rows if int(row["Power"]) == 10)
    if project["network"]["primary_beta"] != 10:
        raise AssertionError("QA network: primary beta is not 10")
    close(project["network"]["scale_free_r2"], numeric(beta10["SFT.R.sq"]), "beta10 scale-free R2")

    anova = rows("results/module_statistics_beta10/module_factorial_ANOVA_typeIII.tsv")
    expected_fdr = {
        row["Module"]: float(row["FDR"])
        for row in anova
        if row["Effect"] == "Cultivar:Stage"
    }
    module_rows = {row["module"]: row for row in modules["modules"]}
    if set(module_rows) != {f"M{i}" for i in range(1, 11)}:
        raise AssertionError("QA modules: expected M1-M10 exactly")
    for module, fdr in expected_fdr.items():
        close(module_rows[module]["cultivar_stage_fdr"], fdr, f"{module} Cultivar:Stage FDR")
        expected_sig = fdr < 0.05
        if module_rows[module]["cultivar_stage_significant_fdr05"] != expected_sig:
            raise AssertionError(f"{module}: significant flag disagrees with canonical FDR")

    source_contrasts = rows("results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv")
    source_map = {
        (row["Module"], row["Stage"], int(row["Year"])): row
        for row in source_contrasts
    }
    export_map = {
        (row["Module"], row["Stage"], int(row["Year"])): row
        for row in contrasts["contrasts"]
    }
    if source_map.keys() != export_map.keys() or len(export_map) != 90:
        raise AssertionError("QA contrasts: expected the same 90 Stage x Year rows")
    for key, source in source_map.items():
        exported = export_map[key]
        for field in ("estimate", "SE", "p.value", "CI_low_unadjusted", "CI_high_unadjusted", "FDR_global_90"):
            close(exported[field], numeric(source[field]), f"{key} {field}")

    m5_profiles = [
        row for row in rows("results/year_robustness_beta10/cell_profiles.tsv")
        if row["Module"] == "M5"
    ]
    profile_map = {
        (row["Cultivar"], row["Stage"], int(row["Year"])): row
        for row in m5["profiles"]
    }
    if len(profile_map) != 18 or len(m5_profiles) != 18:
        raise AssertionError("QA M5: expected 18 cultivar-stage-year profiles")
    for source in m5_profiles:
        key = (source["Cultivar"], source["Stage"], int(source["Year"]))
        exported = profile_map[key]
        for field in ("Mean", "SD", "SE"):
            close(exported[field], numeric(source[field]), f"M5 profile {key} {field}")
        if int(exported["N"]) != int(source["N"]):
            raise AssertionError(f"M5 profile {key}: N mismatch")

    harvest_m5 = sorted(
        [row for row in m5["contrasts"] if row["Stage"] == "Harvest"],
        key=lambda row: row["Year"],
    )
    if len(harvest_m5) != 3 or not all(row["estimate"] < 0 for row in harvest_m5):
        raise AssertionError("QA M5: Harvest must retain three negative Cabernet-Pinot yearly contrasts")

    source_hubs = rows("results/hub_prioritization_beta10/m5_full_hub_ranking.tsv")
    exported_hubs = {
        row["Gene"]: row for row in hubs["rows"] if row["Module"] == "M5"
    }
    if len(exported_hubs) != 108 or len(source_hubs) != 108:
        raise AssertionError("QA hubs: M5 hub universe mismatch")
    for source in source_hubs[:11]:
        gene = source["Gene"]
        exported = exported_hubs[gene]
        if int(exported["Rank_kWithin"]) != int(source["Rank_kWithin"]):
            raise AssertionError(f"QA hubs: {gene} rank mismatch")
        close(exported["kWithin"], numeric(source["kWithin"]), f"QA hubs: {gene} kWithin")

    external_source = rows("results/external_skin_validation_beta10/primary_external_condition_hubs.tsv")
    external_map = {
        (row["Dataset"], row["Condition"], row["Gene"]): row
        for row in external["rows"]
    }
    if len(external_map) != len(external_source) != 74:
        raise AssertionError("QA external: expected 74 primary hub-condition rows")
    for source in external_source:
        key = (source["Dataset"], source["Condition"], source["Gene"])
        exported = external_map[key]
        for field in ("Mean_CS_minus_PN", "BH_priority_361", "BH_prespecified_top37"):
            close(exported[field], numeric(source[field]), f"QA external {key} {field}")

    if t008["summary"]["total_runs"] != 54:
        raise AssertionError("QA T-008: selected run universe changed")
    if t008["summary"]["runs_complete"] and t008["summary"]["validated_runs"] != 54:
        raise AssertionError("QA T-008: run gate opened before 54/54")
    if not t008["summary"]["complete"]:
        raise AssertionError("QA T-008: completed canonical outputs did not open the final gate")
    if t008["analysis"]["comparable_beta10_genes"] != 1922:
        raise AssertionError("QA T-008: comparable beta10 gene universe changed")
    priority = {row["module"]: row for row in t008["analysis"]["module_results"]}
    for module in ("M5", "M10", "M2"):
        if priority[module]["preservation_class"] != "moderate":
            raise AssertionError(f"QA T-008: {module} preservation classification changed")

    print(
        "Scientific UI QA PASS: "
        f"54 samples; beta10 R2={project['network']['scale_free_r2']:.12f}; "
        f"10 modules; 90 yearly contrasts; 18 M5 profiles; "
        f"{len(exported_hubs)} M5 hubs; {len(external_map)} external hub rows; "
        f"T-008={t008['summary']['validated_runs']}/54."
    )


if __name__ == "__main__":
    main()
