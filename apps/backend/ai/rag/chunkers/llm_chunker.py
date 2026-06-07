"""LLM-базирано разделяне на текст на семантични единици (по-скъпо; за production при нужда)."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from langchain_core.documents import Document

logger = logging.getLogger(__name__)

_JSON_FENCE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


def _parse_json_chunks(raw: str) -> list[str] | None:
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        data = json.loads(raw)
        if isinstance(data, list) and all(isinstance(x, str) for x in data):
            parts = [x.strip() for x in data if x.strip()]
            return parts or None
    except json.JSONDecodeError:
        pass
    m = _JSON_FENCE.search(raw)
    if m:
        try:
            data = json.loads(m.group(1).strip())
            if isinstance(data, list) and all(isinstance(x, str) for x in data):
                parts = [x.strip() for x in data if x.strip()]
                return parts or None
        except json.JSONDecodeError:
            pass
    return None


class LLMSemanticChunker:
    """Асинхронно чънкване чрез LLM; при неуспех — един чънк с оригиналния текст."""

    def __init__(self, llm: Any | None = None) -> None:
        self._llm = llm

    def _get_llm(self) -> Any:
        if self._llm is not None:
            return self._llm
        from rag.core.llm import get_llm

        return get_llm()

    async def chunk_document(self, document: Document) -> list[Document]:
        from langchain_core.messages import HumanMessage

        text = document.page_content or ""
        max_in = int(__import__("os").getenv("ACADEMY_LLM_CHUNK_MAX_INPUT_CHARS", "12000"))
        if len(text) > max_in:
            text = text[:max_in] + "\n…"

        prompt = (
            "Раздели следния агрономически/учебен текст на **семантично завършени** части.\n"
            "Всяка част = една практическа идея или логически блок.\n"
            "Върни **само** валиден JSON: масив от низове (без markdown, без коментари).\n\n"
            f"Текст:\n{text}"
        )
        try:
            llm = self._get_llm()
            resp = await llm.ainvoke([HumanMessage(content=prompt)])
            raw = getattr(resp, "content", None) or str(resp)
        except Exception as e:
            logger.warning("LLM chunk_document неуспешен: %s", e)
            return [document]

        parts = _parse_json_chunks(str(raw))
        if not parts:
            logger.debug("LLM chunk parse failed — single-document fallback.")
            return [document]

        base = dict(document.metadata or {})
        out: list[Document] = []
        for i, p in enumerate(parts):
            meta = {**base, "chunk_type": "llm_semantic", "llm_chunk_index": i, "chunk_size": len(p)}
            out.append(Document(page_content=p, metadata=meta))
        return out
