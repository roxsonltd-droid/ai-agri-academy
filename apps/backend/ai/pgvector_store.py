"""PGVector storage in Postgres/Supabase for Academy course chunks."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Sequence

import psycopg

from ai.settings import AI_CHUNKS_TABLE, EMBEDDING_DIMENSIONS, database_url

logger = logging.getLogger(__name__)

_TABLE_SAFE = re.compile(r"^[a-z][a-z0-9_]*$")


def _table_sql(name: str) -> str:
    if not _TABLE_SAFE.match(name):
        raise ValueError("AI_CHUNKS_TABLE must match ^[a-z][a-z0-9_]*$")
    return f'"{name}"'


def _vec_literal(vec: Sequence[float]) -> str:
    return "[" + ",".join(f"{x:.8f}" for x in vec) + "]"


def ensure_schema(conn: psycopg.Connection) -> None:
    t = _table_sql(AI_CHUNKS_TABLE)
    dim = EMBEDDING_DIMENSIONS
    idx_name = f"{AI_CHUNKS_TABLE}_course_slug_idx"
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cur.execute(
            f"""
			CREATE TABLE IF NOT EXISTS {t} (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				course_slug text NOT NULL,
				source_path text NOT NULL,
				chunk_index int NOT NULL,
				content text NOT NULL,
				topic text NOT NULL DEFAULT '',
				lecture_id text NOT NULL DEFAULT '',
				embedding vector({dim}),
				meta jsonb NOT NULL DEFAULT '{{}}'::jsonb,
				UNIQUE (course_slug, source_path, chunk_index)
			)
			"""
        )
        cur.execute(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {t} (course_slug)")
    conn.commit()


def count_chunks(conn: psycopg.Connection) -> int:
    t = _table_sql(AI_CHUNKS_TABLE)
    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        row = cur.fetchone()
    return int(row[0]) if row else 0


def truncate_chunks(conn: psycopg.Connection) -> None:
    t = _table_sql(AI_CHUNKS_TABLE)
    with conn.cursor() as cur:
        cur.execute(f"TRUNCATE TABLE {t}")
    conn.commit()


def upsert_chunk(
    conn: psycopg.Connection,
    *,
    course_slug: str,
    source_path: str,
    chunk_index: int,
    content: str,
    topic: str,
    lecture_id: str,
    embedding: Sequence[float],
    meta: dict[str, Any],
) -> None:
    t = _table_sql(AI_CHUNKS_TABLE)
    vec_lit = _vec_literal(embedding)
    q = f"""
	INSERT INTO {t} (course_slug, source_path, chunk_index, content, topic, lecture_id, embedding, meta)
	VALUES (%s, %s, %s, %s, %s, %s, %s::vector, %s::jsonb)
	ON CONFLICT (course_slug, source_path, chunk_index)
	DO UPDATE SET
		content = EXCLUDED.content,
		topic = EXCLUDED.topic,
		lecture_id = EXCLUDED.lecture_id,
		embedding = EXCLUDED.embedding,
		meta = EXCLUDED.meta
	"""
    params = (course_slug, source_path, chunk_index, content, topic, lecture_id, vec_lit, json.dumps(meta))
    with conn.cursor() as cur:
        cur.execute(q, params)


def search_similar(
    conn: psycopg.Connection,
    *,
    query_embedding: Sequence[float],
    course_slug: str | None,
    top_k: int,
) -> list[dict[str, Any]]:
    t = _table_sql(AI_CHUNKS_TABLE)
    vec_lit = _vec_literal(query_embedding)
    q = f"""
        SELECT content, source_path, course_slug, topic,
               (embedding <=> %s::vector) AS dist
        FROM {t}
        WHERE (%s::text IS NULL OR course_slug = %s::text)
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """
    params = (vec_lit, course_slug, course_slug, vec_lit, top_k)
    out: list[dict[str, Any]] = []
    with conn.cursor() as cur:
        cur.execute(q, params)
        for row in cur.fetchall():
            out.append(
                {
                    "content": row[0],
                    "source": row[1],
                    "course": row[2],
                    "topic": row[3],
                    "distance": float(row[4]) if row[4] is not None else None,
                }
            )
    return out


def with_connection() -> psycopg.Connection:
    dsn = database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL (or POSTGRES_CONNECTION_STRING) is not set")
    return psycopg.connect(dsn)
