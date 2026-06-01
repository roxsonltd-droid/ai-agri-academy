"""Presigned uploads to Cloudflare R2 (S3-compatible)."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.r2 import build_rag_object_key, presigned_put_url, r2_enabled
from db.database import get_db

from api.knowledge import ensure_can_upload

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)

_ALLOWED_SUFFIX = {".md", ".txt", ".pdf", ".docx", ".png", ".jpg", ".jpeg"}
_CT_BY_SUFFIX: dict[str, set[str]] = {
    ".pdf": {"application/pdf"},
    ".md": {"text/markdown", "text/x-markdown", "text/plain"},
    ".txt": {"text/plain", "application/octet-stream"},
    ".docx": {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
    ".png": {"image/png"},
    ".jpg": {"image/jpeg"},
    ".jpeg": {"image/jpeg"},
}


class PresignRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., min_length=3, max_length=120)
    purpose: Literal["rag", "asset"] = "rag"


class PresignResponse(BaseModel):
    url: str
    method: Literal["PUT"] = "PUT"
    headers: dict[str, str]
    object_key: str
    expires_in: int


@router.post("/presign", response_model=PresignResponse)
async def presign_put(
    body: PresignRequest,
    db: Session = Depends(get_db),
    x_rag_upload_secret: str | None = Header(default=None, alias="X-RAG-Upload-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """
    Issue a presigned PUT URL for direct client upload to R2.
    After PUT succeeds, call `POST /api/v1/knowledge/documents/from-r2` with the returned `object_key`.
    """
    await ensure_can_upload(x_rag_upload_secret, creds, db)
    if not r2_enabled():
        raise HTTPException(
            status_code=503,
            detail="R2 не е конфигуриран (липсват R2_ACCOUNT_ID, ключове или bucket).",
        )

    suf = Path(body.filename).suffix.lower()
    if suf not in _ALLOWED_SUFFIX:
        raise HTTPException(
            status_code=400,
            detail=f"Разрешени са само: {', '.join(sorted(_ALLOWED_SUFFIX))}",
        )
    ct = body.content_type.split(";")[0].strip().lower()
    if ct not in {c.lower() for c in _CT_BY_SUFFIX[suf]}:
        raise HTTPException(
            status_code=400,
            detail=f"Content-Type не съответства на разширението {suf}. Очаквано едно от: {', '.join(sorted(_CT_BY_SUFFIX[suf]))}",
        )

    if body.purpose == "asset":
        from core.r2 import build_asset_object_key
        object_key = build_asset_object_key(body.filename, suf)
    else:
        object_key = build_rag_object_key(body.filename, suf)
        
    try:
        url, expires_in = presigned_put_url(object_key=object_key, content_type=body.content_type.split(";")[0].strip())
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Presign неуспешен: {e}") from e

    canonical_ct = body.content_type.split(";")[0].strip()
    return PresignResponse(
        url=url,
        method="PUT",
        headers={"Content-Type": canonical_ct},
        object_key=object_key,
        expires_in=expires_in,
    )
