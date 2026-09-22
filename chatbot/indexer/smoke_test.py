#!/usr/bin/env python3
"""Small end-to-end smoke test for the Gemini File Search store."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from google import genai


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--store", default=os.getenv("GEMINI_FILE_SEARCH_STORE", ""))
    parser.add_argument(
        "--store-file",
        type=Path,
        default=Path(__file__).resolve().parent / ".file-search-store",
    )
    parser.add_argument(
        "--prompt-file",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "system_prompt.txt",
    )
    return parser.parse_args()


def citation_rows(interaction) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for step in interaction.steps or []:
        if getattr(step, "type", None) != "model_output":
            continue
        for block in getattr(step, "content", []) or []:
            for annotation in getattr(block, "annotations", []) or []:
                if getattr(annotation, "type", None) != "file_citation":
                    continue
                file_name = str(getattr(annotation, "file_name", "") or "")
                source = str(getattr(annotation, "source", "") or "")
                key = (file_name, source)
                if not file_name or key in seen:
                    continue
                seen.add(key)
                rows.append({"file_name": file_name, "source": source})

    return rows


def main() -> int:
    args = parse_args()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY is not set.", file=sys.stderr)
        return 2

    store_name = args.store.strip()
    if not store_name and args.store_file.is_file():
        store_name = args.store_file.read_text(encoding="utf-8").strip()

    if not store_name:
        print("ERROR: File Search store name is missing.", file=sys.stderr)
        return 2

    system_prompt = args.prompt_file.read_text(encoding="utf-8")
    client = genai.Client(api_key=api_key)

    question = (
        "¿Qué es el módulo M5, cuál es el hallazgo principal en Harvest y qué "
        "limitación causal debo recordar? Responde brevemente y basa la respuesta "
        "solo en las fuentes del proyecto."
    )

    interaction = client.interactions.create(
        model="gemini-3.8-flash",
        store=False,
        system_instruction=system_prompt,
        input=question,
        tools=[
            {
                "type": "file_search",
                "file_search_store_names": [store_name],
            }
        ],
    )

    answer = str(interaction.output_text or "").strip()
    citations = citation_rows(interaction)

    result = {
        "store": store_name,
        "question": question,
        "answer": answer,
        "citations": citations,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if not answer:
        print("ERROR: smoke test returned no answer.", file=sys.stderr)
        return 3
    if not citations:
        print("ERROR: smoke test returned no File Search citations.", file=sys.stderr)
        return 4
    if "M5" not in answer:
        print("ERROR: smoke answer does not mention M5.", file=sys.stderr)
        return 5

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
