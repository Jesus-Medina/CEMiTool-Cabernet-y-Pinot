"""Validate Grapedia T2T v5.1 reference files and prepare Salmon inputs.

Archives are downloaded separately to a scratch directory because the genome
and all-variant bundles exceed normal Git blob limits. This script verifies
their pinned SHA-256 before extraction and never changes the historical v1
RPKM source or beta10 network.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import re
import shutil
import zipfile
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")

SOURCES = [
    (
        "T2T_ref.zip",
        "https://grapedia.org/wp-content/uploads/2023/11/T2T_ref.zip",
        "582a342a341607b9a4e06bbdd02bb6c7351d4fff50cae92159059da7dd61cc6e",
        133155642,
        "T2T_ref.fasta",
        "genome",
    ),
    (
        "PN40024_5.1_on_T2T_ref_with_names.zip",
        "https://grapedia.org/wp-content/uploads/2024/11/PN40024_5.1_on_T2T_ref_with_names.zip",
        "ba1c7239d43ae081a661152dac41b4ecb30f4ab52989496f64aa9c8b5ee96de7",
        5148437,
        "PN40024_5.1_on_T2T_ref_with_names.gff3",
        "annotation",
    ),
    (
        "5.1_on_T2T_all_variants.zip",
        "https://grapedia.org/wp-content/uploads/2025/03/5.1_on_T2T_all_variants.zip",
        "ea63a39cd61cffb7402b0992a9341f4c1ada1f1e171a7d92232aa3dd999f0e88",
        168153990,
        "5.1_on_T2T_ref_all_transcripts.fasta",
        "all-transcript variants",
    ),
]


def sha256(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def write_tsv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def fasta_ids(path: Path) -> list[str]:
    ids = []
    with path.open(encoding="ascii") as handle:
        for line in handle:
            if line.startswith(">"):
                ids.append(line[1:].split()[0])
    if not ids or len(ids) != len(set(ids)):
        raise ValueError(f"Empty or duplicate FASTA IDs: {path}")
    return ids


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True,
                        help="Existing T-008 scratch directory containing reference ZIPs")
    args = parser.parse_args()
    archive_dir = args.scratch.resolve() / "reference"
    extracted = archive_dir / "extracted"
    extracted.mkdir(parents=True, exist_ok=True)
    extracted_paths: dict[str, Path] = {}
    provenance = []
    for filename, url, expected_sha, expected_bytes, member, role in SOURCES:
        archive = archive_dir / filename
        if not archive.is_file() or archive.stat().st_size != expected_bytes:
            raise ValueError(f"Missing/wrong-size Grapedia archive: {archive}")
        if sha256(archive) != expected_sha:
            raise ValueError(f"Grapedia SHA-256 mismatch: {archive}")
        with zipfile.ZipFile(archive) as source:
            if source.testzip() is not None or member not in source.namelist():
                raise ValueError(f"Invalid ZIP or missing expected member: {archive}")
            target = extracted / member
            with source.open(member) as src, target.open("wb") as dst:
                shutil.copyfileobj(src, dst, length=1024 * 1024)
        extracted_paths[role] = target
        provenance.append({"File": filename, "URL": url, "SHA256": expected_sha,
                           "Bytes": expected_bytes, "Member": member, "Role": role})

    gene_ids = set()
    tx_to_gene = {}
    with extracted_paths["annotation"].open(encoding="utf-8") as handle:
        for line in handle:
            if line.startswith("#"):
                continue
            fields = line.rstrip("\n").split("\t")
            if len(fields) != 9:
                raise ValueError("Malformed GFF3 row")
            attrs = dict(p.split("=", 1) for p in fields[8].split(";") if "=" in p)
            if fields[2] == "gene":
                gene = attrs.get("ID")
                if not gene or gene in gene_ids:
                    raise ValueError("Missing or duplicate v5.1 gene ID")
                gene_ids.add(gene)
            elif fields[2] in {"mRNA", "lncRNA", "transcript"}:
                tx, gene = attrs.get("ID"), attrs.get("Parent")
                if not tx or not gene or "," in gene or tx in tx_to_gene:
                    raise ValueError("Missing, multi-parent or duplicate v5.1 transcript")
                tx_to_gene[tx] = gene
    if not tx_to_gene or not set(tx_to_gene.values()).issubset(gene_ids):
        raise ValueError("GFF3 transcript-to-gene integrity failed")
    tx_ids = fasta_ids(extracted_paths["all-transcript variants"])
    genome_ids = fasta_ids(extracted_paths["genome"])
    fasta_only = set(tx_ids) - set(tx_to_gene)
    gff_only = set(tx_to_gene) - set(tx_ids)
    overlap = set(tx_ids) & set(genome_ids)
    if fasta_only or gff_only or overlap:
        raise ValueError(f"Transcript FASTA/GFF3 or genome-decoy IDs disagree: "
                         f"FASTA_only={len(fasta_only)} {sorted(fasta_only)[:3]}, "
                         f"GFF3_only={len(gff_only)} {sorted(gff_only)[:3]}, "
                         f"decoy_overlap={len(overlap)}")

    with (ROOT / "data/reference/grapedia_t005/v1_to_v5_reciprocal50.tsv").open(
        encoding="utf-8", newline=""
    ) as handle:
        legacy_map_rows = list(csv.DictReader(handle, delimiter="\t"))
    legacy_to_v5 = {row["V1_gene"]: row["Annotation_gene"] for row in legacy_map_rows}
    if (len(legacy_map_rows) != 1922 or len(legacy_to_v5) != 1922 or
            len(set(legacy_to_v5.values())) != 1922 or
            not set(legacy_to_v5.values()).issubset(gene_ids)):
        raise ValueError("Frozen reciprocal V1->v5.1 crosswalk fails current GFF3 integrity")
    with (ROOT / "results/beta10/tables/module.tsv").open(encoding="utf-8", newline="") as handle:
        membership = list(csv.DictReader(handle, delimiter="\t"))
    if len(membership) != 3050 or len({r["genes"] for r in membership}) != 3050:
        raise ValueError("Frozen beta10 membership changed")
    module_genes: dict[str, set[str]] = {}
    for row in membership:
        module_genes.setdefault(row["modules"], set()).add(row["genes"])
    coverage = []
    for module in sorted(module_genes):
        genes = module_genes[module]
        coverage.append({"Module": module, "Legacy_Genes": len(genes),
                         "Reciprocal_V5_Mapped": len(genes & legacy_to_v5.keys()),
                         "Mapped_Fraction": len(genes & legacy_to_v5.keys()) / len(genes)})

    ref = ROOT / "data/reference/t008"
    out = ROOT / "results/fastq_reprocessing_t008"
    write_tsv(ref / "grapedia_t2t_v5_1_source_manifest.tsv", provenance,
              ["File", "URL", "SHA256", "Bytes", "Member", "Role"])
    write_tsv(ref / "t2t_v5_1_tx2gene.tsv",
              [{"Transcript": tx, "Gene": tx_to_gene[tx]} for tx in tx_ids],
              ["Transcript", "Gene"])
    write_tsv(out / "legacy_to_v5_coverage.tsv", coverage,
              ["Module", "Legacy_Genes", "Reciprocal_V5_Mapped", "Mapped_Fraction"])
    decoys = archive_dir / "decoys.txt"
    decoys.write_text("\n".join(genome_ids) + "\n", encoding="ascii")
    gentrome = archive_dir / "gentrome.fa"
    with gentrome.open("wb") as dst:
        for role in ("all-transcript variants", "genome"):
            with extracted_paths[role].open("rb") as src:
                shutil.copyfileobj(src, dst, length=1024 * 1024)
            dst.write(b"\n")
    write_tsv(out / "reference_qc.tsv", [
        {"Metric": "GFF3_genes", "Value": len(gene_ids)},
        {"Metric": "GFF3_transcripts", "Value": len(tx_to_gene)},
        {"Metric": "Transcript_FASTA_ids", "Value": len(tx_ids)},
        {"Metric": "Genome_decoy_sequences", "Value": len(genome_ids)},
        {"Metric": "Transcript_ids_without_GFF3", "Value": len(set(tx_ids) - set(tx_to_gene))},
        {"Metric": "GFF3_transcripts_without_FASTA", "Value": len(set(tx_to_gene) - set(tx_ids))},
        {"Metric": "Gentrome_bytes", "Value": gentrome.stat().st_size},
        {"Metric": "Gentrome_SHA256", "Value": sha256(gentrome)},
    ], ["Metric", "Value"])
    print(f"Validated {len(gene_ids)} genes, {len(tx_ids)} transcripts and "
          f"{len(genome_ids)} genome decoys; gentrome {gentrome.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
