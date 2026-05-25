"""
Споделено състояние за бъдещ multi-teacher LangGraph граф.

Полетата са TypedDict за съвместимост с LangGraph StateGraph. Разширявайте с
LangChain message типове (напр. list[AnyMessage]) когато свържете графа с чат история.
"""

from __future__ import annotations

from typing import TypedDict


class MultiTeacherState(TypedDict, total=False):
    """Минимален чертеж — допълнете с messages, citations, tool_calls и т.н."""

    user_id: str
    session_id: str
    user_message: str
    active_teacher_id: str
    routing_notes: str
    scratchpad: str
    memory_context_bg: str
    rag_context: str
    final_answer: str
