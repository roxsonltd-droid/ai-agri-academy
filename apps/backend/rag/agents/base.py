"""Abstract base for debate / tutor agents (LangGraph node callables)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from langchain_core.messages import AIMessage
from states.debate_state import DebateState


class BaseAgent(ABC):
    """Minimal contract: async ``__call__(state)`` → partial ``DebateState`` update."""

    display_name: str = "Agent"

    def __init__(self, llm: Any | None = None) -> None:
        if llm is None:
            from core.llm import llm as default_llm

            llm = default_llm
        self.llm = llm

    @abstractmethod
    async def __call__(self, state: DebateState) -> dict[str, Any]:
        """Return keys to merge into graph state (e.g. ``agent_opinions``, ``messages``)."""

    def _ai_message(self, content: str) -> AIMessage:
        return AIMessage(content=f"[{self.display_name}]: {content}")
