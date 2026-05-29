"""Персистентност за adaptive learning: Supabase или in-memory."""

from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Protocol

from app.core.config import get_settings


class LearningRepository(Protocol):
	async def get_profile(self, user_id: str) -> dict[str, Any] | None: ...
	async def upsert_profile(self, user_id: str, data: dict[str, Any]) -> None: ...
	async def get_knowledge_state(self, user_id: str, topic: str) -> dict[str, Any] | None: ...
	async def get_knowledge_state_by_id(self, record_id: str) -> dict[str, Any] | None: ...
	async def list_knowledge_state(self, user_id: str) -> list[dict[str, Any]]: ...
	async def upsert_knowledge_state(self, user_id: str, topic: str, data: dict[str, Any]) -> None: ...
	async def delete_knowledge_state(self, user_id: str, topic: str) -> bool: ...
	async def update_knowledge_state_by_id(self, record_id: str, data: dict[str, Any]) -> dict[str, Any] | None: ...
	async def list_knowledge_state_sorted(
		self, user_id: str, *, mastery_desc: bool = True
	) -> list[dict[str, Any]]: ...
	async def list_weak_topics(self, user_id: str, mastery_lt: float) -> list[dict[str, Any]]: ...


def _utcnow() -> str:
	return datetime.now(timezone.utc).isoformat()


@dataclass
class InMemoryLearningRepository:
	_profiles: dict[str, dict[str, Any]] = field(default_factory=dict)
	_knowledge: dict[tuple[str, str], dict[str, Any]] = field(default_factory=dict)

	async def get_profile(self, user_id: str) -> dict[str, Any] | None:
		return self._profiles.get(user_id)

	async def upsert_profile(self, user_id: str, data: dict[str, Any]) -> None:
		row = dict(data)
		row["user_id"] = user_id
		if user_id not in self._profiles:
			row.setdefault("created_at", _utcnow())
		self._profiles[user_id] = row

	async def get_knowledge_state(self, user_id: str, topic: str) -> dict[str, Any] | None:
		return self._knowledge.get((user_id, topic))

	async def get_knowledge_state_by_id(self, record_id: str) -> dict[str, Any] | None:
		for row in self._knowledge.values():
			if str(row.get("id")) == str(record_id):
				return dict(row)
		return None

	async def list_knowledge_state(self, user_id: str) -> list[dict[str, Any]]:
		return [dict(v) for (uid, _), v in self._knowledge.items() if uid == user_id]

	async def upsert_knowledge_state(self, user_id: str, topic: str, data: dict[str, Any]) -> None:
		key = (user_id, topic)
		prev = self._knowledge.get(key, {})
		merged = {**prev, **data, "user_id": user_id, "topic": topic}
		if not merged.get("id"):
			merged["id"] = str(uuid.uuid4())
		if "created_at" not in merged or merged.get("created_at") is None:
			merged.setdefault("created_at", _utcnow())
		merged["updated_at"] = _utcnow()
		self._knowledge[key] = merged

	async def delete_knowledge_state(self, user_id: str, topic: str) -> bool:
		key = (user_id, topic)
		if key in self._knowledge:
			del self._knowledge[key]
			return True
		return False

	async def update_knowledge_state_by_id(self, record_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
		for key, row in list(self._knowledge.items()):
			if str(row.get("id")) == str(record_id):
				updated = {**row, **{k: v for k, v in data.items() if v is not None}}
				updated["updated_at"] = _utcnow()
				self._knowledge[key] = updated
				return dict(updated)
		return None

	async def list_knowledge_state_sorted(self, user_id: str, *, mastery_desc: bool = True) -> list[dict[str, Any]]:
		rows = [dict(v) for (uid, _), v in self._knowledge.items() if uid == user_id]
		rows.sort(key=lambda r: float(r.get("mastery_level") or 0.0), reverse=mastery_desc)
		return rows

	async def list_weak_topics(self, user_id: str, mastery_lt: float) -> list[dict[str, Any]]:
		rows = [dict(v) for (uid, _), v in self._knowledge.items() if uid == user_id]
		weak = [r for r in rows if float(r.get("mastery_level") or 0.0) < mastery_lt]
		weak.sort(key=lambda r: float(r.get("mastery_level") or 0.0))
		return weak


class SupabaseLearningRepository:
	def __init__(self) -> None:
		from supabase import create_client

		s = get_settings()
		if not s.supabase_url or not s.supabase_key:
			raise RuntimeError("SUPABASE_URL and SUPABASE_KEY are required for SupabaseLearningRepository")
		self._client = create_client(s.supabase_url, s.supabase_key)

	def _profiles(self) -> Any:
		return self._client.table("user_learning_profiles")

	def _knowledge(self) -> Any:
		return self._client.table("user_knowledge_state")

	async def get_profile(self, user_id: str) -> dict[str, Any] | None:
		def _run() -> dict[str, Any] | None:
			res = self._profiles().select("*").eq("user_id", user_id).limit(1).execute()
			rows = getattr(res, "data", None) or []
			return rows[0] if rows else None

		return await asyncio.to_thread(_run)

	async def upsert_profile(self, user_id: str, data: dict[str, Any]) -> None:
		payload = {"user_id": user_id, **data}

		def _run() -> None:
			self._profiles().upsert(payload, on_conflict="user_id").execute()

		await asyncio.to_thread(_run)

	async def get_knowledge_state(self, user_id: str, topic: str) -> dict[str, Any] | None:
		def _run() -> dict[str, Any] | None:
			res = (
				self._knowledge()
				.select("*")
				.eq("user_id", user_id)
				.eq("topic", topic)
				.limit(1)
				.execute()
			)
			rows = getattr(res, "data", None) or []
			return rows[0] if rows else None

		return await asyncio.to_thread(_run)

	async def get_knowledge_state_by_id(self, record_id: str) -> dict[str, Any] | None:
		def _run() -> dict[str, Any] | None:
			res = self._knowledge().select("*").eq("id", record_id).limit(1).execute()
			rows = getattr(res, "data", None) or []
			return rows[0] if rows else None

		return await asyncio.to_thread(_run)

	async def list_knowledge_state(self, user_id: str) -> list[dict[str, Any]]:
		def _run() -> list[dict[str, Any]]:
			res = self._knowledge().select("*").eq("user_id", user_id).execute()
			return list(getattr(res, "data", None) or [])

		return await asyncio.to_thread(_run)

	async def upsert_knowledge_state(self, user_id: str, topic: str, data: dict[str, Any]) -> None:
		payload = {"user_id": user_id, "topic": topic, **data}

		def _run() -> None:
			self._knowledge().upsert(payload, on_conflict="user_id,topic").execute()

		await asyncio.to_thread(_run)

	async def delete_knowledge_state(self, user_id: str, topic: str) -> bool:
		def _run() -> bool:
			res = self._knowledge().delete().eq("user_id", user_id).eq("topic", topic).execute()
			rows = getattr(res, "data", None) or []
			return len(rows) > 0

		return await asyncio.to_thread(_run)

	async def update_knowledge_state_by_id(self, record_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
		patch = {k: v for k, v in data.items() if v is not None}

		def _run() -> dict[str, Any] | None:
			if not patch:
				res = self._knowledge().select("*").eq("id", record_id).limit(1).execute()
				rows = getattr(res, "data", None) or []
				return rows[0] if rows else None
			res = self._knowledge().update(patch).eq("id", record_id).execute()
			rows = getattr(res, "data", None) or []
			return rows[0] if rows else None

		return await asyncio.to_thread(_run)

	async def list_knowledge_state_sorted(self, user_id: str, *, mastery_desc: bool = True) -> list[dict[str, Any]]:
		def _run() -> list[dict[str, Any]]:
			q = self._knowledge().select("*").eq("user_id", user_id)
			q = q.order("mastery_level", desc=mastery_desc)
			res = q.execute()
			return list(getattr(res, "data", None) or [])

		return await asyncio.to_thread(_run)

	async def list_weak_topics(self, user_id: str, mastery_lt: float) -> list[dict[str, Any]]:
		def _run() -> list[dict[str, Any]]:
			res = (
				self._knowledge()
				.select("*")
				.eq("user_id", user_id)
				.lt("mastery_level", mastery_lt)
				.order("mastery_level", desc=False)
				.execute()
			)
			return list(getattr(res, "data", None) or [])

		return await asyncio.to_thread(_run)


def get_learning_repository() -> LearningRepository:
	s = get_settings()
	if s.supabase_url and s.supabase_key:
		return SupabaseLearningRepository()
	return InMemoryLearningRepository()
