"""Финален синтез след всички рундове на дебата."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage

from ai.debate.llm import get_debate_llm
from ai.debate.state import DebateState


def _sources_block(state: DebateState) -> str:
    src = state.get("rag_sources") or []
    if not isinstance(src, list) or not src:
        return "(Няма структурирани източници от Academy.)"
    lines: list[str] = []
    for i, item in enumerate(src[:15], start=1):
        if not isinstance(item, dict):
            continue
        parts = [str(item.get(k) or "").strip() for k in ("topic", "course", "source")]
        parts = [p for p in parts if p]
        if parts:
            lines.append(f"{i}. " + " — ".join(parts))
    return "\n".join(lines) if lines else "(Няма източници.)"


def _consensus_from_critic(text: str) -> str:
    t = (text or "").lower()
    if "confidence: висока" in t or "увереност: висока" in t or "висока" in t[-80:]:
        return "high"
    if "ниска" in t[-120:] or "confidence: ниска" in t:
        return "low"
    return "medium"


async def orchestrator_node(state: DebateState) -> dict[str, Any]:
    llm = get_debate_llm()
    opinions = state.get("agent_opinions") or {}
    opinions_txt = "\n\n".join(f"{k.upper()}:\n{v}" for k, v in opinions.items())
    critic = state.get("critic_feedback") or "—"

    prompt = f"""
Ти си Orchestrator на AI Agri Academy.

Въпрос: {state.get("question", "")}
Рундове дебат: завършени {state.get("max_rounds", 1)} цикъла (market → risk → crop → critic).

Профил (обобщено): {state.get("farm_profile", {})}

Мнения (последен рунд):
{opinions_txt}

Критика (последна):
{critic}

Източници (Academy):
{_sources_block(state)}

Създай **финален, практичен и балансиран отговор** за фермера:
- Синтезирай без дублиране
- Ясни стъпки и рискове
- В края кратък раздел „Източници“ към темите от списъка, ако са релевантни
""".strip()

    response = llm.invoke([HumanMessage(content=prompt)])
    text = getattr(response, "content", str(response))
    critic_raw = state.get("critic_feedback") or ""

    return {
        "final_answer": text,
        "consensus_level": _consensus_from_critic(str(critic_raw)),
    }
