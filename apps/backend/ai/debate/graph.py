"""LangGraph: Market → Risk → Crop → Critic → (още рундове) → Orchestrator."""

from __future__ import annotations

import logging
from typing import Any, Literal

from langgraph.graph import END, StateGraph

from ai.debate.agents.critic import CriticAgent
from ai.debate.agents.crop import CropAgent
from ai.debate.agents.market import MarketAgent
from ai.debate.agents.risk import RiskAgent
from ai.debate.orchestrator import orchestrator_node
from ai.debate.state import DebateState

logger = logging.getLogger(__name__)

_compiled: Any | None = None


def should_continue(state: DebateState) -> Literal["market", "orchestrator"]:
    cr = int(state.get("current_round") or 1)
    mx = int(state.get("max_rounds") or 1)
    if cr >= mx:
        return "orchestrator"
    return "market"


def build_debate_graph() -> Any:
    from ai.debate.llm import get_debate_llm

    llm = get_debate_llm()
    market_agent = MarketAgent(llm)
    risk_agent = RiskAgent(llm)
    crop_agent = CropAgent(llm)
    critic_agent = CriticAgent(llm)

    workflow = StateGraph(DebateState)

    workflow.add_node("market", market_agent.run)
    workflow.add_node("risk", risk_agent.run)
    workflow.add_node("crop", crop_agent.run)
    workflow.add_node("critic", critic_agent.run)
    workflow.add_node("orchestrator", orchestrator_node)

    workflow.set_entry_point("market")
    workflow.add_edge("market", "risk")
    workflow.add_edge("risk", "crop")
    workflow.add_edge("crop", "critic")
    workflow.add_conditional_edges(
        "critic",
        should_continue,
        {
            "market": "market",
            "orchestrator": "orchestrator",
        },
    )
    workflow.add_edge("orchestrator", END)

    return workflow.compile()


def get_debate_graph() -> Any:
    global _compiled
    if _compiled is None:
        _compiled = build_debate_graph()
    return _compiled


def _debate_history_from_state(state: DebateState) -> list[dict[str, str]]:
    opinions = state.get("agent_opinions") or {}
    hist: list[dict[str, str]] = []
    for key in ("market", "risk", "crop"):
        if key in opinions:
            hist.append({"agent": key, "content": opinions[key]})
    cf = state.get("critic_feedback")
    if cf:
        hist.append({"agent": "critic", "content": str(cf)})
    return hist


async def run_academy_debate(
    *,
    question: str,
    user_id: str,
    farm_profile: dict[str, Any],
    max_rounds: int = 3,
    culture: str | None = None,
    region: str | None = None,
) -> dict[str, Any]:
    """RAG контекст + ``ainvoke`` на много-рундовия граф."""
    mx = max(1, min(int(max_rounds or 1), 8))

    cultures = farm_profile.get("cultures") or []
    c_from_profile = cultures[0] if cultures and cultures[0] else None
    culture_f = (culture or c_from_profile or "").strip() or None
    region_f = (region or farm_profile.get("region") or "").strip() or None

    filters: dict[str, Any] = {}
    if culture_f:
        filters["course"] = culture_f
    if region_f:
        filters["region"] = region_f

    rag_context = ""
    rag_sources: list[dict[str, Any]] = []
    try:
        from rag.retriever import get_retriever

        rag = get_retriever().get_context(question, filters=filters or None)
        if isinstance(rag, dict):
            rag_context = rag.get("context") or ""
            raw_sources = rag.get("sources", [])
            rag_sources = raw_sources if isinstance(raw_sources, list) else []
    except Exception:
        logger.warning("Academy retriever недостъпен — дебатът продължава без RAG контекст.")

    initial: DebateState = {
        "question": question,
        "farm_profile": farm_profile,
        "culture": culture_f,
        "region": region_f,
        "rag_context": rag_context,
        "rag_sources": rag_sources,
        "messages": [],
        "agent_opinions": {},
        "critic_feedback": None,
        "current_round": 1,
        "max_rounds": mx,
        "final_answer": None,
        "consensus_level": None,
    }

    graph = get_debate_graph()
    config = {"configurable": {"thread_id": f"ai_debate_{user_id}"}}
    try:
        result = await graph.ainvoke(initial, config)
    except Exception:
        logger.exception("run_academy_debate failed")
        raise

    return {
        "final_answer": result.get("final_answer") or "",
        "current_round": int(result.get("current_round") or mx),
        "max_rounds": mx,
        "consensus_level": result.get("consensus_level") or "medium",
        "debate_history": _debate_history_from_state(result),
        "sources": rag_sources,
    }
