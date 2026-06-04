"""CRUD и помощни операции за ``user_knowledge_state`` (Supabase + in-memory repo)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.models.knowledge import KnowledgeUpdate, UserKnowledgeState
from ai.adaptive.repository import LearningRepository, get_learning_repository


def _utc_iso() -> str:
	return datetime.now(timezone.utc).isoformat()


def _serialize_dt(value: datetime | str | None) -> str | None:
	if value is None:
		return None
	if isinstance(value, datetime):
		return value.isoformat()
	return str(value)


def _patch_for_repo(update: KnowledgeUpdate) -> dict[str, Any]:
	raw = update.model_dump(exclude_unset=True)
	out: dict[str, Any] = {}
	for k, v in raw.items():
		if k == "last_assessed":
			out[k] = _serialize_dt(v)  # type: ignore[arg-type]
		else:
			out[k] = v
	return out


class KnowledgeService:
	"""Високо ниво върху ``LearningRepository`` — CRUD + weak topics + increment_attempt."""

	def __init__(self, repository: LearningRepository | None = None) -> None:
		self._repo = repository or get_learning_repository()

	async def ensure_profile(self, user_id: str) -> None:
		"""Създава минимален learning профил при липса (FK за knowledge редове)."""
		await self._ensure_profile(user_id)

	async def _ensure_profile(self, user_id: str) -> None:
		row = await self._repo.get_profile(user_id)
		if row is None:
			await self._repo.upsert_profile(
				user_id,
				{
					"overall_level": 1,
					"cultures": [],
					"last_activity": _utc_iso(),
				},
			)

	async def create_or_update(
		self,
		user_id: str,
		topic: str,
		mastery_level: float,
		*,
		attempts: int = 1,
		correct_answers: int = 0,
	) -> UserKnowledgeState:
		await self._ensure_profile(user_id)
		topic = (topic or "").strip()
		if not topic:
			raise ValueError("topic_required")
		payload: dict[str, Any] = {
			"mastery_level": float(mastery_level),
			"attempts": int(attempts),
			"correct_answers": int(correct_answers),
			"last_assessed": _utc_iso(),
		}
		await self._repo.upsert_knowledge_state(user_id, topic, payload)
		row = await self._repo.get_knowledge_state(user_id, topic)
		if not row:
			raise RuntimeError("knowledge_upsert_failed")
		return UserKnowledgeState.from_row(row)

	async def get_by_topic(self, user_id: str, topic: str) -> UserKnowledgeState | None:
		row = await self._repo.get_knowledge_state(user_id, (topic or "").strip())
		return UserKnowledgeState.from_row(row) if row else None

	async def get_by_id(self, record_id: str) -> UserKnowledgeState | None:
		row = await self._repo.get_knowledge_state_by_id(record_id)
		return UserKnowledgeState.from_row(row) if row else None

	async def get_user_progress(self, user_id: str) -> list[UserKnowledgeState]:
		rows = await self._repo.list_knowledge_state_sorted(user_id, mastery_desc=True)
		return [UserKnowledgeState.from_row(r) for r in rows]

	async def get_weak_topics(self, user_id: str, threshold: float = 0.5) -> list[UserKnowledgeState]:
		rows = await self._repo.list_weak_topics(user_id, float(threshold))
		return [UserKnowledgeState.from_row(r) for r in rows]

	async def update(self, record_id: str, update_data: KnowledgeUpdate) -> UserKnowledgeState | None:
		patch = _patch_for_repo(update_data)
		row = await self._repo.update_knowledge_state_by_id(record_id, patch)
		return UserKnowledgeState.from_row(row) if row else None

	async def delete(self, user_id: str, topic: str) -> bool:
		return await self._repo.delete_knowledge_state(user_id, (topic or "").strip())

	async def increment_attempt(self, user_id: str, topic: str, is_correct: bool) -> UserKnowledgeState:
		"""Увеличава attempts/correct и пренастройва mastery по (correct/attempts)*0.95 (cap 1.0)."""
		await self._ensure_profile(user_id)
		topic = (topic or "").strip()
		if not topic:
			raise ValueError("topic_required")
		state = await self.get_by_topic(user_id, topic)
		if not state:
			await self.create_or_update(user_id, topic, 0.3, attempts=0, correct_answers=0)
			state = await self.get_by_topic(user_id, topic)
		if state is None:
			raise RuntimeError("knowledge_create_failed")
		attempts = state.attempts + 1
		correct = state.correct_answers + (1 if is_correct else 0)
		mastery = min(1.0, (correct / attempts) * 0.95) if attempts else 0.0
		return await self.create_or_update(
			user_id=user_id,
			topic=topic,
			mastery_level=mastery,
			attempts=attempts,
			correct_answers=correct,
		)


def get_knowledge_service(repository: LearningRepository | None = None) -> KnowledgeService:
	return KnowledgeService(repository)
