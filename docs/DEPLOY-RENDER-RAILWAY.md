# Deploy: Render & Railway (FastAPI + optional Next)

This monorepo’s **canonical API** is `apps/backend` → **`app.main:app`** (Uvicorn). Docker: `apps/backend/Dockerfile` (includes `app/` + `rag/` for `/api/tutor/*`).

## Environment variables (backend)

| Variable | Notes |
|----------|--------|
| `PORT` | Render/Railway inject this; the Dockerfile uses `${PORT:-8000}`. |
| `DATABASE_URL` | Postgres (Supabase pooler or Render Postgres). |
| `CORS_ORIGINS` | Comma list, e.g. `https://your-next.onrender.com,https://app.example.com`. |
| `JWT_SECRET` / `SUPABASE_JWT_SECRET` | Auth verification (see `docs/BACKEND_API.md`). |
| `OPENAI_API_KEY` | Tutor + debate LLM (`rag/core/llm.py`). |
| `MISTRAL_API_KEY` | Optional for `/api/tutor/graph`. |
| `ACADEMY_RAG_BACKEND` | `file` (no pgvector) or `auto` / `pg`. |
| `ACADEMY_CONTENT_ROOT` | If you bundle Academy Markdown into the image, set to that path (see below). |

### Academy content in production

File RAG resolves `content/academy/courses` relative to the repo on disk. In Docker **only** `app` + `rag` are copied by default. Either:

1. **Build from monorepo root** and extend the Dockerfile with something like:

   ```dockerfile
   COPY agrinexus-final/content/academy/courses /app/academy-content/courses
   ENV ACADEMY_CONTENT_ROOT=/app/academy-content/courses
   ```

   (Adjust paths to match your clone name.)

2. Or **mount** the same directory as a volume on Render/Railway.

---

## Render

1. **New Web Service** → connect repo → **Root directory** `agrinexus-final/apps/backend` (or your subfolder name).
2. **Runtime**: Docker (use `Dockerfile` in that directory).
3. **Instance type**: smallest is fine for smoke tests.
4. Add **environment** group from the table above.
5. Health check path: `/health` (or `/health/db` if you want DB in the check).

**Next.js on Render:** separate Web Service, root `agrinexus-final/apps/web`, build `npm ci && npm run build`, start `npm run start`, set `API_URL` to the private backend URL so `POST /api/tutor/*` route handlers can proxy.

---

## Railway

1. **New Project** → **Deploy from GitHub** → select repo.
2. Add a **service** with **Dockerfile** path `agrinexus-final/apps/backend/Dockerfile` and root context that contains `agrinexus-final/` (Railway: set **Root Directory** to the folder that contains both `apps` and `content`, or use a Dockerfile that only needs `apps/backend` and set `ACADEMY_RAG_BACKEND=pg` with a hosted DB).
3. Railway sets `PORT` automatically — compatible with the Dockerfile `CMD`.
4. Attach **PostgreSQL** plugin if you use `DATABASE_URL` + pgvector pipeline.

**Networking:** set service **public domain** and paste it into Next `API_URL` / mobile `EXPO_PUBLIC_BACKEND_URL`.

---

## Checklist after deploy

- [ ] `GET https://<api>/health` returns `{"status":"ok"}`.
- [ ] `GET https://<api>/docs` loads Swagger.
- [ ] `CORS_ORIGINS` includes your real web origin (scheme + host, no trailing slash).
- [ ] Next `.env` / Render env: **`API_URL`** = backend HTTPS URL.

See also: **`docs/ENVIRONMENT.md`**, **`docs/LOCAL-DEV.md`**, **`docs/ONBOARDING.md`**.
