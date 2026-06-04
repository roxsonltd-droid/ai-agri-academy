"""Fallback chunking когато LangChain ``RecursiveCharacterTextSplitter`` не може да се зареди (напр. проблемен ``sentence_transformers``)."""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


class MinimalWindowTextSplitter:
    """Фиксиран прозорец + overlap — съвместим с ``split_documents``."""

    def __init__(self, *, chunk_size: int, chunk_overlap: int) -> None:
        self.chunk_size = max(200, int(chunk_size))
        ov = int(chunk_overlap)
        self.chunk_overlap = max(0, min(ov, self.chunk_size - 1))

    def split_documents(self, docs: list[Any]) -> list[Any]:
        from langchain_core.documents import Document

        out: list[Document] = []
        for doc in docs:
            text = doc.page_content or ""
            base = dict(getattr(doc, "metadata", None) or {})
            i = 0
            while i < len(text):
                end = min(len(text), i + self.chunk_size)
                piece = text[i:end]
                meta = {**base, "start_index": i}
                out.append(Document(page_content=piece, metadata=meta))
                if end >= len(text):
                    break
                i += max(1, self.chunk_size - self.chunk_overlap)
        return out


def build_recursive_splitter(
    *,
    chunk_size: int,
    chunk_overlap: int,
    separators: list[str],
    add_start_index: bool = True,
) -> Any:
    """LangChain recursive splitter или ``MinimalWindowTextSplitter``."""
    if (os.getenv("ACADEMY_USE_MINIMAL_CHUNKER") or "").strip().lower() in ("1", "true", "yes"):
        return MinimalWindowTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    for mod_path, cls_name in (
        ("langchain.text_splitter", "RecursiveCharacterTextSplitter"),
        ("langchain_text_splitters.recursive_character_text_splitter", "RecursiveCharacterTextSplitter"),
    ):
        try:
            mod = __import__(mod_path, fromlist=[cls_name])
            ctor = getattr(mod, cls_name)
            return ctor(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=separators,
                length_function=len,
                add_start_index=add_start_index,
            )
        except Exception as e:
            logger.debug("RecursiveCharacterTextSplitter от %s: %s", mod_path, e)
    logger.warning(
        "LangChain RecursiveCharacterTextSplitter е недостъпен — ползвам MinimalWindowTextSplitter."
    )
    return MinimalWindowTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
