"""
RAG over Academy materials:
- Bundled ``knowledge/*.md`` + ``knowledge/uploads`` (PDF→txt, md) via ``retrieve_for_prompt``
- Course / lesson Markdown from the database (embedded separately; invalidated on lesson corpus change)
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
from typing import TYPE_CHECKING

import numpy as np
from langchain_mistralai import MistralAIEmbeddings

from core.config import settings
from core.rag_facade import retrieve_for_prompt

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

_MAX_CHUNK = 1200
_MIN_CHUNK = 200

_lesson_chunks: list[str] = []
_lesson_matrix: np.ndarray | None = None
_lesson_fingerprint: str | None = None
_lesson_lock = asyncio.Lock()
_lesson_embedder: MistralAIEmbeddings | None = None


def invalidate_lesson_rag_index() -> None:
    """Drop in-memory lesson embeddings (call after course/lesson mutations)."""
    global _lesson_chunks, _lesson_matrix, _lesson_fingerprint
    _lesson_chunks = []
    _lesson_matrix = None
    _lesson_fingerprint = None


def _split_into_chunks(text: str) -> list[str]:
    parts = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    buf = ""
    for p in parts:
        if len(buf) + len(p) + 2 <= _MAX_CHUNK:
            buf = f"{buf}\n\n{p}" if buf else p
        else:
            if buf:
                chunks.append(buf)
            buf = p if len(p) <= _MAX_CHUNK else p[:_MAX_CHUNK]
    if buf:
        chunks.append(buf)
    merged: list[str] = []
    for c in chunks:
        if merged and len(c) < _MIN_CHUNK:
            merged[-1] = f"{merged[-1]}\n\n{c}"
        else:
            merged.append(c)
    return merged


def _lesson_corpus_fingerprint(db: Session) -> str:
    from models.course import Lesson

    h = hashlib.sha256()
    for row in db.query(Lesson.id, Lesson.content).order_by(Lesson.id).all():
        lid, content = row
        raw = (content or "").encode("utf-8", errors="replace")
        h.update(lid.encode("utf-8"))
        h.update(len(raw).to_bytes(8, "big"))
        h.update(hashlib.sha256(raw).digest())
    return h.hexdigest()


def _lesson_chunks_from_db(db: Session) -> list[str]:
    from models.course import Course

    out: list[str] = []
    for course in db.query(Course).order_by(Course.id).all():
        modules = sorted(course.modules, key=lambda m: m.order)
        for mod in modules:
            lessons = sorted(mod.lessons, key=lambda l: l.order)
            for les in lessons:
                body = (les.content or "").strip()
                if not body:
                    continue
                header = (
                    f"Курс: {course.title}\n"
                    f"Модул: {mod.title}\n"
                    f"Урок: {les.title}\n\n"
                )
                out.extend(_split_into_chunks(header + body))
    return out


def _cosine_sim(query: np.ndarray, mat: np.ndarray) -> np.ndarray:
    qn = np.linalg.norm(query) + 1e-12
    mn = np.linalg.norm(mat, axis=1) + 1e-12
    return (mat @ query) / (mn * qn)


async def _ensure_lesson_embedder() -> MistralAIEmbeddings | None:
    global _lesson_embedder
    if not settings.MISTRAL_API_KEY:
        return None
    if _lesson_embedder is None:
        _lesson_embedder = MistralAIEmbeddings(
            model="mistral-embed",
            api_key=settings.MISTRAL_API_KEY,
        )
    return _lesson_embedder


async def _build_lesson_index_unlocked(db: Session) -> None:
    global _lesson_chunks, _lesson_matrix, _lesson_fingerprint
    fp = _lesson_corpus_fingerprint(db)
    corpus = _lesson_chunks_from_db(db)
    if not corpus:
        _lesson_chunks = []
        _lesson_matrix = None
        _lesson_fingerprint = fp
        return
    emb = await _ensure_lesson_embedder()
    if emb is None:
        _lesson_chunks = []
        _lesson_matrix = None
        _lesson_fingerprint = fp
        return

    def _embed_all() -> list[list[float]]:
        return emb.embed_documents(corpus)

    try:
        vectors = await asyncio.to_thread(_embed_all)
    except Exception:
        logger.exception("Lesson RAG embedding failed")
        _lesson_chunks = []
        _lesson_matrix = None
        _lesson_fingerprint = fp
        return

    _lesson_chunks = corpus
    _lesson_matrix = np.array(vectors, dtype=np.float32)
    _lesson_fingerprint = fp


async def retrieve_lesson_context(query: str, db: Session, k: int | None = None) -> str:
    """Top-k chunks from course lesson bodies in the database."""
    if not settings.RAG_ENABLED or not query.strip():
        return ""
    top = k if k is not None else settings.ACADEMY_LESSON_RAG_TOP_K

    async with _lesson_lock:
        fp = _lesson_corpus_fingerprint(db)
        if _lesson_matrix is None or _lesson_fingerprint != fp:
            await _build_lesson_index_unlocked(db)
        mat = _lesson_matrix
        ch = list(_lesson_chunks)

    if mat is None or not ch:
        return ""

    emb = await _ensure_lesson_embedder()
    if emb is None:
        return ""

    def _qvec() -> list[float]:
        return emb.embed_query(query)

    q = np.array(await asyncio.to_thread(_qvec), dtype=np.float32)
    scores = _cosine_sim(q, mat)
    idx = np.argsort(-scores)[:top]
    picked = [ch[i] for i in idx if i < len(ch)]
    if not picked:
        return ""
    body = "\n\n---\n\n".join(picked)
    return (
        "Извадки от учебното съдържание на курсовете (уроци в платформата). "
        "Използвай ги като основен източник за факти за конкретния курс.\n\n"
        f"{body}"
    )


async def combined_academy_context(query: str, db: Session) -> str:
    """
    Full Academy RAG: file/bundled knowledge (incl. uploaded PDF→text, MD) + DB lesson chunks.
    """
    file_part = await retrieve_for_prompt(query)
    lesson_part = await retrieve_lesson_context(query, db)
    if file_part and lesson_part:
        return (
            f"{file_part}\n\n"
            "==========\n"
            "Курсово съдържание (уроци)\n"
            "==========\n\n"
            f"{lesson_part}"
        )
    return file_part or lesson_part
