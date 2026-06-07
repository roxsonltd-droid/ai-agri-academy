"""Market Intelligence агент."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage

from ai.debate.agents.base import BaseAgent
from ai.debate.prompts import get_prompt
from ai.debate.state import DebateState


class MarketAgent(BaseAgent):
    name = "Market Intelligence"
    icon = "📈"

    async def run(self, state: DebateState) -> dict[str, Any]:
        opinions = dict(state.get("agent_opinions") or {})
        own = opinions.pop("market", None)
        prompt = get_prompt(
            agent_type="market",
            question=state.get("question", ""),
            culture=state.get("culture"),
            region=state.get("region"),
            previous_opinions=opinions or None,
            critic_feedback=state.get("critic_feedback"),
            rag_context=state.get("rag_context") or "",
        )
        if own:
            prompt = f"{prompt}\n\nТвоето мнение от по-рано в този рунд (ако е релевантно — прегледай):\n{own}"

        response = self.llm.invoke([HumanMessage(content=prompt)])
        opinion = getattr(response, "content", str(response))
        return {
            "agent_opinions": {"market": opinion},
            "messages": [self.format_opinion(opinion, state.get("current_round") or 1)],
        }
