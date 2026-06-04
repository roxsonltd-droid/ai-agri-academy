"""Опционален Redis кеш (async + sync) за Academy RAG и други услуги."""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

_redis_cache_singleton: "RedisCache | None" = None


def get_redis_cache() -> "RedisCache":
	global _redis_cache_singleton
	if _redis_cache_singleton is None:
		from app.core.config import get_settings

		_redis_cache_singleton = RedisCache(url=get_settings().redis_url)
	return _redis_cache_singleton


class RedisCache:
	"""
	Минимален JSON кеш върху Redis.
	- Без ``REDIS_URL``: всички операции са no-op / връщат None.
	- ``decode_responses=False`` — пазим ``bytes`` (utf-8 JSON).
	"""

	def __init__(self, url: str | None) -> None:
		self._url = (url or "").strip() or None
		self._async_client: Any = None
		self._sync_client: Any = None

	def is_configured(self) -> bool:
		return self._url is not None

	def generate_key(self, prefix: str, **kwargs: Any) -> str:
		payload = json.dumps(kwargs, sort_keys=True, default=str, ensure_ascii=False)
		digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:32]
		return f"{prefix}:{digest}"

	def _sync(self) -> Any | None:
		if not self.is_configured():
			return None
		if self._sync_client is None:
			try:
				import redis as redis_sync
			except ImportError:
				logger.warning("RedisCache: пакетът ``redis`` не е инсталиран — sync кеш е изключен.")
				return None
			self._sync_client = redis_sync.Redis.from_url(self._url, decode_responses=False)
		return self._sync_client

	async def _async(self) -> Any | None:
		if not self.is_configured():
			return None
		if self._async_client is None:
			try:
				import redis.asyncio as redis_async
			except ImportError:
				logger.warning("RedisCache: пакетът ``redis`` не е инсталиран — async кеш е изключен.")
				return None
			self._async_client = redis_async.Redis.from_url(self._url, decode_responses=False)
		return self._async_client

	def get_json(self, key: str) -> Any | None:
		r = self._sync()
		if r is None:
			return None
		try:
			raw = r.get(key)
			if not raw:
				return None
			if isinstance(raw, memoryview):
				raw = raw.tobytes()
			return json.loads(raw.decode("utf-8"))
		except Exception as e:
			logger.debug("RedisCache.get_json miss/fail (%s): %s", key[:48], e)
			return None

	def set_json(self, key: str, value: Any, ttl_seconds: int) -> None:
		r = self._sync()
		if r is None:
			return
		try:
			data = json.dumps(value, default=str, ensure_ascii=False).encode("utf-8")
			r.setex(key, max(1, int(ttl_seconds)), data)
		except Exception as e:
			logger.warning("RedisCache.set_json failed (%s): %s", key[:48], e)

	def delete(self, key: str) -> None:
		r = self._sync()
		if r is None:
			return
		try:
			r.delete(key)
		except Exception as e:
			logger.warning("RedisCache.delete failed: %s", e)

	async def aget_json(self, key: str) -> Any | None:
		r = await self._async()
		if r is None:
			return None
		try:
			raw = await r.get(key)
			if not raw:
				return None
			if isinstance(raw, memoryview):
				raw = raw.tobytes()
			return json.loads(raw.decode("utf-8"))
		except Exception as e:
			logger.debug("RedisCache.aget_json miss/fail (%s): %s", key[:48], e)
			return None

	async def aset_json(self, key: str, value: Any, ttl_seconds: int) -> None:
		r = await self._async()
		if r is None:
			return
		try:
			data = json.dumps(value, default=str, ensure_ascii=False).encode("utf-8")
			await r.setex(key, max(1, int(ttl_seconds)), data)
		except Exception as e:
			logger.warning("RedisCache.aset_json failed (%s): %s", key[:48], e)

	async def adelete(self, key: str) -> None:
		r = await self._async()
		if r is None:
			return
		try:
			await r.delete(key)
		except Exception as e:
			logger.warning("RedisCache.adelete failed: %s", e)

	async def adelete_pattern(self, pattern: str) -> int:
		"""SCAN + DELETE. Връща брой изтрити ключове."""
		r = await self._async()
		if r is None:
			return 0
		n = 0
		try:
			async for key in r.scan_iter(match=pattern, count=200):
				await r.delete(key)
				n += 1
			return n
		except Exception as e:
			logger.exception("RedisCache.adelete_pattern failed: %s", e)
			return n

	def delete_pattern(self, pattern: str) -> int:
		"""Синхронен SCAN + DELETE."""
		r = self._sync()
		if r is None:
			return 0
		n = 0
		try:
			for key in r.scan_iter(match=pattern, count=200):
				r.delete(key)
				n += 1
			return n
		except Exception as e:
			logger.exception("RedisCache.delete_pattern failed: %s", e)
			return n
