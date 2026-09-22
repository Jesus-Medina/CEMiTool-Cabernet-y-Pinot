"""Validate that the local T-008 Salmon index is complete and matches reference QC."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")


def read_qc(path: Path) -> dict[str, str]:
    with path.open(encoding="utf-8", newline="") as handle:
        return {row["Metric"]: row["Value"] for row in csv.DictReader(handle, delimiter="\t")}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    args = parser.parse_args()
    index = args.scratch.resolve() / "reference/salmon_t2t_v5_1_index"
    with (index / "info.json").open(encoding="utf-8") as handle:
        info = json.load(handle)
    with (index / "versionInfo.json").open(encoding="utf-8") as handle:
        version = json.load(handle)
    ref_qc = read_qc(ROOT / "results/fastq_reprocessing_t008/reference_qc.tsv")
    expectations = {
        "first_decoy_index": int(ref_qc["Transcript_FASTA_ids"]),
        "num_decoys": int(ref_qc["Genome_decoy_sequences"]),
        "k": 31,
        "keep_duplicates": True,
    }
    if any(info.get(key) != value for key, value in expectations.items()):
        raise ValueError(f"Salmon index settings differ from reference: {info}")
    if version.get("salmonVersion") != "1.12.1":
        raise ValueError("Salmon index version differs from pinned executable")
    required_files = ["sshash.bin", "ctable.bin", "refseq.bin", "reflengths.bin"]
    if any(not (index / name).is_file() or (index / name).stat().st_size == 0 for name in required_files):
        raise ValueError("Salmon index missing a required nonempty component")
    rows = [
        {"Metric": "Salmon_version", "Value": version["salmonVersion"]},
        {"Metric": "Index_version", "Value": info["index_version"]},
        {"Metric": "Kmer_length", "Value": info["k"]},
        {"Metric": "Transcript_targets", "Value": info["first_decoy_index"]},
        {"Metric": "Genome_decoys", "Value": info["num_decoys"]},
        {"Metric": "Keep_duplicate_transcripts", "Value": str(info["keep_duplicates"]).upper()},
        {"Metric": "Distinct_kmers", "Value": info["num_kmers"]},
        {"Metric": "Index_sequence_hash", "Value": info["SeqHash"]},
        {"Metric": "Reference_gentrome_SHA256", "Value": ref_qc["Gentrome_SHA256"]},
        {"Metric": "Required_components_nonempty", "Value": "PASS"},
    ]
    out = ROOT / "results/fastq_reprocessing_t008/salmon_index_qc.tsv"
    with out.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["Metric", "Value"], delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Salmon index PASS: {info['first_decoy_index']} transcript targets, "
          f"{info['num_decoys']} decoys, {info['num_kmers']} distinct k-mers")


if __name__ == "__main__":
    main()
