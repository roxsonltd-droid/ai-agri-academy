"""
File-based RAG for Academy content (no Postgres / pgvector required).

Indexes Markdown under ``content/academy/courses`` with TF–IDF scoring.
Set ``ACADEMY_RAG_BACKEND=file`` to force this backend, or rely on ``auto`` fallback
when ``AcademyRetriever`` (PGVector) cannot be initialised.
"""

from __future__ import annotations

import math
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

# Repo root: apps/backend/rag/file_retriever.py -> parents[3] == agrinexus-final
_DEFAULT_CONTENT = Path(__file__).resolve().parents[3] / "content" / "academy" / "courses"


def _strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return text
    return parts[2].lstrip("\n")


def _parse_frontmatter_meta(text: str) -> Dict[str, str]:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    meta: Dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta


_WORD = re.compile(r"[\w\-]+", re.UNICODE)


def _tokens(s: str) -> List[str]:
    return [t.lower() for t in _WORD.findall(s) if len(t) > 2]


def _chunk_text(text: str, size: int = 900, stride: int = 650) -> List[str]:
    t = text.strip()
    if len(t) <= size:
        return [t] if t else []
    out: List[str] = []
    i = 0
    while i < len(t):
        out.append(t[i : i + size])
        i += stride
    return out


@dataclass
class _Chunk:
    text: str
    tf: Dict[str, int]
    meta: Dict[str, Any]


class SimpleDoc:
    __slots__ = ("page_content", "metadata")

    def __init__(self, page_content: str, metadata: Dict[str, Any]) -> None:
        self.page_content = page_content
        self.metadata = metadata


class FileAcademyRetriever:
    def __init__(self, content_root: Optional[Path] = None) -> None:
        root = content_root or Path(os.getenv("ACADEMY_CONTENT_ROOT", str(_DEFAULT_CONTENT)))
        self.root = root.resolve()
        self.chunks: List[_Chunk] = []
        self._df: Dict[str, int] = {}
        self._N = 0
        self._load()

    def _load(self) -> None:
        if not self.root.is_dir():
            return
        for path in sorted(self.root.rglob("*.md")):
            raw = path.read_text(encoding="utf-8", errors="replace")
            fm = _parse_frontmatter_meta(raw)
            body = _strip_frontmatter(raw)
            rel = path.relative_to(self.root)
            course_slug = fm.get("course_slug") or (rel.parts[0] if rel.parts else "general")
            lecture_id = fm.get("lecture_id", "")
            topic = path.stem.replace("-", " ").title()
            for piece in _chunk_text(body):
                toks = _tokens(piece)
                if not toks:
                    continue
                tf: Dict[str, int] = {}
                for w in toks:
                    tf[w] = tf.get(w, 0) + 1
                meta = {
                    "source": str(rel).replace("\\", "/"),
                    "topic": topic,
                    "course": course_slug,
                    "course_slug": course_slug,
                    "lecture_id": lecture_id,
                    "id": f"{course_slug}:{rel}:{hash(piece) & 0xFFFFFFFF}",
                }
                ch = _Chunk(text=piece, tf=tf, meta=meta)
                self.chunks.append(ch)
                for w in tf:
                    self._df[w] = self._df.get(w, 0) + 1
        self._N = max(len(self.chunks), 1)

    def _idf(self, term: str) -> float:
        df = self._df.get(term, 0)
        if df == 0:
            return 0.0
        return math.log((1.0 + self._N) / (1.0 + df)) + 1.0

    def hybrid_search(self, query: str, top_k: int = 8, filters: dict | None = None) -> List[Any]:
        filters = filters or {}
        want_course = filters.get("course")
        q_terms = _tokens(query)
        if not q_terms:
            return []
        scores: list[tuple[float, _Chunk]] = []
        for ch in self.chunks:
            if want_course and ch.meta.get("course_slug") != want_course and ch.meta.get("course") != want_course:
                continue
            s = 0.0
            for t in q_terms:
                c_tf = ch.tf.get(t, 0)
                if c_tf:
                    s += (1.0 + math.log(c_tf)) * self._idf(t)
            if s > 0:
                scores.append((s, ch))
        scores.sort(key=lambda x: -x[0])
        out: List[Any] = []
        for _, ch in scores[:top_k]:
            out.append(SimpleDoc(ch.text, ch.meta))
        return out

    def get_context(self, query: str, filters: dict | None = None, top_k: int = 7) -> Dict[str, Any]:
        docs = self.hybrid_search(query, top_k=top_k, filters=filters)
        context = "\n\n---\n\n".join(d.page_content for d in docs)
        sources = [
            {
                "source": d.metadata.get("source", "academy"),
                "topic": d.metadata.get("topic", ""),
                "course": d.metadata.get("course", ""),
                "lecture_id": d.metadata.get("lecture_id", ""),
                "chunk_index": d.metadata.get("chunk_index"),
            }
            for d in docs
        ]
        course_filter = None
        if filters:
            course_filter = filters.get("course") or filters.get("course_slug")
        return {
            "context": context,
            "documents": docs,
            "sources": sources,
            "retrieval": {
                "backend": "file",
                "top_k": top_k,
                "document_count": len(docs),
                "course_filter": course_filter,
            },
        }
