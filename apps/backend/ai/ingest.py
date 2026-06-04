"""Embed Academy Markdown chunks and upsert into Postgres (Supabase + pgvector)."""

from __future__ import annotations

import argparse
import logging
import sys
from collections.abc import Iterator

from ai.embeddings import embed_texts
from ai.markdown_loader import CourseChunk, iter_course_chunks
from ai.pgvector_store import ensure_schema, truncate_chunks, upsert_chunk, with_connection
from ai.settings import academy_content_root, openai_api_key

logger = logging.getLogger(__name__)

DEFAULT_BATCH = 32


def _batched(chunks: list[CourseChunk], size: int) -> Iterator[list[CourseChunk]]:
    for i in range(0, len(chunks), size):
        yield chunks[i : i + size]


def ingest_courses(*, truncate: bool = False, batch_size: int = DEFAULT_BATCH) -> int:
    if not openai_api_key():
        raise RuntimeError("OPENAI_API_KEY is required for ingest")
    root = academy_content_root()
    chunks = list(iter_course_chunks(root))
    if not chunks:
        logger.warning("No Markdown chunks under %s", root)
        return 0
    conn = with_connection()
    try:
        ensure_schema(conn)
        if truncate:
            truncate_chunks(conn)
        total = 0
        for group in _batched(chunks, batch_size):
            texts = [c.text for c in group]
            vectors = embed_texts(texts)
            for ch, vec in zip(group, vectors, strict=True):
                meta = {"topic": ch.topic, "lecture_id": ch.lecture_id}
                upsert_chunk(
                    conn,
                    course_slug=ch.course_slug,
                    source_path=ch.source_path,
                    chunk_index=ch.chunk_index,
                    content=ch.text,
                    topic=ch.topic,
                    lecture_id=ch.lecture_id,
                    embedding=vec,
                    meta=meta,
                )
                total += 1
            conn.commit()
            logger.info("Upserted %s / %s chunks", total, len(chunks))
        return total
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Ingest Academy Markdown into ai_course_chunks (pgvector).")
    parser.add_argument("--truncate", action="store_true", help="TRUNCATE table before ingest (full refresh).")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH, help="Embedding batch size (default 32).")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(levelname)s %(message)s")
    try:
        n = ingest_courses(truncate=args.truncate, batch_size=max(1, args.batch_size))
    except Exception as exc:
        logger.error("%s", exc)
        return 1
    logger.info("Done: %s chunks", n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
