"""Stable ``/api/tutor/*`` surface — delegates to ``rag/tutor_router`` (lazy import)."""

from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request

from app.api.deps import bearer_claims_optional
from app.core.config import get_settings
from app.core.feature_flags import is_enabled
from app.core.rate_limit import limiter

router = APIRouter()


def _teach_hints(body: dict) -> dict:
	keys = (
		"culture",
		"cultures",
		"region",
		"overall_level",
		"experience",
		"farm_size_ha",
		"main_culture",
		"tutor_role",
	)
	return {k: body[k] for k in keys if body.get(k) is not None}


async def _resolve_teach_variant(user_id: str, mode: str) -> str:
	m = (mode or "auto").strip().lower()
	if m == "adaptive":
		return "adaptive"
	if m == "static":
		return "static"
	s = get_settings()
	if await is_enabled("tutor.ab_test") and s.feature_tutor_ab_test:
		from app.tutor.ab_assign import assign_ab_variant

		return assign_ab_variant(user_id, s.tutor_ab_adaptive_weight)
	if await is_enabled("tutor.adaptive"):
		return "adaptive"
	return "static"


async def _static_topic_teach(user_id: str, topic: str, hints: dict) -> dict:
	try:
		from tutor_router import TutorRequest, tutor_chat as tutor_chat_inner
	except ImportError as e:
		raise HTTPException(status_code=503, detail=f"tutor_stack_unavailable: {e}") from e
	culture = hints.get("culture")
	if not culture:
		cul = hints.get("cultures")
		if isinstance(cul, list) and cul:
			culture = str(cul[0])
		elif isinstance(cul, str) and cul.strip():
			culture = cul.strip()
	exp = hints.get("experience") or "intermediate"
	farm = hints.get("farm_size_ha")
	farm_f: float | None = None
	if isinstance(farm, (int, float)):
		farm_f = float(farm)
	question = (
		f"Дай структуриран мини-урок по тема «{topic}» за фермер с опит «{exp}». "
		"Включи практически стъпки и 2–3 кратки въпроса за самопроверка в края."
	)
	req = TutorRequest(
		question=question,
		user_id=user_id,
		culture=culture,
		region=hints.get("region"),
		experience=str(exp),
		farm_size_ha=farm_f,
		tutor_role=hints.get("tutor_role"),
	)
	resp = await tutor_chat_inner(req)
	return {
		"variant": "static",
		"topic": topic,
		"lesson": resp.answer,
		"sources": list(getattr(resp, "sources", None) or []),
		"difficulty": None,
		"mastery_level": None,
		"recommended_next": None,
		"rag_filter": None,
		"confidence": getattr(resp, "confidence", None),
	}


async def _adaptive_topic_teach(user_id: str, topic: str, hints: dict) -> dict:
	from ai.tutors.adaptive_tutor import AdaptiveAgriTutor

	tutor = AdaptiveAgriTutor()
	try:
		out = await tutor.teach(user_id, topic, hints)
	except ValueError as e:
		raise HTTPException(status_code=422, detail=str(e)) from e
	out = dict(out)
	out["variant"] = "adaptive"
	out["topic"] = topic
	out.setdefault("sources", [])
	return out


async def run_tutor_teach(body: dict) -> dict:
	uid = (body.get("user_id") or "").strip()
	topic = (body.get("topic") or "").strip()
	if not uid or not topic:
		raise HTTPException(status_code=422, detail="user_id_and_topic_required")

	mode = (body.get("tutor_mode") or body.get("mode") or "auto").strip().lower()
	hints = _teach_hints(body)
	forced_adaptive = mode == "adaptive"
	forced_static = mode == "static"

	variant = await _resolve_teach_variant(uid, mode)
	adaptive_on = await is_enabled("tutor.adaptive")
	chat_on = await is_enabled("tutor.chat")

	if variant == "adaptive" and not adaptive_on:
		if forced_adaptive:
			raise HTTPException(status_code=404, detail="feature_disabled")
		variant = "static"
	if variant == "static" and not chat_on:
		if forced_static:
			raise HTTPException(status_code=404, detail="feature_disabled")
		if adaptive_on:
			variant = "adaptive"
		else:
			raise HTTPException(status_code=503, detail="tutor_teach_unavailable")

	s = get_settings()
	ab_active = bool(await is_enabled("tutor.ab_test") and s.feature_tutor_ab_test and mode == "auto")

	if variant == "adaptive":
		out = await _adaptive_topic_teach(uid, topic, hints)
	else:
		out = await _static_topic_teach(uid, topic, hints)
	out["requested_mode"] = mode
	out["ab_test_active"] = ab_active
	return out


def _parse_assess_answers(raw: object) -> list[bool]:
	if not isinstance(raw, list) or not raw:
		raise HTTPException(status_code=422, detail="answers_required_non_empty_list")
	answers: list[bool] = []
	for a in raw:
		if isinstance(a, bool):
			answers.append(a)
		elif isinstance(a, (int, float)):
			answers.append(bool(int(a)))
		elif isinstance(a, str):
			answers.append(a.strip().lower() in ("1", "true", "yes", "да", "t"))
		else:
			raise HTTPException(status_code=422, detail="answers_must_be_booleans")
	return answers


async def run_tutor_assess(body: dict) -> dict:
	uid = (body.get("user_id") or "").strip()
	topic = (body.get("topic") or "").strip()
	if not uid or not topic:
		raise HTTPException(status_code=422, detail="user_id_and_topic_required")
	record = body.get("record_mastery", True)
	answers = _parse_assess_answers(body.get("answers"))

	if not record:
		from ai.adaptive.quiz import bump_mastery, calculate_score, feedback_message_for_mastery

		score = calculate_score(answers)
		h = bump_mastery(0.3, score)
		return {
			"recorded": False,
			"score_ratio": score,
			"mastery_level": h,
			"feedback": feedback_message_for_mastery(h),
			"hint": "static_tutor_preview_only",
		}

	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	from ai.tutors.adaptive_tutor import AdaptiveAgriTutor

	try:
		out = await AdaptiveAgriTutor().assess_knowledge(uid, topic, answers)
	except ValueError as e:
		raise HTTPException(status_code=422, detail=str(e)) from e
	out = dict(out)
	out["recorded"] = True
	return out


@router.post("/chat")
@limiter.limit("30/minute")
async def tutor_chat_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "Tutor chat",
				"value": {
					"question": "Как да калибрирам сензор за влага?",
					"user_id": "demo-user",
					"culture": "пшеница",
					"region": "Добруджа",
					"experience": "beginner",
					"farm_size_ha": 120,
					"tutor_role": "expert",
				},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.chat"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	try:
		from tutor_router import TutorRequest, tutor_chat as tutor_chat_inner
	except ImportError as e:
		raise HTTPException(status_code=503, detail=f"tutor_stack_unavailable: {e}") from e

	return await tutor_chat_inner(TutorRequest.model_validate(body))


@router.post("/deep-debate")
@limiter.limit("10/minute")
async def tutor_deep_debate_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "Deep debate",
				"value": {
					"question": "Оцени риска от суша за следващия сезон",
					"user_id": "demo-user",
					"useDebate": True,
					"culture": "царевица",
					"region": "Северна България",
				},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.deep_debate"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	try:
		from tutor_router import DeepDebateRequest, tutor_deep_debate as tutor_deep_debate_inner
	except ImportError as e:
		raise HTTPException(status_code=503, detail=f"tutor_stack_unavailable: {e}") from e

	return await tutor_deep_debate_inner(DeepDebateRequest.model_validate(body))


@router.post("/graph")
@limiter.limit("30/minute")
async def tutor_langgraph_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "LangGraph tutor (minimal pipeline)",
				"value": {
					"question": "Как да планирам поливане при горещина?",
					"user_id": "optional",
					"profile": {"experience": "intermediate", "farm_size_ha": 80, "culture": "царевица", "region": "Пловдив"},
					"tutor_role": "mentor",
				},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	"""Two-node LangGraph: topic classify → draft (Mistral if ``MISTRAL_API_KEY``, else stub)."""
	if not await is_enabled("tutor.langgraph"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	from app.tutor.minimal_graph import get_minimal_tutor_graph

	q = (body.get("question") or "").strip()
	if not q:
		raise HTTPException(status_code=422, detail="question_required")

	profile = body.get("profile") if isinstance(body.get("profile"), dict) else None
	role_raw = body.get("tutor_role") or body.get("role")
	role = (str(role_raw).strip().lower() if role_raw else None) or None

	graph = get_minimal_tutor_graph()
	out = graph.invoke({"question": q, "profile": profile, "role": role})
	style = None
	try:
		from ai.tutors.personal_tutor import PersonalTutor

		style = PersonalTutor(profile or {}).teaching_style()
	except ImportError:
		pass
	return {
		"answer": out.get("answer", ""),
		"topic": out.get("topic"),
		"trace": out.get("trace") or [],
		"teaching_style": style,
	}


@router.post("/teach")
@limiter.limit("20/minute")
async def tutor_teach_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "Topic lesson — adaptive / static / auto (A/B)",
				"value": {
					"user_id": "demo-user",
					"topic": "торене_пшеница",
					"tutor_mode": "auto",
					"culture": "пшеница",
					"region": "Добруджа",
					"experience": "beginner",
				},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	"""Урок по тема: адаптивен (mastery + RAG), статичен (Academy chat RAG), или ``auto`` с A/B при ``FEATURE_TUTOR_AB_TEST``."""
	return await run_tutor_teach(body)


@router.post("/assess")
@limiter.limit("30/minute")
async def tutor_assess_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "Quiz → mastery (или preview при record_mastery=false)",
				"value": {"user_id": "demo-user", "topic": "торене_пшеница", "answers": [True, True, False], "record_mastery": True},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	return await run_tutor_assess(body)


@router.get("/progress")
@limiter.limit("60/minute")
async def tutor_progress_api(
	request: Request,
	user_id: str = Query(..., min_length=1, description="Идентификатор на ученика (съвпада с user_id в /teach)."),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	"""Профил + mastery по теми за Progress dashboard."""
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	from ai.tutors.adaptive_tutor import AdaptiveAgriTutor

	return await AdaptiveAgriTutor().get_progress(user_id.strip())


@router.post("/adaptive/lesson")
@limiter.limit("20/minute")
async def tutor_adaptive_lesson_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "Adaptive lesson (mastery → difficulty → RAG)",
				"value": {
					"user_id": "demo-user",
					"topic": "торене_пшеница",
					"culture": "пшеница",
					"region": "Добруджа",
					"cultures": ["пшеница"],
					"overall_level": 2,
				},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	if not await is_enabled("tutor.adaptive"):
		raise HTTPException(status_code=404, detail="feature_disabled")
	payload = dict(body)
	payload["tutor_mode"] = "adaptive"
	return await run_tutor_teach(payload)


@router.post("/adaptive/assess")
@limiter.limit("30/minute")
async def tutor_adaptive_assess_api(
	request: Request,
	body: dict = Body(
		...,
		openapi_examples={
			"default": {
				"summary": "Quiz feedback → update mastery",
				"value": {"user_id": "demo-user", "topic": "торене_пшеница", "answers": [True, True, False]},
			}
		},
	),
	_claims: dict | None = Depends(bearer_claims_optional),
):
	return await run_tutor_assess({**body, "record_mastery": True})
