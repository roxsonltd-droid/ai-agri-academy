# Environment & secrets

This monorepo uses plain `.env` files for local development. **Do not commit real secrets.**

## Layered `.env.example` files

| Location | Scope |
|----------|--------|
| [`.env.example`](../.env.example) | Root / marketing / agent mesh (Mistral, rate limits, …) |
| [`apps/web/.env.example`](../apps/web/.env.example) | Next.js (`NEXT_PUBLIC_*`, Supabase, …) |
| [`apps/backend/.env.example`](../apps/backend/.env.example) | FastAPI (`DATABASE_URL`, JWT, RAG, …) |
| [`apps/mobile/.env.example`](../apps/mobile/.env.example) | Expo (`EXPO_PUBLIC_*`) |

After copying an example to `.env`, adjust values for your machine.

## Doppler (optional)

[Doppler](https://www.doppler.com/) can replace scattered `.env` files for teams and CI.

1. Install CLI: [Doppler install](https://docs.doppler.com/docs/install-cli).
2. Log in: `doppler login`.
3. In the repo root, link a project (one-time): `doppler setup` and pick **project** + **config** (e.g. `dev`).
4. Run commands with secrets injected:

```bash
doppler run -- npm run dev:web
doppler run --project agrinexus --config dev -- npm run dev:backend
```

5. For **GitHub Actions**, use the [Doppler GitHub Action](https://docs.doppler.com/docs/github-actions) or sync secrets to repository secrets and keep using `${{ secrets.* }}` — avoid committing service tokens.

### Deploy (Render / Railway)

See **`docs/DEPLOY-RENDER-RAILWAY.md`** for Docker-based FastAPI + env checklist (`PORT`, `CORS_ORIGINS`, Academy content path).

### Suggested Doppler configs

- `dev` — local machines (non-production URLs, dev DB).
- `stg` / `prd` — deployment pipelines only.

### Mapping to apps

- **Next:** store `NEXT_PUBLIC_*` and server-only keys in the same Doppler config, or split configs per app if you use multiple Doppler projects. For **Supabase Auth**, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SITE_URL`, and in the Supabase dashboard set redirect URLs to include `{origin}/auth/callback` (local + production).
- **FastAPI:** map `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `ACADEMY_RAG_BACKEND`, etc.
- **Expo:** `EXPO_PUBLIC_WEB_ORIGIN`, `EXPO_PUBLIC_BACKEND_URL` (often `dev` config per developer with LAN IP).

## OpenAPI (FastAPI)

When the backend is running locally:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

See also `docs/BACKEND_API.md`.
