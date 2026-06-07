"""Комбинация: семантично чънкване + леки агро евристики (важност по ключови думи)."""

from __future__ import annotations

from typing import Any

from ai.rag.chunkers.semantic_chunker import AgriSemanticChunker

_AGRI_KEYWORDS_BG = (
    "торене",
    "пръскане",
    "сеитба",
    "болест",
    "пестицид",
    "фунгицид",
    "herbicide",
    "fertilizer",
)


class AgriSmartChunker:
    """
    Обвива ``AgriSemanticChunker`` и маркира чънкове с ``importance=high`` при критични теми.
    Подходящо за приоритизиране при re-rank или филтри (metadata).
    """

    def __init__(self) -> None:
        self._semantic = AgriSemanticChunker()

    def split_documents(self, docs: list[Any]) -> list[Any]:
        chunks = self._semantic.split_documents(docs)
        for chunk in chunks:
            text = (chunk.page_content or "").lower()
            if any(w in text for w in _AGRI_KEYWORDS_BG):
                chunk.metadata["importance"] = "high"
            else:
                chunk.metadata.setdefault("importance", "normal")
        return chunks
