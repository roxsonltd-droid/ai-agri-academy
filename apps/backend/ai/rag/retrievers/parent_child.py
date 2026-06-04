"""Parent–child retrieval: търсене по child embeddings, контекст от parent чънкове."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

logger = logging.getLogger(__name__)


def _merge_child_filter(extra: dict[str, Any] | None) -> dict[str, Any]:
    """``metadata @>`` — child винаги има ``chunk_type``."""
    out: dict[str, Any] = dict(extra) if extra else {}
    out["chunk_type"] = "child"
    return out


def _parent_filter(parent_id: str) -> dict[str, Any]:
    return {"chunk_type": "parent", "parent_id": str(parent_id)}


def _filter_children_client_side(docs: list[Any]) -> list[Any]:
    return [d for d in docs if (getattr(d, "metadata", None) or {}).get("chunk_type") == "child"]


class ParentChildRetriever:
    """Работи с LangChain vector store (Supabase / PGVector) с JSON metadata филтри."""

    def __init__(self, vectorstore: Any) -> None:
        self.vectorstore = vectorstore

    def retrieve(self, query: str, *, k: int = 6, filter: dict[str, Any] | None = None) -> dict[str, Any]:
        q = (query or "").strip() or "."
        child_filter = _merge_child_filter(filter)
        try:
            child_docs = self.vectorstore.similarity_search(q, k=max(k * 2, k + 2), filter=child_filter)
        except TypeError:
            child_docs = self.vectorstore.similarity_search(q, k=max(k * 2, k + 2))
            child_docs = _filter_children_client_side(child_docs)

        parent_order = _ordered_unique_parent_ids(child_docs, limit=k)
        parent_docs = self._fetch_parents_sync(q, parent_order)

        child_trim = child_docs[:k]
        context = "\n\n---\n\n".join(
            (p.page_content or "").strip() for p in parent_docs if (p.page_content or "").strip()
        )
        return {
            "child_docs": child_trim,
            "parent_docs": parent_docs,
            "context": context,
            "documents": parent_docs,
        }

    async def aretrieve(self, query: str, *, k: int = 6, filter: dict[str, Any] | None = None) -> dict[str, Any]:
        return await asyncio.to_thread(self.retrieve, query, k=k, filter=filter)

    def _fetch_parents_sync(self, query: str, parent_order: list[str]) -> list[Any]:
        parents: list[Any] = []
        for pid in parent_order:
            pf = _parent_filter(pid)
            try:
                hits = self.vectorstore.similarity_search(query, k=3, filter=pf)
            except TypeError:
                hits = self.vectorstore.similarity_search(query, k=10)
                hits = [h for h in hits if (h.metadata or {}).get("chunk_type") == "parent" and str((h.metadata or {}).get("parent_id")) == pid]
            if hits:
                parents.append(hits[0])
            else:
                logger.debug("ParentChildRetriever: липсва parent за parent_id=%s", pid)
        return parents


def _ordered_unique_parent_ids(child_docs: list[Any], *, limit: int) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for d in child_docs:
        pid = (getattr(d, "metadata", None) or {}).get("parent_id")
        if not pid:
            continue
        s = str(pid)
        if s not in seen:
            seen.add(s)
            out.append(s)
            if len(out) >= limit:
                break
    return out
