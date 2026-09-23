#!/usr/bin/env python3
from __future__ import annotations

import csv
import math
from collections import defaultdict
from pathlib import Path
from typing import Any

SOURCES = {
    "samples": "data/metadata/samples.tsv",
    "gsea_es": "results/beta10/tables/enrichment_es.tsv",
    "gsea_nes": "results/beta10/tables/enrichment_nes.tsv",
    "gsea_padj": "results/beta10/tables/enrichment_padj.tsv",
    "profiles": "results/year_robustness_beta10/cell_profiles.tsv",
}


def parse_scalar(value: str | None) -> Any:
    if value is None:
        return None
    value = value.strip()
    if value == "" or value.upper() in {"NA", "NAN", "NULL"}:
        return None
    try:
        number = float(value)
        if math.isfinite(number):
            if number.is_integer() and all(token not in value.lower() for token in (".", "e")):
                return int(number)
            return number
    except ValueError:
        pass
    return value


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


def read_gsea_matrix(repo_root: Path, key: str) -> dict[str, Any]:
    fields, rows = read_tsv(repo_root, SOURCES[key])
    first = fields[0]
    classes = fields[1:]
    matrix = []
    for row in rows:
        pathway = row[first]
        matrix.append({
            "pathway": pathway,
            "values": {class_name: row[class_name] for class_name in classes},
        })
    return {"classes": classes, "rows": matrix}


def build_gsea_year_profiles(repo_root: Path) -> dict[str, Any]:
    _, samples = read_tsv(repo_root, SOURCES["samples"])
    es = read_gsea_matrix(repo_root, "gsea_es")
    nes = read_gsea_matrix(repo_root, "gsea_nes")
    padj = read_gsea_matrix(repo_root, "gsea_padj")

    if not (es["classes"] == nes["classes"] == padj["classes"]):
        raise ValueError("GSEA class columns differ between ES/NES/padj tables")

    composition: dict[str, dict[int, int]] = defaultdict(lambda: defaultdict(int))
    for row in samples:
        composition[str(row["Class"])][int(row["Year"])] += 1

    sample_composition = [
        {
            "Class": class_name,
            "years": {str(year): composition[class_name].get(year, 0) for year in (2012, 2013, 2014)},
            "total": sum(composition[class_name].values()),
        }
        for class_name in es["classes"]
    ]

    _, profiles_raw = read_tsv(repo_root, SOURCES["profiles"])
    profiles = [
        {
            "Module": str(row["Module"]),
            "Cultivar": str(row["Cultivar"]),
            "Stage": str(row["Stage"]),
            "Year": int(row["Year"]),
            "Mean": float(row["Mean"]),
            "SD": float(row["SD"]),
            "N": int(row["N"]),
            "SE": float(row["SE"]),
        }
        for row in profiles_raw
    ]

    modules = sorted(
        {row["Module"] for row in profiles},
        key=lambda value: int(value[1:]),
    )
    years = sorted({row["Year"] for row in profiles})

    if years != [2012, 2013, 2014]:
        raise ValueError(f"Unexpected profile years: {years}")
    if modules != [f"M{i}" for i in range(1, 11)]:
        raise ValueError(f"Unexpected modules: {modules}")

    expected_profile_rows = 10 * 2 * 3 * 3
    if len(profiles) != expected_profile_rows:
        raise ValueError(
            f"Expected {expected_profile_rows} module profile cells; found {len(profiles)}"
        )

    for row in sample_composition:
        if row["years"] != {"2012": 3, "2013": 3, "2014": 3}:
            raise ValueError(
                f"GSEA class {row['Class']} does not contain 3 replicates from each year: {row['years']}"
            )

    return {
        "schema_version": 1,
        "gsea": {
            "classes": es["classes"],
            "sample_composition": sample_composition,
            "years_included": [2012, 2013, 2014],
            "years_separated": False,
            "class_definition": "Cultivar × Stage; Year pooled within each class",
            "es": es["rows"],
            "nes": nes["rows"],
            "padj": padj["rows"],
            "missing_expected_module_rows": [
                module for module in modules
                if module not in {row["pathway"] for row in nes["rows"]}
            ],
            "native_figure": "assets/integrated/gsea_cemitool.png",
            "native_pdf": "assets/integrated/gsea_cemitool.pdf",
        },
        "ora_year_scope": {
            "network_input_samples": 54,
            "network_years": [2012, 2013, 2014],
            "year_specific": False,
            "explanation": (
                "ORA is computed from frozen beta10 module membership. Those modules were inferred "
                "from all 54 samples spanning 2012-2014, but the ORA itself has no Year dimension "
                "and was not recalculated separately for each year."
            ),
        },
        "profiles": {
            "years": years,
            "modules": modules,
            "rows": profiles,
            "image_pattern": "assets/integrated/{module}_stage_by_year.png",
            "measure": "module eigengene observed cell mean ± biological-replicate SE",
        },
        "sources": SOURCES,
    }
