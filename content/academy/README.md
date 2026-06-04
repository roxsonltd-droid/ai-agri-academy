# AgriNexus Academy — канонично съдържание

Тази папка е **източник на истина** за курсове и лекции (Markdown + JSON метаданни). След промени пусни от корена на монорепото (канонично **`C:\Users\expre\Academy`** — виж **`docs/CANONICAL-WORKSPACE-BG.md`**):

```bash
npm run sync:academy
```

## Структура

```
content/academy/
  README.md                 ← този файл
  courses/
    <slug>/
      course.json           ← slug, заглавия (bg/en), описания, списък лекции
      *.md                  ← тяло на лекцията (препоръчително YAML frontmatter)
```

### `course.json`

- `slug` — URL сегмент (`soil-fertility`).
- `modules` — брой модула за UI.
- `title` / `description` — `{ "bg": "...", "en": "..." }`.
- `lectures[]` — `id`, `file` (път под `public/lectures/`, напр. `courses/soil-fertility/01-probi-i-baza.md`), `filename` (локален файл в същата папка), `title`, `summary` (bg/en).

### Markdown

По желание YAML frontmatter:

```yaml
---
course_slug: soil-fertility
lecture_id: sf-probi
---
```

## RAG

- **Ingest в pgvector:** от `apps/backend/rag` с активен `.env` и `POSTGRES_CONNECTION_STRING` — виж `build_academy_rag.py` (зарежда от `content/academy/courses`).
- **Файлов fallback (без Postgres vector):** `ACADEMY_RAG_BACKEND=file` — TF‑IDF подобно търсене върху същите `.md` файлове; виж `docs/ACADEMY_CONTENT.md`.
