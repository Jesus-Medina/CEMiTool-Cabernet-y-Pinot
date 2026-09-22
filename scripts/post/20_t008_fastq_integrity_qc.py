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
    with gzip.open(path, "rb") as handle:
        for i in range(1000):
            record = [handle.readline() for _ in range(4)]
            if not all(record) or not record[0].startswith(b"@") or not record[2].startswith(b"+"):
                raise ValueError(f"Malformed FASTQ record among first 1000: {i + 1}")
            if len(record[1].rstrip(b"\r\n")) != len(record[3].rstrip(b"\r\n")):
                raise ValueError("FASTQ sequence/quality length mismatch")
        remaining_lines = 0
        while chunk := handle.read(8 * 1024 * 1024):
            remaining_lines += chunk.count(b"\n")
    lines = 4000 + remaining_lines
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
            {"Metric": "First_1000_records_structure", "Value": "PASS"},
            {"Metric": "GZIP_CRC", "Value": "PASS"},
        ])
    print(f"{args.run}: {lines // 4} FASTQ records, MD5/GZIP/structure PASS")


if __name__ == "__main__":
    main()
