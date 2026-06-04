-- Academy courses catalog (PostgreSQL / Supabase).
-- Apply manually in SQL editor or via your migration runner.

CREATE TABLE IF NOT EXISTS academy_courses (
	id TEXT PRIMARY KEY,
	slug TEXT UNIQUE NOT NULL,
	title TEXT NOT NULL,
	description TEXT DEFAULT '',
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO academy_courses (id, slug, title, description)
VALUES
	(
		'intro-precision',
		'intro-precision',
		'Основи на прецизното земеделие',
		'Въведение в дигиталното фермерство и сензори.'
	)
ON CONFLICT (id) DO NOTHING;
