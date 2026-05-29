"""Тестове за contextual compression (без реален vector store)."""

from __future__ import annotations

from langchain_core.documents import Document

from ai.rag.compression import AgriContextualCompressor


def test_compress_documents_fallback_when_llm_returns_none(monkeypatch) -> None:
    c = AgriContextualCompressor()

    def _none(_q: str, _p: str) -> str | None:
        return None

    monkeypatch.setattr(c, "_extract_relevant", _none)
    docs = [
        Document(page_content="alpha " * 50, metadata={"course": "w"}),
        Document(page_content="beta " * 50, metadata={"course": "w"}),
    ]
    out = c.compress_documents("въпрос", docs)
    assert len(out) == 2
    assert out[0].page_content.startswith("alpha")
