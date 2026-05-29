"""Unit tests for RAGEngine.merge_retrieval_filter (no vector DB)."""

from __future__ import annotations

from ai.rag.engine import RAGEngine


def test_merge_retrieval_filter_explicit_wins_on_overlap() -> None:
	base = {"course": "wheat", "region": "north"}
	merged = RAGEngine.merge_retrieval_filter(base, culture="barley", region="south")
	assert merged is not None
	assert merged["course"] == "wheat"
	assert merged["region"] == "north"


def test_merge_retrieval_filter_convenience_fills_missing() -> None:
	merged = RAGEngine.merge_retrieval_filter(None, culture="corn", difficulty="intermediate")
	assert merged is not None
	assert merged.get("course") == "corn"
	assert merged.get("difficulty") == "intermediate"


def test_merge_retrieval_filter_empty_returns_none() -> None:
	assert RAGEngine.merge_retrieval_filter(None) is None
