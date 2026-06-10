"""
Retriever factory: optional ``ai`` RAG (OpenAI + pgvector), LangChain PG hybrid, or TF–IDF files.

``ACADEMY_RAG_BACKEND``: ``auto`` | ``ai`` | ``file`` | ``pg``.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

_pg_retriever = None
_file_retriever = None
_ai_retriever = None


def get_retriever():
    """Return the Academy retriever based on ``ACADEMY_RAG_BACKEND``."""
    global _pg_retriever, _file_retriever, _ai_retriever
    mode = (os.getenv("ACADEMY_RAG_BACKEND") or "auto").lower()
    if mode == "ai":
        if _ai_retriever is None:
            from ai.pipeline import get_ai_rag_retriever

            _ai_retriever = get_ai_rag_retriever()
        return _ai_retriever
    if mode == "file":
        if _file_retriever is None:
            from file_retriever import FileAcademyRetriever

            _file_retriever = FileAcademyRetriever()
        return _file_retriever
    if mode in ("pg", "postgres", "vector"):
        if _pg_retriever is None:
            try:
                from pg_retriever import AcademyRetriever

                _pg_retriever = AcademyRetriever()
            except Exception as e:
                import logging
                logging.error(f"Failed to initialize PGVector retriever: {e}. Falling back to file retriever.")
                if _file_retriever is None:
                    from file_retriever import FileAcademyRetriever

                    _file_retriever = FileAcademyRetriever()
                return _file_retriever
        return _pg_retriever
    if _pg_retriever is not None:
        return _pg_retriever
    if _file_retriever is not None:
        return _file_retriever
    if _ai_retriever is not None:
        return _ai_retriever
    dsn = (os.getenv("DATABASE_URL") or os.getenv("POSTGRES_CONNECTION_STRING") or "").strip()
    has_openai = bool((os.getenv("OPENAI_API_KEY") or "").strip())
    if dsn and has_openai:
        try:
            from ai.pipeline import get_ai_rag_retriever

            if _ai_retriever is None:
                _ai_retriever = get_ai_rag_retriever()
            return _ai_retriever
        except Exception:
            pass
    try:
        from pg_retriever import AcademyRetriever

        _pg_retriever = AcademyRetriever()
        return _pg_retriever
    except Exception:
        if _file_retriever is None:
            from file_retriever import FileAcademyRetriever

            _file_retriever = FileAcademyRetriever()
        return _file_retriever


def __getattr__(name: str):
    if name == "retriever":
        return get_retriever()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
