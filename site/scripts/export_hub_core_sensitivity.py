#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

BASE = "results/hub_core_eigengene_sensitivity_beta10"
SOURCES = {
    "summary": f"{BASE}/hub_core_module_summary.tsv",
    "profiles": f"{BASE}/hub_core_cell_profiles.tsv",
    "contrasts": f"{BASE}/hub_core_stage_year_contrasts.tsv",
    "ranking": f"{BASE}/hub_core_gene_ranking.tsv",
}


def parse_scalar(value: str | None) -> Any:
    if value is None:
        return None
    text = value.strip()
    if text == "" or text.upper() in {"NA", "NAN", "NULL"}:
        return None
    if text.upper() == "TRUE":
        return True
    if text.upper() == "FALSE":
        return False
    try:
        number = float(text)
    except ValueError:
        return text
    if number.is_integer() and all(token not in text.lower() for token in (".", "e")):
        return int(number)
    return number


def read_tsv(repo_root: Path, relative: str) -> list[dict[str, Any]]:
    path = repo_root / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing source: {relative}")
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        return [
            {key: parse_scalar(value) for key, value in row.items()}
            for row in reader
        ]


def build_hub_core_sensitivity(repo_root: Path) -> dict[str, Any]:
    summary = read_tsv(repo_root, SOURCES["summary"])
    profiles = read_tsv(repo_root, SOURCES["profiles"])
    contrasts = read_tsv(repo_root, SOURCES["contrasts"])
    ranking = read_tsv(repo_root, SOURCES["ranking"])

    modules = [f"M{i}" for i in range(1, 11)]
    summary_by_module = {str(row["Module"]): row for row in summary}
    if set(summary_by_module) != set(modules):
        raise ValueError("Hub-core summary must contain exactly M1-M10")

    selected = [
        row for row in ranking
        if row["Hub_core_selected"] is True
    ]

    for module in modules:
        expected = int(summary_by_module[module]["Hub_core_genes"])
        observed = sum(1 for row in selected if row["Module"] == module)
        if observed != expected:
            raise ValueError(
                f"{module} selected hub count mismatch: {observed} != {expected}"
            )

    if len(profiles) != 180:
        raise ValueError(f"Expected 180 hub-core profiles; found {len(profiles)}")
    if len(contrasts) != 90:
        raise ValueError(f"Expected 90 hub-core contrasts; found {len(contrasts)}")

    top_hubs = {}
    for module in modules:
        rows = sorted(
            [row for row in selected if row["Module"] == module],
            key=lambda row: int(row["Rank_kWithin"]),
        )
        top_hubs[module] = rows

    return {
        "schema_version": 1,
        "method": {
            "name": "Hub-core PC1",
            "role": "sensitivity_analysis",
            "hub_definition": "top decile by kWithin",
            "kwithin_definition": "sum of off-diagonal frozen beta10 unsigned adjacency within module",
            "hub_threshold": "Rank_kWithin <= ceiling(module_gene_count * 0.1)",
            "pc1_preprocessing": "centered and scaled selected-gene expression",
            "sign_alignment": "positive correlation with canonical all-gene module eigengene",
            "canonical_replaced": False,
            "network_rerun": False,
            "module_membership_changed": False,
        },
        "summary": summary,
        "profiles": profiles,
        "contrasts": contrasts,
        "selected_hubs": top_hubs,
        "sources": SOURCES,
    }
