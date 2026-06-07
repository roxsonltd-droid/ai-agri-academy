"""Academy RAG с contextual compression (LLM извличане след vector search)."""

from __future__ import annotations

import logging
import os
from typing import Any

from langchain_core.tools import tool

from ai.rag.compression import AgriContextualCompressor
from ai.tools import rag_tool as rag_tool_mod
from ai.vector_store.filters import build_agri_vector_metadata_filter

logger = logging.getLogger(__name__)

_compressor: AgriContextualCompressor | None = None


def get_contextual_compressor() -> AgriContextualCompressor:
    global _compressor
    if _compressor is None:
        _compressor = AgriContextualCompressor()
    return _compressor


def _format_compressed(docs: list[Any], ratio: str, original_n: int) -> str:
    from ai.tools.rag_tool import _format_lc_documents

    body = _format_lc_documents(docs)
    tail = f"\n\n(Компресия: {original_n} → {len(docs)} чънка; символи ~{ratio}.)"
    return f"Намерена информация от Academy (компресиран RAG):\n\n{body}{tail}"


@tool
def search_academy_knowledge_compressed(
    query: str,
    culture: str | None = None,
    region: str | None = None,
    module: str | None = None,
    difficulty: str | None = None,
) -> str:
    """
    Търси в Academy с **contextual compression**: след retrieval LLM оставя само релевантни откъси.
    Ползвай за по-сложни въпроси, когато искаш по-малко шум в контекста (по-бавно от стандартния RAG).
    Изисква ``RAGEngine`` (``REACT_RAG_MODE=auto`` или ``engine``).
    """
    q = (query or "").strip()
    if not q:
        return "Празна заявка към Academy."

    mode = rag_tool_mod._react_rag_mode()
    if mode == "retriever":
        return (
            "Компресираният Academy RAG изисква LangChain ``RAGEngine`` (vector store). "
            "Задай ``REACT_RAG_MODE=auto`` или ``engine``."
        )

    flt = build_agri_vector_metadata_filter(
        culture=culture,
        region=region,
        module=module,
        difficulty=difficulty,
    )
    meta_filter = flt if flt else None

    try:
        result = get_contextual_compressor().retrieve_compressed(q, meta_filter=meta_filter)
    except Exception as e:
        logger.exception("compressed RAG failed")
        return f"Грешка при компресирано търсене: {e!s}"

    docs = result.get("compressed_docs") or result.get("documents") or []
    if not docs:
        return "Не намерих релевантни откъси след компресия (опитай стандартния search_academy_knowledge)."

    ratio = str(result.get("compression_ratio") or "n/a")
    orig_n = int(result.get("original_chunk_count") or 0)
    body = _format_compressed(docs, ratio, orig_n)
    if isinstance(meta_filter, dict) and meta_filter:
        body += f"\n\nПриложени metadata филтри (containment @>): {meta_filter}"
    return body
