"""RAG cache JSON serde (без Redis)."""

from __future__ import annotations

from langchain_core.documents import Document

from ai.rag.rag_cache_serde import rag_pack_to_storable, storable_to_rag_pack


def test_rag_pack_roundtrip_flat() -> None:
    pack = {
        "context": "a\n\n---\n\nb",
        "documents": [
            Document(page_content="hello", metadata={"course": "wheat", "n": 1}),
            Document(page_content="world", metadata={}),
        ],
        "used_compression": False,
        "used_filter": {"course": "wheat"},
    }
    st = rag_pack_to_storable(pack)
    out = storable_to_rag_pack(st)
    assert out is not None
    assert out["context"] == pack["context"]
    assert out["used_filter"] == {"course": "wheat"}
    assert len(out["documents"]) == 2
    assert out["documents"][0].page_content == "hello"
    assert out["documents"][0].metadata.get("course") == "wheat"


def test_rag_pack_roundtrip_parent_child_keys() -> None:
    parent = Document(page_content="P", metadata={"chunk_type": "parent", "parent_id": "1"})
    child = Document(page_content="C", metadata={"chunk_type": "child", "parent_id": "1"})
    pack = {
        "context": "ctx",
        "documents": [parent],
        "child_docs": [child],
        "used_compression": False,
    }
    st = rag_pack_to_storable(pack)
    out = storable_to_rag_pack(st)
    assert out is not None
    assert len(out["child_docs"]) == 1
    assert out["child_docs"][0].page_content == "C"
