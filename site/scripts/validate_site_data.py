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

SOURCE_PATHS = {
    "samples": "data/metadata/samples.tsv",
    "modules": "results/beta10/tables/module.tsv",
    "cell_profiles": "results/year_robustness_beta10/cell_profiles.tsv",
    "eigengenes": "results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv",
    "contrasts": "results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv",
    "enrichments": "results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv",
    "v3_mapman_all": "results/functional_enrichment_beta10/v3_mapman_all_terms.tsv",
    "v3_mapman_themes": "results/functional_enrichment_beta10/v3_mapman_prespecified_themes.tsv",
    "v5_mapman_all": "results/functional_enrichment_beta10/v5_mapman_all_terms.tsv",
    "v5_mapman_themes": "results/functional_enrichment_beta10/v5_mapman_prespecified_themes.tsv",
    "enrichment_qc": "results/functional_enrichment_beta10/annotation_and_test_qc.tsv",
    "go_all": "results/go_ora_beta10/go_all_terms.tsv",
    "go_qc": "results/go_ora_beta10/go_annotation_and_test_qc.tsv",
    "m5_hubs": "results/hub_prioritization_beta10/m5_full_hub_ranking.tsv",
    "m10_m2_hubs": "results/hub_prioritization_beta10/m10_m2_full_hub_ranking.tsv",
    "hub_core_summary": "results/hub_core_eigengene_sensitivity_beta10/hub_core_module_summary.tsv",
    "hub_core_profiles": "results/hub_core_eigengene_sensitivity_beta10/hub_core_cell_profiles.tsv",
    "hub_core_contrasts": "results/hub_core_eigengene_sensitivity_beta10/hub_core_stage_year_contrasts.tsv",
    "hub_core_ranking": "results/hub_core_eigengene_sensitivity_beta10/hub_core_gene_ranking.tsv",
    "m5_edges": "results/hub_prioritization_beta10/m5_all_intramodular_edges.tsv",
    "external": "results/external_skin_validation_beta10/primary_external_condition_hubs.tsv",
    "external_module_summary": "results/external_skin_validation_beta10/module_coverage_direction_summary.tsv",
    "external_source_qc": "results/external_skin_validation_beta10/external_source_qc.tsv",
    "external_gse_audit": "results/external_skin_validation_beta10/gse72421_sample_audit.tsv",
    "external_rna_audit": "results/external_skin_validation_beta10/prjna260535_sample_audit.tsv",
    "t008_manifest": "results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv",
}

EXPECTED_JSON = {
    "project_summary.json",
    "modules.json",
    "m5_trajectory.json",
    "module_contrasts.json",
    "enrichments.json",
    "functional_enrichment.json",
    "gsea_year_profiles.json",
    "hub_core_sensitivity.json",
    "year_completeness_audit.json",
    "hubs.json",
    "m5_network.json",
    "external_validation.json",
    "t008_progress.json",
    "provenance.json",
}


def load_json(name: str) -> Any:
    path = DATA_DIR / name
    if not path.is_file():
        raise FileNotFoundError(f"Missing generated site data: {path.relative_to(REPO_ROOT)}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def read_rows(relative: str) -> list[dict[str, str]]:
    path = REPO_ROOT / relative
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter="\t"))


def assert_finite(value: Any, trail: str = "root") -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise ValueError(f"Non-finite number at {trail}")
    if isinstance(value, dict):
        for key, item in value.items():
            assert_finite(item, f"{trail}.{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            assert_finite(item, f"{trail}[{index}]")


def run_qc_pass_count() -> int:
    count = 0
    for path in (REPO_ROOT / "results/fastq_reprocessing_t008").glob("SRR*_run_qc.tsv"):
        rows = read_rows(str(path.relative_to(REPO_ROOT)))
        metrics = {row["Metric"]: row["Value"] for row in rows}
        if metrics.get("Validation") == "PASS":
            count += 1
    return count


def main() -> None:
    generated = {path.name for path in DATA_DIR.glob("*.json")}
    missing = EXPECTED_JSON - generated
    if missing:
        raise ValueError(f"Generated JSON set is incomplete: {sorted(missing)}")

    payloads = {name: load_json(name) for name in EXPECTED_JSON}
    for name, payload in payloads.items():
        assert_finite(payload, name)

    sample_count = len(read_rows(SOURCE_PATHS["samples"]))
    if payloads["project_summary.json"]["design"]["sample_count"] != sample_count:
        raise AssertionError("project_summary sample count does not match samples.tsv")

    module_source_rows = read_rows(SOURCE_PATHS["modules"])
    module_source_count = len(module_source_rows)
    biological_source_count = sum(1 for row in module_source_rows if row["modules"] != "Not.Correlated")
    module_payload = payloads["modules.json"]["modules"]
    module_export_count = sum(row["gene_count"] for row in module_payload)
    if len(module_payload) != 10 or {row["module"] for row in module_payload} != {f"M{i}" for i in range(1, 11)}:
        raise AssertionError("modules.json must expose exactly the ten biological beta10 modules")
    if module_export_count != biological_source_count:
        raise AssertionError("modules.json biological gene counts do not reconstruct module.tsv excluding Not.Correlated")

    m5_profile_source = sum(1 for row in read_rows(SOURCE_PATHS["cell_profiles"]) if row["Module"] == "M5")
    m5_sample_source = len(read_rows(SOURCE_PATHS["eigengenes"]))
    m5_contrast_source = sum(1 for row in read_rows(SOURCE_PATHS["contrasts"]) if row["Module"] == "M5")
    m5 = payloads["m5_trajectory.json"]
    if len(m5["profiles"]) != m5_profile_source or len(m5["samples"]) != m5_sample_source or len(m5["contrasts"]) != m5_contrast_source:
        raise AssertionError("m5_trajectory.json row counts do not match canonical sources")

    checks = [
        ("module_contrasts.json", "contrasts", SOURCE_PATHS["contrasts"]),
        ("enrichments.json", "rows", SOURCE_PATHS["enrichments"]),
        ("m5_network.json", "edges", SOURCE_PATHS["m5_edges"]),
        ("external_validation.json", "rows", SOURCE_PATHS["external"]),
    ]
    for json_name, key, source in checks:
        if len(payloads[json_name][key]) != len(read_rows(source)):
            raise AssertionError(f"{json_name} row count does not match {source}")

    external = payloads["external_validation.json"]
    if external["schema_version"] != 2:
        raise AssertionError("external_validation schema_version must be 2")
    if len(external["module_summary"]) != len(read_rows(SOURCE_PATHS["external_module_summary"])):
        raise AssertionError("external_validation module_summary count does not match canonical source")
    if len(external["source_qc"]) != len(read_rows(SOURCE_PATHS["external_source_qc"])):
        raise AssertionError("external_validation source_qc count does not match canonical source")
    if external["summary"]["primary_hub_rows"] != len(read_rows(SOURCE_PATHS["external"])):
        raise AssertionError("external_validation primary_hub_rows summary mismatch")
    if external["datasets"]["GSE72421"]["audit_rows"] != len(read_rows(SOURCE_PATHS["external_gse_audit"])):
        raise AssertionError("GSE72421 sample-audit count mismatch")
    if external["datasets"]["PRJNA260535"]["audit_rows"] != len(read_rows(SOURCE_PATHS["external_rna_audit"])):
        raise AssertionError("PRJNA260535 sample-audit count mismatch")

    enrichment = payloads["functional_enrichment.json"]
    expected_tested = {
        "v3_mapman": sum(1 for row in read_rows(SOURCE_PATHS["v3_mapman_all"]) if row["Tested"].upper() == "TRUE"),
        "v5_mapman": sum(1 for row in read_rows(SOURCE_PATHS["v5_mapman_all"]) if row["Tested"].upper() == "TRUE"),
        "go": sum(1 for row in read_rows(SOURCE_PATHS["go_all"]) if row["Tested"].upper() == "TRUE"),
    }
    exported_tested = {
        source: sum(1 for row in enrichment["terms"] if row["Source"] == source)
        for source in expected_tested
    }
    if exported_tested != expected_tested:
        raise AssertionError(f"functional_enrichment tested-term counts mismatch: {exported_tested} != {expected_tested}")

    expected_themes = len(read_rows(SOURCE_PATHS["v3_mapman_themes"])) + len(read_rows(SOURCE_PATHS["v5_mapman_themes"]))
    if len(enrichment["themes"]) != expected_themes:
        raise AssertionError("functional_enrichment theme count does not match canonical MapMan theme tables")

    expected_qc = sum(
        1 for row in read_rows(SOURCE_PATHS["enrichment_qc"])
        if row["Source"] in {"v3_mapman", "v5_mapman"}
    ) + len(read_rows(SOURCE_PATHS["go_qc"]))
    if len(enrichment["qc"]) != expected_qc:
        raise AssertionError("functional_enrichment QC count does not match canonical QC tables")

    for source, expected in expected_tested.items():
        if enrichment["summary"]["tested_terms"][source] != expected:
            raise AssertionError(f"functional_enrichment summary count mismatch for {source}")

    integrated = payloads["gsea_year_profiles.json"]
    if integrated["gsea"]["years_included"] != [2012, 2013, 2014]:
        raise AssertionError("GSEA integrated report must document 2012, 2013 and 2014")
    if integrated["gsea"]["years_separated"] is not False:
        raise AssertionError("Native GSEA must remain documented as pooled across Year")
    if any(
        row["years"] != {"2012": 3, "2013": 3, "2014": 3} or row["total"] != 9
        for row in integrated["gsea"]["sample_composition"]
    ):
        raise AssertionError("Each native GSEA class must contain 3 samples from each year")
    if integrated["ora_year_scope"]["year_specific"] is not False:
        raise AssertionError("ORA must not be mislabeled as year-specific")
    profile_rows = integrated["profiles"]["rows"]
    if len(profile_rows) != 180:
        raise AssertionError("Integrated report must expose 180 module×cultivar×stage×year profile cells")
    if integrated["profiles"]["years"] != [2012, 2013, 2014]:
        raise AssertionError("Yearly module profiles must include 2012, 2013 and 2014")
    if integrated["profiles"]["modules"] != [f"M{i}" for i in range(1, 11)]:
        raise AssertionError("Yearly module profiles must include M1-M10")

    hub_core = payloads["hub_core_sensitivity.json"]
    if hub_core["schema_version"] != 1:
        raise AssertionError("hub_core_sensitivity schema_version must be 1")
    if hub_core["method"]["canonical_replaced"] is not False:
        raise AssertionError("Hub-core sensitivity must never replace the canonical eigengene")
    if hub_core["method"]["network_rerun"] is not False:
        raise AssertionError("Hub-core sensitivity must not rerun the beta10 network")
    if len(hub_core["summary"]) != 10:
        raise AssertionError("Hub-core sensitivity must summarize M1-M10")
    if len(hub_core["profiles"]) != 180:
        raise AssertionError("Hub-core sensitivity must contain 180 module×cultivar×stage×year profiles")
    if len(hub_core["contrasts"]) != 90:
        raise AssertionError("Hub-core sensitivity must contain 90 Stage×Year contrasts")
    hub_modules = [row["Module"] for row in hub_core["summary"]]
    if hub_modules != [f"M{i}" for i in range(1, 11)]:
        raise AssertionError("Hub-core summary must be ordered M1-M10")

    source_summary = read_rows(SOURCE_PATHS["hub_core_summary"])
    source_profiles = read_rows(SOURCE_PATHS["hub_core_profiles"])
    source_contrasts = read_rows(SOURCE_PATHS["hub_core_contrasts"])
    source_ranking = read_rows(SOURCE_PATHS["hub_core_ranking"])
    if len(source_summary) != 10 or len(source_profiles) != 180 or len(source_contrasts) != 90:
        raise AssertionError("Hub-core exported row counts do not match canonical sensitivity tables")
    if len(source_ranking) != biological_source_count:
        raise AssertionError("Hub-core ranking must cover every biological beta10 module gene")

    # The hub definition must remain identical to the already audited T-006
    # rankings for M5, M10 and M2.
    selected_new = {
        (row["Module"], row["Gene"])
        for row in source_ranking
        if row["Hub_core_selected"].upper() == "TRUE"
    }
    selected_existing = {
        ("M5", row["Gene"])
        for row in read_rows(SOURCE_PATHS["m5_hubs"])
        if row["Top_decile_kWithin"].upper() == "TRUE"
    }
    selected_existing |= {
        (row["Module"], row["Gene"])
        for row in read_rows(SOURCE_PATHS["m10_m2_hubs"])
        if row["Top_decile_kWithin"].upper() == "TRUE"
    }
    for module in {"M5", "M10", "M2"}:
        if {gene for mod, gene in selected_new if mod == module} != {
            gene for mod, gene in selected_existing if mod == module
        }:
            raise AssertionError(f"Hub-core {module} top-decile genes differ from T-006")

    audit = payloads["year_completeness_audit.json"]
    if audit["status"] not in {"PASS", "ATTENTION"}:
        raise AssertionError(f"Year completeness audit has invalid status: {audit['status']}")
    if audit["hard_errors"]:
        raise AssertionError(
            "Year completeness audit contains hard errors: "
            + " | ".join(audit["hard_errors"])
        )
    if audit["years"] != [2012, 2013, 2014]:
        raise AssertionError("Year completeness audit must cover exactly 2012, 2013 and 2014")
    if audit["design"]["samples"] != 54 or audit["design"]["balanced"] is not True:
        raise AssertionError("Year completeness audit must preserve the balanced 54-sample design")
    if audit["gsea"]["replicates_per_year_per_class"] != 3:
        raise AssertionError("Each GSEA class must retain three samples from each year")
    unexpected_gsea_missing = set(audit["gsea"]["biological_modules_missing"]) - {"M1"}
    if unexpected_gsea_missing:
        raise AssertionError(
            f"Unexpected biological modules missing from native GSEA: {sorted(unexpected_gsea_missing)}"
        )
    if audit["ora"]["v3_modules_present"] != [f"M{i}" for i in range(1, 11)]:
        raise AssertionError("MapMan v3 ORA must cover M1-M10")
    if audit["ora"]["v5_modules_present"] != [f"M{i}" for i in range(1, 11)]:
        raise AssertionError("MapMan v5.1 ORA must cover M1-M10")
    if audit["ora"]["go_modules_present"] != [f"M{i}" for i in range(1, 11)]:
        raise AssertionError("Current GO ORA QC must cover M1-M10")
    if audit["profiles"]["rows"] != 180 or audit["profiles"]["all_modules_complete"] is not True:
        raise AssertionError("Year-explicit profiles must contain all 180 expected cells")
    if audit["contrasts"]["rows"] != 90 or audit["contrasts"]["all_modules_complete"] is not True:
        raise AssertionError("Stage×Year contrast audit must contain all 90 expected contrasts")
    if len(audit["module_audit"]) != 10:
        raise AssertionError("Year completeness audit must contain M1-M10")
    for row in audit["module_audit"]:
        if row["profile_years"] != [2012, 2013, 2014]:
            raise AssertionError(f"{row['module']} profile years are incomplete")
        if row["contrast_years"] != [2012, 2013, 2014]:
            raise AssertionError(f"{row['module']} contrast years are incomplete")

    expected_hubs = len(read_rows(SOURCE_PATHS["m5_hubs"])) + len(read_rows(SOURCE_PATHS["m10_m2_hubs"]))
    if len(payloads["hubs.json"]["rows"]) != expected_hubs:
        raise AssertionError("hubs.json row count does not match hub source tables")

    t008_payload = payloads["t008_progress.json"]
    if t008_payload["schema_version"] != 2:
        raise AssertionError("t008_progress schema_version must be 2")
    t008 = t008_payload["summary"]
    manifest_rows = read_rows(SOURCE_PATHS["t008_manifest"])
    expected_runs = len(manifest_rows)
    if t008["total_runs"] != expected_runs:
        raise AssertionError("T-008 total run count does not match selected manifest")
    if t008["validated_runs"] != run_qc_pass_count():
        raise AssertionError("T-008 validated count does not match run QC files")
    if t008["complete"] and t008["validated_runs"] != t008["total_runs"]:
        raise AssertionError("T-008 cannot be complete before every run validates")
    expected_fastq_bytes = sum(int(row["FASTQ_Total_Bytes"]) for row in manifest_rows)
    expected_reads = sum(int(row["Read_Count"]) for row in manifest_rows)
    if t008["total_fastq_bytes"] != expected_fastq_bytes:
        raise AssertionError("T-008 FASTQ byte total does not match frozen manifest")
    if t008["total_reads"] != expected_reads:
        raise AssertionError("T-008 read total does not match frozen manifest")
    if t008["pending_runs"] + t008["in_progress_runs"] + t008["validated_runs"] + t008["failed_runs"] != t008["total_runs"]:
        raise AssertionError("T-008 run-status counts do not sum to 54")
    if len(t008_payload["runs"]) != expected_runs:
        raise AssertionError("T-008 run table does not contain all selected runs")

    provenance_ids = {row["artifact_id"] for row in payloads["provenance.json"]["artifacts"]}
    required_ids = {
        "project_summary", "modules", "m5_trajectory", "module_contrasts",
        "enrichments", "functional_enrichment", "year_completeness_audit", "hubs", "m5_network", "external_validation", "t008_progress",
    }
    if not required_ids.issubset(provenance_ids):
        raise AssertionError("provenance.json is missing required artifact records")

    print(
        "Validated site data: "
        f"samples={sample_count}; biological_modules=10; "
        f"module_assignments={biological_source_count}/{module_source_count}; "
        f"hubs={expected_hubs}; enrichment_terms={sum(expected_tested.values())}; "
        f"external_hubs={external['summary']['primary_hub_rows']}; "
        f"t008={t008['validated_runs']}/{t008['total_runs']}"
    )


if __name__ == "__main__":
    main()
