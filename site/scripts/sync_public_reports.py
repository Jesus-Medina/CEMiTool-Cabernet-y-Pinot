#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import shutil
from pathlib import Path


SITE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = SITE_DIR.parent
REPORT_DIR = SITE_DIR / "public" / "reports"

PUBLICATIONS = {
    "manuscript/article_draft.html": "scientific-synthesis-manuscript.html",
    "manuscript/article_draft.pdf": "scientific-synthesis-manuscript.pdf",
    "reports/current/analysis_report.pdf": "complete-technical-analysis.pdf",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    for source_relative, public_name in PUBLICATIONS.items():
        source = REPO_ROOT / source_relative
        destination = REPORT_DIR / public_name
        if not source.is_file() or source.stat().st_size == 0:
            raise FileNotFoundError(f"Missing canonical publication: {source_relative}")
        shutil.copy2(source, destination)
        if sha256(source) != sha256(destination):
            raise RuntimeError(f"Checksum mismatch after copying {source_relative}")
        print(f"Synced {source_relative} -> site/public/reports/{public_name}")


if __name__ == "__main__":
    main()
