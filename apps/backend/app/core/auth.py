"""Bearer verification: Clerk (JWKS) → Supabase JWT → dev HS256 stub."""

from __future__ import annotations

import logging
from typing import Any

import jwt
from fastapi import HTTPException
from jwt import PyJWKClient

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _strip_bearer(authorization: str) -> str:
	a = authorization.strip()
	if a.lower().startswith("bearer "):
		return a[7:].strip()
	return a


def decode_bearer(authorization: str) -> dict[str, Any]:
	"""Return claims dict with at least ``sub``, ``email`` (optional), ``source``."""
	raw = _strip_bearer(authorization)
	if not raw:
		raise HTTPException(status_code=401, detail="empty_token")

	s = get_settings()

	if s.clerk_jwks_url:
		try:
			jwks = PyJWKClient(s.clerk_jwks_url)
			key = jwks.get_signing_key_from_jwt(raw)
			payload = jwt.decode(
				raw,
				key.key,
				algorithms=["RS256", "EdDSA"],
				audience=s.clerk_audience or None,
				issuer=s.clerk_issuer or None,
				options={"verify_aud": bool(s.clerk_audience)},
			)
			email = payload.get("email")
			if not email and isinstance(payload.get("https://clerk.io/email"), str):
				email = payload.get("https://clerk.io/email")
			return {
				"sub": str(payload.get("sub", "")),
				"email": email,
				"source": "clerk",
				"raw": payload,
			}
		except Exception as e:
			logger.debug("Clerk JWT decode failed: %s", e)
			raise HTTPException(status_code=401, detail="invalid_clerk_token") from e

	if s.supabase_jwt_secret:
		try:
			payload = jwt.decode(
				raw,
				s.supabase_jwt_secret,
				algorithms=["HS256"],
				audience=s.supabase_jwt_audience if s.supabase_jwt_audience else None,
				options={"verify_aud": bool(s.supabase_jwt_audience)},
			)
			return {
				"sub": str(payload.get("sub", "")),
				"email": payload.get("email"),
				"source": "supabase",
				"raw": payload,
			}
		except Exception as e:
			logger.debug("Supabase JWT decode failed: %s", e)
			raise HTTPException(status_code=401, detail="invalid_supabase_token") from e

	try:
		payload = jwt.decode(raw, s.jwt_secret, algorithms=["HS256"])
		sub = payload.get("sub")
		if not isinstance(sub, str) or not sub:
			raise HTTPException(status_code=401, detail="invalid_subject")
		return {"sub": sub, "email": sub, "source": "dev", "raw": payload}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=401, detail="invalid_token") from e
