"""Academy courses list from PostgreSQL (Supabase pooler compatible)."""

from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import bearer_claims_optional
from app.core.config import get_settings
from app.core.feature_flags import is_enabled

logger = logging.getLogger(__name__)

router = APIRouter(tags=["academy"])


class CourseOut(BaseModel):
	id: str
	slug: str
	title: str
	description: str | None = None


@router.get("/courses", response_model=list[CourseOut])
async def list_courses(_claims: dict | None = Depends(bearer_claims_optional)) -> list[CourseOut]:
	if not await is_enabled("academy.courses"):
		raise HTTPException(status_code=404, detail="feature_disabled")

	s = get_settings()
	if not s.database_url:
		return []

	try:
		import psycopg
	except ImportError as e:
		raise HTTPException(status_code=500, detail="psycopg_not_installed") from e

	try:
		with psycopg.connect(s.database_url) as conn:
			with conn.cursor() as cur:
				cur.execute(
					"""
					SELECT id, slug, title, COALESCE(description, '')
					FROM academy_courses
					ORDER BY created_at DESC NULLS LAST, title
					"""
				)
				rows = cur.fetchall()
	except Exception as e:
		logger.info("academy_courses unavailable: %s", e)
		return []

	return [
		CourseOut(id=r[0], slug=r[1], title=r[2], description=r[3] or None)
		for r in rows
	]
