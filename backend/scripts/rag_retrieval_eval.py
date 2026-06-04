"""
Offline retrieval evaluation: checks whether expected knowledge sources appear in top-k.

Usage (from backend/ with venv, MISTRAL_API_KEY set for file-RAG embeddings):
  python scripts/rag_retrieval_eval.py rag_eval_golden.example.json
  python scripts/rag_retrieval_eval.py my_golden.json

See docs/RAG_EVAL_AND_OBSERVABILITY.md
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


def _case_hit(bundle, case: dict) -> bool:
    subs = [s.lower() for s in case.get("any_source_contains") or []]
    min_n = int(case.get("min_sources") or 0)
    if len(bundle.sources) < min_n:
        return False
    if not subs:
        return bool(bundle.prompt_block.strip())
    for src in bundle.sources:
        label = (src.source or "").lower()
        if any(sub in label for sub in subs):
            return True
    return False


async def _run(path: Path) -> int:
    from core.rag_facade import retrieve_for_prompt_bundle

    cases = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or not cases:
        print("Golden file must be a non-empty JSON array.")
        return 1

    hits = 0
    evaluated = 0
    for i, case in enumerate(cases):
        if not isinstance(case, dict):
            print(f"[{i}] skip: not an object")
            continue
        q = (case.get("query") or "").strip()
        if not q:
            print(f"[{i}] skip: empty query")
            continue
        bundle = await retrieve_for_prompt_bundle(q)
        ok = _case_hit(bundle, case)
        hits += int(ok)
        evaluated += 1
        status = "HIT" if ok else "MISS"
        srcs = [s.source for s in bundle.sources]
        print(f"[{i}] {status} query={q!r} sources={srcs}")

    print(f"\nSummary: {hits}/{evaluated} cases hit")
    if evaluated == 0:
        return 1
    return 0 if hits == evaluated else 1


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        print("ERROR: missing path to golden JSON (e.g. rag_eval_golden.example.json).")
        raise SystemExit(2)
    path = Path(sys.argv[1])
    if not path.is_file():
        print(f"ERROR: not a file: {path}")
        raise SystemExit(2)
    code = asyncio.run(_run(path))
    raise SystemExit(code)


if __name__ == "__main__":
    main()
