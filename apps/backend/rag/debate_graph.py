"""LangGraph debate pipeline: Market → Risk → Crop → Critic → Orchestrator (class-based agents)."""

from agents import CriticAgent, CropAgent, MarketAgent, OrchestratorAgent, RiskAgent
from core.llm import llm
from langgraph.graph import END, StateGraph
from states.debate_state import DebateState


def build_debate_graph():
    workflow = StateGraph(DebateState)

    market = MarketAgent(llm=llm)
    risk = RiskAgent(llm=llm)
    crop = CropAgent(llm=llm)
    critic = CriticAgent(llm=llm)
    orchestrator_agent = OrchestratorAgent(llm=llm)

    workflow.add_node("market_agent", market)
    workflow.add_node("risk_agent", risk)
    workflow.add_node("crop_agent", crop)
    workflow.add_node("critic_agent", critic)
    workflow.add_node("orchestrator", orchestrator_agent)

    workflow.set_entry_point("market_agent")
    workflow.add_edge("market_agent", "risk_agent")
    workflow.add_edge("risk_agent", "crop_agent")
    workflow.add_edge("crop_agent", "critic_agent")
    workflow.add_edge("critic_agent", "orchestrator")
    workflow.add_edge("orchestrator", END)

    return workflow.compile()


debate_graph = build_debate_graph()


async def ask_with_debate(question: str, user_id: str, farm_profile: dict):
    from retriever import get_retriever

    filters: dict = {}
    cultures = farm_profile.get("cultures") or []
    if cultures and cultures[0]:
        filters["course"] = cultures[0]
    if farm_profile.get("region"):
        filters["region"] = farm_profile["region"]

    rag = get_retriever().get_context(question, filters=filters or None)
    rag_context = rag.get("context", "") or ""
    rag_sources = rag.get("sources", [])
    if not isinstance(rag_sources, list):
        rag_sources = []

    initial_state = {
        "question": question,
        "farm_profile": farm_profile,
        "culture": farm_profile.get("cultures", [""])[0] if farm_profile.get("cultures") else "",
        "region": farm_profile.get("region", ""),
        "debate_rounds": 1,
        "max_rounds": 2,
        "agent_opinions": {},
        "critic_feedback": {},
        "messages": [],
        "rag_context": rag_context,
        "rag_sources": rag_sources,
        "final_answer": "",
        "consensus_level": "",
        "key_risks": [],
        "recommendations": [],
        "debate_history": [],
    }

    config = {"configurable": {"thread_id": f"debate_{user_id}"}}

    result = await debate_graph.ainvoke(initial_state, config)
    return {
        "final_answer": result.get("final_answer", ""),
        "consensus_level": result.get("consensus_level", "medium"),
        "debate_history": result.get("debate_history", []),
        "sources": rag_sources,
    }
