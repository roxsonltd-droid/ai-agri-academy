"""LLM за дебат графа — преизползва ``rag.core.llm`` когато е наличен."""

from __future__ import annotations

from typing import Any


def get_debate_llm() -> Any:
    try:
        from rag.core.llm import get_llm

        return get_llm()
    except Exception:
        pass
    try:
        from rag.core.llm import llm as llm_singleton

        return llm_singleton
    except Exception:

        class _Dummy:
            def invoke(self, messages_or_prompt: object) -> Any:
                return type("R", (), {"content": "Задайте OPENAI_API_KEY / LLM_PROVIDER в .env за дебат LLM."})()

        return _Dummy()
