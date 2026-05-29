"""LangGraph state за много-рундов дебат (AI Agri Academy)."""

from __future__ import annotations

from operator import add
from typing import Annotated, Any, TypedDict

from langchain_core.messages import BaseMessage


def merge_agent_opinions(
    left: dict[str, str] | None,
    right: dict[str, str] | None,
) -> dict[str, str]:
    """Слива частични updates на ``agent_opinions`` от всеки агент."""
    merged = dict(left or {})
    if right:
        merged.update(right)
    return merged


class DebateState(TypedDict, total=False):
    question: str
    farm_profile: dict[str, Any]
    culture: str | None
    region: str | None

    # Academy RAG (попълва се преди ``ainvoke``)
    rag_context: str
    rag_sources: list[dict[str, Any]]

    messages: Annotated[list[BaseMessage], add]
    agent_opinions: Annotated[dict[str, str], merge_agent_opinions]
    critic_feedback: str | None

    current_round: int
    max_rounds: int

    final_answer: str | None
    consensus_level: str | None
