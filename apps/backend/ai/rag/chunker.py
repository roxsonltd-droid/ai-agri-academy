"""Smart chunking за Academy документи."""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_STRATEGY_CACHE: dict[str, Any] = {}


def _recursive_chunker() -> Any:
    from ai.rag.chunkers.fallback_splitter import build_recursive_splitter

    return build_recursive_splitter(
        chunk_size=int(os.getenv("ACADEMY_RECURSIVE_CHUNK_SIZE", "900")),
        chunk_overlap=int(os.getenv("ACADEMY_RECURSIVE_CHUNK_OVERLAP", "150")),
        separators=["\n\n## ", "\n\n### ", "\n\n#### ", "\n\n", "\n", " ", ""],
        add_start_index=True,
    )


def get_chunker(strategy: str | None = None) -> Any:
    """
    Връща обект с ``split_documents(docs: list[Document]) -> list[Document]``.

    Env ``ACADEMY_CHUNK_STRATEGY`` (или аргумент ``strategy``):

    - ``recursive`` — класически ``RecursiveCharacterTextSplitter`` (по подразбиране).
    - ``semantic`` — ``SemanticChunker`` + fallback (изисква ``langchain-experimental``).
    - ``smart`` — семантично + metadata ``importance`` по агро ключови думи.
    - ``hierarchical`` — parent + child чънкове (виж ``HierarchicalChunker``); за retrieval ползвай ``ACADEMY_RETRIEVAL_MODE=parent_child``.

    За LLM-базирано чънкване виж ``ai.rag.chunkers.llm_chunker.LLMSemanticChunker`` (отделен pipeline).
    """
    strat = (strategy or os.getenv("ACADEMY_CHUNK_STRATEGY", "recursive")).strip().lower()
    if strat not in ("recursive", "semantic", "smart", "hierarchical"):
        logger.warning("Неизвестен ACADEMY_CHUNK_STRATEGY=%s — ползвам recursive.", strat)
        strat = "recursive"

    if strat == "recursive":
        return _recursive_chunker()

    if strat not in _STRATEGY_CACHE:
        if strat == "semantic":
            from ai.rag.chunkers.semantic_chunker import AgriSemanticChunker

            _STRATEGY_CACHE[strat] = AgriSemanticChunker()
        elif strat == "hierarchical":
            from ai.rag.chunkers.hierarchical import HierarchicalChunker

            _STRATEGY_CACHE[strat] = HierarchicalChunker()
        else:
            from ai.rag.chunkers.agri_chunker import AgriSmartChunker

            _STRATEGY_CACHE[strat] = AgriSmartChunker()

    return _STRATEGY_CACHE[strat]
