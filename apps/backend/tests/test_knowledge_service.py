"""Тестове за KnowledgeService + repo разширения."""

from __future__ import annotations

import asyncio

import pytest

from ai.adaptive.knowledge_service import KnowledgeService
from ai.adaptive.repository import InMemoryLearningRepository
from app.models.knowledge import KnowledgeUpdate


def test_knowledge_service_crud() -> None:
	async def _run() -> None:
		repo = InMemoryLearningRepository()
		svc = KnowledgeService(repo)
		a = await svc.create_or_update("u1", "тема_а", 0.4, attempts=1, correct_answers=1)
		assert a.topic == "тема_а"
		assert a.mastery_level == pytest.approx(0.4)
		b = await svc.get_by_topic("u1", "тема_а")
		assert b is not None and b.id == a.id
		prog = await svc.get_user_progress("u1")
		assert len(prog) == 1
		weak = await svc.get_weak_topics("u1", threshold=0.5)
		assert len(weak) == 1
		upd = await svc.update(str(a.id), KnowledgeUpdate(mastery_level=0.9))
		assert upd is not None and upd.mastery_level == pytest.approx(0.9)
		ok = await svc.delete("u1", "тема_а")
		assert ok is True
		assert await svc.get_by_topic("u1", "тема_а") is None

	asyncio.run(_run())


def test_increment_attempt() -> None:
	async def _run() -> None:
		repo = InMemoryLearningRepository()
		svc = KnowledgeService(repo)
		s = await svc.increment_attempt("u2", "тема_б", True)
		assert s.attempts == 1
		assert s.correct_answers == 1
		s2 = await svc.increment_attempt("u2", "тема_б", False)
		assert s2.attempts == 2
		assert s2.correct_answers == 1

	asyncio.run(_run())
