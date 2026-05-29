"""Тестове за йерархично чънкване (без vector store)."""

from __future__ import annotations

import pytest
from langchain_core.documents import Document


@pytest.fixture(autouse=True)
def _minimal_chunker_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ACADEMY_USE_MINIMAL_CHUNKER", "true")


def test_hierarchical_parent_child_metadata() -> None:
    from ai.rag.chunkers.hierarchical import HierarchicalChunker

    body = (
        "## Въведение\n\nКратък текст.\n\n## Торене\n\n"
        + ("Препоръки за азот. " * 80)
        + "\n\n## Заключение\n\nКрай."
    )
    doc = Document(page_content=body, metadata={"course": "wheat", "module": "nutrition"})
    hc = HierarchicalChunker()
    chunks = hc.create_hierarchical_chunks([doc])

    parents = [c for c in chunks if c.metadata.get("chunk_type") == "parent"]
    children = [c for c in chunks if c.metadata.get("chunk_type") == "child"]
    assert parents, "очакваме поне един parent"
    assert children, "очакваме поне един child"

    parent_ids = {p.metadata["parent_id"] for p in parents}
    group_ids = {c.metadata.get("hierarchical_group_id") for c in chunks}
    assert len(group_ids) == 1
    gid = next(iter(group_ids))
    for ch in children:
        assert ch.metadata.get("parent_id") in parent_ids
        assert ch.metadata.get("hierarchical_group_id") == gid
        assert ch.metadata.get("course") == "wheat"
