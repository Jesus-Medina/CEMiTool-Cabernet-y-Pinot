#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git_output(repo_root: Path, *args: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=repo_root,
            check=True,
            capture_output=True,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    value = result.stdout.strip()
    return value or None


def file_record(repo_root: Path, relative_path: str) -> dict[str, Any]:
    path = repo_root / relative_path
    if not path.is_file():
        raise FileNotFoundError(f"Provenance source is missing: {relative_path}")
    return {
        "path": relative_path.replace("\\", "/"),
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
    }


def build_manifest(
    repo_root: Path,
    artifacts: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    commit = git_output(repo_root, "rev-parse", "HEAD")
    commit_time = git_output(repo_root, "show", "-s", "--format=%cI", "HEAD")

    artifact_records: list[dict[str, Any]] = []
    for artifact_id, spec in artifacts.items():
        artifact_records.append(
            {
                "artifact_id": artifact_id,
                "sources": [file_record(repo_root, p) for p in spec.get("sources", [])],
                "scripts": [file_record(repo_root, p) for p in spec.get("scripts", [])],
                "parameters": spec.get("parameters", {}),
            }
        )

    return {
        "schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "repository_commit": commit,
        "repository_commit_time": commit_time,
        "artifacts": artifact_records,
    }
