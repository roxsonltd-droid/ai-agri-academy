"""Load Markdown course files into text chunks (no LangChain)."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator

_WORD = re.compile(r"[\w\-]+", re.UNICODE)


def _strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return text
    return parts[2].lstrip("\n")


def _parse_frontmatter_meta(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    meta: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta


def _chunk_text(text: str, size: int = 900, stride: int = 650) -> list[str]:
    t = text.strip()
    if len(t) <= size:
        return [t] if t else []
    out: list[str] = []
    i = 0
    while i < len(t):
        out.append(t[i : i + size])
        i += stride
    return out


@dataclass
class CourseChunk:
    text: str
    course_slug: str
    source_path: str
    chunk_index: int
    topic: str
    lecture_id: str


def iter_course_chunks(content_root: Path) -> Iterator[CourseChunk]:
    if not content_root.is_dir():
        return
    for path in sorted(content_root.rglob("*.md")):
        raw = path.read_text(encoding="utf-8", errors="replace")
        fm = _parse_frontmatter_meta(raw)
        body = _strip_frontmatter(raw)
        rel = path.relative_to(content_root)
        course_slug = fm.get("course_slug") or (rel.parts[0] if rel.parts else "general")
        lecture_id = fm.get("lecture_id", "")
        topic = path.stem.replace("-", " ").title()
        rel_str = str(rel).replace("\\", "/")
        for i, piece in enumerate(_chunk_text(body)):
            if not piece.strip():
                continue
            yield CourseChunk(
                text=piece,
                course_slug=course_slug,
                source_path=rel_str,
                chunk_index=i,
                topic=topic,
                lecture_id=lecture_id,
            )


def _tokens(s: str) -> list[str]:
    return [t.lower() for t in _WORD.findall(s) if len(t) > 2]


class TfidfFallbackIndex:
    """Tiny TF–IDF index over in-memory chunks (used when PG has no rows or DB unavailable)."""

    def __init__(self, chunks: list[dict[str, Any]]) -> None:
        self._chunks = chunks
        self._df: dict[str, int] = {}
        self._N = max(len(chunks), 1)
        for ch in chunks:
            toks = set(_tokens(ch["text"]))
            for w in toks:
                self._df[w] = self._df.get(w, 0) + 1

    def _idf(self, term: str) -> float:
        import math

        df = self._df.get(term, 0)
        if df == 0:
            return 0.0
        return math.log((1.0 + self._N) / (1.0 + df)) + 1.0

    def search(self, query: str, course_slug: str | None, top_k: int = 7) -> list[dict[str, Any]]:
        q_terms = _tokens(query)
        if not q_terms:
            return []
        import math

        scores: list[tuple[float, dict[str, Any]]] = []
        for ch in self._chunks:
            if course_slug and ch.get("course_slug") != course_slug:
                continue
            tf: dict[str, int] = {}
            for w in _tokens(ch["text"]):
                tf[w] = tf.get(w, 0) + 1
            s = 0.0
            for t in q_terms:
                c_tf = tf.get(t, 0)
                if c_tf:
                    s += (1.0 + math.log(c_tf)) * self._idf(t)
            if s > 0:
                scores.append((s, ch))
        scores.sort(key=lambda x: -x[0])
        return [c for _, c in scores[:top_k]]
