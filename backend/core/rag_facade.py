"""Unified RAG entry: LlamaIndex+Pinecone when enabled, else bundled file RAG."""

from __future__ import annotations

from core.config import settings
from core.rag_types import RagRetrieval, RagSourceItem


async def retrieve_for_prompt_bundle(query: str, k: int | None = None) -> RagRetrieval:
    """Пълен retrieval: текст за prompt + списък източници (за API / UI)."""
    if settings.PLATFORM_RAG_BACKEND == "llamaindex":
        from rag.llamaindex_pinecone import query_pinecone_context

        block = await query_pinecone_context(query, top_k=k)
        if block:
            preview = block.replace("\n", " ")[:240]
            return RagRetrieval(
                prompt_block=block,
                sources=[
                    RagSourceItem(
                        source="pinecone",
                        score=None,
                        preview=preview,
                    )
                ],
            )
        return RagRetrieval(prompt_block="", sources=[])

    from core.rag import retrieve_context_bundle

    return await retrieve_context_bundle(query, k=k)


async def retrieve_for_prompt(query: str, k: int | None = None) -> str:
    """Само текстовият блок (обратна съвместимост с courses/lab)."""
    bundle = await retrieve_for_prompt_bundle(query, k=k)
    return bundle.prompt_block
