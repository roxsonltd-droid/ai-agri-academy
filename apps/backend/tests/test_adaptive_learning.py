"""Unit tests: adaptive engine, quiz, tutor (mock LLM + RAG)."""

from __future__ import annotations

import asyncio
from typing import Any

import pytest

from ai.adaptive.engine import AdaptiveLearningEngine
from ai.adaptive.quiz import bump_mastery, calculate_score, feedback_message_for_mastery
from ai.adaptive.repository import InMemoryLearningRepository
from ai.tutors.adaptive_tutor import AdaptiveAgriTutor


def test_calculate_user_level_from_mastery() -> None:
    eng = AdaptiveLearningEngine()
    ks = [{"mastery_level": 0.3}, {"mastery_level": 0.3}]
    assert eng.calculate_user_level(None, ks) == 1
    ks2 = [{"mastery_level": 0.9}, {"mastery_level": 0.9}]
    assert eng.calculate_user_level(None, ks2) == 5


def test_get_next_difficulty() -> None:
    eng = AdaptiveLearningEngine()
    assert eng.get_next_difficulty("x", 0.2) == "beginner"
    assert eng.get_next_difficulty("x", 0.5) == "intermediate"
    assert eng.get_next_difficulty("x", 0.7) == "advanced"
    assert eng.get_next_difficulty("x", 0.9) == "expert"


def test_calculate_score_and_bump() -> None:
    assert calculate_score([True, False, True]) == pytest.approx(2 / 3)
    assert calculate_score([]) == 0.0
    assert bump_mastery(0.3, 1.0) == pytest.approx(0.45)
    assert bump_mastery(0.95, 1.0) == 1.0


def test_feedback_message_for_mastery() -> None:
    assert "Отличен" in feedback_message_for_mastery(0.9)
    assert "Добър" in feedback_message_for_mastery(0.65)
    assert "основите" in feedback_message_for_mastery(0.4)


def test_assess_updates_mastery() -> None:
    async def _run() -> None:
        repo = InMemoryLearningRepository()
        tutor = AdaptiveAgriTutor(llm=None, repository=repo, rag=_FakeRAG())
        await tutor.assess_knowledge("u1", "торене", [True, True, False])
        st = await repo.get_knowledge_state("u1", "торене")
        assert st is not None
        assert st["attempts"] == 1
        assert float(st["mastery_level"]) > 0.3

    asyncio.run(_run())


def test_teach_returns_lesson_and_difficulty() -> None:
    async def _run() -> None:
        repo = InMemoryLearningRepository()
        tutor = AdaptiveAgriTutor(llm=_FakeLLM(), repository=repo, rag=_FakeRAG())
        out = await tutor.teach(
            "demo",
            "сеитба_домати",
            {"culture": "домати", "cultures": ["домати"], "region": "Пловдив"},
        )
        assert out["difficulty"] in ("beginner", "intermediate", "advanced", "expert")
        assert "lesson" in out and out["lesson"] == "stub-lesson"
        assert "recommended_next" in out

    asyncio.run(_run())


class _FakeRAG:
    async def aretrieve(self, query: str, k: int = 7, filter: dict[str, Any] | None = None) -> dict[str, Any]:
        return {"context": "ctx", "used_filter": filter}


class _FakeLLM:
    async def ainvoke(self, messages: Any) -> Any:
        class _R:
            content = "stub-lesson"

        return _R()
