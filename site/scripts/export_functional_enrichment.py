#!/usr/bin/env python3
from __future__ import annotations

import csv
import math
import re
from pathlib import Path
from typing import Any

FUNCTIONAL_SOURCE_PATHS = {
    "v3_mapman_all": "results/functional_enrichment_beta10/v3_mapman_all_terms.tsv",
    "v3_mapman_themes": "results/functional_enrichment_beta10/v3_mapman_prespecified_themes.tsv",
    "v5_mapman_all": "results/functional_enrichment_beta10/v5_mapman_all_terms.tsv",
    "v5_mapman_themes": "results/functional_enrichment_beta10/v5_mapman_prespecified_themes.tsv",
    "mapman_qc": "results/functional_enrichment_beta10/annotation_and_test_qc.tsv",
    "go_all": "results/go_ora_beta10/go_all_terms.tsv",
    "go_qc": "results/go_ora_beta10/go_annotation_and_test_qc.tsv",
    "go_summary": "results/go_ora_beta10/analysis_summary.txt",
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
    relative = FUNCTIONAL_SOURCE_PATHS[key]
    path = repo_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing functional-enrichment source: {relative}")

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if reader.fieldnames is None:
            raise ValueError(f"No header found in {relative}")
        missing = required - set(reader.fieldnames)
        if missing:
            raise ValueError(f"{relative} is missing columns: {sorted(missing)}")
        return [{field: parse_scalar(value) for field, value in row.items()} for row in reader]


def read_summary(repo_root: Path) -> dict[str, Any]:
    path = repo_root / FUNCTIONAL_SOURCE_PATHS["go_summary"]
    if not path.is_file():
        raise FileNotFoundError(f"Missing GO summary: {path.relative_to(repo_root)}")
    summary: dict[str, Any] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if "=" not in raw_line:
            continue
        key, value = raw_line.split("=", 1)
        summary[key.strip()] = parse_scalar(value)
    return summary


def compact_term(row: dict[str, Any], source: str) -> dict[str, Any]:
    return {
        "Source": source,
        "Module": row["Module"],
        "Aspect": row.get("Aspect"),
        "TermID": row["TermID"],
        "TermName": row["TermName"],
        "Background_N": row["Background_N"],
        "Module_n": row["Module_n"],
        "Term_background_K": row["Term_background_K"],
        "Overlap_k": row["Overlap_k"],
        "Expected_overlap": row.get("Expected_overlap"),
        "Fold_enrichment": row["Fold_enrichment"],
        "p_value": row["p_value"],
        "FDR_within_module": row.get("FDR_within_module"),
        "FDR_global_module_terms": row["FDR_global_module_terms"],
    }


def build_functional_enrichment(repo_root: Path) -> dict[str, Any]:
    term_required = {
        "Module", "TermID", "TermName", "Background_N", "Module_n",
        "Term_background_K", "Overlap_k", "Fold_enrichment", "Tested",
        "p_value", "FDR_global_module_terms",
    }
    theme_required = {
        "Source", "Theme", "Module", "Matched_MapMan_terms", "Background_N",
        "Module_n", "Theme_background_K", "Overlap_k", "Fold_enrichment",
        "Tested", "Reason_if_not_tested", "p_value", "FDR_global_themes",
        "Coverage_warning",
    }
    mapman_qc_required = {
        "Source", "Module", "Assigned_module_genes", "Annotated_module_genes",
        "Coverage_percent", "Background_annotated_genes", "Terms_tested",
        "Global_FDR_hits", "Coverage_warning",
    }
    go_qc_required = {
        "Module", "Assigned_genes", "GO_annotated_genes", "Coverage_percent",
        "Background_N", "Terms_tested", "Global_FDR_hits", "Coverage_warning",
    }

    v3_terms_raw = read_tsv(repo_root, "v3_mapman_all", term_required | {"Source"})
    v5_terms_raw = read_tsv(repo_root, "v5_mapman_all", term_required | {"Source"})
    go_terms_raw = read_tsv(repo_root, "go_all", term_required | {"Aspect"})
    v3_themes = read_tsv(repo_root, "v3_mapman_themes", theme_required)
    v5_themes = read_tsv(repo_root, "v5_mapman_themes", theme_required)
    mapman_qc = read_tsv(repo_root, "mapman_qc", mapman_qc_required)
    go_qc = read_tsv(repo_root, "go_qc", go_qc_required)

    terms: list[dict[str, Any]] = []
    for source, rows in (
        ("v3_mapman", v3_terms_raw),
        ("v5_mapman", v5_terms_raw),
        ("go", go_terms_raw),
    ):
        terms.extend(compact_term(row, source) for row in rows if row["Tested"] is True)

    themes = v3_themes + v5_themes

    qc: list[dict[str, Any]] = []
    for row in mapman_qc:
        if row["Source"] not in {"v3_mapman", "v5_mapman"}:
            continue
        qc.append({
            "Source": row["Source"],
            "Module": row["Module"],
            "Assigned_module_genes": row["Assigned_module_genes"],
            "Annotated_module_genes": row["Annotated_module_genes"],
            "Coverage_percent": row["Coverage_percent"],
            "Background_annotated_genes": row["Background_annotated_genes"],
            "Terms_tested": row["Terms_tested"],
            "Global_FDR_hits": row["Global_FDR_hits"],
            "Coverage_warning": row["Coverage_warning"],
        })
    for row in go_qc:
        qc.append({
            "Source": "go",
            "Module": row["Module"],
            "Assigned_module_genes": row["Assigned_genes"],
            "Annotated_module_genes": row["GO_annotated_genes"],
            "Coverage_percent": row["Coverage_percent"],
            "Background_annotated_genes": row["Background_N"],
            "Terms_tested": row["Terms_tested"],
            "Global_FDR_hits": row["Global_FDR_hits"],
            "Coverage_warning": row["Coverage_warning"],
        })

    tested_counts = {
        source: sum(1 for row in terms if row["Source"] == source)
        for source in ("v3_mapman", "v5_mapman", "go")
    }
    hit_counts = {
        source: sum(
            1 for row in terms
            if row["Source"] == source
            and row["FDR_global_module_terms"] is not None
            and float(row["FDR_global_module_terms"]) < 0.05
        )
        for source in ("v3_mapman", "v5_mapman", "go")
    }

    return {
        "schema_version": 1,
        "sources": [
            {
                "id": "v3_mapman",
                "label": "MapMan v3",
                "role": "primary",
                "current": True,
                "notes": "Anotación primaria del ORA funcional.",
            },
            {
                "id": "v5_mapman",
                "label": "MapMan v5.1",
                "role": "secondary",
                "current": True,
                "notes": "Anotación secundaria con cobertura menor en varios módulos.",
            },
            {
                "id": "go",
                "label": "Gene Ontology auditado",
                "role": "secondary",
                "current": True,
                "notes": "GO corregido por T-005A con términos obsoletos filtrados usando la ontología oficial.",
            },
        ],
        "summary": {
            "tested_terms": tested_counts,
            "global_fdr05_hits": hit_counts,
            "go_audit": read_summary(repo_root),
            "go_superseded_historical_table": "results/functional_enrichment_beta10/v5_go_all_terms.tsv",
            "go_current_table": FUNCTIONAL_SOURCE_PATHS["go_all"],
        },
        "terms": terms,
        "themes": themes,
        "qc": qc,
    }
