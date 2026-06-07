"""Paths and constants for the ``ai`` package (env-driven, Supabase-compatible)."""

from __future__ import annotations

import os
from pathlib import Path

# apps/backend/ai/settings.py → parents[1] == apps/backend; parents[1] of that == monorepo app root (agrinexus-final)
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
_REPO_ROOT = _BACKEND_ROOT.parents[1]

DEFAULT_CONTENT_ROOT = _REPO_ROOT / "content" / "academy" / "courses"

AI_CHUNKS_TABLE = os.getenv("AI_CHUNKS_TABLE", "ai_course_chunks")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")
# text-embedding-3-small default dimension
EMBEDDING_DIMENSIONS = int(os.getenv("AI_EMBEDDING_DIMENSIONS", "1536"))


def academy_content_root() -> Path:
    raw = os.getenv("ACADEMY_CONTENT_ROOT", str(DEFAULT_CONTENT_ROOT))
    return Path(raw).resolve()


def database_url() -> str | None:
    return (os.getenv("DATABASE_URL") or os.getenv("POSTGRES_CONNECTION_STRING") or "").strip() or None


def openai_api_key() -> str | None:
    return (os.getenv("OPENAI_API_KEY") or "").strip() or None
