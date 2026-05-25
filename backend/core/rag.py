"""
Lightweight RAG: Mistral embeddings + cosine retrieval over bundled knowledge files.
No vector DB dependency — fits Render free tier and cold starts (rebuilds index in memory).
"""

from __future__ import annotations

import asyncio
import logging

import numpy as np
from langchain_mistralai import MistralAIEmbeddings

from core.config import settings
from core.rag_paths import KNOWLEDGE_ROOT, knowledge_uploads_dir

logger = logging.getLogger(__name__)

_MAX_CHUNK = 1200
_MIN_CHUNK = 200


_chunks: list[str] = []
_matrix: np.ndarray | None = None
_embedder: MistralAIEmbeddings | None = None
_build_lock = asyncio.Lock()
_corpus_empty: bool = False


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
    # merge tiny trailing pieces into previous chunk
    merged: list[str] = []
    for c in chunks:
        if merged and len(c) < _MIN_CHUNK:
            merged[-1] = f"{merged[-1]}\n\n{c}"
        else:
            merged.append(c)
    return merged


def _load_corpus() -> list[str]:
    if not KNOWLEDGE_ROOT.is_dir():
        logger.warning("RAG knowledge directory missing: %s", KNOWLEDGE_ROOT)
        return []
    all_chunks: list[str] = []
    for path in sorted(KNOWLEDGE_ROOT.glob("*.md")):
        try:
            raw = path.read_text(encoding="utf-8")
        except OSError as e:
            logger.warning("Could not read %s: %s", path, e)
            continue
        all_chunks.extend(_split_into_chunks(raw))
        logger.info("RAG loaded %s (%d chunks so far)", path.name, len(all_chunks))

    uploads = knowledge_uploads_dir()
    if uploads.is_dir():
        upload_paths = sorted(uploads.glob("*.md")) + sorted(uploads.glob("*.txt"))
        for path in upload_paths:
            try:
                raw = path.read_text(encoding="utf-8")
            except OSError as e:
                logger.warning("Could not read %s: %s", path, e)
                continue
            all_chunks.extend(_split_into_chunks(raw))
            logger.info("RAG loaded upload %s (%d chunks so far)", path.name, len(all_chunks))
    return all_chunks


def _cosine_sim(query: np.ndarray, mat: np.ndarray) -> np.ndarray:
    qn = np.linalg.norm(query) + 1e-12
    mn = np.linalg.norm(mat, axis=1) + 1e-12
    return (mat @ query) / (mn * qn)


async def _ensure_embedder() -> MistralAIEmbeddings | None:
    global _embedder
    if not settings.MISTRAL_API_KEY:
        return None
    if _embedder is None:
        _embedder = MistralAIEmbeddings(
            model="mistral-embed",
            api_key=settings.MISTRAL_API_KEY,
        )
    return _embedder


async def _build_index_unlocked() -> None:
    global _chunks, _matrix, _corpus_empty
    if _corpus_empty:
        return
    corpus = _load_corpus()
    if not corpus:
        _corpus_empty = True
        _chunks = []
        _matrix = None
        return
    emb = await _ensure_embedder()
    if emb is None:
        _chunks = []
        _matrix = None
        return

    def _embed_all() -> list[list[float]]:
        return emb.embed_documents(corpus)

    try:
        vectors = await asyncio.to_thread(_embed_all)
    except Exception:
        logger.exception("RAG embedding failed; continuing without knowledge index")
        _chunks = []
        _matrix = None
        return
    _chunks = corpus
    _matrix = np.array(vectors, dtype=np.float32)


async def retrieve_context(query: str, k: int | None = None) -> str:
    """
    Returns top-k knowledge snippets for the query, or empty string if RAG is off / unavailable.
    """
    if not settings.RAG_ENABLED:
        return ""
    top = k if k is not None else settings.RAG_TOP_K
    if not query.strip():
        return ""
    if _corpus_empty:
        return ""

    async with _build_lock:
        if _matrix is None:
            await _build_index_unlocked()
        if _matrix is None or not _chunks:
            return ""
        mat = _matrix
        ch = list(_chunks)

    emb = await _ensure_embedder()
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
        "Следните извадки са от вътрешната база знания на академията. "
        "Използвай ги като опора, но ако не са по темата, разчитай на общите си знания.\n\n"
        f"{body}"
    )


async def invalidate_rag_index() -> None:
    """Call after adding/removing knowledge files so the next query rebuilds embeddings."""
    global _chunks, _matrix, _corpus_empty
    async with _build_lock:
        _chunks = []
        _matrix = None
        _corpus_empty = False
