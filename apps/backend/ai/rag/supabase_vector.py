"""Supabase + pgvector чрез LangChain ``SupabaseVectorStore`` (RPC ``match_documents``)."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from ai.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)


def _require_supabase_env() -> tuple[str, str]:
    url = (os.getenv("SUPABASE_URL") or "").strip()
    key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "").strip()
    if not url or not key:
        raise RuntimeError(
            "За Supabase Vector Store задай SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY (или SUPABASE_KEY)."
        )
    return url, key


class SupabaseVectorConfig:
    """Клиент + embeddings + фабрика за ``SupabaseVectorStore``."""

    def __init__(
        self,
        *,
        table_name: str | None = None,
        query_name: str | None = None,
        chunk_size: int | None = None,
    ) -> None:
        self.supabase_url, self.supabase_key = _require_supabase_env()
        from supabase import create_client

        self.supabase_client = create_client(self.supabase_url, self.supabase_key)
        self.embeddings = get_embeddings()
        self.table_name = table_name or os.getenv("SUPABASE_RAG_TABLE", "documents")
        self.query_name = query_name or os.getenv("SUPABASE_RAG_MATCH_FN", "match_documents")
        self.chunk_size = int(chunk_size or os.getenv("SUPABASE_RAG_CHUNK_SIZE", "500"))

    def get_vectorstore(self) -> Any:
        from langchain_community.vectorstores import SupabaseVectorStore

        return SupabaseVectorStore(
            client=self.supabase_client,
            embedding=self.embeddings,
            table_name=self.table_name,
            query_name=self.query_name,
            chunk_size=self.chunk_size,
        )

    def from_documents(self, documents: list[Any]) -> Any:
        """Индексира документи (upsert по таблицата)."""
        from langchain_community.vectorstores import SupabaseVectorStore

        return SupabaseVectorStore.from_documents(
            documents,
            self.embeddings,
            client=self.supabase_client,
            table_name=self.table_name,
            query_name=self.query_name,
            chunk_size=self.chunk_size,
        )

    def similarity_search(self, query: str, k: int = 8, filter: dict[str, Any] | None = None) -> list[Any]:
        """Синхронно търсене (Supabase Python client е sync)."""
        return self.get_vectorstore().similarity_search(query, k=k, filter=filter)

    async def asimilarity_search(self, query: str, k: int = 8, filter: dict[str, Any] | None = None) -> list[Any]:
        return await asyncio.to_thread(self.similarity_search, query, k, filter)
