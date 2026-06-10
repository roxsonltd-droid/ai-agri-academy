"""AgriNexus FastAPI — unified ``/api`` surface, rate limits, optional Clerk/Supabase auth."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any

from app.core.path_setup import ensure_backend_paths

ensure_backend_paths()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.rate_limit import limiter


def _cors_origins() -> list[str]:
	raw = get_settings().cors_origins
	origins = [o.strip() for o in raw.split(",") if o.strip()]
	defaults = ["http://localhost:3000", "http://127.0.0.1:3456", "http://localhost:3456", "http://localhost:8000"]
	for d in defaults:
		if d not in origins:
			origins.append(d)
	return origins


@asynccontextmanager
async def lifespan(app: FastAPI):
	yield


app = FastAPI(
	title="AgriNexus API",
	version="0.2.0",
	lifespan=lifespan,
	docs_url="/docs",
	redoc_url="/redoc",
	openapi_url="/openapi.json",
	description="""
## HTTP API

- **Swagger UI:** [`/docs`](/docs) — интерактивни заявки към `/api/*`.
- **ReDoc:** [`/redoc`](/redoc) — четим референс.
- **OpenAPI JSON:** [`/openapi.json`](/openapi.json) — за клиенти и codegen.

Пълният текстов преглед на маршрутите: `docs/BACKEND_API.md`.
""",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
	CORSMiddleware,
	allow_origins=_cors_origins(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}


@app.get("/health/db")
def health_db() -> dict[str, Any]:
	dsn = get_settings().database_url or os.getenv("DATABASE_URL")
	if not dsn:
		return {"database": "skipped", "detail": "DATABASE_URL not set"}
	try:
		import psycopg

		with psycopg.connect(dsn) as conn:
			with conn.cursor() as cur:
				cur.execute("SELECT 1")
				one = cur.fetchone()
		return {"database": "ok", "select": one}
	except Exception as e:
		return {"database": "error", "detail": str(e)}
