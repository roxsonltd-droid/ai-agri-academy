"""HMAC verification of raw webhook body (single read) + JSON parse."""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
from typing import Any

from fastapi import HTTPException, Request

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _webhook_secret() -> str:
	return (get_settings().webhook_hmac_secret or "").strip()


async def verified_json_payload(request: Request) -> dict[str, Any]:
	"""
	Verifies ``HMAC_SHA256(secret, raw_body)`` as lowercase hex in the header named by
	``WEBHOOK_SIGNATURE_HEADER`` (default ``x-webhook-signature``).
	"""
	s = get_settings()
	secret = _webhook_secret()
	header_key = (s.webhook_signature_header or "x-webhook-signature").lower()
	sig = request.headers.get(header_key)
	if sig is None:
		for hk, hv in request.headers.items():
			if hk.lower() == header_key:
				sig = hv
				break

	raw = await request.body()

	if not secret:
		logger.warning("Webhook HMAC secret not set — skipping signature check (dev only).")
	else:
		if not sig:
			raise HTTPException(status_code=401, detail="missing_webhook_signature")
		expected = hmac.new(secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
		if not hmac.compare_digest(expected, sig.strip().lower()):
			raise HTTPException(status_code=401, detail="invalid_webhook_signature")

	try:
		return json.loads(raw.decode("utf-8") if raw else "{}")
	except json.JSONDecodeError as e:
		raise HTTPException(status_code=400, detail="invalid_json_body") from e
