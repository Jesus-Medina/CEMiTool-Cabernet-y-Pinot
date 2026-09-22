"""Validate one selected Salmon run and archive exact outputs without touching FASTQ."""

from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import json
import math
import shutil
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")
RESULTS = ROOT / "results/fastq_reprocessing_t008"


def tsv_rows(path: Path):
    with path.open(encoding="utf-8", newline="") as handle:
        yield from csv.DictReader(handle, delimiter="\t")


def qc_map(path: Path) -> dict[str, str]:
    return {row["Metric"]: row["Value"] for row in tsv_rows(path)}


def sha256(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def save_exact(source: Path, destination: Path, compress: bool) -> None:
    if not source.is_file() or source.stat().st_size == 0:
        raise ValueError(f"Missing or empty Salmon output: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(destination.name + ".part")
    if temporary.exists():
        raise ValueError(f"Incomplete previous archive needs inspection: {temporary}")
    if destination.exists():
        if compress:
            with gzip.open(destination, "rb") as handle:
                archived_hash = hashlib.sha256()
                while chunk := handle.read(8 * 1024 * 1024):
                    archived_hash.update(chunk)
            if archived_hash.hexdigest() != sha256(source):
                raise ValueError(f"Archived output differs from source: {destination}")
        elif sha256(destination) != sha256(source):
            raise ValueError(f"Archived output differs from source: {destination}")
        return
    try:
        if compress:
            with source.open("rb") as inp, temporary.open("wb") as out:
                with gzip.GzipFile(fileobj=out, mode="wb", filename="", mtime=0) as zipped:
                    shutil.copyfileobj(inp, zipped, length=8 * 1024 * 1024)
        else:
            shutil.copyfile(source, temporary)
        temporary.replace(destination)
    except Exception:
        # Keep the .part file to diagnose an interrupted copy; never modify source.
        raise
    save_exact(source, destination, compress)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    parser.add_argument("--run", required=True)
    args = parser.parse_args()
    scratch = args.scratch.resolve()
    matching = [row for row in tsv_rows(RESULTS / "selected_54_gsm_to_srr.tsv")
                if row["SRA_Run"] == args.run]
    if len(matching) != 1:
        raise ValueError("Run absent or duplicated in selected manifest")
    sample = matching[0]
    fastq_qc = qc_map(RESULTS / f"{args.run}_fastq_qc.tsv")
    index_qc = qc_map(RESULTS / "salmon_index_qc.tsv")
    source = scratch / "quant" / args.run
    with (source / "aux_info/meta_info.json").open(encoding="utf-8") as handle:
        meta = json.load(handle)
    with (source / "cmd_info.json").open(encoding="utf-8") as handle:
        cmd = json.load(handle)
    if meta["quant_errors"] or meta["salmon_version"] != index_qc["Salmon_version"]:
        raise ValueError("Salmon errors or version mismatch")
    if meta["index_seq_hash"] != index_qc["Index_sequence_hash"]:
        raise ValueError("Run used a different reference index")
    if meta["library_types"] != ["U"] or meta["num_libraries"] != 1:
        raise ValueError("Unexpected library type/count")
    if cmd.get("fldMean") != "250" or cmd.get("fldSD") != "25" or cmd.get("libType") != "U":
        raise ValueError("Quantification parameters differ from pinned primary pilot")
    if "seqBias" not in cmd or "dumpEq" not in cmd:
        raise ValueError("Missing pilot bias/equivalence settings")
    if meta["num_processed"] != int(sample["Read_Count"]) or meta["num_processed"] != int(fastq_qc["FASTQ_Records"]):
        raise ValueError("Read count differs from ENA or full FASTQ QC")
    if meta["num_valid_targets"] != int(index_qc["Transcript_targets"]) or meta["num_decoy_targets"] != int(index_qc["Genome_decoys"]):
        raise ValueError("Unexpected target/decoy count")
    expected = {row["Transcript"] for row in tsv_rows(ROOT / "data/reference/t008/t2t_v5_1_tx2gene.tsv")}
    seen: set[str] = set()
    tpm_sum = 0.0
    estimated_sum = 0.0
    nonzero = 0
    for row in tsv_rows(source / "quant.sf"):
        tx = row["Name"]
        if tx in seen or tx not in expected:
            raise ValueError(f"Duplicate/unknown transcript {tx}")
        seen.add(tx)
        values = {key: float(row[key]) for key in ("Length", "EffectiveLength", "TPM", "NumReads")}
        if any(not math.isfinite(value) or value < 0 for value in values.values()):
            raise ValueError(f"Invalid abundance/length for {tx}")
        if values["Length"] <= 0 or values["EffectiveLength"] <= 0:
            raise ValueError(f"Nonpositive length for {tx}")
        tpm_sum += values["TPM"]
        estimated_sum += values["NumReads"]
        nonzero += values["TPM"] > 0
    if seen != expected or not 999990 <= tpm_sum <= 1000010:
        raise ValueError("Incomplete transcript set or TPM closure failure")
    if abs(estimated_sum - meta["num_mapped"]) > 1:
        raise ValueError("Estimated counts do not sum to Salmon mapped fragments")
    if not 0 <= meta["percent_mapped"] <= 100 or meta["num_mapped"] > meta["num_processed"]:
        raise ValueError("Invalid mapping metrics")

    dest = RESULTS / "samples" / args.run
    for relative, compressed in (("quant.sf", True), ("cmd_info.json", False),
                                  ("aux_info/meta_info.json", False), ("aux_info/ambig_info.tsv", True),
                                  ("aux_info/eq_classes.txt.gz", False),
                                  ("logs/salmon_quant.log", True)):
        target = dest / (relative + ".gz" if compressed else relative)
        save_exact(source / relative, target, compressed)
    rows = [
        ("GSM", sample["GSM"]), ("SRA_Run", args.run),
        ("FASTQ_MD5", fastq_qc["MD5"]), ("Salmon_version", meta["salmon_version"]),
        ("Index_sequence_hash", meta["index_seq_hash"]),
        ("Quant_SF_SHA256", sha256(source / "quant.sf")),
        ("Processed_fragments", meta["num_processed"]),
        ("Mapped_fragments", meta["num_mapped"]),
        ("Percent_mapped", meta["percent_mapped"]),
        ("Decoy_fragments", meta["num_decoy_fragments"]),
        ("Equivalence_classes", meta["num_eq_classes"]),
        ("Transcript_targets", len(seen)), ("Nonzero_TPM_transcripts", nonzero),
        ("TPM_sum", f"{tpm_sum:.6f}"),
        ("Estimated_transcript_counts_sum", f"{estimated_sum:.3f}"),
        ("Fragment_length_mean_effective", meta["frag_length_mean"]),
        ("Fragment_length_sd_effective", meta["frag_length_sd"]),
        ("Quant_errors", len(meta["quant_errors"])), ("Validation", "PASS"),
    ]
    output = RESULTS / f"{args.run}_run_qc.tsv"
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
        writer.writerow(["Metric", "Value"])
        writer.writerows(rows)
    print(f"{args.run}: PASS, {meta['percent_mapped']:.2f}% mapped, {len(seen)} transcripts")


if __name__ == "__main__":
    main()
