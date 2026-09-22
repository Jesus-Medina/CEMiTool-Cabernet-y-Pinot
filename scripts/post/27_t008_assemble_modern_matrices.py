"""Assemble 54 pinned Salmon outputs into gene matrices with audited size factors.

Run only after 54/54 per-run QC PASS. Historical RPKM/beta networks are read-only.
"""

from __future__ import annotations

import csv
import gzip
import hashlib
import io
import math
from pathlib import Path

import numpy as np


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")
RESULTS = ROOT / "results/fastq_reprocessing_t008"


def rows(path: Path):
    with path.open(encoding="utf-8", newline="") as handle:
        yield from csv.DictReader(handle, delimiter="\t")


def qc_map(path: Path) -> dict[str, str]:
    return {r["Metric"]: r["Value"] for r in rows(path)}


def write_matrix(path: Path, genes: list[str], samples: list[str], values: np.ndarray) -> None:
    if path.exists() or path.with_name(path.name + ".part").exists():
        raise FileExistsError(f"Refusing to overwrite modern matrix or partial file: {path}")
    temporary = path.with_name(path.name + ".part")
    with temporary.open("wb") as binary:
        with gzip.GzipFile(fileobj=binary, mode="wb", filename="", mtime=0) as zipped:
            with io.TextIOWrapper(zipped, encoding="utf-8", newline="") as handle:
                writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
                writer.writerow(["Gene", *samples])
                for gene, vector in zip(genes, values, strict=True):
                    writer.writerow([gene, *(f"{float(x):.6f}" for x in vector)])
    temporary.replace(path)


def write_tsv(path: Path, table: list[dict[str, object]], fields: list[str]) -> None:
    if path.exists():
        raise FileExistsError(f"Refusing to overwrite QC table: {path}")
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(table)


def main() -> None:
    samples_path = ROOT / "data/metadata/samples.tsv"
    frozen = qc_map(RESULTS / "run_manifest_qc.tsv")["Frozen_samples_TSV_SHA256"]
    with samples_path.open("rb") as handle:
        if hashlib.file_digest(handle, "sha256").hexdigest() != frozen:
            raise ValueError("Frozen 54-sample metadata changed")
    samples = list(rows(samples_path))
    if len(samples) != 54 or len({r["GSM"] for r in samples}) != 54:
        raise ValueError("Expected exactly 54 unique samples")
    manifest = {r["GSM"]: r for r in rows(RESULTS / "selected_54_gsm_to_srr.tsv")}
    if set(manifest) != {r["GSM"] for r in samples}:
        raise ValueError("Sample manifest differs from frozen metadata")
    tx_to_gene = {r["Transcript"]: r["Gene"] for r in rows(ROOT / "data/reference/t008/t2t_v5_1_tx2gene.tsv")}
    if len(tx_to_gene) != 56910:
        raise ValueError("Unexpected transcript reference")
    genes = sorted(set(tx_to_gene.values()))
    if len(genes) != 47971:
        raise ValueError("Unexpected gene reference")
    gene_index = {gene: i for i, gene in enumerate(genes)}
    counts = np.zeros((len(genes), 54), dtype=np.float64)
    tpm = np.zeros_like(counts)
    sample_qc: list[dict[str, object]] = []
    for j, sample in enumerate(samples):
        gsm = sample["GSM"]
        run = manifest[gsm]["SRA_Run"]
        qc = qc_map(RESULTS / f"{run}_run_qc.tsv")
        if qc["Validation"] != "PASS" or qc["GSM"] != gsm or qc["SRA_Run"] != run:
            raise ValueError(f"Run QC identity/status failure: {run}")
        path = RESULTS / "samples" / run / "quant.sf.gz"
        if not path.is_file():
            raise FileNotFoundError(path)
        seen: set[str] = set()
        sha = hashlib.sha256()
        with gzip.open(path, "rb") as binary:
            # Re-hash exact decompressed bytes while parsing, checking the archive.
            data = binary.read()
        sha.update(data)
        if sha.hexdigest() != qc["Quant_SF_SHA256"]:
            raise ValueError(f"Archived quant.sf differs from QC SHA-256: {run}")
        text = data.decode("utf-8").splitlines()
        for row in csv.DictReader(text, delimiter="\t"):
            tx = row["Name"]
            if tx in seen or tx not in tx_to_gene:
                raise ValueError(f"Duplicate/unknown transcript in {run}: {tx}")
            seen.add(tx)
            i = gene_index[tx_to_gene[tx]]
            count, abundance = float(row["NumReads"]), float(row["TPM"])
            if not all(math.isfinite(v) and v >= 0 for v in (count, abundance)):
                raise ValueError(f"Invalid expression in {run}: {tx}")
            counts[i, j] += count
            tpm[i, j] += abundance
        if seen != set(tx_to_gene):
            raise ValueError(f"Missing transcript in {run}")
        if abs(counts[:, j].sum() - float(qc["Mapped_fragments"])) > 1:
            raise ValueError(f"Gene count sum differs from mapped fragments: {run}")
        if abs(tpm[:, j].sum() - 1_000_000) > 10:
            raise ValueError(f"Gene TPM closure failure: {run}")
        sample_qc.append({
            "GSM": gsm, "SRA_Run": run, "Cultivar": sample["Cultivar"],
            "Stage": sample["Stage"], "Year": sample["Year"],
            "Processed_fragments": qc["Processed_fragments"],
            "Mapped_fragments": qc["Mapped_fragments"],
            "Percent_mapped": qc["Percent_mapped"],
            "Decoy_fragments": qc["Decoy_fragments"],
            "Nonzero_gene_counts": int(np.count_nonzero(counts[:, j])),
        })
        print(f"{j + 1}/54 {gsm} {run} verified", flush=True)

    # DESeq-style median-of-ratios depth factors. Positive-in-all genes only;
    # this is a documented normalization choice, not a re-estimation of RPKM.
    eligible = np.all(counts > 0, axis=1)
    if int(eligible.sum()) < 500:
        raise ValueError("Too few all-positive genes for median-ratio normalization")
    geometric = np.exp(np.mean(np.log(counts[eligible, :]), axis=1))
    factors = np.median(counts[eligible, :] / geometric[:, None], axis=0)
    if np.any(~np.isfinite(factors)) or np.any(factors <= 0):
        raise ValueError("Invalid size factor")
    factors /= np.exp(np.mean(np.log(factors)))
    normalized = np.log2(counts / factors[None, :] + 1)
    for row, factor in zip(sample_qc, factors, strict=True):
        row["Median_ratio_size_factor"] = f"{factor:.8f}"
    labels = [r["GSM"] for r in samples]
    write_matrix(RESULTS / "modern_gene_estimated_counts_54.tsv.gz", genes, labels, counts)
    write_matrix(RESULTS / "modern_gene_tpm_54.tsv.gz", genes, labels, tpm)
    write_matrix(RESULTS / "modern_gene_log2_median_ratio_counts_54.tsv.gz", genes, labels, normalized)
    write_tsv(RESULTS / "modern_sample_qc_54.tsv", sample_qc, list(sample_qc[0]))
    write_tsv(RESULTS / "modern_matrix_qc.tsv", [
        {"Metric": "Samples", "Value": 54},
        {"Metric": "Genes", "Value": len(genes)},
        {"Metric": "Transcripts", "Value": len(tx_to_gene)},
        {"Metric": "Genes_positive_in_all_samples_for_size_factors", "Value": int(eligible.sum())},
        {"Metric": "Size_factor_min", "Value": float(factors.min())},
        {"Metric": "Size_factor_max", "Value": float(factors.max())},
        {"Metric": "Mapped_percent_min", "Value": min(float(r["Percent_mapped"]) for r in sample_qc)},
        {"Metric": "Mapped_percent_median", "Value": float(np.median([float(r["Percent_mapped"]) for r in sample_qc]))},
        {"Metric": "Validation", "Value": "PASS"},
    ], ["Metric", "Value"])
    print("54-sample modern matrices PASS", flush=True)


if __name__ == "__main__":
    main()
