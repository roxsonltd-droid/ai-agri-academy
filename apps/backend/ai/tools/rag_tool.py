"""Academy RAG като LangChain tool — ``RAGEngine`` (PGVector/Supabase) + fallback към ``rag.retriever``."""

from __future__ import annotations

import logging
import os
from typing import Any

from langchain_core.tools import tool

from ai.vector_store.filters import build_agri_vector_metadata_filter

logger = logging.getLogger(__name__)

_rag_engine_singleton: Any = None


def _react_rag_mode() -> str:
    """``auto`` | ``engine`` | ``retriever`` — виж ``REACT_RAG_MODE`` в .env.example."""
    return (os.getenv("REACT_RAG_MODE") or "auto").strip().lower()


def _react_rag_top_k() -> int:
    try:
        return max(1, min(20, int(os.getenv("REACT_RAG_TOP_K", "6"))))
    except ValueError:
        return 6


def get_rag_engine_singleton() -> Any:
    """Единична инстанция на ``RAGEngine`` за ReAct (lazy)."""
    global _rag_engine_singleton
    if _rag_engine_singleton is None:
        from ai.rag.engine import RAGEngine

        _rag_engine_singleton = RAGEngine()
    return _rag_engine_singleton


def _format_lc_documents(docs: list[Any]) -> str:
    chunks: list[str] = []
    seen_sources: list[str] = []
    for d in docs:
        text = getattr(d, "page_content", None) or (str(d) if d is not None else "")
        text = (text or "").strip()
        if not text:
            continue
        meta = getattr(d, "metadata", None) or {}
        if not isinstance(meta, dict):
            meta = {}
        src = (
            meta.get("source")
            or meta.get("source_path")
            or meta.get("file")
            or meta.get("path")
            or meta.get("course")
            or "unknown"
        )
        src_s = str(src).strip() or "unknown"
        if src_s not in seen_sources:
            seen_sources.append(src_s)
        chunks.append(f"[{src_s}]\n{text}")
    body = "\n\n---\n\n".join(chunks)
    max_chars = int(os.getenv("REACT_RAG_TOOL_MAX_CHARS", "6000"))
    if len(body) > max_chars:
        body = body[:max_chars] + "…"
    tail = ""
    if seen_sources:
        tail = "\n\nИзточници (файлове/курсове): " + "; ".join(seen_sources[:12])
    return f"Намерена информация от Academy (RAG Engine / Knowledge Base):\n\n{body}{tail}"


def _search_via_rag_engine(query: str, meta_filter: dict[str, Any] | None) -> str:
    engine = get_rag_engine_singleton()
    engine.initialize(rebuild=False)
    k = _react_rag_top_k()
    use_filter = meta_filter if meta_filter else None
    try:
        result = engine.retrieve(query, k=k, filter=use_filter)
    except Exception as e:
        logger.exception("RAGEngine.retrieve failed")
        return f"Грешка при търсене в знанията: {e!s}"
    docs = result.get("documents") or []
    if not docs:
        return "Не намерих релевантни чънкове в LangChain векторната колекция (RAGEngine)."
    body = _format_lc_documents(docs)
    uf = result.get("used_filter")
    if isinstance(uf, dict) and uf:
        body += f"\n\nПриложени metadata филтри (containment @>): {uf}"
    return body


def _search_via_legacy_retriever(query: str, filters: dict[str, Any] | None) -> str:
    try:
        from rag.retriever import get_retriever

        data = get_retriever().get_context(query, filters=filters)
    except Exception as e:
        logger.warning("legacy get_retriever failed: %s", e)
        return f"Academy търсенето (legacy retriever) е недостъпно: {e!s}"

    if not isinstance(data, dict):
        return "RAG (legacy) върна неочакван формат."
    ctx = (data.get("context") or "").strip()
    sources = data.get("sources") or []
    if not ctx:
        return "Няма намерени откъси в Academy (legacy retriever) за тази заявка."
    tail = ""
    if isinstance(sources, list) and sources:
        lines: list[str] = []
        for i, s in enumerate(sources[:8], start=1):
            if isinstance(s, dict):
                parts = [str(s.get(k) or "") for k in ("course", "topic", "source")]
                line = " — ".join(p for p in parts if p)
                if line:
                    lines.append(f"{i}. {line}")
        if lines:
            tail = "\nИзточници:\n" + "\n".join(lines)
    max_chars = int(os.getenv("REACT_RAG_TOOL_MAX_CHARS", "6000"))
    body = ctx[:max_chars] + ("…" if len(ctx) > max_chars else "")
    return f"Намерена информация от Academy (legacy retriever):\n\n{body}{tail}"


def _legacy_course_filter(culture: str | None) -> dict[str, Any] | None:
    """TF–IDF file retriever филтрира основно по ``course``."""
    if culture and (v := culture.strip().lower()):
        return {"course": v}
    return None


@tool
def search_academy_knowledge(
    query: str,
    culture: str | None = None,
    region: str | None = None,
    module: str | None = None,
    difficulty: str | None = None,
) -> str:
    """
    Търси в учебното Academy съдържание (курсове, практики) чрез RAG.
    Ползвай за сеитба, торене, болести, агротехника и други специализирани теми,
    преди да разчиташ само на общи знания.

    Опционално подай ``culture`` (курс/култура), ``region``, ``module``, ``difficulty`` —
    при Supabase векторния store филтърът е JSON containment (``metadata @> filter``).
    """
    q = (query or "").strip()
    if not q:
        return "Празна заявка към Academy."

    flt = build_agri_vector_metadata_filter(
        culture=culture,
        region=region,
        module=module,
        difficulty=difficulty,
    )
    meta_filter = flt if flt else None
    legacy_filters = _legacy_course_filter(culture)

    mode = _react_rag_mode()
    if mode == "retriever":
        return _search_via_legacy_retriever(q, legacy_filters)
    if mode == "engine":
        try:
            return _search_via_rag_engine(q, meta_filter)
        except Exception as e:
            logger.exception("RAGEngine search failed (mode=engine)")
            return f"Грешка при търсене с RAGEngine: {e!s}"

    # auto: опитай LangChain vectorstore, после legacy retriever
    try:
        return _search_via_rag_engine(q, meta_filter)
    except Exception as e:
        logger.info("RAGEngine недостъпен (%s) — fallback към legacy retriever.", e)
        return _search_via_legacy_retriever(q, legacy_filters)
