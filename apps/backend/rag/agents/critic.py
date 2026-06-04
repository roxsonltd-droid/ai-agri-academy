"""Critic Agent: reviews specialist opinions for contradictions, risk, and SME fit."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage
from states.debate_state import DebateState

from .base import BaseAgent


class CriticAgent(BaseAgent):
    """Aggregates ``agent_opinions``, writes structured critique to ``critic_feedback``."""

    display_name = "Critic Agent"

    def build_critique_prompt(self, state: DebateState) -> str:
        opinions = state.get("agent_opinions") or {}
        opinions_text = "\n\n".join(
            f"{key.upper()} AGENT:\n{text}" for key, text in opinions.items()
        )
        question = state.get("question", "")
        rag = (state.get("rag_context") or "").strip()
        grounding = rag[:4000] if rag else "(Няма извлечен Academy контекст.)"
        return f"""
Ти си Critic Agent в AgriNexus — строг, но конструктивен критик.

Въпрос: {question}

ОПОРА (откъси от Academy — провери дали мненията на агентите са съгласувани с тях):
{grounding}

МНЕНИЯ НА СПЕЦИАЛИСТИТЕ:
{opinions_text}

Твоята задача:
1. Намери **противоречия** между агентите
2. Посочи **нереалистични** или **твърде рискови** препоръки
3. Провери дали съветите са подходящи за **малки и средни фермери** в България
4. Провери дали специалистите **не излизат далеч** от опората от Academy, когато тя е налична
5. Предложи как да се подобрят отговорите
6. Оцени общата увереност (висока / средна / ниска)

Бъди обективен, честен и практичен.
""".strip()

    async def __call__(self, state: DebateState) -> dict[str, Any]:
        prompt = self.build_critique_prompt(state)
        response = self.llm.invoke([HumanMessage(content=prompt)])
        text = getattr(response, "content", str(response))
        critic_feedback = dict(state.get("critic_feedback") or {})
        critic_feedback["critic"] = text
        return {
            "critic_feedback": critic_feedback,
            "messages": [self._ai_message(text)],
        }
