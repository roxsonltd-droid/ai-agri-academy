# AgriNexus backend API (FastAPI)

Старт от `agrinexus-final/apps/backend`:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## OpenAPI (Swagger + ReDoc)

Със стартиран сървър:

- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
- **OpenAPI JSON:** `http://127.0.0.1:8000/openapi.json`

Променливи и тайни: **`docs/ENVIRONMENT.md`**.

**Next.js (`apps/web`):** `POST /api/tutor/chat` и `POST /api/tutor/deep-debate` са Route Handlers, които проксират към същия FastAPI през **`API_URL`** (виж `apps/web/.env.example`). В браузъра не е нужен CORS за тези два маршрута.

## Маршрути

| Метод | Път | Описание |
|--------|-----|----------|
| GET | `/health` | Liveness |
| GET | `/health/db` | PostgreSQL `SELECT 1` (ако има `DATABASE_URL`) |
| POST | `/api/auth/token` | Dev JWT (HS256) за тест |
| GET | `/api/auth/me` | Декодиране на Bearer (Clerk → Supabase JWT → dev JWT) |
| POST | `/api/tutor/chat` | Academy tutor + RAG: pgvector stack **или** файлов TF–IDF fallback (`ACADEMY_RAG_BACKEND=file`) — виж `docs/ACADEMY_CONTENT.md` |
| POST | `/api/tutor/graph` | **LangGraph** (минимален граф: класификация на тема → чернов отговор). При `MISTRAL_API_KEY` се вика Mistral API; иначе стъб. Toggle: `FEATURE_TUTOR_LANGGRAPH` / Unleash `tutor_langgraph`. |
| POST | `/api/tutor/deep-debate` | Multi-agent дебат |
| GET | `/api/academy/courses` | Списък курсове от таблица `academy_courses` |
| POST | `/api/webhooks/supabase-user-created` | Webhook + HMAC на raw body |

## Auth

1. **Clerk** — задайте `CLERK_JWKS_URL`, опционално `CLERK_ISSUER`, `CLERK_AUDIENCE`. Тогава Bearer се валидира като Clerk JWT (приоритет).
2. **Supabase Auth** — `SUPABASE_JWT_SECRET` (+ опционално `SUPABASE_JWT_AUDIENCE=authenticated`).
3. **Dev** — `POST /api/auth/token` с `{ "email": "..." }` и `JWT_SECRET`.

За да се изисква токен за tutor: `AUTH_REQUIRED_FOR_TUTOR=true`.

## Rate limiting

[SlowAPI](https://github.com/laurentS/slowapi): по подразбиране `30/min` за chat, `10/min` за deep-debate, `60/min` за webhooks. Override чрез env в `app/core/config.py` (`RATE_TUTOR_CHAT`, …) — изисква рестарт (лимитите са статични в декораторите; при нужда променете стойностите в `app/api/tutor.py` / `webhooks.py`).

## Webhook verification

Header: `x-webhook-signature` (или `WEBHOOK_SIGNATURE_HEADER`) = lowercase hex на `HMAC_SHA256(WEBHOOK_HMAC_SECRET, raw_body)`.

Алтернатива за легаси env: `SUPABASE_WEBHOOK_SECRET` се ползва като secret, ако `WEBHOOK_HMAC_SECRET` липсва.

## Feature flags

- Env: `FEATURE_TUTOR_CHAT`, `FEATURE_TUTOR_DEEP_DEBATE`, `FEATURE_TUTOR_LANGGRAPH`, `FEATURE_ACADEMY_COURSES_API` (`true`/`false`).
- **Unleash:** `UNLEASH_URL` (base до `/api`, напр. `https://…/default/api`), `UNLEASH_API_TOKEN` (client token). Toggle имена: `tutor_chat`, `tutor_deep_debate`, `tutor_langgraph`, `academy_courses`.

## База данни

- **Supabase** = managed Postgres + Auth — препоръчително; същият `DATABASE_URL` за `psycopg` и за Prisma.
- **Prisma** (опционално за Node): `apps/backend/prisma/schema.prisma` — синхрон с таблица `academy_courses`.
- SQL seed: `apps/backend/migrations/001_academy_courses.sql`.

Python **не** използва Prisma runtime — само SQL/Supabase client. Alembic не е задължителен; миграции може да водите с Prisma или с SQL в Supabase.

## Стара `rag/main.py`

Legacy сървър на порт 8000 с `/tutor/chat` без `/api` префикс — за нови клиенти ползвайте `app.main:app` и маршрутите по-горе.
