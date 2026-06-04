"""Academy Tutor API: RAG (файлове + уроци) + LangGraph дебат Tutor / Critic."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ai.academy_debate_graph import run_academy_debate
from ai.academy_rag import combined_academy_context
from core.config import settings
from backend.db.database import get_db

router = APIRouter()


class AcademyTutorRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Въпрос на студента")
    max_debate_rounds: int | None = Field(
        default=None,
        ge=1,
        le=8,
        description="Макс. брой оценки от критик (след което се финализира). По подразбиране от настройките.",
    )


class AcademyTutorResponse(BaseModel):
    reply: str
    debate_log: list[str] = []
    rag_used: bool = False


@router.post("/debate", response_model=AcademyTutorResponse)
async def academy_tutor_debate(body: AcademyTutorRequest, db: Session = Depends(get_db)):
    """
    Academy Tutor с RAG върху ``knowledge/*``, качени PDF/MD и Markdown на уроците в БД;
    multi-round дебат Tutor ↔ Critic (LangGraph), след което финален отговор.
    """
    if not settings.MISTRAL_API_KEY:
        raise HTTPException(status_code=503, detail="Липсва MISTRAL_API_KEY в средата.")

    q = body.message.strip()
    try:
        rag = await combined_academy_context(q, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG неуспешен: {e}") from e

    try:
        out = await run_academy_debate(
            user_query=q,
            rag_context=rag,
            max_debate_rounds=body.max_debate_rounds,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    reply = (out.get("final_answer") or out.get("tutor_draft") or "").strip()
    if not reply:
        reply = "Няма генериран отговор."

    logs = out.get("debate_log") or []
    if not isinstance(logs, list):
        logs = [str(logs)]

    return AcademyTutorResponse(
        reply=reply,
        debate_log=[str(x) for x in logs],
        rag_used=bool(rag and rag.strip()),
    )
