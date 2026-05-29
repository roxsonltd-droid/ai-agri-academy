"""Embedding-базиран семантичен chunker (Greg Kamradt / LangChain ``SemanticChunker``) + recursive fallback."""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


def _fallback_splitter() -> Any:
    from ai.rag.chunkers.fallback_splitter import build_recursive_splitter

    return build_recursive_splitter(
        chunk_size=int(os.getenv("ACADEMY_SEMANTIC_FALLBACK_CHUNK_SIZE", "800")),
        chunk_overlap=int(os.getenv("ACADEMY_SEMANTIC_FALLBACK_CHUNK_OVERLAP", "150")),
        separators=["\n\n## ", "\n\n### ", "\n\n", "\n"],
        add_start_index=True,
    )


class AgriSemanticChunker:
    """
    Първо опитва ``SemanticChunker`` (изисква ``langchain-experimental`` + embeddings).
    При грешка, твърде големи чънкове или липсващ пакет — ``RecursiveCharacterTextSplitter``.
    """

    def __init__(self, embeddings: Any | None = None) -> None:
        self._embeddings_override = embeddings
        self._semantic: Any | None = None
        self._semantic_unavailable: bool = False
        self._fallback = _fallback_splitter()

    def _embeddings(self) -> Any:
        if self._embeddings_override is not None:
            return self._embeddings_override
        from ai.rag.embeddings import get_embeddings

        return get_embeddings()

    def _get_semantic_splitter(self) -> Any | None:
        if self._semantic_unavailable:
            return None
        if self._semantic is not None:
            return self._semantic
        try:
            from langchain_experimental.text_splitter import SemanticChunker
        except ImportError as e:
            logger.warning(
                "SemanticChunker недостъпен (%s). Инсталирай langchain-experimental или ползвай ACADEMY_CHUNK_STRATEGY=recursive.",
                e,
            )
            self._semantic_unavailable = True
            return None

        bp = float(os.getenv("ACADEMY_SEMANTIC_BREAKPOINT_PERCENTILE", "85"))
        min_chars = int(os.getenv("ACADEMY_SEMANTIC_MIN_CHARS", "200"))
        self._semantic = SemanticChunker(
            embeddings=self._embeddings(),
            breakpoint_threshold_type="percentile",
            breakpoint_threshold_amount=bp,
            min_chunk_size=min_chars,
            add_start_index=True,
        )
        return self._semantic

    def split_documents(self, docs: list[Any]) -> list[Any]:
        sc = self._get_semantic_splitter()
        max_len = int(os.getenv("ACADEMY_SEMANTIC_FALLBACK_MAX_CHARS", "1500"))
        out: list[Any] = []
        for doc in docs:
            base_meta = dict(getattr(doc, "metadata", None) or {})
            used_semantic = False
            chunks: list[Any]
            if sc is None:
                chunks = self._fallback.split_documents([doc])
            else:
                try:
                    chunks = sc.split_documents([doc])
                    if any(len(c.page_content or "") > max_len for c in chunks):
                        logger.debug(
                            "Semantic chunker даде чънк > %s символа — fallback към recursive за този документ.",
                            max_len,
                        )
                        chunks = self._fallback.split_documents([doc])
                    else:
                        used_semantic = True
                except Exception as e:
                    logger.warning("Semantic split неуспешен (%s) — recursive fallback.", e)
                    chunks = self._fallback.split_documents([doc])

            for chunk in chunks:
                cm = {**base_meta, **(getattr(chunk, "metadata", None) or {})}
                chunk.metadata = cm
                chunk.metadata["chunk_type"] = "semantic" if used_semantic else "recursive"
                chunk.metadata["chunk_size"] = len(chunk.page_content or "")
                chunk.metadata.setdefault("course", base_meta.get("course"))
                chunk.metadata.setdefault("module", base_meta.get("module"))
            out.extend(chunks)
        return out
