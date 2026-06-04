"""Услуга за Academy vector store: инициализация, ingest на партиди, similarity / hybrid (вектор)."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from langchain_core.documents import Document

from ai.vector_store.config import VectorStoreConfig
from ai.vector_store.filters import build_agri_vector_metadata_filter

logger = logging.getLogger(__name__)


def _default_ingest_batch() -> int:
    try:
        return max(1, min(200, int(os.getenv("VECTOR_STORE_INGEST_BATCH", "50"))))
    except ValueError:
        return 50


class VectorStoreService:
    """LangChain ``SupabaseVectorStore`` — upsert, търсене, подготовка за hybrid (pg_trgm в БД)."""

    def __init__(self, config: VectorStoreConfig | None = None) -> None:
        self.config = config or VectorStoreConfig()
        self._vectorstore: Any | None = None

    def get_vectorstore(self) -> Any:
        if self._vectorstore is None:
            self._vectorstore = self.config.get_vectorstore()
        return self._vectorstore

    async def initialize(self) -> Any:
        await asyncio.to_thread(self.get_vectorstore)
        return self._vectorstore

    def add_documents(self, docs: list[Document], *, batch_size: int | None = None) -> int:
        """Upsert на чънкове (синхронно; Supabase client е sync)."""
        if not docs:
            return 0
        vs = self.get_vectorstore()
        bs = batch_size if batch_size is not None else _default_ingest_batch()
        total = 0
        for i in range(0, len(docs), bs):
            batch = docs[i : i + bs]
            vs.add_documents(batch)
            total += len(batch)
            logger.info(
                "VectorStoreService: записани %s документа (batch %s–%s, таблица %s)",
                len(batch),
                i,
                i + len(batch),
                self.config.table_name,
            )
        return total

    async def aadd_documents(self, docs: list[Document], *, batch_size: int | None = None) -> int:
        return await asyncio.to_thread(self.add_documents, docs, batch_size=batch_size)

    def similarity_search(self, query: str, k: int = 8, filter: dict[str, Any] | None = None) -> list[Any]:
        vs = self.get_vectorstore()
        if filter:
            try:
                return vs.similarity_search(query, k=k, filter=filter)
            except TypeError:
                logger.warning("Vector store без filter= — пропускам metadata филтър за този backend.")
                return vs.similarity_search(query, k=k)
        return vs.similarity_search(query, k=k)

    async def asimilarity_search(self, query: str, k: int = 8, filter: dict[str, Any] | None = None) -> list[Any]:
        return await asyncio.to_thread(self.similarity_search, query, k, filter)

    async def hybrid_search(self, query: str, k: int = 8) -> list[Any]:
        """
        В момента: векторно търсене (HNSW + RPC ``match_documents``).
        Пълен hybrid (vector + ``pg_trgm`` keyword) — чрез отделна SQL функция / PostgREST filter (TBD).
        """
        return await self.asimilarity_search(query, k=k, filter=None)

    def retrieve_with_filter(
        self,
        query: str,
        *,
        k: int = 7,
        culture: str | None = None,
        region: str | None = None,
        module: str | None = None,
        difficulty: str | None = None,
        source_type: str | None = None,
    ) -> dict[str, Any]:
        """Векторно търсене + metadata containment (``@>`` в Supabase RPC)."""
        flt = build_agri_vector_metadata_filter(
            culture=culture,
            region=region,
            module=module,
            difficulty=difficulty,
            source_type=source_type,
        )
        use_filter: dict[str, Any] | None = flt if flt else None
        docs = self.similarity_search(query, k=k, filter=use_filter)
        parts = [d.page_content for d in docs if getattr(d, "page_content", None)]
        context = "\n\n---\n\n".join(parts)
        return {"context": context, "documents": docs, "used_filter": flt}

    async def aretrieve_with_filter(
        self,
        query: str,
        *,
        k: int = 7,
        culture: str | None = None,
        region: str | None = None,
        module: str | None = None,
        difficulty: str | None = None,
        source_type: str | None = None,
    ) -> dict[str, Any]:
        return await asyncio.to_thread(
            self.retrieve_with_filter,
            query,
            k=k,
            culture=culture,
            region=region,
            module=module,
            difficulty=difficulty,
            source_type=source_type,
        )

    def from_documents(self, documents: list[Document]) -> Any:
        """Пълен re-ingest: заменя кеширания store с резултата от ``from_documents``."""
        self._vectorstore = self.config.from_documents(documents)
        return self._vectorstore