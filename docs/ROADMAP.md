# AgriNexus — product & engineering roadmap

High-level plan for the monorepo (`apps/web`, `apps/backend`, `apps/mobile`, marketing root). Dates are indicative; order can shift with user feedback.

## Q2–Q3 2026 — foundation

| Area | Goal | Status |
|------|------|--------|
| **DevEx** | Husky, lint-staged, GitHub Actions CI, pytest + Playwright smoke, env docs | Done |
| **Auth** | Supabase Auth on Next (`/login`), JWT verification on FastAPI (`SUPABASE_JWT_SECRET`), optional gate for tutor | In progress |
| **API surface** | Stable `/api/*` on FastAPI, Swagger + ReDoc, rate limits | Done |
| **Academy** | Next routes, catalog, final tests, lecturer; content sync scripts | Ongoing |

## Q3 2026 — intelligence layer

| Area | Goal |
|------|------|
| **AI Tutor** | LangGraph-based `/api/tutor/graph` (expand nodes: RAG, tools, memory); align with marketing `POST /api/chat` where useful |
| **RAG** | PGVector / file fallback for academy materials; eval harness (`rag/run_evaluation.py`) wired in CI optionally |
| **Mobile** | Same auth story as web (Supabase session or backend JWT), offline-friendly academy shell |

## Q4 2026 — product depth

| Area | Goal |
|------|------|
| **Farm profile** | Supabase `farm_profiles` + onboarding flows; sync progress from web storage where needed |
| **Market / lab** | Live desk + policy-safe LLM outputs; role-based access |
| **Observability** | Structured logs, tracing for tutor paths, cost dashboards for LLM calls |

## Beyond

- Kubernetes / managed runtime for backend workers (graph + embed jobs).
- Field operations integrations (telemetry, machinery) behind explicit user consent.
- SOC2-oriented audit trail for automated recommendations.

## How to use this doc

- Link from the root **`README.md`**.
- For **architecture** detail, see `docs/TARGET-ARCHITECTURE.md`, `docs/ACADEMY_ARCHITECTURE.md`, `docs/BACKEND_API.md`.
- For **local setup**, see `docs/LOCAL-DEV.md` and `docs/ENVIRONMENT.md`.
