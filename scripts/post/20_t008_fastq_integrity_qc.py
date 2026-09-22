"""Verify a downloaded T-008 FASTQ against ENA and basic record structure."""

from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    parser.add_argument("--run", required=True)
    args = parser.parse_args()
    with (ROOT / "results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv").open(
        encoding="utf-8", newline=""
    ) as handle:
        rows = list(csv.DictReader(handle, delimiter="\t"))
    matches = [row for row in rows if row["SRA_Run"] == args.run]
    if len(matches) != 1:
        raise ValueError("Run absent or duplicated in audited manifest")
    row = matches[0]
    urls, sizes, checksums = row["FASTQ_URLs"].split(";"), row["FASTQ_Bytes"].split(";"), row["FASTQ_MD5"].split(";")
    if len(urls) != 1 or len(sizes) != 1 or len(checksums) != 1 or row["Library_Layout"] != "SINGLE":
        raise ValueError("This QC currently requires one single-end FASTQ")
    path = args.scratch.resolve() / "raw" / args.run / urls[0].rsplit("/", 1)[-1]
    if not path.is_file() or path.stat().st_size != int(sizes[0]):
        raise ValueError("FASTQ missing or compressed size differs from ENA")
    with path.open("rb") as handle:
        actual_md5 = hashlib.file_digest(handle, "md5").hexdigest()
    if actual_md5 != checksums[0]:
        raise ValueError("FASTQ MD5 differs from ENA")
    probe_records = min(10_000, int(row["Read_Count"]))
    q20 = q30 = bases = n_bases = 0
    read_lengths: list[int] = []
    with gzip.open(path, "rb") as handle:
        for i in range(probe_records):
            record = [handle.readline() for _ in range(4)]
            if not all(record) or not record[0].startswith(b"@") or not record[2].startswith(b"+"):
                raise ValueError(f"Malformed FASTQ record among first {probe_records}: {i + 1}")
            sequence = record[1].rstrip(b"\r\n")
            quality = record[3].rstrip(b"\r\n")
            if len(sequence) != len(quality):
                raise ValueError("FASTQ sequence/quality length mismatch")
            if any(base not in b"ACGTNacgtn" for base in sequence):
                raise ValueError("Unexpected non-IUPAC-ACGTN sequence character in quality probe")
            if any(q < 33 or q > 126 for q in quality):
                raise ValueError("Quality probe contains bytes outside printable Phred+33 range")
            read_lengths.append(len(sequence))
            bases += len(sequence)
            n_bases += sum(base in b"Nn" for base in sequence)
            q20 += sum(q >= 53 for q in quality)
            q30 += sum(q >= 63 for q in quality)
        remaining_lines = 0
        while chunk := handle.read(8 * 1024 * 1024):
            remaining_lines += chunk.count(b"\n")
    lines = probe_records * 4 + remaining_lines
    if lines % 4 or lines // 4 != int(row["Read_Count"]):
        raise ValueError(f"FASTQ record count disagrees with ENA: {lines // 4} vs {row['Read_Count']}")
    out = ROOT / "results/fastq_reprocessing_t008" / f"{args.run}_fastq_qc.tsv"
    with out.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["Metric", "Value"], delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows([
            {"Metric": "GSM", "Value": row["GSM"]},
            {"Metric": "SRA_Run", "Value": args.run},
            {"Metric": "Compressed_Bytes", "Value": path.stat().st_size},
            {"Metric": "MD5", "Value": actual_md5},
            {"Metric": "FASTQ_Records", "Value": lines // 4},
            {"Metric": "Expected_ENA_Read_Count", "Value": row["Read_Count"]},
            {"Metric": "First_10000_records_structure", "Value": "PASS"},
            {"Metric": "Quality_probe_records", "Value": probe_records},
            {"Metric": "Quality_probe_scope", "Value": "first_reads_only_not_random"},
            {"Metric": "Quality_probe_read_length_min", "Value": min(read_lengths)},
            {"Metric": "Quality_probe_read_length_max", "Value": max(read_lengths)},
            {"Metric": "Quality_probe_read_length_mean", "Value": f"{sum(read_lengths)/probe_records:.4f}"},
            {"Metric": "Quality_probe_Q20_fraction", "Value": f"{q20/bases:.6f}"},
            {"Metric": "Quality_probe_Q30_fraction", "Value": f"{q30/bases:.6f}"},
            {"Metric": "Quality_probe_N_fraction", "Value": f"{n_bases/bases:.6f}"},
            {"Metric": "GZIP_CRC", "Value": "PASS"},
        ])
    print(f"{args.run}: {lines // 4} FASTQ records, MD5/GZIP/structure PASS")


if __name__ == "__main__":
    main()
