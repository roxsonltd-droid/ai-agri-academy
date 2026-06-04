"""HTTP CRUD за ``user_knowledge_state`` (adaptive learning)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.api.deps import bearer_claims_optional
from app.core.feature_flags import is_enabled
from app.core.rate_limit import limiter
from app.models.knowledge import KnowledgeUpdate
from ai.adaptive.knowledge_service import KnowledgeService, get_knowledge_service
from pydantic import BaseModel, Field

router = APIRouter()


class KnowledgeCreateBody(BaseModel):
	user_id: str = Field(..., min_length=1)
	topic: str = Field(..., min_length=1)
	mastery_level: float = Field(default=0.0, ge=0.0, le=1.0)
	attempts: int = Field(default=1, ge=0)
	correct_answers: int = Field(default=0, ge=0)


class IncrementAttemptBody(BaseModel):
	user_id: str = Field(..., min_length=1)
	topic: str = Field(..., min_length=1)
	is_correct: bool


def _svc() -> KnowledgeService:
	return get_knowledge_service()


@router.get("/knowledge-state")
@limiter.limit("60/minute")
async def list_knowledge_state_api(
	request: Request,
	user_id: str = Query(..., min_length=1),
	weak_only: bool = Query(default=False),
	threshold: float = Query(default=0.5, ge=0.0, le=1.0),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	svc = _svc()
	if weak_only:
		rows = await svc.get_weak_topics(user_id, threshold)
	else:
		rows = await svc.get_user_progress(user_id)
	return {"items": [r.model_dump(mode="json") for r in rows]}


@router.get("/knowledge-state/item")
@limiter.limit("60/minute")
async def get_knowledge_item_api(
	request: Request,
	user_id: str = Query(..., min_length=1),
	topic: str = Query(..., min_length=1),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	row = await _svc().get_by_topic(user_id, topic)
	if not row:
		raise HTTPException(status_code=404, detail="not_found")
	return row.model_dump(mode="json")


@router.get("/knowledge-state/{record_id}")
@limiter.limit("60/minute")
async def get_knowledge_by_id_api(
	request: Request,
	record_id: str,
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	row = await _svc().get_by_id(record_id)
	if not row:
		raise HTTPException(status_code=404, detail="not_found")
	return row.model_dump(mode="json")


@router.post("/knowledge-state")
@limiter.limit("30/minute")
async def upsert_knowledge_state_api(
	request: Request,
	body: KnowledgeCreateBody,
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	try:
		out = await _svc().create_or_update(
			body.user_id.strip(),
			body.topic.strip(),
			body.mastery_level,
			attempts=body.attempts,
			correct_answers=body.correct_answers,
		)
	except ValueError as e:
		raise HTTPException(status_code=422, detail=str(e)) from e
	return out.model_dump(mode="json")


@router.patch("/knowledge-state/{record_id}")
@limiter.limit("30/minute")
async def patch_knowledge_state_api(
	request: Request,
	record_id: str,
	body: KnowledgeUpdate,
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	out = await _svc().update(record_id, body)
	if not out:
		raise HTTPException(status_code=404, detail="not_found")
	return out.model_dump(mode="json")


@router.delete("/knowledge-state")
@limiter.limit("20/minute")
async def delete_knowledge_state_api(
	request: Request,
	user_id: str = Query(..., min_length=1),
	topic: str = Query(..., min_length=1),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	ok = await _svc().delete(user_id.strip(), topic.strip())
	if not ok:
		raise HTTPException(status_code=404, detail="not_found")
	return {"deleted": True}


@router.post("/knowledge-state/increment-attempt")
@limiter.limit("30/minute")
async def increment_attempt_api(
	request: Request,
	body: IncrementAttemptBody,
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	try:
		out = await _svc().increment_attempt(body.user_id.strip(), body.topic.strip(), body.is_correct)
	except ValueError as e:
		raise HTTPException(status_code=422, detail=str(e)) from e
	return out.model_dump(mode="json")
