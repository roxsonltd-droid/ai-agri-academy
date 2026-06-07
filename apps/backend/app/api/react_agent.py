"""``POST /api/react/run`` — ReAct агент с инструменти (време, пазар, Academy RAG)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.api.deps import bearer_claims_optional
from app.core.feature_flags import is_enabled
from app.core.rate_limit import limiter

router = APIRouter()


class ReactRunRequest(BaseModel):
    question: str
    user_id: str = "anonymous"
    farm_profile: dict[str, Any] = Field(default_factory=dict)


class ReactRunResponse(BaseModel):
    answer: str
    thought_process: list[dict[str, Any]] = Field(default_factory=list)
    used_rag: bool = False


@router.post("/run", response_model=ReactRunResponse)
@limiter.limit("15/minute")
async def react_run(
    request: Request,
    body: ReactRunRequest = Body(
        ...,
        openapi_examples={
            "weather": {
                "summary": "Прогноза за регион",
                "value": {
                    "question": "Каква е прогнозата за следващите дни в Добруджа за поливане?",
                    "user_id": "demo",
                    "farm_profile": {"region": "Добруджа", "cultures": ["пшеница"]},
                },
            },
            "academy": {
                "summary": "Academy + инструменти",
                "value": {
                    "question": "Кога е оптималната сеитба на царевица според курсовете и какво време очакваме в Пловдив?",
                    "user_id": "demo",
                    "farm_profile": {},
                },
            },
        },
    ),
    _claims: dict | None = Depends(bearer_claims_optional),
):
    if not await is_enabled("tutor.react_tools"):
        raise HTTPException(status_code=404, detail="feature_disabled")
    q = (body.question or "").strip()
    if not q:
        raise HTTPException(status_code=422, detail="question_required")
    try:
        from ai.agents.react.agent import ReActAgriAgent
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"react_stack_unavailable: {e}") from e

    agent = ReActAgriAgent()
    try:
        result = await agent.run(question=q, farm_profile=body.farm_profile or None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    return ReactRunResponse(
        answer=result.get("answer") or "",
        thought_process=list(result.get("thought_process") or []),
        used_rag=bool(result.get("used_rag")),
    )
