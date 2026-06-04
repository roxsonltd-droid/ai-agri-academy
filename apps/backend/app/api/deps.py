"""Shared FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import Header, HTTPException

from app.core.auth import decode_bearer
from app.core.config import get_settings


async def bearer_claims_optional(
	authorization: Annotated[str | None, Header()] = None,
) -> dict[str, Any] | None:
	"""If ``AUTH_REQUIRED_FOR_TUTOR`` is false, returns None without token."""
	s = get_settings()
	if not s.auth_required_for_tutor:
		return None
	if not authorization or not authorization.lower().startswith("bearer "):
		raise HTTPException(status_code=401, detail="missing_bearer")
	return decode_bearer(authorization)
