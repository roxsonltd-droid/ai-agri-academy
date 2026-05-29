"""
Clerk JWT verification for FastAPI (JWKS + RS256/ES256).

Requires CLERK_JWKS_URL and CLERK_ISSUER. Optional CLERK_JWT_AUDIENCE for aud check.
See docs/CLERK.md — session token should include an `email` claim to map to users.email.
"""

from __future__ import annotations

import asyncio
import logging

import jwt
from jwt import PyJWKClient, PyJWTError
from pydantic import BaseModel

from core.config import settings

logger = logging.getLogger(__name__)

_jwk_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient | None:
    global _jwk_client
    if not settings.CLERK_JWKS_URL:
        return None
    if _jwk_client is None:
        _jwk_client = PyJWKClient(settings.CLERK_JWKS_URL)
    return _jwk_client


class ClerkUser(BaseModel):
    sub: str
    email: str | None = None


def verify_clerk_bearer_token_sync(token: str) -> ClerkUser | None:
    if not settings.CLERK_JWKS_URL or not settings.CLERK_ISSUER:
        return None
    client = _get_jwks_client()
    if client is None:
        return None
    try:
        signing_key = client.get_signing_key_from_jwt(token)
    except PyJWTError:
        return None

    aud = settings.CLERK_JWT_AUDIENCE
    decode_kwargs: dict = {
        "algorithms": ["RS256", "RS384", "RS512", "ES256"],
        "issuer": settings.CLERK_ISSUER,
        "options": {"verify_aud": bool(aud)},
    }
    if aud:
        decode_kwargs["audience"] = aud

    try:
        claims = jwt.decode(token, signing_key.key, **decode_kwargs)
    except PyJWTError as e:
        logger.debug("Clerk JWT decode failed: %s", e)
        return None

    sub = claims.get("sub")
    if not sub:
        return None
    email = claims.get("email")
    if not isinstance(email, str) or "@" not in email:
        email = None
    return ClerkUser(sub=str(sub), email=email)


async def verify_clerk_bearer_token(token: str) -> ClerkUser | None:
    if not settings.CLERK_JWKS_URL or not settings.CLERK_ISSUER:
        return None
    return await asyncio.to_thread(verify_clerk_bearer_token_sync, token)
