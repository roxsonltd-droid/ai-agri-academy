"""Инвалидиране на RAG Redis кеш (SCAN по префикс)."""

from __future__ import annotations

import logging

from app.core.cache import get_redis_cache
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class RAGCacheManager:
	def __init__(self) -> None:
		p = (get_settings().academy_rag_cache_prefix or "agri:rag:v1").strip().rstrip(":")
		self._pattern = f"{p}:*"
		self._cache = get_redis_cache()

	async def invalidate_all_async(self) -> int:
		"""Изтрива всички ключове с префикс на RAG кеша. Връща брой изтрити."""
		n = await self._cache.adelete_pattern(self._pattern)
		logger.info("RAGCacheManager: invalidate_all_async removed %s keys (pattern=%s)", n, self._pattern)
		return n

	def invalidate_all_sync(self) -> int:
		n = self._cache.delete_pattern(self._pattern)
		logger.info("RAGCacheManager: invalidate_all_sync removed %s keys (pattern=%s)", n, self._pattern)
		return n


def get_rag_cache_manager() -> RAGCacheManager:
	return RAGCacheManager()
