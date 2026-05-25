"""
LlamaIndex retriever over Pinecone.
Requires: requirements-ai.txt, PINECONE_*, OPENAI_API_KEY (OpenAI embeddings by default).
"""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING

from core.config import settings

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    pass


def _is_configured() -> bool:
    return (
        settings.PLATFORM_RAG_BACKEND == "llamaindex"
        and bool(settings.PINECONE_API_KEY)
        and bool(settings.PINECONE_INDEX_NAME)
        and bool(settings.OPENAI_API_KEY)
    )


async def query_pinecone_context(question: str, top_k: int | None = None) -> str | None:
    """
    Returns a single string context block for injection into prompts, or None if skipped/failed.
    Runs sync LlamaIndex calls in a worker thread.
    """
    if not _is_configured():
        return None
    k = top_k if top_k is not None else settings.RAG_TOP_K

    def _run() -> str:
        from llama_index.core import Settings, VectorStoreIndex
        from llama_index.embeddings.openai import OpenAIEmbedding
        from llama_index.vector_stores.pinecone import PineconeVectorStore

        embed = OpenAIEmbedding(
            api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small",
        )
        Settings.embed_model = embed

        vector_store = PineconeVectorStore(
            api_key=settings.PINECONE_API_KEY,
            index_name=settings.PINECONE_INDEX_NAME or "",
        )
        index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed)
        qe = index.as_query_engine(similarity_top_k=k)
        resp = qe.query(question)
        text = str(resp).strip()
        return text if text else ""

    try:
        out = await asyncio.to_thread(_run)
        if not out:
            return None
        return (
            "Контекст от Pinecone (LlamaIndex):\n"
            "Използвай го като опора; ако е нерелевантен, разчитай на общи знания.\n\n"
            f"{out}"
        )
    except Exception:
        logger.exception("LlamaIndex/Pinecone query failed")
        return None
