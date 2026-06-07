"""Retriever factory за ``RAGEngine`` (similarity / MMR; hybrid — разширение)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ai.rag.engine import RAGEngine


def get_similarity_retriever(engine: RAGEngine, k: int = 8) -> Any:
    """Стандартен similarity retriever (LangChain ``as_retriever``)."""
    return engine.get_retriever(k=k)


def get_mmr_retriever(engine: RAGEngine, k: int = 8, fetch_k: int = 24) -> Any:
    """MMR за по-разнообразни чънкове при близки embedding-и."""
    return engine.vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": k, "fetch_k": fetch_k},
    )


class HybridRetriever:
    """
    Обвивка за бъдещ hybrid search (dense + lexical).

    В момента делегира на similarity; добави BM25/keyword merge тук.
    """

    def __init__(self, engine: RAGEngine, k: int = 8) -> None:
        self._inner = get_similarity_retriever(engine, k=k)

    def invoke(self, query: str) -> list[Any]:
        return self._inner.invoke(query)

    async def ainvoke(self, query: str) -> list[Any]:
        return await self._inner.ainvoke(query)
