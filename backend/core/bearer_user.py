"""Resolve SQLAlchemy User from Authorization: Bearer (local JWT or Clerk)."""

from __future__ import annotations

from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.clerk_auth import verify_clerk_bearer_token
from core.config import settings
from core.security import decode_access_token
from models.user import User


async def resolve_user_from_bearer(
    creds: HTTPAuthorizationCredentials | None,
    db: Session,
) -> User | None:
    if not creds or creds.scheme.lower() != "bearer":
        return None
    token = creds.credentials

    payload = decode_access_token(token)
    if payload:
        email = payload.get("sub")
        if isinstance(email, str) and email:
            return db.query(User).filter(User.email == email).first()

    if settings.CLERK_JWKS_URL and settings.CLERK_ISSUER:
        clerk_user = await verify_clerk_bearer_token(token)
        if clerk_user is not None and clerk_user.email:
            return db.query(User).filter(User.email == clerk_user.email).first()

    return None
