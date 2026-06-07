"""Critic: обобщава мненията и подготвя следващ рунд или финал."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage

from ai.debate.agents.base import BaseAgent
from ai.debate.state import DebateState


class CriticAgent(BaseAgent):
    name = "Critic"
    icon = "🔍"

    def _critique_prompt(self, state: DebateState) -> str:
        opinions = state.get("agent_opinions") or {}
        block = "\n\n".join(f"**{k}**:\n{v}" for k, v in opinions.items())
        rag = (state.get("rag_context") or "").strip()[:6000]
        grounding = rag or "(Няма Academy контекст.)"
        r = state.get("current_round") or 1
        mx = state.get("max_rounds") or 1
        return f"""
Ти си Critic в AI Agri Academy — строг, но конструктивен.

Въпрос: {state.get("question", "")}
Рунд: {r} / {mx}

Опора (Academy / RAG):
{grounding}

Мнения на специалистите:
{block}

Задачи:
1. Противоречия между агентите
2. Прекомерен риск или нереалистични обещания
3. Съответствие с опората от Academy (когато е налична)
4. Подходящост за малки/средни фермери в България
5. Какво да се коригира в следващ рунд (ако има такъв)
6. Една дума за увереност в края: CONFIDENCE: висока|средна|ниска

Бъди кратък и практичен.
""".strip()

    async def run(self, state: DebateState) -> dict[str, Any]:
        prompt = self._critique_prompt(state)
        response = self.llm.invoke([HumanMessage(content=prompt)])
        text = getattr(response, "content", str(response))
        cr = int(state.get("current_round") or 1)
        mx = int(state.get("max_rounds") or 1)

        update: dict[str, Any] = {
            "critic_feedback": text,
            "messages": [self.format_opinion(text, cr)],
        }
        if cr < mx:
            update["current_round"] = cr + 1
        return update
