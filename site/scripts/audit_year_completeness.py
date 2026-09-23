#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

YEARS = (2012, 2013, 2014)
MODULES = tuple(f"M{i}" for i in range(1, 11))
CULTIVARS = ("Cabernet Sauvignon", "Pinot noir")
STAGES = ("FruitSet", "Veraison", "Harvest")

SOURCES = {
    "samples": "data/metadata/samples.tsv",
    "phenotypes": "data/metadata/phenotypes.tsv",
    "modules": "results/beta10/tables/module.tsv",
    "gsea_es": "results/beta10/tables/enrichment_es.tsv",
    "gsea_nes": "results/beta10/tables/enrichment_nes.tsv",
    "gsea_padj": "results/beta10/tables/enrichment_padj.tsv",
    "ora_qc": "results/functional_enrichment_beta10/annotation_and_test_qc.tsv",
    "go_qc": "results/go_ora_beta10/go_annotation_and_test_qc.tsv",
    "profiles": "results/year_robustness_beta10/cell_profiles.tsv",
    "contrasts": "results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv",
}


def parse_scalar(value: str | None) -> Any:
    if value is None:
        return None
    text = value.strip()
    if text == "" or text.upper() in {"NA", "NAN", "NULL"}:
        return None
    try:
        number = float(text)
    except ValueError:
        return text
    if number.is_integer() and all(token not in text.lower() for token in (".", "e")):
        return int(number)
    return number


def read_tsv(repo_root: Path, relative: str) -> tuple[list[str], list[dict[str, Any]]]:
    path = repo_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing source: {relative}")
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if reader.fieldnames is None:
            raise ValueError(f"No header in {relative}")
        rows = [
            {key: parse_scalar(value) for key, value in row.items()}
            for row in reader
        ]
        return list(reader.fieldnames), rows


def module_sort_key(value: str) -> tuple[int, int | str]:
    if value.startswith("M") and value[1:].isdigit():
        return (0, int(value[1:]))
    return (1, value)


def build_year_completeness_audit(repo_root: Path) -> dict[str, Any]:
    _, samples = read_tsv(repo_root, SOURCES["samples"])
    _, phenotypes = read_tsv(repo_root, SOURCES["phenotypes"])
    _, module_rows = read_tsv(repo_root, SOURCES["modules"])
    es_fields, es_rows = read_tsv(repo_root, SOURCES["gsea_es"])
    nes_fields, nes_rows = read_tsv(repo_root, SOURCES["gsea_nes"])
    padj_fields, padj_rows = read_tsv(repo_root, SOURCES["gsea_padj"])
    _, ora_qc = read_tsv(repo_root, SOURCES["ora_qc"])
    _, go_qc = read_tsv(repo_root, SOURCES["go_qc"])
    _, profiles = read_tsv(repo_root, SOURCES["profiles"])
    _, contrasts = read_tsv(repo_root, SOURCES["contrasts"])

    hard_errors: list[str] = []
    attention: list[str] = []

    # 1) Canonical 54-sample design.
    sample_names = [str(row["SampleName"]) for row in samples]
    if len(samples) != 54:
        hard_errors.append(f"Expected 54 samples; found {len(samples)}")
    if len(set(sample_names)) != len(sample_names):
        hard_errors.append("Duplicate SampleName values detected")

    design_counts = Counter(
        (str(row["Cultivar"]), str(row["Stage"]), int(row["Year"]))
        for row in samples
    )
    expected_design_keys = {
        (cultivar, stage, year)
        for cultivar in CULTIVARS
        for stage in STAGES
        for year in YEARS
    }
    if set(design_counts) != expected_design_keys:
        hard_errors.append("Cultivar × Stage × Year design cells are incomplete or unexpected")
    for key in sorted(expected_design_keys):
        if design_counts.get(key) != 3:
            hard_errors.append(f"Design cell {key} has n={design_counts.get(key, 0)}; expected 3")

    phenotype_map = {str(row["SampleName"]): str(row["Class"]) for row in phenotypes}
    if len(phenotypes) != 54 or set(phenotype_map) != set(sample_names):
        hard_errors.append("phenotypes.tsv does not contain the same 54 sample names as samples.tsv")
    for row in samples:
        sample = str(row["SampleName"])
        if phenotype_map.get(sample) != str(row["Class"]):
            hard_errors.append(f"Class mismatch between samples.tsv and phenotypes.tsv for {sample}")

    class_year_counts: dict[str, Counter[int]] = defaultdict(Counter)
    for row in samples:
        class_year_counts[str(row["Class"])][int(row["Year"])] += 1

    expected_classes = tuple(
        f"{'CS' if cultivar == 'Cabernet Sauvignon' else 'PN'}_{stage}"
        for cultivar in CULTIVARS
        for stage in STAGES
    )
    if set(class_year_counts) != set(expected_classes):
        hard_errors.append(
            f"Unexpected GSEA classes in sample metadata: {sorted(class_year_counts)}"
        )
    for class_name in expected_classes:
        counts = class_year_counts[class_name]
        if {year: counts.get(year, 0) for year in YEARS} != {year: 3 for year in YEARS}:
            hard_errors.append(
                f"GSEA class {class_name} is not balanced 3+3+3 across 2012-2014"
            )

    # 2) Frozen beta10 module membership is global, not year-specific.
    module_key = "modules" if module_rows and "modules" in module_rows[0] else "Module"
    module_counts = Counter(str(row[module_key]) for row in module_rows)
    missing_membership = [module for module in MODULES if module not in module_counts]
    if missing_membership:
        hard_errors.append(f"Frozen beta10 membership is missing modules: {missing_membership}")

    # 3) Native CEMiTool GSEA export.
    if not (es_fields == nes_fields == padj_fields):
        hard_errors.append("GSEA ES/NES/padj matrices do not share identical columns")
    gsea_classes = tuple(es_fields[1:])
    if set(gsea_classes) != set(expected_classes):
        hard_errors.append(
            f"GSEA result columns differ from the six canonical classes: {gsea_classes}"
        )

    def gsea_row_names(rows: list[dict[str, Any]], fields: list[str]) -> set[str]:
        first = fields[0]
        return {str(row[first]) for row in rows}

    gsea_es_rows = gsea_row_names(es_rows, es_fields)
    gsea_nes_rows = gsea_row_names(nes_rows, nes_fields)
    gsea_padj_rows = gsea_row_names(padj_rows, padj_fields)
    if not (gsea_es_rows == gsea_nes_rows == gsea_padj_rows):
        hard_errors.append("GSEA ES/NES/padj matrices do not contain the same pathway rows")

    gsea_rows = gsea_nes_rows
    gsea_missing = [module for module in MODULES if module not in gsea_rows]
    gsea_extra = sorted(gsea_rows - set(MODULES))
    unexpected_missing = sorted(set(gsea_missing) - {"M1"})
    unexpected_extra = sorted(set(gsea_extra) - {"Not.Correlated"})
    if unexpected_missing:
        hard_errors.append(
            f"Native GSEA is missing unexpected biological modules: {unexpected_missing}"
        )
    if unexpected_extra:
        hard_errors.append(f"Native GSEA has unexpected extra rows: {unexpected_extra}")
    if "M1" in gsea_missing:
        attention.append(
            "Native CEMiTool GSEA ES/NES/padj exports omit M1. "
            "No replacement value is imputed; cause is unresolved from canonical outputs."
        )

    # 4) ORA module coverage. Year is intentionally absent from ORA itself.
    ora_sources = ("v3_mapman", "v5_mapman")
    ora_by_source = {
        source: {str(row["Module"]) for row in ora_qc if str(row["Source"]) == source}
        for source in ora_sources
    }
    for source, present in ora_by_source.items():
        missing = sorted(set(MODULES) - present, key=module_sort_key)
        if missing:
            hard_errors.append(f"{source} ORA QC is missing modules: {missing}")

    go_present = {str(row["Module"]) for row in go_qc}
    go_missing = sorted(set(MODULES) - go_present, key=module_sort_key)
    if go_missing:
        hard_errors.append(f"Current GO ORA QC is missing modules: {go_missing}")

    go_untestable = sorted(
        [
            str(row["Module"])
            for row in go_qc
            if int(row["Terms_tested"] or 0) == 0
        ],
        key=module_sort_key,
    )

    # 5) Year-explicit module profiles.
    profile_keys = Counter(
        (
            str(row["Module"]),
            str(row["Cultivar"]),
            str(row["Stage"]),
            int(row["Year"]),
        )
        for row in profiles
    )
    expected_profile_keys = {
        (module, cultivar, stage, year)
        for module in MODULES
        for cultivar in CULTIVARS
        for stage in STAGES
        for year in YEARS
    }
    if len(profiles) != 180:
        hard_errors.append(f"Expected 180 profile rows; found {len(profiles)}")
    if set(profile_keys) != expected_profile_keys:
        hard_errors.append("Module profiles do not contain every M1-M10 × cultivar × stage × year cell")
    for key in sorted(expected_profile_keys):
        if profile_keys.get(key) != 1:
            hard_errors.append(f"Profile cell {key} appears {profile_keys.get(key, 0)} times")
    for row in profiles:
        if int(row["N"]) != 3:
            hard_errors.append(
                f"Profile {row['Module']} {row['Cultivar']} {row['Stage']} {row['Year']} "
                f"has N={row['N']}; expected 3"
            )

    # 6) Year-explicit CS-PN contrasts.
    contrast_keys = Counter(
        (str(row["Module"]), str(row["Stage"]), int(row["Year"]))
        for row in contrasts
    )
    expected_contrast_keys = {
        (module, stage, year)
        for module in MODULES
        for stage in STAGES
        for year in YEARS
    }
    if len(contrasts) != 90:
        hard_errors.append(f"Expected 90 Stage × Year contrasts; found {len(contrasts)}")
    if set(contrast_keys) != expected_contrast_keys:
        hard_errors.append("Contrast table does not contain every M1-M10 × stage × year cell")

    rows: list[dict[str, Any]] = []
    for module in MODULES:
        profile_years = sorted(
            {
                int(row["Year"])
                for row in profiles
                if str(row["Module"]) == module
            }
        )
        contrast_years = sorted(
            {
                int(row["Year"])
                for row in contrasts
                if str(row["Module"]) == module
            }
        )
        rows.append(
            {
                "module": module,
                "gene_count": int(module_counts.get(module, 0)),
                "gsea_native_row_present": module in gsea_rows,
                "gsea_input_years": list(YEARS),
                "gsea_year_balance_verified": all(
                    class_year_counts[class_name].get(year, 0) == 3
                    for class_name in expected_classes
                    for year in YEARS
                ),
                "gsea_year_specific": False,
                "ora_v3_module_present": module in ora_by_source["v3_mapman"],
                "ora_v5_module_present": module in ora_by_source["v5_mapman"],
                "ora_go_module_present": module in go_present,
                "ora_go_terms_tested": next(
                    (
                        int(row["Terms_tested"] or 0)
                        for row in go_qc
                        if str(row["Module"]) == module
                    ),
                    0,
                ),
                "ora_network_input_years": list(YEARS),
                "ora_year_specific": False,
                "profile_years": profile_years,
                "profile_cells": sum(
                    1 for row in profiles if str(row["Module"]) == module
                ),
                "profile_all_three_years": profile_years == list(YEARS),
                "contrast_years": contrast_years,
                "contrast_cells": sum(
                    1 for row in contrasts if str(row["Module"]) == module
                ),
                "contrast_all_three_years": contrast_years == list(YEARS),
                "coverage_status": (
                    "ATTENTION_GSEA_M1_NATIVE_ROW_MISSING"
                    if module == "M1" and module not in gsea_rows
                    else "COMPLETE_ANALYSIS_SCOPE"
                ),
            }
        )

    status = "FAIL" if hard_errors else ("ATTENTION" if attention else "PASS")
    return {
        "schema_version": 1,
        "status": status,
        "purpose": (
            "Audit analysis scope and year completeness without modifying, rerunning, "
            "or imputing scientific results."
        ),
        "years": list(YEARS),
        "design": {
            "samples": len(samples),
            "balanced": not any(
                design_counts.get(key) != 3 for key in expected_design_keys
            ),
            "replicates_per_cultivar_stage_year": 3,
            "classes": list(expected_classes),
            "class_year_counts": {
                class_name: {
                    str(year): class_year_counts[class_name].get(year, 0)
                    for year in YEARS
                }
                for class_name in expected_classes
            },
        },
        "gsea": {
            "status": "ATTENTION" if gsea_missing else "PASS",
            "uses_all_54_samples": len(samples) == 54 and len(phenotypes) == 54,
            "classes": list(gsea_classes),
            "years_in_each_class": list(YEARS),
            "replicates_per_year_per_class": 3,
            "year_specific": False,
            "biological_modules_present": sorted(
                set(MODULES) & gsea_rows, key=module_sort_key
            ),
            "biological_modules_missing": gsea_missing,
            "extra_rows": gsea_extra,
            "interpretation": (
                "All six GSEA classes pool balanced samples from 2012, 2013 and 2014. "
                "The native result is not a year-specific GSEA. M1 is absent from the "
                "canonical ES/NES/padj exports and is not imputed."
            ),
        },
        "ora": {
            "status": "PASS",
            "network_input_samples": len(samples),
            "network_input_years": list(YEARS),
            "year_specific": False,
            "v3_modules_present": sorted(ora_by_source["v3_mapman"], key=module_sort_key),
            "v5_modules_present": sorted(ora_by_source["v5_mapman"], key=module_sort_key),
            "go_modules_present": sorted(go_present, key=module_sort_key),
            "go_modules_with_zero_testable_terms": go_untestable,
            "interpretation": (
                "ORA covers module membership for M1-M10. The modules were inferred from "
                "the 54-sample three-year network, but ORA itself has no Year dimension."
            ),
        },
        "profiles": {
            "status": "PASS",
            "rows": len(profiles),
            "expected_rows": 180,
            "years": list(YEARS),
            "all_modules_complete": set(profile_keys) == expected_profile_keys,
            "n_per_cell": 3,
        },
        "contrasts": {
            "status": "PASS",
            "rows": len(contrasts),
            "expected_rows": 90,
            "years": list(YEARS),
            "all_modules_complete": set(contrast_keys) == expected_contrast_keys,
        },
        "module_audit": rows,
        "attention": attention,
        "hard_errors": hard_errors,
        "sources": SOURCES,
        "non_destructive_guarantee": {
            "rerun_cemitool": False,
            "recalculate_ora": False,
            "change_module_membership": False,
            "impute_gsea_m1": False,
            "modify_existing_scientific_tables": False,
        },
    }


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    audit = build_year_completeness_audit(repo_root)
    print(json.dumps(audit, indent=2, ensure_ascii=False))
    if audit["hard_errors"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
