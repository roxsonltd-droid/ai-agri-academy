"""
Roboflow image inference proxy — see docs/ROBOFLOW_VISION.md
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.bearer_user import resolve_user_from_bearer
from core.config import settings
from core.roboflow_client import roboflow_configured, roboflow_infer_sync
from db.database import get_db
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)

_ALLOWED_CT = {"image/jpeg", "image/png", "image/webp"}


async def _ensure_vision_access(
    x_roboflow_infer_secret: str | None,
    creds: HTTPAuthorizationCredentials | None,
    db: Session,
) -> User | None:
    if settings.ROBOFLOW_INFER_SECRET and x_roboflow_infer_secret == settings.ROBOFLOW_INFER_SECRET:
        return None
    user = await resolve_user_from_bearer(creds, db)
    if user is None:
        raise HTTPException(
            status_code=403,
            detail="Нужен е валиден JWT или X-Roboflow-Infer-Secret (ако е конфигуриран).",
        )
    return user


@router.post("/roboflow/infer")
async def roboflow_infer(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_roboflow_infer_secret: str | None = Header(default=None, alias="X-Roboflow-Infer-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """
    Run Roboflow Serverless v2 inference on an uploaded image; returns provider JSON.
    """
    await _ensure_vision_access(x_roboflow_infer_secret, creds, db)
    if not roboflow_configured():
        raise HTTPException(
            status_code=503,
            detail="Roboflow не е конфигуриран (ROBOFLOW_API_KEY, WORKSPACE, PROJECT, VERSION).",
        )

    ct = (file.content_type or "").split(";")[0].strip().lower()
    if ct not in _ALLOWED_CT:
        raise HTTPException(
            status_code=400,
            detail=f"Разрешени MIME типове: {', '.join(sorted(_ALLOWED_CT))}",
        )

    body = await file.read()
    max_b = max(256_000, min(settings.ROBOFLOW_IMAGE_MAX_BYTES, 20 * 1024 * 1024))
    if len(body) > max_b:
        raise HTTPException(status_code=413, detail="Изображението е твърде голямо")

    try:
        data = roboflow_infer_sync(body, ct, file.filename or "image.jpg")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return JSONResponse(content=data)
