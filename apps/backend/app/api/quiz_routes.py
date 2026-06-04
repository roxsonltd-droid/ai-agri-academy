"""Quiz generation & submit API."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.deps import bearer_claims_optional
from app.core.feature_flags import is_enabled
from app.core.rate_limit import limiter
from app.models.quiz import GeneratedQuiz, QuizSubmitBody
from ai.quiz.service import get_quiz_service
from pydantic import BaseModel, Field

router = APIRouter()


class QuizGenerateBody(BaseModel):
	user_id: str = Field(..., min_length=1)
	topic: str = Field(..., min_length=1)
	difficulty: str | None = None
	num_questions: int = Field(default=6, ge=1, le=15)
	culture: str | None = None
	region: str | None = None


@router.post("/generate")
@limiter.limit("15/minute")
async def quiz_generate_api(
	request: Request,
	body: QuizGenerateBody,
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	svc = get_quiz_service()
	try:
		quiz: GeneratedQuiz = await svc.create_quiz(
			body.user_id.strip(),
			body.topic.strip(),
			body.difficulty,
			body.num_questions,
			culture=body.culture,
			region=body.region,
		)
	except ValueError as e:
		raise HTTPException(status_code=422, detail=str(e)) from e
	return quiz.model_dump(mode="json")


@router.post("/submit")
@limiter.limit("30/minute")
async def quiz_submit_api(
	request: Request,
	body: QuizSubmitBody,
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	svc = get_quiz_service()
	try:
		out = await svc.submit_quiz(body)
	except ValueError as e:
		raise HTTPException(status_code=422, detail=str(e)) from e
	return out
