"""Unified RAG entry: LlamaIndex+Pinecone when enabled, else bundled file RAG."""

from __future__ import annotations

from core.config import settings


async def retrieve_for_prompt(query: str, k: int | None = None) -> str:
    if settings.PLATFORM_RAG_BACKEND == "llamaindex":
        from rag.llamaindex_pinecone import query_pinecone_context

        block = await query_pinecone_context(query, top_k=k)
        if block:
            return block
    # Lazy import: core.rag pulls numpy/langchain; only needed for file RAG.
    from core.rag import retrieve_context as retrieve_file_rag

    return await retrieve_file_rag(query, k=k)
