"""Final synthesis after specialists + critic."""

from __future__ import annotations

from typing import Any

from states.debate_state import DebateState

from .base import BaseAgent


class OrchestratorAgent(BaseAgent):
    display_name = "Orchestrator"

    @staticmethod
    def _sources_lines(state: DebateState) -> str:
        src = state.get("rag_sources") or []
        if not isinstance(src, list) or not src:
            return "(Няма списък с източници от Academy.)"
        lines: list[str] = []
        for i, item in enumerate(src[:12], start=1):
            if not isinstance(item, dict):
                continue
            topic = str(item.get("topic", "") or "").strip()
            course = str(item.get("course", "") or "").strip()
            path = str(item.get("source", "") or "").strip()
            parts = [p for p in (topic, course, path) if p]
            if parts:
                lines.append(f"{i}. " + " — ".join(parts))
        return "\n".join(lines) if lines else "(Няма структурирани източници.)"

    def build_synthesis_prompt(self, state: DebateState) -> str:
        critic_input = (state.get("critic_feedback") or {}).get("critic", "")
        opinions = "\n\n".join(
            f"{key.upper()} AGENT:\n{text}"
            for key, text in (state.get("agent_opinions") or {}).items()
        )
        question = state.get("question", "")
        sources_block = self._sources_lines(state)
        return f"""
Ти си Orchestrator Agent.

ВЪПРОС: {question}

МНЕНИЯ НА АГЕНТИТЕ:
{opinions}

КРИТИКА:
{critic_input}

ИЗТОЧНИЦИ ОТ ACADEMY (цитирай релевантните в края на отговора, ако са полезни):
{sources_block}

Създай **финален практически отговор** за фермера:
- Вземи предвид критиката
- Балансирай мненията
- Дай ясни, actionable препоръки
- Посочи рисковете
- Завърши с приоритетни стъпки
- В края добави кратък раздел „Източници“ с препратки към учебните теми/файлове от списъка по-горе, когато са приложими
""".strip()

    async def __call__(self, state: DebateState) -> dict[str, Any]:
        prompt = self.build_synthesis_prompt(state)
        final_response = self.llm.invoke(prompt)
        text = getattr(final_response, "content", str(final_response))
        critic_input = (state.get("critic_feedback") or {}).get("critic", "")
        consensus = "high" if "висока" in critic_input.lower() else "medium"
        return {
            "final_answer": text,
            "consensus_level": consensus,
            "debate_history": [
                {"agent": "Market", "content": (state.get("agent_opinions") or {}).get("market", "")},
                {"agent": "Risk", "content": (state.get("agent_opinions") or {}).get("risk", "")},
                {"agent": "Crop", "content": (state.get("agent_opinions") or {}).get("crop", "")},
                {"agent": "Critic", "content": critic_input},
            ],
        }
