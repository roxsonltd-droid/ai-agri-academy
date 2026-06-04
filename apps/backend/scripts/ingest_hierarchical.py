#!/usr/bin/env python3
"""
Йерархичен ingest в Supabase (shortcut за ``ingest_academy.py --hierarchical``).

    cd apps/backend
    python scripts/ingest_hierarchical.py
    python scripts/ingest_hierarchical.py --rebuild
"""

from __future__ import annotations

import argparse
import asyncio
import importlib.util
import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


def main() -> None:
    p = argparse.ArgumentParser(description="Hierarchical parent+child ingest into Supabase vector store")
    p.add_argument("--rebuild", action="store_true", help="Пълен from_documents")
    args = p.parse_args()

    path = Path(__file__).resolve().parent / "ingest_academy.py"
    spec = importlib.util.spec_from_file_location("ingest_academy_mod", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Не мога да заредя ingest_academy.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    asyncio.run(mod._ingest(rebuild=args.rebuild, hierarchical=True))


if __name__ == "__main__":
    main()
