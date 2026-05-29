"""Базов клас за дебат агенти (LangGraph async node)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage

from ai.debate.state import DebateState


class BaseAgent(ABC):
    name: str = "Agent"
    icon: str = "🤖"

    def __init__(self, llm: Any | None = None) -> None:
        if llm is None:
            from ai.debate.llm import get_debate_llm

            llm = get_debate_llm()
        self.llm = llm

    @abstractmethod
    async def run(self, state: DebateState) -> dict[str, Any]:
        """Връща частичен update към ``DebateState``."""

    def format_opinion(self, content: str, round_num: int) -> BaseMessage:
        label = f"{self.icon} [{self.name} — Round {round_num}]"
        return AIMessage(content=f"{label}\n{content}")
