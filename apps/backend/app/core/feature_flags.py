"""
Feature flags: env defaults + optional Unleash Client API (``/api/client/features``).

Create toggles in Unleash named ``tutor_chat``, ``tutor_deep_debate``, ``tutor_react_tools``, ``tutor_adaptive``,
``tutor_ab_test``, ``academy_courses``
(or rely on env ``FEATURE_TUTOR_CHAT`` etc. when Unleash is not configured).
"""

from __future__ import annotations

import logging
import time
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_cache: dict[str, tuple[float, bool]] = {}
_CACHE_TTL_SEC = 30.0


def _unleash_feature_name(flag_key: str) -> str:
	return flag_key.replace(".", "_")


def _env_flag(flag_key: str) -> bool:
	s = get_settings()
	match flag_key:
		case "tutor.chat":
			return s.feature_tutor_chat
		case "tutor.deep_debate":
			return s.feature_tutor_deep_debate
		case "academy.courses":
			return s.feature_academy_courses_api
		case "tutor.langgraph":
			return s.feature_tutor_langgraph
		case "tutor.react_tools":
			return s.feature_tutor_react_tools
		case "tutor.adaptive":
			return s.feature_tutor_adaptive
		case "tutor.ab_test":
			return s.feature_tutor_ab_test
		case _:
			return True


def _features_url() -> str | None:
	s = get_settings()
	if not s.unleash_url:
		return None
	base = s.unleash_url.rstrip("/")
	if base.endswith("/api"):
		return f"{base}/client/features"
	return f"{base}/api/client/features"


async def is_enabled(flag_key: str) -> bool:
	s = get_settings()
	url = _features_url()
	if not url or not s.unleash_api_token:
		return _env_flag(flag_key)

	now = time.monotonic()
	if flag_key in _cache:
		expires, val = _cache[flag_key]
		if now < expires:
			return val

	uname = _unleash_feature_name(flag_key)
	enabled = _env_flag(flag_key)

	try:
		async with httpx.AsyncClient(timeout=8.0) as client:
			r = await client.get(
				url,
				headers={
					"Authorization": s.unleash_api_token,
					"UNLEASH-APPNAME": s.unleash_app_name,
					"UNLEASH-CONNECTION-ID": "agrinexus-backend",
				},
			)
			r.raise_for_status()
			data: Any = r.json()
	except Exception:
		logger.exception("Unleash fetch failed; env fallback for %s", flag_key)
		_cache[flag_key] = (now + _CACHE_TTL_SEC, enabled)
		return enabled

	if isinstance(data, dict) and "features" in data:
		for feat in data.get("features") or []:
			if not isinstance(feat, dict):
				continue
			if feat.get("name") == uname:
				enabled = bool(feat.get("enabled", enabled))
				break

	_cache[flag_key] = (now + _CACHE_TTL_SEC, enabled)
	return enabled
