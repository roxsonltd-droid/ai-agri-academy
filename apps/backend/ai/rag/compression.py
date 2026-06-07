"""Contextual compression след vector retrieval — LLM извлича релевантни откъси (пести токени).

Не зависи от ``langchain.retrievers.contextual_compression`` (често конфликтни версии на ``langchain`` пакети).
Логика: по-широко ``similarity_search`` → по документ LLM извличане → компресиран контекст.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from langchain_core.documents import Document
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)


def _max_compress_docs() -> int:
    try:
        return max(1, min(16, int(os.getenv("ACADEMY_COMPRESSION_MAX_DOCS", "8"))))
    except ValueError:
        return 8


def _fetch_k() -> int:
    try:
        return max(4, min(30, int(os.getenv("ACADEMY_COMPRESSION_FETCH_K", "12"))))
    except ValueError:
        return 12


def _passage_cap() -> int:
    try:
        return max(2000, min(24000, int(os.getenv("ACADEMY_COMPRESSION_PASSAGE_CHARS", "12000"))))
    except ValueError:
        return 12000


class AgriContextualCompressor:
    """
    Еквивалент на идеята за ``ContextualCompressionRetriever`` + ``LLMChainExtractor``:
    взима повече чънкове от vector store, после LLM оставя само релевантното към заявката.
    """

    def __init__(self, llm: Any | None = None) -> None:
        self._llm = llm

    def _llm_sync(self) -> Any:
        if self._llm is not None:
            return self._llm
        from rag.core.llm import get_llm

        return get_llm()

    def _extract_relevant(self, query: str, passage: str) -> str | None:
        llm = self._llm_sync()
        cap = _passage_cap()
        passage_trim = (passage or "")[:cap]
        prompt = (
            "Ти компресираш текст за RAG. От „Пасажа“ извади **само** изречения или кратки абзаци, "
            "които директно помагат да се отговори на „Въпроса“. Запази българския език; не добавяй нови факти. "
            "Ако нищо не е релевантно, отговори точно с един ред: NONE\n\n"
            f"Въпрос: {query}\n\nПасаж:\n{passage_trim}"
        )
        msg = HumanMessage(content=prompt)
        if hasattr(llm, "invoke"):
            r = llm.invoke([msg])
        else:
            r = llm.invoke(msg)
        text = (getattr(r, "content", None) or str(r) or "").strip()
        if not text or text.upper() == "NONE":
            return None
        return text

    def compress_documents(self, query: str, documents: list[Document]) -> list[Document]:
        if not documents:
            return []
        out: list[Document] = []
        for d in documents[: _max_compress_docs()]:
            raw = (d.page_content or "").strip()
            if not raw:
                continue
            excerpt = self._extract_relevant(query, raw)
            if excerpt:
                meta = dict(d.metadata or {})
                meta["compression"] = "llm_extract"
                out.append(Document(page_content=excerpt, metadata=meta))
        if not out:
            logger.debug("Contextual compression: празен резултат — fallback към първите 3 чънка.")
            return documents[:3]
        return out

    def retrieve_compressed(
        self,
        query: str,
        *,
        fetch_k: int | None = None,
        meta_filter: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        from ai.tools.rag_tool import get_rag_engine_singleton

        engine = get_rag_engine_singleton()
        engine.initialize(rebuild=False)
        fk = fetch_k if fetch_k is not None else _fetch_k()
        use_filter = meta_filter if meta_filter else None
        try:
            raw_docs = engine.similarity_search(query, k=fk, filter=use_filter)
        except TypeError:
            raw_docs = engine.similarity_search(query, k=fk)

        n_before = len(raw_docs)
        comp = self.compress_documents(query, raw_docs)
        n_after = len(comp)
        chars_before = sum(len(d.page_content or "") for d in raw_docs)
        chars_after = sum(len(d.page_content or "") for d in comp)
        ratio = f"{chars_after}/{chars_before} chars" if chars_before else "n/a"
        ctx = "\n\n---\n\n".join((d.page_content or "").strip() for d in comp if (d.page_content or "").strip())
        return {
            "compressed_context": ctx,
            "compressed_docs": comp,
            "documents": comp,
            "context": ctx,
            "original_chunk_count": n_before,
            "compressed_chunk_count": n_after,
            "compression_ratio": ratio,
        }
