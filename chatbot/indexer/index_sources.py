#!/usr/bin/env python3
"""Index curated project sources into a Gemini File Search store.

This script never edits scientific source files. Text-like inputs are copied to
temporary .txt files only to make MIME detection predictable during upload.

Examples (PowerShell):
    $env:GEMINI_API_KEY="..."
    python index_sources.py --repo-root ..\\..

Optional:
    python index_sources.py --repo-root ..\\.. --extra-dir "C:\\path\\to\\NotebookLM_sources"

The script creates a NEW File Search store unless --store is provided.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import tempfile
import time
from pathlib import Path

from google import genai


TEXT_SUFFIXES = {
    ".md", ".txt", ".tsv", ".csv", ".r", ".py", ".sh", ".json",
    ".rmd", ".yml", ".yaml", ".html", ".htm", ".css", ".js", ".ts", ".tsx",
}
EXTRA_SUFFIXES = TEXT_SUFFIXES | {
    ".pdf", ".png", ".jpg", ".jpeg", ".docx", ".pptx", ".xlsx",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--repo-root",
        type=Path,
        required=True,
        help="Repository root that contains docs/, results/, scripts/, reports/.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "source_manifest.txt",
        help="Path to the curated repository-relative source manifest.",
    )
    parser.add_argument(
        "--store",
        default=os.getenv("GEMINI_FILE_SEARCH_STORE", ""),
        help="Existing store name to append to. If omitted, a new store is created.",
    )
    parser.add_argument(
        "--display-name",
        default="cemitool-cabernet-pinot",
        help="Display name for a newly created File Search store.",
    )
    parser.add_argument(
        "--extra-dir",
        type=Path,
        action="append",
        default=[],
        help="Optional folder of extra NotebookLM/PDF/image sources. May be repeated.",
    )
    return parser.parse_args()


def manifest_paths(manifest: Path) -> list[str]:
    rows: list[str] = []
    for raw in manifest.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        rows.append(line)
    return rows


def prepare_upload(source: Path, temp_root: Path, display_name: str) -> Path:
    suffix = source.suffix.lower()
    if suffix not in TEXT_SUFFIXES:
        return source

    safe_name = display_name.replace("\\", "__").replace("/", "__")
    target = temp_root / f"{safe_name}.txt"
    shutil.copyfile(source, target)
    return target


def wait_for_operation(client: genai.Client, operation) -> None:
    while not operation.done:
        time.sleep(2)
        operation = client.operations.get(operation)


def collect_extra_files(extra_dirs: list[Path]) -> list[tuple[Path, str]]:
    output: list[tuple[Path, str]] = []
    for directory in extra_dirs:
        resolved = directory.expanduser().resolve()
        if not resolved.is_dir():
            raise FileNotFoundError(f"Extra source directory not found: {resolved}")
        for path in sorted(p for p in resolved.rglob("*") if p.is_file()):
            if path.suffix.lower() not in EXTRA_SUFFIXES:
                continue
            rel = path.relative_to(resolved).as_posix()
            output.append((path, f"extra/{resolved.name}/{rel}"))
    return output


def main() -> int:
    args = parse_args()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY is not set.", file=sys.stderr)
        return 2

    repo_root = args.repo_root.expanduser().resolve()
    manifest = args.manifest.expanduser().resolve()

    if not repo_root.is_dir():
        print(f"ERROR: repo root not found: {repo_root}", file=sys.stderr)
        return 2
    if not manifest.is_file():
        print(f"ERROR: manifest not found: {manifest}", file=sys.stderr)
        return 2

    curated: list[tuple[Path, str]] = []
    missing: list[str] = []
    for rel in manifest_paths(manifest):
        path = repo_root / rel
        if not path.is_file():
            missing.append(rel)
        else:
            curated.append((path, rel))

    if missing:
        print("ERROR: required curated sources are missing:", file=sys.stderr)
        for rel in missing:
            print(f"  - {rel}", file=sys.stderr)
        return 3

    extra = collect_extra_files(args.extra_dir)
    sources = curated + extra

    client = genai.Client(api_key=api_key)

    if args.store:
        store_name = args.store
        print(f"Using existing File Search store: {store_name}")
    else:
        store = client.file_search_stores.create(
            config={
                "display_name": args.display_name,
                "embedding_model": "models/gemini-embedding-2",
            }
        )
        store_name = store.name
        print(f"Created File Search store: {store_name}")

    state_file = Path(__file__).resolve().parent / ".file-search-store"
    state_file.write_text(store_name + "\n", encoding="utf-8")

    uploaded = 0
    with tempfile.TemporaryDirectory(prefix="cemitool-rag-") as tmp:
        temp_root = Path(tmp)
        for index, (source, display_name) in enumerate(sources, start=1):
            upload_path = prepare_upload(source, temp_root, display_name)
            print(f"[{index}/{len(sources)}] Indexing {display_name}")
            try:
                operation = client.file_search_stores.upload_to_file_search_store(
                    file=str(upload_path),
                    file_search_store_name=store_name,
                    config={"display_name": display_name},
                )
                wait_for_operation(client, operation)
                uploaded += 1
            except Exception as exc:  # noqa: BLE001
                print(f"ERROR indexing {display_name}: {exc}", file=sys.stderr)
                print("No source files were modified.", file=sys.stderr)
                return 4

    print()
    print("Indexing completed successfully.")
    print(f"Indexed documents: {uploaded}")
    print(f"Store: {store_name}")
    print(f"Store name saved locally to: {state_file}")
    print()
    print("Next: configure the worker secret GEMINI_FILE_SEARCH_STORE with this store name.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
