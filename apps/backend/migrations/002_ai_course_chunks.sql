-- Supabase / Postgres: pgvector table for apps/backend/ai RAG (see ai/pgvector_store.ensure_schema).
-- Run in SQL editor if you prefer migrations outside the app.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_course_chunks (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	course_slug text NOT NULL,
	source_path text NOT NULL,
	chunk_index int NOT NULL,
	content text NOT NULL,
	topic text NOT NULL DEFAULT '',
	lecture_id text NOT NULL DEFAULT '',
	embedding vector(1536),
	meta jsonb NOT NULL DEFAULT '{}'::jsonb,
	UNIQUE (course_slug, source_path, chunk_index)
);

CREATE INDEX IF NOT EXISTS ai_course_chunks_course_slug_idx ON ai_course_chunks (course_slug);

-- Optional: tune IVFFlat / HNSW later for scale.
COMMENT ON TABLE ai_course_chunks IS 'Academy Markdown chunks + OpenAI embeddings for ai.pipeline RAG';
