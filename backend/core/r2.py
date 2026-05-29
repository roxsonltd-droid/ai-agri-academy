"""Cloudflare R2 helpers (S3-compatible API). See docs/CLOUDFLARE_R2.md."""

from __future__ import annotations

import logging
import re
import uuid
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from core.config import settings

logger = logging.getLogger(__name__)

# Keys produced by presign: rag/{uuid8}__{stem}.{pdf|md|txt}
RAG_OBJECT_KEY_RE = re.compile(r"^rag/[a-f0-9]{8}__[A-Za-z0-9._\-]+\.(?:pdf|md|txt)$")


def r2_enabled() -> bool:
    return bool(
        settings.R2_ACCOUNT_ID
        and settings.R2_ACCESS_KEY_ID
        and settings.R2_SECRET_ACCESS_KEY
        and settings.R2_BUCKET_NAME
    )


def _s3_client():
    if not r2_enabled():
        return None
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def safe_stem_r2(name: str) -> str:
    base = Path(name).stem
    base = re.sub(r"[^\w\-\.]", "_", base)
    base = base.strip("._")[:80]
    return base or "document"


def build_rag_object_key(original_filename: str, suffix: str) -> str:
    """Return S3 object key under rag/ prefix (suffix must be .pdf, .md, or .txt)."""
    suf = suffix.lower()
    return f"rag/{uuid.uuid4().hex[:8]}__{safe_stem_r2(original_filename)}{suf}"


def presigned_put_url(*, object_key: str, content_type: str) -> tuple[str, int]:
    """
    Returns (presigned_url, expires_in_seconds).
    Client must send PUT with the same Content-Type header.
    """
    client = _s3_client()
    if client is None:
        raise RuntimeError("R2 is not configured")
    expires = max(60, min(settings.R2_PRESIGN_EXPIRES_SECONDS, 3600))
    url = client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.R2_BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=expires,
    )
    return url, expires


def get_object_bytes(object_key: str, *, max_bytes: int | None = None) -> bytes:
    client = _s3_client()
    if client is None:
        raise RuntimeError("R2 is not configured")
    if not RAG_OBJECT_KEY_RE.fullmatch(object_key):
        raise ValueError("Invalid object key")
    try:
        resp = client.get_object(Bucket=settings.R2_BUCKET_NAME, Key=object_key)
    except ClientError as e:
        code = (e.response.get("Error") or {}).get("Code", "")
        if code in ("NoSuchKey", "404"):
            raise FileNotFoundError(object_key) from e
        logger.warning("R2 get_object failed: %s", e)
        raise
    stream = resp["Body"]
    if max_bytes is None:
        return stream.read()
    chunks: list[bytes] = []
    total = 0
    while True:
        part = stream.read(65536)
        if not part:
            break
        total += len(part)
        if total > max_bytes:
            raise ValueError(f"Object larger than {max_bytes} bytes")
        chunks.append(part)
    return b"".join(chunks)


def delete_object(object_key: str) -> None:
    client = _s3_client()
    if client is None:
        return
    if not RAG_OBJECT_KEY_RE.fullmatch(object_key):
        return
    try:
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=object_key)
    except ClientError as e:
        logger.warning("R2 delete_object failed for %s: %s", object_key, e)
