"""
LlamaIndex retriever over Elasticsearch / OpenSearch.
Requires: requirements-ai.txt, ELASTICSEARCH_*, OPENAI_API_KEY.
Performs True Hybrid Search (BM25 + Dense Vectors).
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
        settings.PLATFORM_RAG_BACKEND == "elasticsearch"
        and bool(settings.ELASTICSEARCH_URL)
        and bool(settings.OPENAI_API_KEY)
    )


async def query_elasticsearch_context(question: str, top_k: int | None = None) -> str | None:
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
        from llama_index.vector_stores.elasticsearch import ElasticsearchStore

        embed = OpenAIEmbedding(
            api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small",
        )
        Settings.embed_model = embed

        # Connect to Elasticsearch
        es_kwargs = {}
        if settings.ELASTICSEARCH_USERNAME and settings.ELASTICSEARCH_PASSWORD:
            es_kwargs["basic_auth"] = (settings.ELASTICSEARCH_USERNAME, settings.ELASTICSEARCH_PASSWORD)

        vector_store = ElasticsearchStore(
            es_url=settings.ELASTICSEARCH_URL,
            index_name=settings.ELASTICSEARCH_INDEX_NAME,
            **es_kwargs
        )
        
        index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed)
        
        # Enable Hybrid Search (BM25 + kNN)
        qe = index.as_query_engine(
            similarity_top_k=k,
            vector_store_query_mode="hybrid"
        )
        resp = qe.query(question)
        text = str(resp).strip()
        return text if text else ""

    try:
        out = await asyncio.to_thread(_run)
        if not out:
            return None
        return (
            "Контекст от Elasticsearch (Hybrid Search):\n"
            "Използвай го като опора; ако е нерелевантен, разчитай на общи знания.\n\n"
            f"{out}"
        )
    except Exception:
        logger.exception("LlamaIndex/Elasticsearch query failed")
        return None
