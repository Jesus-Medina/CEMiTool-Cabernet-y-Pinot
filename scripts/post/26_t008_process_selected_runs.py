"""Checkpointed, conservative processing of the frozen 54-run T-008 selection.

Keeps every downloaded FASTQ and Salmon directory in scratch. Never edits the
historical RPKM/network. A failed step stops the batch with evidence intact.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path.cwd().resolve()
if not (ROOT / "AGENTS.md").is_file() or not (ROOT / ".git").exists():
    raise RuntimeError("Run from the canonical Git repository root")
RESULTS = ROOT / "results/fastq_reprocessing_t008"
PROGRESS = RESULTS / "t008_batch_progress.tsv"


def stamp() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def event(run: str, stage: str, status: str, detail: str = "") -> None:
    new = not PROGRESS.exists()
    with PROGRESS.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
        if new:
            writer.writerow(["UTC", "SRA_Run", "Stage", "Status", "Detail"])
        writer.writerow([stamp(), run, stage, status, (detail or "-").replace("\t", " ").replace("\n", " ")])
    print(f"{stamp()} {run} {stage} {status} {detail}", flush=True)


def run_command(args: list[str], run: str, stage: str) -> None:
    event(run, stage, "START")
    result = subprocess.run(args, cwd=ROOT, check=False)
    if result.returncode:
        event(run, stage, "FAIL", f"exit={result.returncode}")
        raise RuntimeError(f"{run} {stage} failed with exit {result.returncode}")
    event(run, stage, "PASS")


def process(args: argparse.Namespace) -> None:
    scratch = args.scratch.resolve()
    if not (scratch / "reference/salmon_t2t_v5_1_index/info.json").is_file():
        raise ValueError("Pinned Salmon index missing from scratch")
    if not (scratch / "tools/salmon-linux-x86_64/bin/salmon").is_file():
        raise ValueError("Pinned Salmon binary missing from scratch")
    with (RESULTS / "selected_54_gsm_to_srr.tsv").open(encoding="utf-8", newline="") as handle:
        manifest = list(csv.DictReader(handle, delimiter="\t"))
    if len(manifest) != 54 or len({row["SRA_Run"] for row in manifest}) != 54:
        raise ValueError("Frozen manifest is not 54 unique runs")
    if any(row["Library_Layout"] != "SINGLE" for row in manifest):
        raise ValueError("Unexpected paired-end library")
    to_download = sum(int(row["FASTQ_Total_Bytes"]) for row in manifest
                      if not (scratch / "raw" / row["SRA_Run"] / f"{row['SRA_Run']}.fastq.gz").exists())
    free = shutil.disk_usage(scratch).free
    if free < to_download + 15_000_000_000:
        raise RuntimeError(f"Insufficient free space to retain all FASTQ: free={free}, pending={to_download}")
    event("ALL", "DISK", "PASS", f"free={free}; pending_FASTQ={to_download}; no_file_deletion")

    count = 0
    for row in sorted(manifest, key=lambda item: (int(item["FASTQ_Total_Bytes"]), item["SRA_Run"])):
        run = row["SRA_Run"]
        quant = scratch / "quant" / run
        qc = RESULTS / f"{run}_run_qc.tsv"
        if quant.is_dir() and qc.is_file():
            # Re-audit rather than trusting a stale PASS marker.
            run_command([sys.executable, "scripts/post/25_t008_validate_salmon_run.py",
                         "--scratch", str(scratch), "--run", run], run, "REVALIDATE")
            continue
        if quant.is_dir():
            # A complete local batch may have finished outside this orchestrator
            # (for example after a supervised/manual continuation).  Never
            # overwrite or rerun that quantification.  Rebuild the missing
            # evidence chain from the retained FASTQ and validate/archive the
            # existing Salmon directory.  Any partial or inconsistent output
            # fails in scripts 20/25 and stops the batch with sources intact.
            run_command([sys.executable, "scripts/post/20_t008_fastq_integrity_qc.py",
                         "--scratch", str(scratch), "--run", run], run, "FASTQ_QC_EXISTING")
            run_command([sys.executable, "scripts/post/25_t008_validate_salmon_run.py",
                         "--scratch", str(scratch), "--run", run], run, "QUANT_QC_EXISTING")
            count += 1
            if args.stop_after and count >= args.stop_after:
                event("ALL", "BATCH", "STOP_AFTER", str(args.stop_after))
                return
            continue
        run_command([sys.executable, "scripts/post/19_t008_download_verified_fastq.py",
                     "--scratch", str(scratch), "--run", run], run, "DOWNLOAD")
        run_command([sys.executable, "scripts/post/20_t008_fastq_integrity_qc.py",
                     "--scratch", str(scratch), "--run", run], run, "FASTQ_QC")
        if quant.exists():
            # Partial Salmon output is preserved for inspection, never overwritten.
            raise RuntimeError(f"Unvalidated Salmon output already exists: {quant}")
        wsl_scratch = "/mnt/d/CEMiTool_T008_scratch"
        if scratch != Path("D:/CEMiTool_T008_scratch"):
            raise ValueError("This pinned WSL invocation expects D:/CEMiTool_T008_scratch")
        command = (
            f"export LOCPATH={wsl_scratch}/tools/locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8; "
            f"{wsl_scratch}/tools/salmon-linux-x86_64/bin/salmon quant "
            f"-i {wsl_scratch}/reference/salmon_t2t_v5_1_index -l U "
            f"-r {wsl_scratch}/raw/{run}/{run}.fastq.gz "
            f"--fldMean 250 --fldSD 25 --seqBias --dumpEq -p 2 "
            f"-o {wsl_scratch}/quant/{run}"
        )
        # Clear Windows-inherited locale before bash starts; set the pinned
        # user-local locale inside the command before invoking Salmon.
        run_command(["wsl", "-d", "Ubuntu-24.04", "--", "env", "-u", "LC_ALL", "-u", "LANG",
                     "bash", "-lc", command], run, "SALMON")
        run_command([sys.executable, "scripts/post/25_t008_validate_salmon_run.py",
                     "--scratch", str(scratch), "--run", run], run, "QUANT_QC")
        count += 1
        if args.stop_after and count >= args.stop_after:
            event("ALL", "BATCH", "STOP_AFTER", str(args.stop_after))
            return
    event("ALL", "BATCH", "PASS", "54/54 selected runs validated")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    parser.add_argument("--stop-after", type=int, default=0,
                        help="For a controlled small-batch test; 0 processes all selected runs")
    args = parser.parse_args()
    scratch = args.scratch.resolve()
    if not scratch.is_dir():
        raise FileNotFoundError(scratch)
    lock = scratch / "t008_batch.lock"
    try:
        with lock.open("x", encoding="ascii") as handle:
            handle.write(f"pid={os.getpid()} started_utc={stamp()}\n")
    except FileExistsError as exc:
        raise RuntimeError(f"Another batch may be running; inspect {lock}") from exc
    try:
        process(args)
    finally:
        lock.unlink()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        event("ALL", "BATCH", "FAIL", str(exc))
        raise
