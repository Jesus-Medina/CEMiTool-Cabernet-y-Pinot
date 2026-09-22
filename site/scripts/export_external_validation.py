#!/usr/bin/env python3
from __future__ import annotations

import csv
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any

EXTERNAL_SOURCE_PATHS = {
    "primary_hubs": "results/external_skin_validation_beta10/primary_external_condition_hubs.tsv",
    "module_summary": "results/external_skin_validation_beta10/module_coverage_direction_summary.tsv",
    "source_qc": "results/external_skin_validation_beta10/external_source_qc.tsv",
    "gse_audit": "results/external_skin_validation_beta10/gse72421_sample_audit.tsv",
    "rna_audit": "results/external_skin_validation_beta10/prjna260535_sample_audit.tsv",
    "analysis_summary": "results/external_skin_validation_beta10/analysis_summary.txt",
}

INTEGER_RE = re.compile(r"^[+-]?\d+$")


def parse_scalar(value: str | None) -> Any:
    if value is None:
        return None
    value = value.strip()
    if value == "" or value.upper() in {"NA", "NAN", "NULL"}:
        return None
    if value.upper() == "TRUE":
        return True
    if value.upper() == "FALSE":
        return False
    if INTEGER_RE.match(value):
        try:
            return int(value)
        except ValueError:
            pass
    try:
        number = float(value)
        if math.isfinite(number):
            return number
    except ValueError:
        pass
    return value


def read_tsv(repo_root: Path, key: str, required: set[str]) -> list[dict[str, Any]]:
    relative = EXTERNAL_SOURCE_PATHS[key]
    path = repo_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing external-validation source: {relative}")

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if reader.fieldnames is None:
            raise ValueError(f"No header found in {relative}")
        missing = required - set(reader.fieldnames)
        if missing:
            raise ValueError(f"{relative} is missing columns: {sorted(missing)}")
        return [{field: parse_scalar(value) for field, value in row.items()} for row in reader]


def descriptive_baseline_mean(row: dict[str, Any]) -> float | None:
    values = [
        row.get("Primary_Harvest_CS_minus_PN_2012"),
        row.get("Primary_Harvest_CS_minus_PN_2013"),
        row.get("Primary_Harvest_CS_minus_PN_2014"),
    ]
    if any(value is None for value in values):
        return None
    return sum(float(value) for value in values) / 3.0


def target_sample_summary(
    rows: list[dict[str, Any]],
    condition_field: str,
    primary_condition: str | int,
) -> tuple[int, dict[str, int]]:
    target = [
        row for row in rows
        if row.get("Cultivar") in {"Cabernet Sauvignon", "Pinot noir"}
        and str(row.get(condition_field)) == str(primary_condition)
    ]
    counts = Counter(str(row["Cultivar"]) for row in target)
    return len(target), dict(sorted(counts.items()))


def single_value(rows: list[dict[str, Any]], field: str) -> Any:
    values = sorted({row.get(field) for row in rows if row.get(field) is not None}, key=str)
    if len(values) != 1:
        raise ValueError(f"Expected one {field} value, got {values}")
    return values[0]


def build_external_validation(repo_root: Path) -> dict[str, Any]:
    primary_required = {
        "Dataset", "Condition", "Platform", "Module", "Gene", "Rank_kWithin",
        "Top_decile_kWithin", "Primary_Harvest_CS_minus_PN_2012",
        "Primary_Harvest_CS_minus_PN_2013", "Primary_Harvest_CS_minus_PN_2014",
        "Primary_Harvest_sign_stable", "Assayed", "Complete_data",
        "CS_observed_replicates", "PN_observed_replicates", "Mean_CS", "Mean_PN",
        "Mean_CS_minus_PN", "Welch_p", "Welch_CI95_lower", "Welch_CI95_upper",
        "Direction_matches_stable_primary", "CS_replicates", "PN_replicates",
        "CS_log2CPM_ge_0_replicates", "PN_log2CPM_ge_0_replicates",
        "BH_priority_361", "BH_prespecified_top37",
    }
    summary_required = {
        "Dataset", "Condition", "Module", "Module_genes", "Assayed_genes",
        "Complete_data_genes", "Stable_primary_assayed_genes",
        "Direction_matched_stable_genes", "Top_hubs", "Assayed_top_hubs",
        "Complete_data_top_hubs", "Direction_matched_stable_top_hubs",
        "Top_hubs_BH37_lt_005", "Top_hubs_BH361_lt_005",
    }
    gse_required = {"SampleName", "Cultivar", "Treatment", "Year", "Tissue", "Stage"}
    rna_required = {"SampleName", "Cultivar", "Brix", "Year", "Tissue"}

    rows = read_tsv(repo_root, "primary_hubs", primary_required)
    for row in rows:
        row["Baseline_Harvest_mean_2012_2014"] = descriptive_baseline_mean(row)

    module_summary = read_tsv(repo_root, "module_summary", summary_required)
    source_qc = read_tsv(repo_root, "source_qc", {"Metric", "Value"})
    gse_audit = read_tsv(repo_root, "gse_audit", gse_required)
    rna_audit = read_tsv(repo_root, "rna_audit", rna_required)

    gse_target_n, gse_by_cultivar = target_sample_summary(gse_audit, "Treatment", "WW")
    rna_target_n, rna_by_cultivar = target_sample_summary(rna_audit, "Brix", 24)

    qc = {str(row["Metric"]): row["Value"] for row in source_qc}
    primary_datasets = {str(row["Dataset"]) for row in rows}
    if primary_datasets != {"GSE72421", "PRJNA260535"}:
        raise ValueError(f"Unexpected primary external datasets: {sorted(primary_datasets)}")

    return {
        "schema_version": 2,
        "rows": rows,
        "module_summary": module_summary,
        "source_qc": source_qc,
        "datasets": {
            "GSE72421": {
                "label": "GSE72421",
                "platform": "microarray",
                "year": int(single_value(gse_audit, "Year")),
                "tissue": str(single_value(gse_audit, "Tissue")),
                "primary_condition": "WW",
                "sensitivity_conditions": ["WD"],
                "audit_rows": len(gse_audit),
                "primary_target_samples": gse_target_n,
                "primary_samples_by_cultivar": gse_by_cultivar,
                "stage_label": str(single_value(gse_audit, "Stage")),
            },
            "PRJNA260535": {
                "label": "PRJNA260535",
                "platform": "RNA-seq log2CPM",
                "year": int(single_value(rna_audit, "Year")),
                "tissue": str(single_value(rna_audit, "Tissue")),
                "primary_condition": "24",
                "sensitivity_conditions": ["20", "22", "26"],
                "audit_rows": len(rna_audit),
                "primary_target_samples": rna_target_n,
                "primary_samples_by_cultivar": rna_by_cultivar,
                "stage_label": "24 °Brix",
            },
        },
        "summary": {
            "primary_hub_rows": len(rows),
            "frozen_priority_genes": qc.get("Frozen_priority_genes"),
            "frozen_top_decile_hubs": qc.get("Frozen_top_decile_hubs"),
            "comparison_rows": qc.get("Comparison_rows"),
        },
    }
