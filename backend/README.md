# AI Agro Academy — Backend (FastAPI)

Python **FastAPI** API за AI Agro Academy: auth, курсове, чат, лаборатория, RAG / knowledge, платформени метаданни.

## Изисквания

- **Python 3.11+** (виж `../render.yaml` за примерна версия в cloud)
- Виртуална среда (препоръчително)

## Бърз старт (SQLite, без Docker)

От тази папка (`backend/`):

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
```

По подразбиране `DATABASE_URL` не е зададена → **SQLite** файл `./agro_academy.db` в текущата директория. При SQLite приложението създава таблиците автоматично при старт (`create_all` в `main.py`).

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **OpenAPI (Swagger UI):** [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
- **ReDoc:** [http://127.0.0.1:8000/api/v1/redoc](http://127.0.0.1:8000/api/v1/redoc)
- **Health:** `GET /health`

## PostgreSQL (локално с Docker)

Пълно ръководство (SSL, Render, troubleshooting): **[`../docs/POSTGRES.md`](../docs/POSTGRES.md)**.

От **корена на монорепото** (`../`):

```bash
docker compose up -d
```

В **`backend/.env`** задайте:

```env
DATABASE_URL=postgresql+psycopg2://agro:agro_dev_change_me@localhost:5432/agro_academy
```

Паролата и потребителят съвпадат с `../docker-compose.yml` (`agro` / `agro_dev_change_me`, база `agro_academy`).

При **PostgreSQL** не разчитайте на `create_all` за продукция — пуснете миграциите:

```bash
cd backend
python -m alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Променливи на средата (`.env`)

Файлът **`backend/.env`** се зарежда от `pydantic-settings` (`core/config.py`). Примерни стойности са и в **`../.env.example`** (корен на репото).

| Променлива | Задължителна | Описание |
|------------|----------------|----------|
| `DATABASE_URL` | Не | По подразбиране `sqlite:///./agro_academy.db`. За Postgres: `postgresql+psycopg2://USER:PASS@HOST:5432/DBNAME` |
| `BACKEND_CORS_ORIGINS` | Не | Списък origin-и за CORS (по подразбиране включва `localhost:3000`). При задаване от env често се ползва JSON масив. |
| `MISTRAL_API_KEY` | За AI чат / embeddings в „files“ RAG | API ключ към Mistral |
| `RAG_ENABLED` | Не | `true` / `false` (по подразбиране логиката в кода е включена) |
| `RAG_TOP_K` | Не | Брой chunks за RAG |
| `RAG_UPLOAD_SECRET` | Не | Споделен секрет за header `X-RAG-Upload-Secret` при качване на документи |
| `RAG_MAX_UPLOAD_BYTES` | Не | Лимит на upload (по подразбиране 10 MB) |
| `PLATFORM_RAG_BACKEND` | Не | `files` (вградени MD + Mistral) или `llamaindex` (Pinecone през LlamaIndex). Бъдещо: `weaviate` — виж [LANGCHAIN_VECTOR_DB.md](../docs/LANGCHAIN_VECTOR_DB.md) |
| `PINECONE_API_KEY` | За LlamaIndex path | Pinecone API ключ |
| `PINECONE_INDEX_NAME` | За LlamaIndex path | Име на индекс |
| `OPENAI_API_KEY` | За LlamaIndex embeddings | OpenAI ключ |
| `CLERK_JWKS_URL` | За верификация на Clerk JWT | URL към JWKS |
| `CLERK_ISSUER` | За Clerk | Issuer на токените |
| `CLERK_JWT_AUDIENCE` | Не | Ако зададен, `aud` в Clerk JWT се валидира срещу тази стойност |
| `CLOUDFLARE_ACCOUNT_ID` | Опционално (бъдещо Stream API) | Cloudflare акаунт |
| `CLOUDFLARE_STREAM_API_TOKEN` | Опционално | Stream API токен |
| `R2_ACCOUNT_ID` | Опционално (R2) | Cloudflare акаунт за R2 endpoint |
| `R2_ACCESS_KEY_ID` | Опционално | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | Опционално | R2 API token secret |
| `R2_BUCKET_NAME` | Опционално | Име на bucket |
| `R2_PUBLIC_BASE_URL` | Опционално | Публичен base URL за четене (ако ползвате custom domain или public bucket) |
| `R2_PRESIGN_EXPIRES_SECONDS` | Не | TTL за presigned PUT (секунди; по подразбиране 900, ограничение 60–3600) |
| `R2_DELETE_AFTER_INGEST` | Не | `true`/`false` — изтриване на обекта в R2 след успешен `POST .../knowledge/documents/from-r2` (по подразбиране `true`) |
| `ELEVENLABS_API_KEY` | За TTS | API ключ — виж [ELEVENLABS_VOICE.md](../docs/ELEVENLABS_VOICE.md) |
| `ELEVENLABS_VOICE_ID` | За TTS | ID на глас от ElevenLabs dashboard |
| `ELEVENLABS_MODEL_ID` | Не | По подразбиране `eleven_multilingual_v2` |
| `VOICE_TTS_MAX_CHARS` | Не | Макс. символи за една TTS заявка (по подразбиране 4000) |
| `VOICE_TTS_SECRET` | Не | Опционален споделен секрет за header `X-Voice-TTS-Secret` |
| `ROBOFLOW_API_KEY` | За Roboflow infer | Private API key — [ROBOFLOW_VISION.md](../docs/ROBOFLOW_VISION.md) |
| `ROBOFLOW_WORKSPACE` | За infer | Workspace slug |
| `ROBOFLOW_PROJECT` | За infer | Project slug |
| `ROBOFLOW_VERSION` | За infer | Версия на модела (напр. `1`) |
| `ROBOFLOW_CONFIDENCE` | Не | Праг 0.05–0.95 (по подразбиране `0.4`) |
| `ROBOFLOW_IMAGE_MAX_BYTES` | Не | Макс. байтове за снимка (по подразбиране 5 MB) |
| `ROBOFLOW_SERVERLESS_BASE` | Не | По подразбиране `https://serverless.roboflow.com` |
| `ROBOFLOW_INFER_SECRET` | Не | Опционален header `X-Roboflow-Infer-Secret` |

Когато са зададени `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` и `R2_BUCKET_NAME`, `GET /api/v1/platform/status` връща `r2_configured: true`. Пълен поток (presign, CORS): **[`../docs/CLOUDFLARE_R2.md`](../docs/CLOUDFLARE_R2.md)**. Endpoints: **`POST /api/v1/storage/presign`**, **`POST /api/v1/knowledge/documents/from-r2`**. При **`ELEVENLABS_API_KEY`** + **`ELEVENLABS_VOICE_ID`** → **`elevenlabs_configured`**; TTS: **`POST /api/v1/voice/tts`** — **[`../docs/ELEVENLABS_VOICE.md`](../docs/ELEVENLABS_VOICE.md)**. При **`ROBOFLOW_API_KEY`** + workspace/project/version → **`roboflow_configured`**; CV: **`POST /api/v1/vision/roboflow/infer`** — **[`../docs/ROBOFLOW_VISION.md`](../docs/ROBOFLOW_VISION.md)**.

**Забележка:** JWT за вградения email/password login се подписва в `core/security.py` с локален `SECRET_KEY` — за продукция трябва да се изнесе в конфигурация/секрети и да съвпада с това, което очакваш в deployment (`JWT_SECRET` в `render.yaml` е отделна настройка на платформата; подравни я с кода, когато се централизира секретът).

## Допълнителни AI пакети

За LangGraph / LlamaIndex / Pinecone (по избор):

```bash
pip install -r requirements.txt -r requirements-ai.txt
```

## Alembic (миграции на схемата)

- Конфиг: **`alembic.ini`**, **`alembic/env.py`** (импортира `User`, `Course`, `Module`, `Lesson` за `target_metadata`).
- **`DATABASE_URL`** за миграции се взима от **environment** (`env.py`), не от фиксирания ред в `alembic.ini`.

Винаги от папка **`backend/`** (за да е `script_location = alembic` коректен):

```bash
python -m alembic upgrade head      # приложи всички миграции
python -m alembic current           # текуща ревизия
python -m alembic history           # история
python -m alembic revision -m "описание" --autogenerate   # нова миграция от diff (прегледай diff преди commit!)
python -m alembic downgrade -1      # една стъпка назад (ако downgrade е коректен)
```

На **Windows** използвай **`python -m alembic`**, ако `alembic` не е в PATH.

Подробно ръководство (autogenerate, рискове, `order` + `quote=True`, импорт на нови модели в `env.py`): **`../docs/ALEMBIC.md`**.

## Маршрути (преглед)

Префикс по подразбиране: **`/api/v1`** (`API_V1_STR`).

| Router | Път |
|--------|-----|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Chat | `/api/v1/chat` |
| Courses | `/api/v1/courses` |
| Lab | `/api/v1/lab` |
| Knowledge (RAG) | `/api/v1/knowledge` |
| Storage (R2 presign) | `/api/v1/storage` |
| Voice (ElevenLabs TTS) | `/api/v1/voice` |
| Vision (Roboflow) | `/api/v1/vision` |
| Platform | `/api/v1/platform` |
| Agents | `/api/v1/agents` |

## Deploy (кратко)

Пример за Render: в **`../render.yaml`** — `buildCommand` инсталира от `backend/`, `startCommand` първо пуска `alembic upgrade head`, после `uvicorn main:app`.

Архитектура в облака (auth, storage, realtime, free tier): **`../docs/CLOUD_BACKEND.md`**.  
Файлово хранилище (R2, presigned uploads): **`../docs/CLOUDFLARE_R2.md`**.  
Глас (ElevenLabs TTS): **`../docs/ELEVENLABS_VOICE.md`**.  
Vision (Roboflow): **`../docs/ROBOFLOW_VISION.md`**.  
Multi-agent факултет (LangGraph, личности, памет): **`../docs/MULTI_AI_TEACHERS.md`**.  
Видео обучение (уроци, прогрес, Stream): **`../docs/VIDEO_LEARNING_SYSTEM.md`**.

---

По-широк контекст на платформата: **`../docs/PLATFORM.md`**.  
Clerk (auth): **`../docs/CLERK.md`**.
