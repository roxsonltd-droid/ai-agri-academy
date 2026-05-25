"""Paths for bundled knowledge and uploads — no numpy / embedding deps (safe at import time)."""

from __future__ import annotations

from pathlib import Path

KNOWLEDGE_ROOT = Path(__file__).resolve().parent.parent / "knowledge"
_UPLOADS_DIR_NAME = "uploads"


def knowledge_uploads_dir() -> Path:
    d = KNOWLEDGE_ROOT / _UPLOADS_DIR_NAME
    d.mkdir(parents=True, exist_ok=True)
    return d
