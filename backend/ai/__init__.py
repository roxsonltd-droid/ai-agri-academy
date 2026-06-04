"""
Academy AI layer: RAG (файлове + уроци) + LangGraph debate (Tutor / Critic).

Тежките модули се зареждат мързеливо при ``from ai import …``, за да не се чупи импортът при опционални зависимости.
"""

from __future__ import annotations

from typing import Any

__all__ = [
    "combined_academy_context",
    "invalidate_lesson_rag_index",
    "run_academy_debate",
]


def __getattr__(name: str) -> Any:
    if name == "combined_academy_context":
        from ai.academy_rag import combined_academy_context

        return combined_academy_context
    if name == "invalidate_lesson_rag_index":
        from ai.academy_rag import invalidate_lesson_rag_index

        return invalidate_lesson_rag_index
    if name == "run_academy_debate":
        from ai.academy_debate_graph import run_academy_debate

        return run_academy_debate
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
