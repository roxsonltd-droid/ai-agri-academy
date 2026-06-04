"""
LlamaIndex retriever over Qdrant.
Requires: requirements-ai.txt, QDRANT_*, OPENAI_API_KEY (OpenAI embeddings by default).
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
        and bool(settings.QDRANT_URL)
        and bool(settings.QDRANT_COLLECTION_NAME)
        and bool(settings.OPENAI_API_KEY)
    )


async def query_qdrant_context(question: str, top_k: int | None = None) -> str | None:
    """
    Returns a single string context block for injection into prompts, or None if skipped/failed.
    Runs sync LlamaIndex calls in a worker thread.
    """
    if not _is_configured():
        return None
    k = top_k if top_k is not None else settings.RAG_TOP_K

    def _run() -> str:
        import qdrant_client
        from llama_index.core import Settings, VectorStoreIndex
        from llama_index.embeddings.openai import OpenAIEmbedding
        from llama_index.vector_stores.qdrant import QdrantVectorStore

        embed = OpenAIEmbedding(
            api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small",
        )
        Settings.embed_model = embed

        client = qdrant_client.QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )

        vector_store = QdrantVectorStore(
            client=client, 
            collection_name=settings.QDRANT_COLLECTION_NAME or "agro_knowledge"
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
            "Контекст от Qdrant (LlamaIndex):\n"
            "Използвай го като опора; ако е нерелевантен, разчитай на общи знания.\n\n"
            f"{out}"
        )
    except Exception:
        logger.exception("LlamaIndex/Qdrant query failed")
        return None
