#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import math
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from build_provenance_manifest import build_manifest

SITE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = SITE_DIR.parent
OUTPUT_DIR = SITE_DIR / "public" / "data"

PRIMARY_BETA = 10
STAGE_ORDER = {"FruitSet": 0, "Veraison": 1, "Harvest": 2}
CULTIVAR_ORDER = {"Cabernet Sauvignon": 0, "Pinot noir": 1}

SOURCES = {
    "samples": "data/metadata/samples.tsv",
    "modules": "results/beta10/tables/module.tsv",
    "beta_fit": "results/beta10/tables/beta_fit_indices.tsv",
    "anova": "results/module_statistics_beta10/module_factorial_ANOVA_typeIII.tsv",
    "eigengenes": "results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv",
    "cell_profiles": "results/year_robustness_beta10/cell_profiles.tsv",
    "contrasts": "results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv",
    "classification": "results/year_robustness_beta10/priority_module_classification.tsv",
    "enrichments": "results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv",
    "m5_hubs": "results/hub_prioritization_beta10/m5_full_hub_ranking.tsv",
    "m10_m2_hubs": "results/hub_prioritization_beta10/m10_m2_full_hub_ranking.tsv",
    "m5_edges": "results/hub_prioritization_beta10/m5_all_intramodular_edges.tsv",
    "external": "results/external_skin_validation_beta10/primary_external_condition_hubs.tsv",
    "t008_manifest": "results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv",
    "t008_events": "results/fastq_reprocessing_t008/t008_batch_progress.tsv",
}

REQUIRED_COLUMNS = {
    "samples": {"SampleName", "GSM", "Cultivar", "Year", "Stage", "Replicate"},
    "modules": {"genes", "modules"},
    "beta_fit": {"Power", "SFT.R.sq", "mean.k."},
    "anova": {"Effect", "Module", "FDR"},
    "eigengenes": {"SampleName", "Cultivar", "Year", "Stage", "Replicate", "M5"},
    "cell_profiles": {"Module", "Cultivar", "Stage", "Year", "Mean", "SD", "N", "SE"},
    "contrasts": {"Module", "Stage", "Year", "estimate", "FDR_global_90"},
    "classification": {"Module", "Classification", "Note"},
    "enrichments": {"Source", "Module", "TermID", "TermName", "Fold_enrichment", "FDR_global_module_terms"},
    "m5_hubs": {"Gene", "Rank_kWithin", "kWithin", "kME_signed", "Top_decile_kWithin"},
    "m10_m2_hubs": {"Module", "Gene", "Rank_kWithin", "kWithin", "kME_signed", "Top_decile_kWithin"},
    "m5_edges": {"Gene1", "Gene2", "Pearson_r", "Beta10_unsigned_adjacency", "Pair_group"},
    "external": {"Dataset", "Condition", "Platform", "Module", "Gene", "Assayed", "Complete_data", "Mean_CS_minus_PN"},
    "t008_manifest": {"GSM", "Cultivar", "Stage", "Year", "Replicate", "SRA_Run"},
    "t008_events": {"UTC", "SRA_Run", "Stage", "Status", "Detail"},
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


def read_tsv(source_key: str) -> list[dict[str, Any]]:
    relative = SOURCES[source_key]
    path = REPO_ROOT / relative
    if not path.is_file():
        raise FileNotFoundError(f"Missing required source: {relative}")

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if reader.fieldnames is None:
            raise ValueError(f"No header found in {relative}")
        missing = REQUIRED_COLUMNS[source_key] - set(reader.fieldnames)
        if missing:
            raise ValueError(f"{relative} is missing columns: {sorted(missing)}")
        return [
            {key: parse_scalar(value) for key, value in row.items()}
            for row in reader
        ]


def read_metric_tsv(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if reader.fieldnames is None or not {"Metric", "Value"}.issubset(reader.fieldnames):
            raise ValueError(f"Unexpected run-QC schema: {path.relative_to(REPO_ROOT)}")
        return {str(row["Metric"]): parse_scalar(row["Value"]) for row in reader}


def module_sort_key(module: str) -> tuple[int, int | str]:
    if module.startswith("M") and module[1:].isdigit():
        return (0, int(module[1:]))
    return (1, module)


def unique_in_order(values: list[Any]) -> list[Any]:
    seen: set[Any] = set()
    ordered: list[Any] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            ordered.append(value)
    return ordered


def write_json(name: str, payload: Any) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    target = OUTPUT_DIR / name
    temporary = target.with_suffix(target.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2, allow_nan=False)
        handle.write("\n")
    temporary.replace(target)


def build_t008(manifest_rows: list[dict[str, Any]], event_rows: list[dict[str, Any]]) -> dict[str, Any]:
    events_by_run: dict[str, list[dict[str, Any]]] = {}
    for event in event_rows:
        run = str(event.get("SRA_Run"))
        events_by_run.setdefault(run, []).append(event)

    run_qc_dir = REPO_ROOT / "results" / "fastq_reprocessing_t008"
    qc_paths = {path.stem.replace("_run_qc", ""): path for path in run_qc_dir.glob("SRR*_run_qc.tsv")}
    runs: list[dict[str, Any]] = []

    for row in manifest_rows:
        run = str(row["SRA_Run"])
        events = events_by_run.get(run, [])
        latest_by_stage: dict[str, str] = {}
        failed = False
        for event in events:
            stage = str(event["Stage"])
            status = str(event["Status"])
            latest_by_stage[stage] = status
            if status == "FAIL":
                failed = True

        metrics = read_metric_tsv(qc_paths[run]) if run in qc_paths else {}
        validation = metrics.get("Validation")
        if validation == "PASS":
            overall = "PASS"
        elif failed or validation == "FAIL":
            overall = "FAIL"
        elif events:
            overall = "IN_PROGRESS"
        else:
            overall = "PENDING"

        runs.append(
            {
                "gsm": row["GSM"],
                "sra_run": run,
                "cultivar": row["Cultivar"],
                "stage": row["Stage"],
                "year": row["Year"],
                "replicate": row["Replicate"],
                "status": overall,
                "pipeline_stages": latest_by_stage,
                "percent_mapped": metrics.get("Percent_mapped"),
                "processed_fragments": metrics.get("Processed_fragments"),
                "mapped_fragments": metrics.get("Mapped_fragments"),
                "salmon_version": metrics.get("Salmon_version"),
                "validation": validation,
            }
        )

    validated = sum(1 for row in runs if row["status"] == "PASS")
    failed = sum(1 for row in runs if row["status"] == "FAIL")
    latest_event = max((str(row["UTC"]) for row in event_rows if row.get("UTC")), default=None)

    return {
        "summary": {
            "total_runs": len(runs),
            "validated_runs": validated,
            "failed_runs": failed,
            "pending_or_running_runs": len(runs) - validated - failed,
            "complete": len(runs) > 0 and validated == len(runs) and failed == 0,
            "latest_event_utc": latest_event,
        },
        "runs": runs,
        "events": event_rows,
    }


def main() -> None:
    loaded = {key: read_tsv(key) for key in SOURCES}

    samples = loaded["samples"]
    module_rows = loaded["modules"]
    beta_rows = loaded["beta_fit"]
    anova_rows = loaded["anova"]
    eigengene_rows = loaded["eigengenes"]
    profile_rows = loaded["cell_profiles"]
    contrast_rows = loaded["contrasts"]
    classification_rows = loaded["classification"]
    enrichment_rows = loaded["enrichments"]
    m5_hubs = loaded["m5_hubs"]
    m10_m2_hubs = loaded["m10_m2_hubs"]
    m5_edges = loaded["m5_edges"]
    external_rows = loaded["external"]
    t008 = build_t008(loaded["t008_manifest"], loaded["t008_events"])

    beta_row = next((row for row in beta_rows if row["Power"] == PRIMARY_BETA), None)
    if beta_row is None:
        raise ValueError(f"Primary beta {PRIMARY_BETA} is absent from {SOURCES['beta_fit']}")

    cell_counts = Counter((row["Cultivar"], row["Stage"], row["Year"]) for row in samples)
    replicate_counts = sorted(set(cell_counts.values()))

    project_summary = {
        "schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "design": {
            "sample_count": len(samples),
            "cultivars": unique_in_order([row["Cultivar"] for row in samples]),
            "stages": sorted(unique_in_order([row["Stage"] for row in samples]), key=lambda x: STAGE_ORDER.get(str(x), 99)),
            "years": sorted(unique_in_order([row["Year"] for row in samples])),
            "replicates_per_cell_values": replicate_counts,
            "balanced": len(replicate_counts) == 1,
        },
        "network": {
            "primary_beta": PRIMARY_BETA,
            "scale_free_r2": beta_row["SFT.R.sq"],
            "mean_connectivity": beta_row["mean.k."],
        },
        "t008": t008["summary"],
    }

    module_counts = Counter(str(row["modules"]) for row in module_rows)
    interaction_fdr = {
        str(row["Module"]): row["FDR"]
        for row in anova_rows
        if row["Effect"] == "Cultivar:Stage"
    }
    classifications = {str(row["Module"]): row for row in classification_rows}
    modules = []
    for module in sorted(module_counts, key=module_sort_key):
        fdr = interaction_fdr.get(module)
        classification = classifications.get(module)
        modules.append(
            {
                "module": module,
                "gene_count": module_counts[module],
                "cultivar_stage_fdr": fdr,
                "cultivar_stage_significant_fdr05": bool(fdr is not None and float(fdr) < 0.05),
                "robustness_classification": classification.get("Classification") if classification else None,
                "robustness_note": classification.get("Note") if classification else None,
            }
        )

    m5_profiles = sorted(
        [row for row in profile_rows if row["Module"] == "M5"],
        key=lambda row: (int(row["Year"]), STAGE_ORDER.get(str(row["Stage"]), 99), CULTIVAR_ORDER.get(str(row["Cultivar"]), 99)),
    )
    m5_samples = sorted(
        [
            {
                "SampleName": row["SampleName"],
                "Cultivar": row["Cultivar"],
                "Year": row["Year"],
                "Stage": row["Stage"],
                "Replicate": row["Replicate"],
                "M5": row["M5"],
            }
            for row in eigengene_rows
        ],
        key=lambda row: (int(row["Year"]), STAGE_ORDER.get(str(row["Stage"]), 99), CULTIVAR_ORDER.get(str(row["Cultivar"]), 99), int(row["Replicate"])),
    )
    m5_contrasts = sorted(
        [row for row in contrast_rows if row["Module"] == "M5"],
        key=lambda row: (int(row["Year"]), STAGE_ORDER.get(str(row["Stage"]), 99)),
    )
    m5_trajectory = {
        "module": "M5",
        "profiles": m5_profiles,
        "samples": m5_samples,
        "contrasts": m5_contrasts,
    }

    hubs = [{"Module": "M5", **row} for row in m5_hubs] + m10_m2_hubs
    hubs.sort(key=lambda row: (module_sort_key(str(row["Module"])), int(row["Rank_kWithin"])))

    t008_qc_sources = [
        str(path.relative_to(REPO_ROOT)).replace("\\", "/")
        for path in sorted((REPO_ROOT / "results/fastq_reprocessing_t008").glob("SRR*_run_qc.tsv"))
    ]

    artifacts = {
        "project_summary": {
            "sources": [SOURCES["samples"], SOURCES["beta_fit"], SOURCES["t008_manifest"], SOURCES["t008_events"]] + t008_qc_sources,
            "scripts": ["scripts/master/02_prepare_data.R", "scripts/master/03_run_cemitool.R", "scripts/post/26_t008_process_selected_runs.py"],
            "parameters": {"primary_beta": PRIMARY_BETA},
        },
        "modules": {
            "sources": [SOURCES["modules"], SOURCES["anova"], SOURCES["classification"]],
            "scripts": ["scripts/master/03_run_cemitool.R", "scripts/post/07_module_statistics_beta10.R", "scripts/post/09_year_robustness_beta10.R"],
            "parameters": {"primary_beta": PRIMARY_BETA},
        },
        "m5_trajectory": {
            "sources": [SOURCES["eigengenes"], SOURCES["cell_profiles"], SOURCES["contrasts"]],
            "scripts": ["scripts/post/07_module_statistics_beta10.R", "scripts/post/09_year_robustness_beta10.R"],
            "parameters": {"module": "M5"},
        },
        "module_contrasts": {
            "sources": [SOURCES["contrasts"]],
            "scripts": ["scripts/post/09_year_robustness_beta10.R"],
            "parameters": {},
        },
        "enrichments": {
            "sources": [SOURCES["enrichments"]],
            "scripts": ["scripts/post/11_functional_enrichment_beta10.R"],
            "parameters": {"source": "v3_mapman", "scope": "global_FDR05_hits"},
        },
        "hubs": {
            "sources": [SOURCES["m5_hubs"], SOURCES["m10_m2_hubs"]],
            "scripts": ["scripts/post/13_m5_hub_prioritization_beta10.R", "scripts/post/14_m10_m2_hub_prioritization_beta10.R"],
            "parameters": {"hub_metric": "kWithin"},
        },
        "m5_network": {
            "sources": [SOURCES["m5_edges"]],
            "scripts": ["scripts/post/13_m5_hub_prioritization_beta10.R"],
            "parameters": {"module": "M5", "network": "beta10 unsigned adjacency"},
        },
        "external_validation": {
            "sources": [SOURCES["external"]],
            "scripts": ["scripts/post/16_t007_external_skin_validation.R"],
            "parameters": {"scope": "primary_external_condition_hubs"},
        },
        "t008_progress": {
            "sources": [SOURCES["t008_manifest"], SOURCES["t008_events"]] + t008_qc_sources,
            "scripts": ["scripts/post/25_t008_validate_salmon_run.py", "scripts/post/26_t008_process_selected_runs.py"],
            "parameters": {},
        },
    }

    outputs = {
        "project_summary.json": project_summary,
        "modules.json": {"schema_version": 1, "modules": modules},
        "m5_trajectory.json": {"schema_version": 1, **m5_trajectory},
        "module_contrasts.json": {"schema_version": 1, "contrasts": contrast_rows},
        "enrichments.json": {"schema_version": 1, "rows": enrichment_rows},
        "hubs.json": {"schema_version": 1, "rows": hubs},
        "m5_network.json": {"schema_version": 1, "edges": m5_edges},
        "external_validation.json": {"schema_version": 1, "rows": external_rows},
        "t008_progress.json": {"schema_version": 1, **t008},
        "provenance.json": build_manifest(REPO_ROOT, artifacts),
    }

    for name, payload in outputs.items():
        write_json(name, payload)

    print(f"Exported {len(outputs)} site-data files to {OUTPUT_DIR.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
