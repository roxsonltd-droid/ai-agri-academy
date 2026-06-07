from typing import Optional

from core.llm import llm
from debate_graph import ask_with_debate
from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from retriever import get_retriever

router = APIRouter(prefix="/tutor", tags=["Academy Tutor"])


class TutorRequest(BaseModel):
    question: str
    user_id: str
    culture: Optional[str] = None  # пшеница, домати и т.н.
    region: Optional[str] = None
    experience: Optional[str] = None  # beginner | intermediate | advanced (или свободен текст)
    farm_size_ha: Optional[float] = None
    tutor_role: Optional[str] = None  # main | expert | mentor | examiner


def generate_prompt(question: str, context: str, request: TutorRequest) -> str:
    try:
        from ai.tutors.prompts import build_academy_rag_tutor_prompt

        profile = {
            "experience": request.experience,
            "farm_size_ha": request.farm_size_ha,
            "culture": request.culture,
            "region": request.region,
        }
        return build_academy_rag_tutor_prompt(
            question=question,
            context=context,
            user_profile=profile,
            tutor_role=request.tutor_role,
        )
    except ImportError:
        return f"""
Ти си AgriNexus Academy Tutor — опитен, практичен и честен агроном съветник.

Контекст от Academy материалите:
{context}

Въпрос на фермера: {question}

Правила за отговор:
- Отговаряй на български език, с топъл и разбираем тон.
- Бъди практичен и конкретен.
- Ако нещо не е ясно от контекста — кажи го честно.
- В края добави източниците.
- Предложи actionable стъпки когато е възможно.

Отговор:
"""


class TutorResponse(BaseModel):
    answer: str
    sources: list
    confidence: float = 0.85
    retrieval: dict = Field(default_factory=dict)

@router.post("/chat", response_model=TutorResponse)
async def tutor_chat(request: TutorRequest):
    try:
        # Филтри
        filters = {}
        if request.culture:
            filters["course"] = request.culture
        if request.region:
            filters["region"] = request.region

        # Retrieval
        data = get_retriever().get_context(request.question, filters=filters)

        # LLM Prompt
        prompt = generate_prompt(request.question, data["context"], request)

        # Извикване на LLM (Grok, Claude, или локален)
        response = llm.invoke([HumanMessage(content=prompt)])

        return TutorResponse(
            answer=response.content,
            sources=data["sources"],
            confidence=0.88,
            retrieval=data.get("retrieval") or {},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DeepDebateRequest(BaseModel):
    question: str
    user_id: str
    useDebate: bool = True
    culture: Optional[str] = None
    region: Optional[str] = None

class DeepDebateResponse(BaseModel):
    final_answer: str
    consensus_level: str
    debate_history: list
    sources: list = Field(default_factory=list)

@router.post("/deep-debate", response_model=DeepDebateResponse)
async def tutor_deep_debate(request: DeepDebateRequest):
    farm_profile = {
        "cultures": [request.culture] if request.culture else [],
        "region": request.region
    }
    try:
        result = await ask_with_debate(request.question, request.user_id, farm_profile)
        return DeepDebateResponse(
            final_answer=result["final_answer"],
            consensus_level=result["consensus_level"],
            debate_history=result["debate_history"],
            sources=result.get("sources") or [],
        )
    except Exception as e:
        print("Deep debate error:", e)
        raise HTTPException(status_code=500, detail=str(e))
