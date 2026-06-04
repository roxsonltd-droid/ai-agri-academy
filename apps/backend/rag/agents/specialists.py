"""Domain agents: Market, Risk, Crop — shared specialist pipeline over ``generate_prompt``."""

from __future__ import annotations

from abc import abstractmethod
from typing import Any

from prompts import generate_prompt
from states.debate_state import DebateState

from .base import BaseAgent


class SpecialistAgent(BaseAgent):
    """One opinion slot in ``agent_opinions`` + one AIMessage."""

    prompt_template_name: str
    opinion_key: str

    @abstractmethod
    def prompt_kwargs(self, state: DebateState) -> dict[str, Any]:
        """Kwargs passed to ``generate_prompt`` (without ``context`` — added from RAG)."""

    @staticmethod
    def academy_context(state: DebateState) -> str:
        raw = (state.get("rag_context") or "").strip()
        if raw:
            return raw
        return (
            "(Няма извлечен текст от Academy за този филтър — отговори консервативно и "
            "посочи накратко, че липсва локален учебен материал.)"
        )

    async def __call__(self, state: DebateState) -> dict[str, Any]:
        kwargs = dict(self.prompt_kwargs(state))
        kwargs["context"] = self.academy_context(state)
        prompt = generate_prompt(self.prompt_template_name, **kwargs)
        response = self.llm.invoke(prompt)
        text = getattr(response, "content", str(response))
        opinions = dict(state.get("agent_opinions") or {})
        opinions[self.opinion_key] = text
        return {
            "agent_opinions": opinions,
            "messages": [self._ai_message(text)],
        }


class MarketAgent(SpecialistAgent):
    display_name = "Market Agent"
    prompt_template_name = "market_intelligence"
    opinion_key = "market"

    def prompt_kwargs(self, state: DebateState) -> dict[str, Any]:
        return {
            "question": state.get("question", ""),
            "culture": state.get("culture", ""),
        }


class RiskAgent(SpecialistAgent):
    display_name = "Risk Agent"
    prompt_template_name = "risk_weather"
    opinion_key = "risk"

    def prompt_kwargs(self, state: DebateState) -> dict[str, Any]:
        return {
            "question": state.get("question", ""),
            "culture": state.get("culture", ""),
            "region": state.get("region", ""),
        }


class CropAgent(SpecialistAgent):
    display_name = "Crop Expert"
    prompt_template_name = "crop_expert"
    opinion_key = "crop"

    def prompt_kwargs(self, state: DebateState) -> dict[str, Any]:
        return {
            "question": state.get("question", ""),
            "culture": state.get("culture", ""),
            "region": state.get("region", ""),
        }
