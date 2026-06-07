"""LangChain RAG engine: PGVector (direct Postgres) или Supabase Vector Store."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from ai.rag.chunker import get_chunker
from ai.rag.embeddings import get_embeddings
from ai.rag.loaders import load_academy_content
from ai.rag.rag_cache_serde import rag_pack_to_storable, stable_json_for_cache_key, storable_to_rag_pack
from ai.settings import database_url
from ai.vector_store.filters import build_agri_vector_metadata_filter
from app.core.cache import get_redis_cache
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class RAGEngine:
    """Embeddings + Academy loaders + PGVector **или** SupabaseVectorStore."""

    def __init__(self, collection_name: str | None = None) -> None:
        self._backend = (os.getenv("RAG_VECTOR_BACKEND") or "pgvector").strip().lower()
        self.collection_name = collection_name or os.getenv("RAG_LC_COLLECTION", "ai_agri_academy")
        self.connection_string = database_url() or os.getenv("POSTGRES_CONNECTION_STRING", "").strip() or None
        self.embeddings = get_embeddings()
        self._vectorstore: Any = None
        self._vector_store_service: Any = None

    @staticmethod
    def merge_retrieval_filter(
        base: dict[str, Any] | None,
        *,
        culture: str | None = None,
        region: str | None = None,
        module: str | None = None,
        difficulty: str | None = None,
    ) -> dict[str, Any] | None:
        """
        Обединява metadata филтър от повикващия с convenience полета.
        Стойностите в ``base`` имат приоритет при съвпадение на ключове.
        """
        extra = build_agri_vector_metadata_filter(
            culture=culture,
            region=region,
            module=module,
            difficulty=difficulty,
        )
        if not base and not extra:
            return None
        merged = {**extra, **(base or {})}
        return merged or None

    def _rag_cache_enabled(self, use_cache: bool | None) -> tuple[bool, int]:
        s = get_settings()
        on = use_cache if use_cache is not None else (bool(s.redis_url) and s.academy_rag_cache_enabled)
        return on, int(s.academy_rag_cache_ttl_seconds)

    def _rag_cache_key(self, query: str, k: int, merged: dict[str, Any] | None, use_compression: bool) -> str:
        prefix = (get_settings().academy_rag_cache_prefix or "agri:rag:v1").strip().rstrip(":")
        bump = (os.getenv("ACADEMY_RAG_CACHE_BUMP") or "").strip()
        return get_redis_cache().generate_key(
            prefix,
            q=query.strip().lower(),
            k=k,
            fs=stable_json_for_cache_key({"filter": merged or {}}),
            mode=self._retrieval_mode(),
            uc=use_compression,
            bump=bump,
        )

    def _try_rag_cache_read_sync(self, cache_key: str) -> dict[str, Any] | None:
        raw = get_redis_cache().get_json(cache_key)
        if raw is None:
            return None
        pack = storable_to_rag_pack(raw) if isinstance(raw, dict) else None
        if pack is None:
            return None
        logger.debug("RAGEngine: cache hit %s…", cache_key[:56])
        return pack

    def _try_rag_cache_write_sync(self, cache_key: str, pack: dict[str, Any], ttl: int) -> None:
        try:
            get_redis_cache().set_json(cache_key, rag_pack_to_storable(pack), ttl)
        except Exception as e:
            logger.warning("RAGEngine: cache set failed: %s", e)

    async def _try_rag_cache_read_async(self, cache_key: str) -> dict[str, Any] | None:
        raw = await get_redis_cache().aget_json(cache_key)
        if raw is None:
            return None
        pack = storable_to_rag_pack(raw) if isinstance(raw, dict) else None
        if pack is None:
            return None
        logger.debug("RAGEngine: cache hit %s…", cache_key[:56])
        return pack

    async def _try_rag_cache_write_async(self, cache_key: str, pack: dict[str, Any], ttl: int) -> None:
        try:
            await get_redis_cache().aset_json(cache_key, rag_pack_to_storable(pack), ttl)
        except Exception as e:
            logger.warning("RAGEngine: cache set failed: %s", e)

    def _maybe_compress(self, query: str, pack: dict[str, Any], use_compression: bool) -> dict[str, Any]:
        """След retrieval опционално компресира ``documents`` чрез ``AgriContextualCompressor``."""
        out = dict(pack)
        if not use_compression:
            out.setdefault("used_compression", False)
            return out
        docs = list(out.get("documents") or [])
        if not docs:
            out.setdefault("used_compression", False)
            return out
        try:
            from ai.rag.compression import AgriContextualCompressor

            comp = AgriContextualCompressor()
            compressed = comp.compress_documents(query, docs)
            ctx = "\n\n---\n\n".join(
                (d.page_content or "").strip() for d in compressed if (d.page_content or "").strip()
            )
            out["documents"] = compressed
            out["context"] = ctx
            out["used_compression"] = True
        except Exception as e:
            logger.warning("RAGEngine: contextual compression failed (%s) — връщам некомпресиран контекст.", e)
            out.setdefault("used_compression", False)
        return out

    @property
    def vectorstore(self) -> Any:
        if self._vectorstore is None:
            raise RuntimeError("RAGEngine не е инициализиран — извикай initialize().")
        return self._vectorstore

    def initialize(self, *, rebuild: bool = False) -> None:
        if self._backend == "supabase":
            self._init_supabase(rebuild=rebuild)
            return

        self._init_pgvector(rebuild=rebuild)

    def _init_pgvector(self, *, rebuild: bool) -> None:
        if not self.connection_string:
            raise RuntimeError("DATABASE_URL или POSTGRES_CONNECTION_STRING е задължителен за PGVector.")

        from langchain_community.vectorstores import PGVector

        if rebuild:
            docs = load_academy_content()
            chunker = get_chunker()
            chunks = chunker.split_documents(docs)
            for ch in chunks:
                ch.metadata.setdefault("source_type", "academy")
                ch.metadata.setdefault("language", "bg")
            self._vectorstore = PGVector.from_documents(
                documents=chunks,
                embedding=self.embeddings,
                collection_name=self.collection_name,
                connection_string=self.connection_string,
                use_jsonb=True,
            )
            logger.info("RAG: PGVector пресъздаден с %s чънка (%s)", len(chunks), self.collection_name)
            return

        self._vectorstore = PGVector(
            connection_string=self.connection_string,
            embedding_function=self.embeddings,
            collection_name=self.collection_name,
            use_jsonb=True,
        )
        logger.info("RAG: PGVector свързан към колекция %s", self.collection_name)

    def _init_supabase(self, *, rebuild: bool) -> None:
        from ai.vector_store.service import VectorStoreService

        self._vector_store_service = VectorStoreService()
        if rebuild:
            docs = load_academy_content()
            chunker = get_chunker()
            chunks = chunker.split_documents(docs)
            for ch in chunks:
                ch.metadata.setdefault("source_type", "academy")
                ch.metadata.setdefault("language", "bg")
            self._vectorstore = self._vector_store_service.from_documents(chunks)
            logger.info(
                "RAG: Supabase upsert %s чънка в таблица %s",
                len(chunks),
                self._vector_store_service.config.table_name,
            )
            return

        self._vectorstore = self._vector_store_service.get_vectorstore()
        logger.info("RAG: SupabaseVectorStore (%s)", self._vector_store_service.config.table_name)

    async def ainitialize(self, *, rebuild: bool = False) -> "RAGEngine":
        await asyncio.to_thread(self.initialize, rebuild=rebuild)
        return self

    def get_retriever(self, k: int = 8) -> Any:
        return self.vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": k})

    def get_retriever_score_threshold(self, k: int = 8, score_threshold: float = 0.75) -> Any:
        """Работи с SupabaseVectorStore (LangChain relevance scores)."""
        return self.vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"k": k, "score_threshold": score_threshold},
        )

    def similarity_search(self, query: str, k: int = 8, filter: dict[str, Any] | None = None) -> list[Any]:
        vs = self.vectorstore
        if filter:
            try:
                return vs.similarity_search(query, k=k, filter=filter)
            except TypeError:
                logger.warning("RAGEngine: vector store без filter= — пропускам metadata филтър.")
                return vs.similarity_search(query, k=k)
        return vs.similarity_search(query, k=k)

    async def asimilarity_search(self, query: str, k: int = 8, filter: dict[str, Any] | None = None) -> list[Any]:
        vs = self.vectorstore
        if filter:
            try:
                return await vs.asimilarity_search(query, k=k, filter=filter)
            except TypeError:
                logger.warning("RAGEngine: vector store без filter= — пропускам metadata филтър.")
                return await vs.asimilarity_search(query, k=k)
        return await vs.asimilarity_search(query, k=k)

    @staticmethod
    def _retrieval_mode() -> str:
        """``flat`` (default) | ``parent_child`` — виж ``ACADEMY_RETRIEVAL_MODE``."""
        return (os.getenv("ACADEMY_RETRIEVAL_MODE") or "flat").strip().lower()

    @staticmethod
    def _pack_flat_result(docs: list[Any], filter: dict[str, Any] | None) -> dict[str, Any]:
        parts = [d.page_content for d in docs if getattr(d, "page_content", None)]
        context = "\n\n---\n\n".join(parts)
        out: dict[str, Any] = {"context": context, "documents": docs}
        if filter is not None:
            out["used_filter"] = filter
        return out

    def retrieve(
        self,
        query: str,
        k: int = 7,
        filter: dict[str, Any] | None = None,
        *,
        culture: str | None = None,
        region: str | None = None,
        module: str | None = None,
        difficulty: str | None = None,
        use_compression: bool = False,
        use_cache: bool | None = None,
        cache_ttl_seconds: int | None = None,
    ) -> dict[str, Any]:
        """Контекст за RAG / ReAct. При ``ACADEMY_RETRIEVAL_MODE=parent_child`` — child search + parent контекст."""
        merged = self.merge_retrieval_filter(
            filter,
            culture=culture,
            region=region,
            module=module,
            difficulty=difficulty,
        )
        cache_on, ttl_default = self._rag_cache_enabled(use_cache)
        ttl = int(cache_ttl_seconds) if cache_ttl_seconds is not None else ttl_default
        cache_key: str | None = None
        if cache_on:
            cache_key = self._rag_cache_key(query, k, merged, use_compression)
            hit = self._try_rag_cache_read_sync(cache_key)
            if hit is not None:
                return hit

        self.initialize(rebuild=False)
        if self._retrieval_mode() == "parent_child":
            from ai.rag.retrievers.parent_child import ParentChildRetriever

            out = ParentChildRetriever(self.vectorstore).retrieve(query, k=k, filter=merged)
            if not (out.get("child_docs") or []):
                logger.info("Parent–child: няма child попадения — flat RAG fallback.")
                docs = self.similarity_search(query, k=k, filter=merged)
                pack = self._pack_flat_result(docs, merged)
                result = self._maybe_compress(query, pack, use_compression)
            else:
                if merged is not None:
                    out["used_filter"] = merged
                result = self._maybe_compress(query, out, use_compression)
        else:
            docs = self.similarity_search(query, k=k, filter=merged)
            pack = self._pack_flat_result(docs, merged)
            result = self._maybe_compress(query, pack, use_compression)

        if cache_on and cache_key:
            self._try_rag_cache_write_sync(cache_key, result, ttl)
        return result

    async def aretrieve(
        self,
        query: str,
        k: int = 7,
        filter: dict[str, Any] | None = None,
        *,
        culture: str | None = None,
        region: str | None = None,
        module: str | None = None,
        difficulty: str | None = None,
        use_compression: bool = False,
        use_cache: bool | None = None,
        cache_ttl_seconds: int | None = None,
    ) -> dict[str, Any]:
        merged = self.merge_retrieval_filter(
            filter,
            culture=culture,
            region=region,
            module=module,
            difficulty=difficulty,
        )
        cache_on, ttl_default = self._rag_cache_enabled(use_cache)
        ttl = int(cache_ttl_seconds) if cache_ttl_seconds is not None else ttl_default
        cache_key: str | None = None
        if cache_on:
            cache_key = self._rag_cache_key(query, k, merged, use_compression)
            hit = await self._try_rag_cache_read_async(cache_key)
            if hit is not None:
                return hit

        await self.ainitialize(rebuild=False)
        if self._retrieval_mode() == "parent_child":
            from ai.rag.retrievers.parent_child import ParentChildRetriever

            out = await ParentChildRetriever(self.vectorstore).aretrieve(query, k=k, filter=merged)
            if not (out.get("child_docs") or []):
                logger.info("Parent–child: няма child попадения — flat RAG fallback.")
                docs = await self.asimilarity_search(query, k=k, filter=merged)
                pack = self._pack_flat_result(docs, merged)
                result = await self._amaybe_compress(query, pack, use_compression)
            else:
                if merged is not None:
                    out["used_filter"] = merged
                result = await self._amaybe_compress(query, out, use_compression)
        else:
            docs = await self.asimilarity_search(query, k=k, filter=merged)
            pack = self._pack_flat_result(docs, merged)
            result = await self._amaybe_compress(query, pack, use_compression)

        if cache_on and cache_key:
            await self._try_rag_cache_write_async(cache_key, result, ttl)
        return result

    async def _amaybe_compress(self, query: str, pack: dict[str, Any], use_compression: bool) -> dict[str, Any]:
        """Не блокира event loop при LLM компресия."""
        if use_compression:
            return await asyncio.to_thread(self._maybe_compress, query, pack, True)
        return self._maybe_compress(query, pack, False)
