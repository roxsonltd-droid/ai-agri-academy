"""JSON-сериализация на RAG ``retrieve`` резултати за Redis (без pickle на LangChain обекти)."""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.documents import Document

logger = logging.getLogger(__name__)


def _doc_to_row(d: Any) -> dict[str, Any]:
	text = getattr(d, "page_content", None) or ""
	meta = getattr(d, "metadata", None) or {}
	if not isinstance(meta, dict):
		meta = {}
	return {"page_content": str(text), "metadata": meta}


def _rows_to_docs(rows: list[Any]) -> list[Document]:
	out: list[Document] = []
	for r in rows:
		if not isinstance(r, dict):
			continue
		out.append(
			Document(
				page_content=str(r.get("page_content") or ""),
				metadata=dict(r.get("metadata") or {}),
			)
		)
	return out


def rag_pack_to_storable(pack: dict[str, Any]) -> dict[str, Any]:
	"""Подготвя dict за ``json.dumps`` (metadata с ``default=str`` при запис в Redis)."""
	out: dict[str, Any] = {
		"v": 1,
		"context": str(pack.get("context") or ""),
		"used_compression": bool(pack.get("used_compression")),
		"documents": [_doc_to_row(d) for d in (pack.get("documents") or [])],
	}
	if pack.get("used_filter") is not None:
		out["used_filter"] = pack.get("used_filter")
	for extra in ("child_docs", "parent_docs"):
		if extra in pack and pack[extra] is not None:
			out[extra] = [_doc_to_row(d) for d in (pack.get(extra) or [])]
	return out


def storable_to_rag_pack(data: dict[str, Any]) -> dict[str, Any] | None:
	"""Възстановява RAG pack с ``Document`` списъци."""
	if not isinstance(data, dict) or data.get("v") != 1:
		return None
	try:
		out: dict[str, Any] = {
			"context": str(data.get("context") or ""),
			"used_compression": bool(data.get("used_compression")),
			"documents": _rows_to_docs(list(data.get("documents") or [])),
		}
		if "used_filter" in data:
			out["used_filter"] = data["used_filter"]
		for extra in ("child_docs", "parent_docs"):
			if extra in data:
				out[extra] = _rows_to_docs(list(data.get(extra) or []))
		return out
	except Exception as e:
		logger.warning("storable_to_rag_pack failed: %s", e)
		return None


def stable_json_for_cache_key(obj: dict[str, Any]) -> str:
	return json.dumps(obj, sort_keys=True, default=str, ensure_ascii=False)
