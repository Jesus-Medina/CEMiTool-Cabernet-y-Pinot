"""Download one audited ENA FASTQ into T-008 scratch with size/MD5 checks.

This intentionally handles one run at a time. It never downloads the full
study implicitly, never changes the historical expression matrix, and never
deletes an existing verified FASTQ. Example:

  python scripts/post/19_t008_download_verified_fastq.py \
    --scratch D:/CEMiTool_T008_scratch --run SRR5560506
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import time
import urllib.request
from pathlib import Path


ROOT = Path.cwd()
if not (ROOT / "AGENTS.md").is_file():
    raise RuntimeError("Run from the canonical repository root")


def md5(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "md5").hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", type=Path, required=True)
    parser.add_argument("--run", required=True)
    args = parser.parse_args()
    with (ROOT / "results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv").open(
        encoding="utf-8", newline=""
    ) as handle:
        rows = list(csv.DictReader(handle, delimiter="\t"))
    selected = [row for row in rows if row["SRA_Run"] == args.run]
    if len(selected) != 1:
        raise ValueError("Run must occur exactly once in the audited 54-run manifest")
    row = selected[0]
    urls, sizes, checksums = (
        row["FASTQ_URLs"].split(";"), row["FASTQ_Bytes"].split(";"),
        row["FASTQ_MD5"].split(";"),
    )
    if len(urls) != len(sizes) or len(urls) != len(checksums):
        raise ValueError("Manifest FASTQ triples do not match")
    out = args.scratch.resolve() / "raw" / args.run
    out.mkdir(parents=True, exist_ok=True)
    for url, size, checksum in zip(urls, sizes, checksums):
        if not url.startswith("https://ftp.sra.ebi.ac.uk/"):
            raise ValueError("Unexpected FASTQ host")
        name = url.rsplit("/", 1)[-1]
        path = out / name
        if path.exists():
            if path.stat().st_size == int(size) and md5(path) == checksum:
                print(f"Already verified: {path}")
                continue
            raise ValueError(f"Existing FASTQ fails size/MD5; inspect manually: {path}")
        partial = out / (name + ".part")
        expected_size = int(size)
        if partial.exists() and partial.stat().st_size > expected_size:
            raise ValueError(f"Partial download exceeds ENA size: {partial}")
        for attempt in range(1, 6):
            offset = partial.stat().st_size if partial.exists() else 0
            if offset == expected_size:
                break
            headers = {"User-Agent": "CEMiTool-T008/1.0", "Accept-Encoding": "identity"}
            if offset:
                headers["Range"] = f"bytes={offset}-"
            request = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    if offset:
                        expected_range = f"bytes {offset}-"
                        if response.status != 206 or not response.headers.get("Content-Range", "").startswith(expected_range):
                            raise ValueError("Server did not honor exact resume range; refusing to append")
                    elif response.status != 200:
                        raise ValueError(f"Unexpected initial HTTP status {response.status}")
                    with partial.open("ab" if offset else "wb") as handle:
                        while chunk := response.read(8 * 1024 * 1024):
                            handle.write(chunk)
                if partial.stat().st_size == expected_size:
                    break
                raise IOError("Download ended before advertised ENA byte count")
            except (OSError, TimeoutError) as exc:
                if attempt == 5:
                    raise
                print(f"Download interruption for {args.run}, attempt {attempt}/5: {exc}; retaining .part")
                time.sleep(min(2 ** attempt, 30))
        if partial.stat().st_size != int(size) or md5(partial) != checksum:
            raise ValueError(f"Downloaded FASTQ fails ENA size/MD5: {partial}")
        partial.replace(path)
        print(f"Verified ENA FASTQ: {path} ({path.stat().st_size} bytes; MD5 {checksum})")


if __name__ == "__main__":
    main()
