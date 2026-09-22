"""Compare two assumed single-end fragment-length priors for the same pilot run."""

from __future__ import annotations

import argparse
import csv
import json
import math
import shutil
from collections import defaultdict
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")


def read_quant(path: Path, transcript_gene: dict[str, str]) -> tuple[dict[str, float], dict[str, float], dict[str, float]]:
    transcripts: dict[str, float] = {}
    genes: dict[str, float] = defaultdict(float)
    counts: dict[str, float] = defaultdict(float)
    with path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            tx = row["Name"]
            if tx in transcripts or tx not in transcript_gene:
                raise ValueError(f"Duplicate/unknown transcript {tx}")
            tpm = float(row["TPM"])
            if not math.isfinite(tpm) or tpm < 0:
                raise ValueError(f"Invalid TPM for {tx}")
            count = float(row["NumReads"])
            if not math.isfinite(count) or count < 0:
                raise ValueError(f"Invalid estimated count for {tx}")
            transcripts[tx] = tpm
            genes[transcript_gene[tx]] += tpm
            counts[transcript_gene[tx]] += count
    if set(transcripts) != set(transcript_gene):
        raise ValueError("Pilot transcript set differs from frozen reference")
    return transcripts, genes, counts


def pearson_log1p(a: dict[str, float], b: dict[str, float]) -> float:
    names = sorted(a)
    x = [math.log1p(a[n]) for n in names]
    y = [math.log1p(b[n]) for n in names]
    xm, ym = sum(x) / len(x), sum(y) / len(y)
    numerator = sum((u - xm) * (v - ym) for u, v in zip(x, y))
    denominator = math.sqrt(sum((u - xm) ** 2 for u in x) * sum((v - ym) ** 2 for v in y))
    return numerator / denominator


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    args = parser.parse_args()
    scratch = args.scratch.resolve()
    baseline = scratch / "quant/SRR5560506"
    alternative = scratch / "quant/SRR5560506_fld200_sd80"
    with (baseline / "aux_info/meta_info.json").open(encoding="utf-8") as handle:
        bm = json.load(handle)
    with (alternative / "aux_info/meta_info.json").open(encoding="utf-8") as handle:
        am = json.load(handle)
    for key in ("salmon_version", "index_seq_hash", "num_processed", "num_mapped", "num_decoy_fragments"):
        if bm[key] != am[key]:
            raise ValueError(f"Alternative quantification differs in {key}")
    if bm["quant_errors"] or am["quant_errors"] or am["library_types"] != ["U"]:
        raise ValueError("Alternative quantification errors or library mismatch")
    with (alternative / "cmd_info.json").open(encoding="utf-8") as handle:
        cmd = json.load(handle)
    if cmd.get("fldMean") != "200" or cmd.get("fldSD") != "80":
        raise ValueError("Unexpected requested alternative prior")
    if not 190 <= am["frag_length_mean"] <= 210 or not 65 <= am["frag_length_sd"] <= 85:
        raise ValueError("Unexpected effective alternative distribution")
    with (ROOT / "data/reference/t008/t2t_v5_1_tx2gene.tsv").open(encoding="utf-8", newline="") as handle:
        mapping = {row["Transcript"]: row["Gene"] for row in csv.DictReader(handle, delimiter="\t")}
    bt, bg, bc = read_quant(baseline / "quant.sf", mapping)
    at, ag, ac = read_quant(alternative / "quant.sf", mapping)
    both_expressed = [g for g in bg if bg[g] >= 1 and ag[g] >= 1]
    abs_log2_ratios = sorted(abs(math.log2(ag[g] / bg[g])) for g in both_expressed)
    both_counted = [g for g in bc if bc[g] >= 10 and ac[g] >= 10]
    count_log2_ratios = sorted(abs(math.log2(ac[g] / bc[g])) for g in both_counted)
    top_b = set(sorted(bg, key=lambda g: (-bg[g], g))[:100])
    top_a = set(sorted(ag, key=lambda g: (-ag[g], g))[:100])
    top_bc = set(sorted(bc, key=lambda g: (-bc[g], g))[:100])
    top_ac = set(sorted(ac, key=lambda g: (-ac[g], g))[:100])
    dest = ROOT / "results/fastq_reprocessing_t008/pilot_SRR5560506_fld200_sd80"
    dest.mkdir(exist_ok=True)
    for rel in ("quant.sf", "cmd_info.json", "aux_info/meta_info.json", "logs/salmon_quant.log"):
        source = alternative / rel
        if not source.is_file() or source.stat().st_size == 0:
            raise ValueError(f"Missing/empty sensitivity output: {source}")
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    metrics = [
        ("SRA_Run", "SRR5560506"),
        ("Primary_assumed_mean_sd", "250/25"),
        ("Sensitivity_assumed_mean_sd", "200/80"),
        ("Sensitivity_effective_mean_sd", f"{am['frag_length_mean']:.4f}/{am['frag_length_sd']:.4f}"),
        ("Same_index_and_read_mapping", "PASS"),
        ("Transcripts_both", len(bt)),
        ("Genes_both", len(bg)),
        ("Gene_TPM_log1p_Pearson", f"{pearson_log1p(bg, ag):.8f}"),
        ("Genes_TPM_ge_1_both", len(both_expressed)),
        ("Median_abs_gene_log2_TPM_ratio_among_ge_1", f"{abs_log2_ratios[len(abs_log2_ratios)//2]:.8f}"),
        ("Genes_abs_ratio_gt_2fold_among_ge_1", sum(value > 1 for value in abs_log2_ratios)),
        ("Top_100_gene_TPM_overlap", len(top_b & top_a)),
        ("Gene_estimated_counts_log1p_Pearson", f"{pearson_log1p(bc, ac):.8f}"),
        ("Genes_estimated_counts_ge_10_both", len(both_counted)),
        ("Median_abs_gene_log2_count_ratio_among_ge_10", f"{count_log2_ratios[len(count_log2_ratios)//2]:.8f}"),
        ("Genes_abs_count_ratio_gt_2fold_among_ge_10", sum(value > 1 for value in count_log2_ratios)),
        ("Top_100_gene_estimated_count_overlap", len(top_bc & top_ac)),
        ("Validation", "PASS"),
    ]
    out = ROOT / "results/fastq_reprocessing_t008/SRR5560506_fragment_prior_sensitivity_qc.tsv"
    with out.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
        writer.writerow(["Metric", "Value"])
        writer.writerows(metrics)
    print(f"Fragment-prior sensitivity PASS: {len(bg)} genes, "
          f"log1p Pearson {pearson_log1p(bg, ag):.6f}")


if __name__ == "__main__":
    main()
