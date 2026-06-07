"""RAG retrieval: PGVector + OpenAI embeddings when available, else TF–IDF over Markdown chunks."""

from __future__ import annotations

import logging
from typing import Any

from ai.embeddings import embed_query
from ai.markdown_loader import TfidfFallbackIndex, iter_course_chunks
from ai.pgvector_store import count_chunks, search_similar, with_connection
from ai.settings import academy_content_root, database_url, openai_api_key

logger = logging.getLogger(__name__)


class _Doc:
    __slots__ = ("page_content", "metadata")

    def __init__(self, page_content: str, metadata: dict[str, Any]) -> None:
        self.page_content = page_content
        self.metadata = metadata


def _course_slug_from_filters(filters: dict | None) -> str | None:
    if not filters:
        return None
    return filters.get("course") or filters.get("course_slug")


class AiCourseRAG:
    """Retrieve Academy course context: vector search in ``ai_course_chunks`` or in-process TF–IDF."""

    def __init__(self) -> None:
        self._tfidf: TfidfFallbackIndex | None = None

    def _build_tfidf(self) -> TfidfFallbackIndex:
        chunks: list[dict[str, Any]] = []
        for ch in iter_course_chunks(academy_content_root()):
            chunks.append(
                {
                    "text": ch.text,
                    "course_slug": ch.course_slug,
                    "source_path": ch.source_path,
                    "topic": ch.topic,
                    "lecture_id": ch.lecture_id,
                }
            )
        return TfidfFallbackIndex(chunks)

    def _get_tfidf(self) -> TfidfFallbackIndex:
        if self._tfidf is None:
            self._tfidf = self._build_tfidf()
        return self._tfidf

    def _vector_docs(self, query: str, course_slug: str | None, top_k: int) -> list[_Doc] | None:
        if not (database_url() and openai_api_key()):
            return None
        try:
            conn = with_connection()
        except Exception as exc:
            logger.debug("AI RAG: skip vector path (connection): %s", exc)
            return None
        try:
            n = count_chunks(conn)
            if n == 0:
                return None
            qvec = embed_query(query)
            rows = search_similar(conn, query_embedding=qvec, course_slug=course_slug, top_k=top_k)
        except Exception as exc:
            logger.warning("AI RAG: vector search failed, using TF–IDF: %s", exc)
            return None
        finally:
            try:
                conn.close()
            except Exception:
                pass
        out: list[_Doc] = []
        for row in rows:
            meta = {
                "source": row.get("source", ""),
                "topic": row.get("topic", ""),
                "course": row.get("course", ""),
                "course_slug": row.get("course", ""),
                "lecture_id": "",
            }
            out.append(_Doc(row.get("content") or "", meta))
        return out

    def _tfidf_docs(self, query: str, course_slug: str | None, top_k: int) -> list[_Doc]:
        index = self._get_tfidf()
        raw = index.search(query, course_slug=course_slug, top_k=top_k)
        out: list[_Doc] = []
        for ch in raw:
            meta = {
                "source": ch.get("source_path", ""),
                "topic": ch.get("topic", ""),
                "course": ch.get("course_slug", ""),
                "course_slug": ch.get("course_slug", ""),
                "lecture_id": ch.get("lecture_id", ""),
            }
            out.append(_Doc(ch.get("text", ""), meta))
        return out

    def get_context(self, query: str, filters: dict | None = None, top_k: int = 7) -> dict[str, Any]:
        course_slug = _course_slug_from_filters(filters)
        docs = self._vector_docs(query, course_slug, top_k)
        if not docs:
            docs = self._tfidf_docs(query, course_slug, top_k)
        context = "\n\n---\n\n".join(d.page_content for d in docs)
        sources = [
            {
                "source": d.metadata.get("source", "academy"),
                "topic": d.metadata.get("topic", ""),
                "course": d.metadata.get("course", ""),
            }
            for d in docs
        ]
        return {"context": context, "documents": docs, "sources": sources}


_instance: AiCourseRAG | None = None


def get_ai_rag_retriever() -> AiCourseRAG:
    global _instance
    if _instance is None:
        _instance = AiCourseRAG()
    return _instance
