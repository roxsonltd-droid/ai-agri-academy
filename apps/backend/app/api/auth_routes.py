"""JWT stub auth under ``/api/auth``."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import decode_bearer
from app.core.config import get_settings

router = APIRouter()

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


class TokenRequest(BaseModel):
	email: str = Field(..., min_length=3, max_length=320)


@router.post("/token")
def create_access_token(body: TokenRequest) -> dict[str, str]:
	"""Dev-friendly: issues HS256 JWT (same secret as ``decode_bearer`` fallback)."""
	email = body.email.strip()
	if "@" not in email or len(email) < 5:
		raise HTTPException(status_code=400, detail="invalid_email")
	s = get_settings()
	now = datetime.now(timezone.utc)
	exp = now + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
	payload = {"sub": email, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
	token = jwt.encode(payload, s.jwt_secret, algorithm=JWT_ALGORITHM)
	if isinstance(token, bytes):
		token = token.decode("utf-8")
	return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def auth_me(authorization: str | None = Header(default=None)) -> dict[str, str]:
	if not authorization or not authorization.lower().startswith("bearer "):
		raise HTTPException(status_code=401, detail="missing_bearer")
	claims = decode_bearer(authorization)
	email = claims.get("email") or claims.get("sub") or ""
	return {"sub": str(claims.get("sub", "")), "email": str(email), "source": str(claims.get("source", ""))}
