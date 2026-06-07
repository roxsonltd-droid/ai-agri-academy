#!/usr/bin/env python3
"""
Ingest Academy Markdown в Supabase pgvector (LangChain ``SupabaseVectorStore``).

Изпълни от **apps/backend** (за да работят ``import ai`` и ``rag``)::

    cd apps/backend
    python scripts/ingest_academy.py
    python scripts/ingest_academy.py --rebuild   # пълен from_documents (нови id-та; за production изчисти таблицата в SQL при нужда)
    python scripts/ingest_academy.py --hierarchical   # parent+child чънкове (виж ACADEMY_RETRIEVAL_MODE=parent_child)

Изисква: ``SUPABASE_URL``, ``SUPABASE_SERVICE_ROLE_KEY``, RPC ``match_documents`` (таблица ``documents``) **или**
``match_academy_documents`` (таблица ``academy_documents``; виж ``migrations/004_academy_documents_vector.sql``).
Таблица: ``VECTOR_STORE_TABLE`` / ``SUPABASE_RAG_TABLE`` / по подразбиране ``documents``.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


async def _ingest(*, rebuild: bool, hierarchical: bool = False) -> None:
    os.environ.setdefault("RAG_VECTOR_BACKEND", "supabase")
    if hierarchical:
        os.environ["ACADEMY_CHUNK_STRATEGY"] = "hierarchical"

    from ai.rag.chunker import get_chunker
    from ai.rag.loaders import load_academy_content
    from ai.vector_store.service import VectorStoreService

    raw_docs = load_academy_content()
    if not raw_docs:
        print("Няма Academy документи (провери ACADEMY_RAG_ROOT).")
        return

    chunker = get_chunker()
    chunks = chunker.split_documents(raw_docs)
    for ch in chunks:
        ch.metadata.setdefault("source_type", "academy")
        ch.metadata.setdefault("language", "bg")

    svc = VectorStoreService()
    await svc.initialize()

    if rebuild:
        svc.from_documents(chunks)
        print(f"OK: rebuild — {len(chunks)} чънка в таблица {svc.config.table_name}")
        return

    n = await svc.aadd_documents(chunks)
    print(f"OK: добавени/обновени {n} чънка в таблица {svc.config.table_name}")


def main() -> None:
    p = argparse.ArgumentParser(description="Ingest Academy content into Supabase vector store")
    p.add_argument(
        "--rebuild",
        action="store_true",
        help="LangChain from_documents (пълен upsert pipeline); за чиста таблица използвай TRUNCATE в SQL преди това.",
    )
    p.add_argument(
        "--hierarchical",
        action="store_true",
        help="Йерархични parent+child чънкове (HierarchicalChunker). За retrieval: ACADEMY_RETRIEVAL_MODE=parent_child.",
    )
    args = p.parse_args()
    asyncio.run(_ingest(rebuild=args.rebuild, hierarchical=args.hierarchical))


if __name__ == "__main__":
    main()
