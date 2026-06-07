"""Адаптивен Academy Tutor: mastery → трудност → RAG → урок; квиз обновява състоянието."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from ai.adaptive.engine import AdaptiveLearningEngine
from ai.adaptive.quiz import bump_mastery, calculate_score, feedback_message_for_mastery
from ai.adaptive.repository import LearningRepository, get_learning_repository
from ai.rag.engine import RAGEngine
from ai.vector_store.filters import build_agri_vector_metadata_filter

logger = logging.getLogger(__name__)


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _culture_for_rag(user_profile: dict[str, Any]) -> str | None:
    mc = user_profile.get("main_culture") or user_profile.get("culture")
    if mc and str(mc).strip():
        return str(mc).strip()
    cultures = user_profile.get("cultures") or []
    if isinstance(cultures, str):
        return cultures.strip() or None
    if isinstance(cultures, list) and cultures:
        return str(cultures[0]).strip() or None
    return None


class AdaptiveAgriTutor:
    """RAG + LLM урок по текущо mastery; репозиторий: Supabase или in-memory."""

    def __init__(
        self,
        llm: Any | None = None,
        repository: LearningRepository | None = None,
        rag: RAGEngine | None = None,
    ) -> None:
        self._llm = llm
        self.adaptive_engine = AdaptiveLearningEngine()
        self.rag = rag or RAGEngine()
        self.repository = repository or get_learning_repository()

    async def _get_llm(self) -> Any:
        if self._llm is None:
            from rag.core.llm import get_llm

            self._llm = get_llm()
        return self._llm

    async def _ensure_profile(self, user_id: str, hints: dict[str, Any] | None) -> dict[str, Any]:
        hints = dict(hints or {})
        existing = await self.repository.get_profile(user_id)
        cultures: list[Any] = []
        if existing and isinstance(existing.get("cultures"), list):
            cultures = list(existing["cultures"])
        elif existing and isinstance(existing.get("cultures"), str):
            try:
                cultures = json.loads(existing["cultures"])
            except (json.JSONDecodeError, TypeError):
                cultures = [existing["cultures"]]

        if hints.get("cultures") and isinstance(hints["cultures"], list):
            for c in hints["cultures"]:
                if c and c not in cultures:
                    cultures.append(c)
        elif hints.get("culture"):
            c = str(hints["culture"]).strip()
            if c and c not in cultures:
                cultures.append(c)

        lvl = hints.get("overall_level")
        if lvl is None and existing:
            lvl = existing.get("overall_level")
        try:
            overall = max(1, min(5, int(lvl))) if lvl is not None else 1
        except (TypeError, ValueError):
            overall = 1

        region = hints.get("region")
        if region is None and existing:
            region = existing.get("region")

        await self.repository.upsert_profile(
            user_id,
            {
                "overall_level": overall,
                "cultures": cultures,
                "region": region,
                "last_activity": _utc_iso(),
            },
        )
        row = await self.repository.get_profile(user_id)
        return dict(row or {"user_id": user_id, "cultures": cultures, "overall_level": overall})

    def _merged_profile_for_prompt(self, stored: dict[str, Any], hints: dict[str, Any] | None) -> dict[str, Any]:
        hints = hints or {}
        out = dict(stored)
        for k in ("experience", "farm_size_ha", "main_culture", "culture", "region"):
            if k in hints and hints[k] is not None:
                out[k] = hints[k]
        if hints.get("cultures"):
            out["cultures"] = hints["cultures"]
        return out

    async def get_user_knowledge_state(self, user_id: str, topic: str) -> dict[str, Any] | None:
        return await self.repository.get_knowledge_state(user_id, topic)

    async def teach(self, user_id: str, topic: str, user_profile: dict[str, Any] | None = None) -> dict[str, Any]:
        topic = (topic or "").strip()
        if not topic:
            raise ValueError("topic_required")

        stored_profile = await self._ensure_profile(user_id, user_profile)
        merged = self._merged_profile_for_prompt(stored_profile, user_profile)

        user_state = await self.get_user_knowledge_state(user_id, topic)
        mastery = float(user_state.get("mastery_level", 0.0)) if user_state else 0.0
        difficulty = self.adaptive_engine.get_next_difficulty(topic, mastery)

        culture = _culture_for_rag(merged)
        region = (merged.get("region") or "").strip() or None
        flt = build_agri_vector_metadata_filter(culture=culture, region=region, difficulty=difficulty)

        try:
            context_pack = await self.rag.aretrieve(query=topic, k=7, filter=flt if flt else None)
        except Exception:
            logger.exception("AdaptiveAgriTutor: RAG retrieve failed for topic=%s", topic)
            context_pack = {"context": "", "used_filter": flt}

        context = (context_pack.get("context") or "").strip()
        all_states = await self.repository.list_knowledge_state(user_id)
        recommended = self.adaptive_engine.generate_personalized_path(merged, topic, knowledge_states=all_states)

        prompt = f"""Ти си AgriTutor. Преподавай темата "{topic}" на ниво {difficulty}.
Потребителят има следния профил: {json.dumps(merged, ensure_ascii=False)}
Текущо ниво на владеене по темата: {mastery:.2f}

Контекст (академия / база знания):
{context or "(няма намерени чънкове — обясни от общи агрономски принципи.)"}

Преподавай ясно, практически и с примери от полето.
В края задай 2–3 кратки въпроса за самопроверка (без да изискваш машинно оценяване)."""

        llm = await self._get_llm()
        from langchain_core.messages import HumanMessage

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        lesson = getattr(response, "content", None) or str(response)

        return {
            "lesson": lesson,
            "difficulty": difficulty,
            "mastery_level": mastery,
            "recommended_next": recommended,
            "rag_filter": context_pack.get("used_filter") or flt,
        }

    async def assess_knowledge(self, user_id: str, topic: str, answers: list[bool]) -> dict[str, Any]:
        topic = (topic or "").strip()
        if not topic:
            raise ValueError("topic_required")

        await self._ensure_profile(user_id, None)
        state = await self.repository.get_knowledge_state(user_id, topic) or {}
        old_mastery = float(state.get("mastery_level", 0.3))

        score = calculate_score(answers)
        new_mastery = bump_mastery(old_mastery, score)

        attempts = int(state.get("attempts") or 0) + 1
        prev_correct = int(state.get("correct_answers") or 0)
        correct_delta = sum(1 for a in answers if a)
        correct_answers = prev_correct + correct_delta

        await self.repository.upsert_knowledge_state(
            user_id,
            topic,
            {
                "mastery_level": new_mastery,
                "last_assessed": _utc_iso(),
                "attempts": attempts,
                "correct_answers": correct_answers,
            },
        )

        return {
            "feedback": feedback_message_for_mastery(new_mastery),
            "mastery_level": new_mastery,
            "score_ratio": score,
            "attempts": attempts,
        }

    async def get_progress(self, user_id: str) -> dict[str, Any]:
        """Профил + всички теми с mastery за dashboard."""
        await self._ensure_profile(user_id, None)
        profile = await self.repository.get_profile(user_id)
        topics = await self.repository.list_knowledge_state(user_id)
        level = self.adaptive_engine.calculate_user_level(profile, topics or None)
        return {
            "profile": profile,
            "topics": topics,
            "computed_level": level,
        }
