"""Shared Roboflow Serverless v2 inference — used by api/vision and agents."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from core.config import settings

logger = logging.getLogger(__name__)

_ALLOWED_CT = {"image/jpeg", "image/png", "image/webp"}


def roboflow_configured() -> bool:
    return bool(
        settings.ROBOFLOW_API_KEY
        and settings.ROBOFLOW_WORKSPACE
        and settings.ROBOFLOW_PROJECT
        and settings.ROBOFLOW_VERSION
    )


def roboflow_infer_sync(
    body: bytes,
    content_type: str,
    filename: str = "image.jpg",
) -> dict[str, Any]:
    """
    POST image bytes to Roboflow Serverless v2; returns parsed JSON dict.
    Raises RuntimeError on configuration / HTTP / parse errors.
    """
    if not roboflow_configured():
        raise RuntimeError("Roboflow is not configured")

    ct = (content_type or "").split(";")[0].strip().lower()
    if ct not in _ALLOWED_CT:
        raise ValueError(f"Unsupported content type: {ct}")

    max_b = max(256_000, min(settings.ROBOFLOW_IMAGE_MAX_BYTES, 20 * 1024 * 1024))
    if len(body) > max_b:
        raise ValueError("Image too large")

    base = settings.ROBOFLOW_SERVERLESS_BASE.rstrip("/")
    ws = settings.ROBOFLOW_WORKSPACE.strip("/")  # type: ignore[union-attr]
    proj = settings.ROBOFLOW_PROJECT.strip("/")  # type: ignore[union-attr]
    ver = settings.ROBOFLOW_VERSION.strip("/")  # type: ignore[union-attr]
    url = f"{base}/infer/{ws}/{proj}/{ver}"
    params = {
        "api_key": settings.ROBOFLOW_API_KEY,
        "confidence": max(0.05, min(settings.ROBOFLOW_CONFIDENCE, 0.95)),
    }
    files = {"file": (filename or "image.jpg", body, ct)}

    with httpx.Client(timeout=httpx.Timeout(120.0, connect=20.0)) as client:
        try:
            r = client.post(url, params=params, files=files)
        except httpx.RequestError as e:
            logger.warning("Roboflow infer connection error: %s", e)
            raise RuntimeError("Roboflow connection failed") from e

    if r.status_code >= 400:
        logger.warning("Roboflow infer HTTP %s: %s", r.status_code, r.text[:800])
        raise RuntimeError("Roboflow returned an error")

    try:
        data = r.json()
    except ValueError as e:
        raise RuntimeError("Invalid JSON from Roboflow") from e
    if not isinstance(data, dict):
        return {"result": data}
    return data
