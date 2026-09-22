"""Audit and preserve the single-library T-008 Salmon pilot (not biological inference)."""

from __future__ import annotations

import argparse
import csv
import json
import math
import shutil
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")


def tsv_rows(path: Path):
    with path.open(encoding="utf-8", newline="") as handle:
        yield from csv.DictReader(handle, delimiter="\t")


def qc_map(path: Path) -> dict[str, str]:
    return {row["Metric"]: row["Value"] for row in tsv_rows(path)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    args = parser.parse_args()
    scratch = args.scratch.resolve()
    run = "SRR5560506"
    src = scratch / "quant" / run
    if not src.is_dir():
        raise FileNotFoundError(src)

    expected_ids = {r["Transcript"] for r in tsv_rows(ROOT / "data/reference/t008/t2t_v5_1_tx2gene.tsv")}
    if len(expected_ids) != 56910:
        raise ValueError("Unexpected transcript reference count")
    manifest = [r for r in tsv_rows(ROOT / "results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv")
                if r["SRA_Run"] == run]
    if len(manifest) != 1:
        raise ValueError("Pilot run is not unique in the frozen manifest")
    fastq_qc = qc_map(ROOT / f"results/fastq_reprocessing_t008/{run}_fastq_qc.tsv")
    index_qc = qc_map(ROOT / "results/fastq_reprocessing_t008/salmon_index_qc.tsv")
    with (src / "aux_info/meta_info.json").open(encoding="utf-8") as handle:
        meta = json.load(handle)
    if meta["quant_errors"] or meta["salmon_version"] != index_qc["Salmon_version"]:
        raise ValueError("Salmon errors or version mismatch")
    if meta["index_seq_hash"] != index_qc["Index_sequence_hash"]:
        raise ValueError("Pilot used a different index")
    if meta["library_types"] != ["U"] or meta["num_libraries"] != 1:
        raise ValueError("Unexpected library type/count")
    if meta["num_processed"] != int(manifest[0]["Read_Count"]) or meta["num_processed"] != int(fastq_qc["FASTQ_Records"]):
        raise ValueError("Salmon read count differs from ENA or FASTQ QC")
    if meta["num_valid_targets"] != len(expected_ids) or meta["num_decoy_targets"] != int(index_qc["Genome_decoys"]):
        raise ValueError("Unexpected transcript/decoy target count")

    seen: set[str] = set()
    tpm_sum = 0.0
    nonzero_tpm = 0
    num_reads_sum = 0.0
    for row in tsv_rows(src / "quant.sf"):
        name = row["Name"]
        if name in seen or name not in expected_ids:
            raise ValueError(f"Duplicate or unknown quantified transcript: {name}")
        seen.add(name)
        for col in ("Length", "EffectiveLength", "TPM", "NumReads"):
            value = float(row[col])
            if not math.isfinite(value) or value < 0:
                raise ValueError(f"Invalid {col} for {name}: {row[col]}")
        if float(row["Length"]) <= 0 or float(row["EffectiveLength"]) <= 0:
            raise ValueError(f"Nonpositive transcript length for {name}")
        tpm_sum += float(row["TPM"])
        num_reads_sum += float(row["NumReads"])
        nonzero_tpm += float(row["TPM"]) > 0
    if seen != expected_ids or not 999990 <= tpm_sum <= 1000010:
        raise ValueError(f"Incomplete transcript set or TPM sum: {len(seen)}, {tpm_sum}")
    if not 0 <= meta["percent_mapped"] <= 100 or meta["num_mapped"] > meta["num_processed"]:
        raise ValueError("Invalid mapping metrics")

    result_dir = ROOT / "results/fastq_reprocessing_t008"
    dest = result_dir / f"pilot_{run}"
    dest.mkdir(exist_ok=True)
    keep = ["quant.sf", "cmd_info.json", "aux_info/meta_info.json", "aux_info/ambig_info.tsv",
            "aux_info/eq_classes.txt.gz", "logs/salmon_quant.log"]
    for rel in keep:
        source = src / rel
        if not source.is_file() or source.stat().st_size == 0:
            raise ValueError(f"Missing/empty pilot output: {source}")
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)

    metrics = [
        ("GSM", manifest[0]["GSM"]), ("SRA_Run", run),
        ("Salmon_version", meta["salmon_version"]), ("Index_sequence_hash", meta["index_seq_hash"]),
        ("Library_type", meta["library_types"][0]),
        ("Fragment_length_mean_assumed", meta["frag_length_mean"]),
        ("Fragment_length_sd_assumed", meta["frag_length_sd"]),
        ("ENA_FASTQ_records", manifest[0]["Read_Count"]),
        ("Salmon_processed_fragments", meta["num_processed"]),
        ("Salmon_mapped_fragments", meta["num_mapped"]),
        ("Salmon_percent_mapped", meta["percent_mapped"]),
        ("Salmon_decoy_fragments", meta["num_decoy_fragments"]),
        ("Salmon_equivalence_classes", meta["num_eq_classes"]),
        ("Quantified_transcripts", len(seen)), ("Nonzero_TPM_transcripts", nonzero_tpm),
        ("TPM_sum", f"{tpm_sum:.6f}"), ("Estimated_transcript_counts_sum", f"{num_reads_sum:.3f}"),
        ("Quant_errors", len(meta["quant_errors"])), ("Validation", "PASS"),
    ]
    with (result_dir / f"{run}_quant_qc.tsv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
        writer.writerow(["Metric", "Value"])
        writer.writerows(metrics)
    print(f"Pilot PASS: {len(seen)} transcripts, TPM sum {tpm_sum:.3f}, "
          f"{meta['percent_mapped']:.2f}% mapped")


if __name__ == "__main__":
    main()
