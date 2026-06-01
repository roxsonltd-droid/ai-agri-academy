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
from core.rag_types import RagRetrieval, RagSourceItem

logger = logging.getLogger(__name__)

_MAX_CHUNK = 1200
_MIN_CHUNK = 200

_chunk_texts: list[str] = []
_chunk_sources: list[str] = []
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
    merged: list[str] = []
    for c in chunks:
        if merged and len(c) < _MIN_CHUNK:
            merged[-1] = f"{merged[-1]}\n\n{c}"
        else:
            merged.append(c)
    return merged


def _load_corpus() -> list[tuple[str, str]]:
    """(chunk_text, source_label) — label е име на файл или upload:име."""
    rows: list[tuple[str, str]] = []
    if not KNOWLEDGE_ROOT.is_dir():
        logger.warning("RAG knowledge directory missing: %s", KNOWLEDGE_ROOT)
    else:
        for path in sorted(KNOWLEDGE_ROOT.glob("*.md")):
            try:
                raw = path.read_text(encoding="utf-8")
            except OSError as e:
                logger.warning("Could not read %s: %s", path, e)
                continue
            label = path.name
            for c in _split_into_chunks(raw):
                rows.append((c, label))
            logger.info("RAG loaded %s (%d chunks so far)", path.name, len(rows))

    uploads = knowledge_uploads_dir()
    if uploads.is_dir():
        upload_paths = sorted(uploads.glob("*.md")) + sorted(uploads.glob("*.txt"))
        for path in upload_paths:
            try:
                raw = path.read_text(encoding="utf-8")
            except OSError as e:
                logger.warning("Could not read %s: %s", path, e)
                continue
            label = f"upload:{path.name}"
            for c in _split_into_chunks(raw):
                rows.append((c, label))
            logger.info("RAG loaded upload %s (%d chunks so far)", path.name, len(rows))
    return rows


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
    global _chunk_texts, _chunk_sources, _matrix, _corpus_empty
    if _corpus_empty:
        return
    rows = _load_corpus()
    if not rows:
        _corpus_empty = True
        _chunk_texts = []
        _chunk_sources = []
        _matrix = None
        return
    emb = await _ensure_embedder()
    if emb is None:
        _chunk_texts = []
        _chunk_sources = []
        _matrix = None
        return

    texts = [r[0] for r in rows]
    sources = [r[1] for r in rows]

    def _embed_all() -> list[list[float]]:
        return emb.embed_documents(texts)

    try:
        vectors = await asyncio.to_thread(_embed_all)
    except Exception:
        logger.exception("RAG embedding failed; continuing without knowledge index")
        _chunk_texts = []
        _chunk_sources = []
        _matrix = None
        return
    _chunk_texts = texts
    _chunk_sources = sources
    _matrix = np.array(vectors, dtype=np.float32)


def _format_prompt_block(picked: list[str]) -> str:
    if not picked:
        return ""
    body = "\n\n---\n\n".join(picked)
    return (
        "Следните извадки са от вътрешната база знания на академията. "
        "Използвай ги като опора, но ако не са по темата, разчитай на общите си знания.\n\n"
        f"{body}"
    )


async def retrieve_context_bundle(query: str, k: int | None = None) -> RagRetrieval:
    """Top-k chunks + метаданни за източници (scores, preview)."""
    if not settings.RAG_ENABLED:
        return RagRetrieval(prompt_block="", sources=[])
    top = k if k is not None else settings.RAG_TOP_K
    if not query.strip():
        return RagRetrieval(prompt_block="", sources=[])
    if _corpus_empty:
        return RagRetrieval(prompt_block="", sources=[])

    async with _build_lock:
        if _matrix is None:
            await _build_index_unlocked()
        if _matrix is None or not _chunk_texts:
            return RagRetrieval(prompt_block="", sources=[])
        mat = _matrix
        ch = list(_chunk_texts)
        src = list(_chunk_sources)

    emb = await _ensure_embedder()
    if emb is None:
        return RagRetrieval(prompt_block="", sources=[])

    def _qvec() -> list[float]:
        return emb.embed_query(query)

    q = np.array(await asyncio.to_thread(_qvec), dtype=np.float32)
    scores = _cosine_sim(q, mat)
    idx = np.argsort(-scores)[:top]
    picked: list[str] = []
    sources_out: list[RagSourceItem] = []
    for i in idx:
        if int(i) >= len(ch):
            continue
        text = ch[int(i)]
        picked.append(text)
        sc = float(scores[int(i)])
        preview = " ".join(text.split())[:200]
        sources_out.append(
            RagSourceItem(source=src[int(i)] if int(i) < len(src) else "unknown", score=sc, preview=preview)
        )
        if settings.RAG_LOG_RETRIEVAL:
            logger.info("RAG hit source=%s score=%.4f", src[int(i)] if int(i) < len(src) else "?", sc)

    if not picked:
        return RagRetrieval(prompt_block="", sources=[])
    return RagRetrieval(prompt_block=_format_prompt_block(picked), sources=sources_out)


async def retrieve_context(query: str, k: int | None = None) -> str:
    """Съвместимост: само текстовият блок за prompt."""
    bundle = await retrieve_context_bundle(query, k=k)
    return bundle.prompt_block


async def invalidate_rag_index() -> None:
    """Call after adding/removing knowledge files so the next query rebuilds embeddings."""
    global _chunk_texts, _chunk_sources, _matrix, _corpus_empty
    async with _build_lock:
        _chunk_texts = []
        _chunk_sources = []
        _matrix = None
        _corpus_empty = False
