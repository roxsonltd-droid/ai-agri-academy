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
            user = db.query(User).filter(User.email == clerk_user.email).first()
            is_admin = clerk_user.email in settings.ADMIN_EMAILS
            
            if not user:
                user = User(
                    email=clerk_user.email,
                    role="admin" if is_admin else "student",
                    hashed_password="", # Managed by Clerk
                    full_name=clerk_user.email.split("@")[0]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            elif is_admin and user.role != "admin":
                user.role = "admin"
                db.commit()
                
            return user

    return None

from fastapi import HTTPException

async def ensure_admin(
    creds: HTTPAuthorizationCredentials | None,
    db: Session,
) -> User:
    user = await resolve_user_from_bearer(creds, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Достъпът е разрешен само за администратори.")
    return user
