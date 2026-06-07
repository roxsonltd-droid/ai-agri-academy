from operator import add
from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_core.messages import BaseMessage


class DebateState(TypedDict):
    question: str
    farm_profile: Dict
    culture: Optional[str]
    region: Optional[str]
    # Academy RAG (filled before graph run; specialists read ``rag_context``)
    rag_context: str
    rag_sources: List[Dict[str, Any]]

    messages: Annotated[List[BaseMessage], add]
    agent_opinions: Dict[str, str]           # Мненията на специализираните агенти
    critic_feedback: Dict[str, str]          # Критиката на Critic Agent
    debate_rounds: int
    max_rounds: int

    final_answer: str
    consensus_level: str                     # full / partial / low
    key_risks: List[str]
    recommendations: List[Dict]
    debate_history: List[Dict[str, str]]
