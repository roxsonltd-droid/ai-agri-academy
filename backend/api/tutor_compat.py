"""
Съвместимост с Next.js прокси: POST /api/tutor/chat → същият RAG + агент като /api/v1/chat,
но отговорът е { answer, sources } както очакват `useTutor`, Academy panel и /tutor страницата.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from core.ai_agent import ask_agromind
from core.simple_rate_limit import enforce_chat_rate_limit

router = APIRouter(prefix="/api", tags=["tutor-compat"])


class TutorChatIn(BaseModel):
    """Тяло от Next: ``userId`` (camelCase); приемаме и ``user_id``."""

    model_config = ConfigDict(populate_by_name=True)

    question: str = Field(..., min_length=1)
    user_id: str | None = Field(None, alias="userId")
    culture: str | None = None
    region: str | None = None


@router.post("/tutor/chat")
async def tutor_chat_proxy(request: Request, body: TutorChatIn):
    enforce_chat_rate_limit(request)
    try:
        uid = (body.user_id or "anonymous").strip() or "anonymous"
        headers: dict[str, str] = {}
        if uid:
            headers["Helicone-User-Id"] = uid[:128]
        if body.culture:
            headers["Helicone-Property-Culture"] = str(body.culture)[:200]
        if body.region:
            headers["Helicone-Property-Region"] = str(body.region)[:200]

        out = await ask_agromind(body.question.strip(), llm_extra_headers=headers or None)
        sources: list[dict] = []
        for s in out.rag_sources:
            sources.append(
                {
                    "source": s.source,
                    "topic": (s.preview or "").strip() or None,
                    "score": s.score,
                }
            )
        return {"answer": out.reply, "sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
