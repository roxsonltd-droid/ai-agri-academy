"""Supabase-style user-created webhook (farm_profiles) with HMAC verification."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.core.webhook_security import verified_json_payload

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/webhooks/supabase-user-created")
@limiter.limit("60/minute")
async def handle_user_created(
	request: Request,
	payload: dict = Depends(verified_json_payload),
):
	try:
		from core.supabase_client import get_supabase_client
	except ImportError as e:
		raise HTTPException(status_code=503, detail="supabase_client_unavailable") from e

	user = payload.get("record") or payload.get("new")
	if not user or not user.get("id"):
		return {"status": "ignored", "detail": "Липсва потребителски запис"}

	s = get_settings()
	if not s.supabase_url or not s.supabase_key:
		logger.info("Supabase not configured — webhook accepted, side-effects skipped.")
		return {"status": "accepted", "user_id": user["id"], "supabase": "not_configured"}

	try:
		supabase = get_supabase_client()
		existing = supabase.table("farm_profiles").select("id").eq("user_id", user["id"]).execute()
		if not existing.data:
			meta = user.get("user_metadata") or {}
			raw_meta = user.get("raw_user_meta_data") or {}
			full_name = meta.get("full_name") or raw_meta.get("full_name")
			avatar_url = meta.get("avatar_url")
			app_meta = user.get("app_metadata") or {}
			provider = app_meta.get("provider", "email")
			supabase.table("farm_profiles").insert(
				{
					"user_id": user["id"],
					"email": user.get("email"),
					"full_name": full_name,
					"avatar_url": avatar_url,
					"cultures": [],
					"region": None,
					"total_ha": 0,
					"onboarding_completed": False,
					"provider": provider,
				}
			).execute()
	except Exception as e:
		logger.exception("Webhook farm_profiles upsert failed: %s", e)
		raise HTTPException(status_code=400, detail=f"processing_error: {e}") from e

	return {"status": "success", "user_id": user["id"]}
