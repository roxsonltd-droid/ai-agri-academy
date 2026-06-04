"""Chunking стратегии (recursive + smart metadata без тежки embeddings)."""

from __future__ import annotations

import pytest
from langchain_core.documents import Document


@pytest.fixture(autouse=True)
def _minimal_chunker_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Избягва тежки LangChain/native импорти в проблемни CI/локални среди."""
    monkeypatch.setenv("ACADEMY_USE_MINIMAL_CHUNKER", "true")


def test_recursive_chunker_splits() -> None:
    from ai.rag.chunker import get_chunker

    c = get_chunker("recursive")
    body = "Въведение.\n\n## Тема\n\n" + ("дълъг текст. " * 200)
    docs = [Document(page_content=body, metadata={"course": "demo"})]
    out = c.split_documents(docs)
    assert len(out) >= 1
    assert all(getattr(x, "page_content", "") for x in out)


def test_agri_smart_importance_from_semantic_layer() -> None:
    from ai.rag.chunkers.agri_chunker import AgriSmartChunker

    c = AgriSmartChunker()

    def fake_split(docs: list[Document]) -> list[Document]:
        return [
            Document(page_content="Общ преглед на посевите.", metadata={"course": "wheat"}),
            Document(page_content="Препоръки за торене с азот през пролетта.", metadata={"course": "wheat"}),
        ]

    c._semantic.split_documents = fake_split  # type: ignore[method-assign]

    out = c.split_documents([Document(page_content="x", metadata={})])
    assert out[0].metadata.get("importance") == "normal"
    assert out[1].metadata.get("importance") == "high"
