# Academy съдържание и RAG

## Къде е канонът

- **`content/academy/courses/<slug>/`** — `course.json` (метаданни + списък лекции) и Markdown файлове за всяка лекция.
- След редакция пуснете от корена на `agrinexus-final`:

```bash
npm run sync:academy
```

Това копира Markdown в `apps/web/public/lectures/...` и обновява:

- `apps/web/src/content/academy.catalog.json`
- `apps/mobile/lib/academy.catalog.json`

Next.js импортира каталога в `src/content/academy-courses.ts`; мобилното — в `lib/courses.ts`.

На всяка **страница на курс** (`/academy/course/[slug]`) има клиентски панел **Course tutor (RAG)** — изпраща `culture = slug` към `POST /api/tutor/chat` (Next прокси → FastAPI), така че retrieval да е ограничен до материалите на този курс. Вторият бутон стартира **Deep debate** (`POST /api/tutor/deep-debate`) със същия прокси и визуализация (`AnimatedDebateTimeline`).

## RAG върху съдържанието

### 1) Файлов режим (без pgvector)

Подходящ за локална разработка без тежки LangChain зависимости и без PostgreSQL с embeddings.

- Модул: `apps/backend/rag/file_retriever.py`
- Индексира всички `*.md` под `content/academy/courses`, чисти YAML frontmatter, чънква текста и търси с **TF–IDF-подобен** score по заявката.

Променливи:

| Variable | Effect |
|----------|--------|
| `ACADEMY_RAG_BACKEND=file` | Винаги файлов retriever |
| `ACADEMY_RAG_BACKEND=auto` (по подразбиране) | Опитва PGVector retriever; при грешка → файлов |
| `ACADEMY_RAG_BACKEND=pg` | Принудително PGVector (както досега) |
| `ACADEMY_CONTENT_ROOT` | Път към папката `courses` (по подразбиране: `<repo>/content/academy/courses`) |

### 2) pgvector pipeline (пълен стек)

От директория `apps/backend/rag` с инсталирани optional зависимости и `POSTGRES_CONNECTION_STRING` (виж `pg_retriever.py`):

```bash
python build_academy_rag.py
```

Скриптът зарежда Markdown от **`content/academy/courses`** (рекурсивно), чънква и пълни колекция `academy_tutor_v1` в PGVector.

## Курс „Интегрирана растителна защита“

Нов курс `integrated-pest-management` с две лекции и финален тест (`final-course-tests/integrated-pest-management.ts`).
