#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parents[1]
DIST = SITE_DIR / "dist"

MAIN_JS_LIMIT = 420_000
CHUNK_LIMIT = 600_000
TOTAL_JS_LIMIT = 1_100_000
CSS_LIMIT = 200_000


def main() -> None:
    index = DIST / "index.html"
    if not index.is_file():
        raise FileNotFoundError("dist/index.html is missing; run npm run build first")

    html = index.read_text(encoding="utf-8")
    match = re.search(r'<script[^>]+src="([^"]+\.js)"', html)
    if not match:
        raise AssertionError("Could not identify the initial JS entry from dist/index.html")

    initial_name = Path(match.group(1)).name
    assets = DIST / "assets"
    js_files = sorted(assets.glob("*.js"))
    css_files = sorted(assets.glob("*.css"))
    if not js_files:
        raise AssertionError("No JS assets found in dist/assets")

    sizes = {path.name: path.stat().st_size for path in js_files}
    initial_size = sizes.get(initial_name)
    if initial_size is None:
        raise AssertionError(f"Initial bundle {initial_name} is not present in dist/assets")

    largest_name, largest_size = max(sizes.items(), key=lambda item: item[1])
    total_js = sum(sizes.values())
    total_css = sum(path.stat().st_size for path in css_files)

    if initial_size > MAIN_JS_LIMIT:
        raise AssertionError(f"Initial JS bundle too large: {initial_size} > {MAIN_JS_LIMIT} bytes")
    if largest_size > CHUNK_LIMIT:
        raise AssertionError(f"Largest JS chunk too large: {largest_name}={largest_size} > {CHUNK_LIMIT} bytes")
    if total_js > TOTAL_JS_LIMIT:
        raise AssertionError(f"Total JS too large: {total_js} > {TOTAL_JS_LIMIT} bytes")
    if total_css > CSS_LIMIT:
        raise AssertionError(f"CSS bundle too large: {total_css} > {CSS_LIMIT} bytes")

    print(
        "Bundle QA PASS: "
        f"initial={initial_name}:{initial_size} bytes; "
        f"largest={largest_name}:{largest_size} bytes; "
        f"total_js={total_js} bytes; total_css={total_css} bytes."
    )


if __name__ == "__main__":
    main()
