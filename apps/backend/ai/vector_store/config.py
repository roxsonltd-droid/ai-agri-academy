"""Конфигурация за Supabase + pgvector (LangChain ``SupabaseVectorStore``).

Таблица по подразбиране: ``VECTOR_STORE_TABLE`` → ``SUPABASE_RAG_TABLE`` → ``documents``.
За ``academy_documents`` RPC по подразбиране е ``match_academy_documents`` (виж миграция 004).
"""

from __future__ import annotations

import os
from typing import Any

from ai.rag.supabase_vector import SupabaseVectorConfig


def default_vector_table() -> str:
    return (
        (os.getenv("VECTOR_STORE_TABLE") or os.getenv("SUPABASE_RAG_TABLE") or "documents").strip()
    )


def resolve_match_rpc_name(table_name: str, query_name: str | None) -> str | None:
    """LangChain ``query_name``: ``match_academy_documents`` за таблица ``academy_documents``, иначе env / default."""
    if query_name and str(query_name).strip():
        return str(query_name).strip()
    env_fn = (os.getenv("VECTOR_STORE_MATCH_FN") or os.getenv("SUPABASE_RAG_MATCH_FN") or "").strip()
    if env_fn:
        return env_fn
    if table_name.strip().lower() == "academy_documents":
        return "match_academy_documents"
    return None


class VectorStoreConfig:
    """Фасад над ``SupabaseVectorConfig`` — единна конфигурация за vector store + ingest."""

    def __init__(
        self,
        *,
        table_name: str | None = None,
        query_name: str | None = None,
        chunk_size: int | None = None,
    ) -> None:
        tbl = table_name or default_vector_table()
        qn = resolve_match_rpc_name(tbl, query_name)
        self._impl = SupabaseVectorConfig(
            table_name=tbl,
            query_name=qn,
            chunk_size=chunk_size,
        )

    @property
    def supabase_url(self) -> str:
        return self._impl.supabase_url

    @property
    def supabase_key(self) -> str:
        return self._impl.supabase_key

    @property
    def client(self) -> Any:
        return self._impl.supabase_client

    @property
    def embeddings(self) -> Any:
        return self._impl.embeddings

    @property
    def table_name(self) -> str:
        return self._impl.table_name

    @property
    def query_name(self) -> str:
        return self._impl.query_name

    @property
    def chunk_size(self) -> int:
        return self._impl.chunk_size

    def get_vectorstore(self) -> Any:
        return self._impl.get_vectorstore()

    def from_documents(self, documents: list[Any]) -> Any:
        return self._impl.from_documents(documents)
