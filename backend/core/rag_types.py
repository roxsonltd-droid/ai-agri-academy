"""Shared types for RAG retrieval (used by rag_facade, API responses)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class RagSourceItem(BaseModel):
    """Един източник, ползван при retrieval (файл от knowledge/ или Pinecone)."""

    source: str = Field(description="Етикет: име на файл, upload или pinecone")
    score: float | None = Field(
        default=None, description="Косинусова прилика или None за външен backend"
    )
    preview: str = Field(default="", description="Кратък преглед на текста")


class RagRetrieval(BaseModel):
    """Блок за prompt + метаданни за UI / логове."""

    prompt_block: str = Field(default="", description="Текст за инжектиране в LLM")
    sources: list[RagSourceItem] = Field(default_factory=list)
