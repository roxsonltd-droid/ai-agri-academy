"""``/api/debate/*`` — много-рундов LangGraph дебат (``ai.debate``)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.api.deps import bearer_claims_optional
from app.core.feature_flags import is_enabled
from app.core.rate_limit import limiter

router = APIRouter()


class DebateRunRequest(BaseModel):
    question: str
    user_id: str = "anonymous"
    farm_profile: dict[str, Any] = Field(default_factory=dict)
    culture: str | None = None
    region: str | None = None
    max_rounds: int = Field(default=3, ge=1, le=8)


class DebateRunResponse(BaseModel):
    final_answer: str
    current_round: int
    max_rounds: int
    consensus_level: str
    debate_history: list[dict[str, str]] = Field(default_factory=list)
    sources: list[Any] = Field(default_factory=list)


@router.post("/run", response_model=DebateRunResponse)
@limiter.limit("10/minute")
async def run_multi_round_debate(
    request: Request,
    body: DebateRunRequest = Body(
        ...,
        openapi_examples={
            "default": {
                "summary": "Multi-round academy debate",
                "value": {
                    "question": "Как да намаля риска от суша при царевица?",
                    "user_id": "demo-user",
                    "culture": "царевица",
                    "region": "Добруджа",
                    "max_rounds": 2,
                    "farm_profile": {"cultures": ["царевица"], "region": "Добруджа"},
                },
            }
        },
    ),
    _claims: dict | None = Depends(bearer_claims_optional),
):
    if not await is_enabled("tutor.deep_debate"):
        raise HTTPException(status_code=404, detail="feature_disabled")
    try:
        from ai.debate.graph import run_academy_debate
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"debate_stack_unavailable: {e}") from e

    fp = dict(body.farm_profile or {})
    if body.culture and not fp.get("cultures"):
        fp["cultures"] = [body.culture]
    if body.region and not fp.get("region"):
        fp["region"] = body.region

    try:
        out = await run_academy_debate(
            question=body.question.strip(),
            user_id=body.user_id.strip() or "anonymous",
            farm_profile=fp,
            max_rounds=body.max_rounds,
            culture=body.culture,
            region=body.region,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    return DebateRunResponse(
        final_answer=out.get("final_answer") or "",
        current_round=int(out.get("current_round") or body.max_rounds),
        max_rounds=int(out.get("max_rounds") or body.max_rounds),
        consensus_level=str(out.get("consensus_level") or "medium"),
        debate_history=list(out.get("debate_history") or []),
        sources=list(out.get("sources") or []),
    )
