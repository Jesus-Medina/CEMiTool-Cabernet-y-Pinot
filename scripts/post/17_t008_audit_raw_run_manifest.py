"""Audit GSE98923 GEO GSM -> SRA experiment -> ENA FASTQ run lineage.

Metadata only: this script does not download reads or alter the historical
GSE98923 RPKM matrix. Run at the canonical repository root. It preserves the
exact public metadata responses and their SHA-256 hashes for reproducibility.
"""

from __future__ import annotations

import csv
import hashlib
import io
import re
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")

GEO_URL = (
    "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?"
    "acc=GSE98923&targ=gsm&view=brief&form=text"
)
ENA_URL = (
    "https://www.ebi.ac.uk/ena/portal/api/filereport?accession=SRP107227"
    "&result=read_run&fields=run_accession,sample_accession,"
    "secondary_sample_accession,experiment_accession,fastq_ftp,fastq_bytes,fastq_md5,"
    "library_layout,read_count,base_count&format=tsv"
)


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "CEMiTool-T008-audit/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def write_tsv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    frozen_samples = ROOT / "data/metadata/samples.tsv"
    with frozen_samples.open(encoding="utf-8", newline="") as handle:
        selected = list(csv.DictReader(handle, delimiter="\t"))
    if len(selected) != 54 or len({r["GSM"] for r in selected}) != 54:
        raise ValueError("Expected exactly 54 unique frozen baseline GSMs")
    if set(Counter((r["Cultivar"], r["Stage"], r["Year"]) for r in selected).values()) != {3}:
        raise ValueError("The frozen 2x3x3 design no longer has three replicates per cell")

    geo_bytes = fetch(GEO_URL)
    ena_bytes = fetch(ENA_URL)
    geo_text = geo_bytes.decode("utf-8-sig")
    ena_text = ena_bytes.decode("utf-8-sig")

    geo_to_experiment: dict[str, str] = {}
    geo_attributes: dict[str, dict[str, str]] = {}
    current_gsm: str | None = None
    for raw_line in geo_text.splitlines():
        line = raw_line.strip()
        if line.startswith("^SAMPLE = "):
            current_gsm = line.removeprefix("^SAMPLE = ")
            if not re.fullmatch(r"GSM\d+", current_gsm) or current_gsm in geo_to_experiment:
                raise ValueError("Duplicate or malformed GEO sample block")
            geo_attributes[current_gsm] = {}
        elif line.startswith("!Sample_characteristics_ch1 = "):
            if current_gsm is None:
                raise ValueError("GEO characteristic outside sample block")
            characteristic = line.removeprefix("!Sample_characteristics_ch1 = ")
            key, separator, value = characteristic.partition(": ")
            if separator and key in {"year", "cultivar", "time point", "time point replicate",
                                     "day after veraison", "treatment (cluster thinning)"}:
                if key in geo_attributes[current_gsm]:
                    raise ValueError(f"Duplicate GEO characteristic {current_gsm}/{key}")
                geo_attributes[current_gsm][key] = value
        elif line.startswith("!Sample_relation = SRA:"):
            if current_gsm is None or current_gsm in geo_to_experiment:
                raise ValueError("Missing or duplicate SRA relation in GEO block")
            match = re.search(r"SRX\d+", line)
            if match is None:
                raise ValueError(f"No SRX in {current_gsm} SRA relation")
            geo_to_experiment[current_gsm] = match.group()
    if len(geo_to_experiment) != 219:
        raise ValueError(f"Expected 219 GEO GSM -> SRX links, got {len(geo_to_experiment)}")

    runs = list(csv.DictReader(io.StringIO(ena_text), delimiter="\t"))
    if len(runs) != 220 or len({r["run_accession"] for r in runs}) != 220:
        raise ValueError("Expected 220 unique SRA/ENA runs")
    required = {
        "run_accession", "sample_accession", "secondary_sample_accession",
        "experiment_accession", "fastq_ftp", "fastq_bytes", "fastq_md5", "library_layout",
        "read_count", "base_count",
    }
    if not required.issubset(runs[0]):
        raise ValueError("ENA read_run schema changed")
    runs_by_experiment: dict[str, list[dict]] = defaultdict(list)
    for run in runs:
        if not re.fullmatch(r"SRR\d+", run["run_accession"]):
            raise ValueError("Invalid SRR accession")
        if not re.fullmatch(r"SRX\d+", run["experiment_accession"]):
            raise ValueError("Invalid SRX accession")
        files = run["fastq_ftp"].split(";")
        sizes = run["fastq_bytes"].split(";")
        checksums = run["fastq_md5"].split(";")
        if len(files) != len(sizes) or len(files) != len(checksums) or not files or any(not p for p in files):
            raise ValueError("ENA FASTQ file/size mismatch")
        if any(not n.isdigit() or int(n) <= 0 for n in sizes):
            raise ValueError("Missing/nonpositive ENA FASTQ byte size")
        if any(not re.fullmatch(r"[0-9a-f]{32}", digest) for digest in checksums):
            raise ValueError("Missing/malformed ENA FASTQ MD5")
        if run["library_layout"] not in {"SINGLE", "PAIRED"}:
            raise ValueError("Unexpected library layout")
        if not run["read_count"].isdigit() or not run["base_count"].isdigit():
            raise ValueError("Missing ENA read/base count")
        runs_by_experiment[run["experiment_accession"]].append(run)

    selected_rows: list[dict] = []
    for sample in selected:
        gsm = sample["GSM"]
        if gsm not in geo_to_experiment:
            raise ValueError(f"Frozen GSM absent from GEO: {gsm}")
        attributes = geo_attributes[gsm]
        expected_attributes = {
            "year": sample["Year"], "cultivar": sample["Cultivar"],
            "time point": sample["TimePoint"],
            "time point replicate": sample["Replicate"],
            "treatment (cluster thinning)": "unthinned",
        }
        if any(attributes.get(key) != value for key, value in expected_attributes.items()):
            raise ValueError(f"Frozen metadata disagrees with GEO characteristics for {gsm}")
        if sample["Stage"] == "Veraison" and attributes.get("day after veraison") != "0":
            raise ValueError(f"Frozen Veraison GSM is not day 0 in GEO: {gsm}")
        experiment = geo_to_experiment[gsm]
        experiment_runs = runs_by_experiment.get(experiment, [])
        if not experiment_runs:
            raise ValueError(f"No ENA run for {gsm}/{experiment}")
        for run in experiment_runs:
            selected_rows.append({
                "GSM": gsm, "Cultivar": sample["Cultivar"], "Stage": sample["Stage"],
                "Year": sample["Year"], "Replicate": sample["Replicate"],
                "SRA_Experiment": experiment, "SRA_Run": run["run_accession"],
                "ENA_BioSample": run["sample_accession"],
                "ENA_Secondary_Sample": run["secondary_sample_accession"],
                "Library_Layout": run["library_layout"],
                "FASTQ_URLs": ";".join("https://" + p for p in run["fastq_ftp"].split(";")),
                "FASTQ_Bytes": run["fastq_bytes"],
                "FASTQ_MD5": run["fastq_md5"],
                "FASTQ_Total_Bytes": sum(int(x) for x in run["fastq_bytes"].split(";")),
                "Read_Count": int(run["read_count"]),
                "Base_Count": int(run["base_count"]),
            })
    if len({r["SRA_Run"] for r in selected_rows}) != len(selected_rows):
        raise ValueError("One SRA run mapped to multiple frozen GSMs")
    if len({r["GSM"] for r in selected_rows}) != 54:
        raise ValueError("Selected run mapping lost a frozen GSM")
    selected_rows.sort(key=lambda row: (row["GSM"], row["SRA_Run"]))

    ref = ROOT / "data/reference/t008"
    out = ROOT / "results/fastq_reprocessing_t008"
    ref.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    (ref / "GSE98923_GSM_SOFT_brief.txt").write_bytes(geo_bytes)
    (ref / "SRP107227_ENA_read_run.tsv").write_bytes(ena_bytes)
    write_tsv(ref / "source_manifest.tsv", [
        {"File": "GSE98923_GSM_SOFT_brief.txt", "URL": GEO_URL,
         "SHA256": hashlib.sha256(geo_bytes).hexdigest(), "Bytes": len(geo_bytes)},
        {"File": "SRP107227_ENA_read_run.tsv", "URL": ENA_URL,
         "SHA256": hashlib.sha256(ena_bytes).hexdigest(), "Bytes": len(ena_bytes)},
    ], ["File", "URL", "SHA256", "Bytes"])
    write_tsv(out / "selected_54_gsm_to_srr.tsv", selected_rows, list(selected_rows[0]))

    all_bytes = sum(sum(int(x) for x in r["fastq_bytes"].split(";")) for r in runs)
    selected_bytes = sum(r["FASTQ_Total_Bytes"] for r in selected_rows)
    layout_counts = Counter(r["Library_Layout"] for r in selected_rows)
    qc = [
        {"Metric": "GEO_series_GSM", "Value": len(geo_to_experiment)},
        {"Metric": "ENA_series_runs", "Value": len(runs)},
        {"Metric": "Frozen_GSM", "Value": len(selected)},
        {"Metric": "Frozen_samples_TSV_SHA256", "Value": hashlib.sha256(frozen_samples.read_bytes()).hexdigest()},
        {"Metric": "Frozen_GSM_with_run", "Value": len({r["GSM"] for r in selected_rows})},
        {"Metric": "Selected_runs", "Value": len(selected_rows)},
        {"Metric": "Selected_SINGLE_runs", "Value": layout_counts["SINGLE"]},
        {"Metric": "Selected_PAIRED_runs", "Value": layout_counts["PAIRED"]},
        {"Metric": "All_ENA_FASTQ_bytes", "Value": all_bytes},
        {"Metric": "Selected_ENA_FASTQ_bytes", "Value": selected_bytes},
        {"Metric": "Selected_ENA_read_count", "Value": sum(r["Read_Count"] for r in selected_rows)},
    ]
    write_tsv(out / "run_manifest_qc.tsv", qc, ["Metric", "Value"])
    print(f"Audited {len(selected)} GSMs -> {len(selected_rows)} runs; "
          f"selected ENA compressed FASTQ {selected_bytes / 1e9:.2f} GB")


if __name__ == "__main__":
    main()
