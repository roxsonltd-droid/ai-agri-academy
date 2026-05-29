"""Central settings (env). Used by auth, flags, DB, webhooks."""

from __future__ import annotations

from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

	# Database (PostgreSQL / Supabase pooler)
	database_url: str | None = Field(default=None, validation_alias=AliasChoices("DATABASE_URL"))

	# Redis (sessions / cache / future LangGraph checkpointer)
	redis_url: str | None = Field(default=None, validation_alias=AliasChoices("REDIS_URL"))

	# RAG Redis cache (LangChain ``RAGEngine.retrieve`` / ``aretrieve``)
	academy_rag_cache_enabled: bool = Field(
		default=True,
		validation_alias=AliasChoices("ACADEMY_RAG_CACHE_ENABLED"),
	)
	academy_rag_cache_ttl_seconds: int = Field(
		default=1200,
		ge=60,
		le=86400,
		validation_alias=AliasChoices("ACADEMY_RAG_CACHE_TTL_SECONDS"),
	)
	academy_rag_cache_prefix: str = Field(
		default="agri:rag:v1",
		validation_alias=AliasChoices("ACADEMY_RAG_CACHE_PREFIX"),
	)

	# CORS
	cors_origins: str = Field(
		default="http://localhost:3000,http://127.0.0.1:3000",
		validation_alias=AliasChoices("CORS_ORIGINS"),
	)

	# Dev JWT (stub auth)
	jwt_secret: str = Field(
		default="agrinexus-dev-jwt-secret-change-me",
		validation_alias=AliasChoices("JWT_SECRET"),
	)

	# Supabase (DB + optional Auth webhook side-effects)
	supabase_url: str | None = Field(default=None, validation_alias=AliasChoices("SUPABASE_URL"))
	supabase_key: str | None = Field(
		default=None,
		validation_alias=AliasChoices("SUPABASE_KEY", "SUPABASE_SERVICE_ROLE_KEY"),
	)
	# JWT secret from Supabase Dashboard → Settings → API → JWT Secret (for verifying user access_token)
	supabase_jwt_secret: str | None = Field(
		default=None,
		validation_alias=AliasChoices("SUPABASE_JWT_SECRET"),
	)
	supabase_jwt_audience: str | None = Field(
		default=None,
		validation_alias=AliasChoices("SUPABASE_JWT_AUDIENCE"),
	)  # e.g. "authenticated"; omit to skip aud check

	# Clerk (optional; if set, Bearer tokens are verified as Clerk JWTs)
	clerk_jwks_url: str | None = Field(default=None, validation_alias=AliasChoices("CLERK_JWKS_URL"))
	clerk_issuer: str | None = Field(default=None, validation_alias=AliasChoices("CLERK_ISSUER"))
	clerk_audience: str | None = Field(default=None, validation_alias=AliasChoices("CLERK_AUDIENCE"))

	# Webhook HMAC (raw body)
	webhook_hmac_secret: str | None = Field(
		default=None,
		validation_alias=AliasChoices("WEBHOOK_HMAC_SECRET", "SUPABASE_WEBHOOK_SECRET"),
	)
	webhook_signature_header: str = Field(
		default="x-webhook-signature",
		validation_alias=AliasChoices("WEBHOOK_SIGNATURE_HEADER"),
	)

	# Rate limits (SlowAPI string format; used in docs — override literals in routers if needed)
	rate_tutor_chat: str = Field(default="30/minute", validation_alias=AliasChoices("RATE_TUTOR_CHAT"))
	rate_tutor_debate: str = Field(default="10/minute", validation_alias=AliasChoices("RATE_TUTOR_DEBATE"))
	rate_tutor_react: str = Field(default="15/minute", validation_alias=AliasChoices("RATE_TUTOR_REACT"))
	rate_webhooks: str = Field(default="60/minute", validation_alias=AliasChoices("RATE_WEBHOOKS"))

	# Auth gate: if true, /api/tutor/* requires a valid Bearer (Clerk or Supabase or dev JWT)
	auth_required_for_tutor: bool = Field(
		default=False,
		validation_alias=AliasChoices("AUTH_REQUIRED_FOR_TUTOR"),
	)

	# Unleash Client API base, e.g. https://<instance>.unleash-hosted.com/<env>/api
	unleash_url: str | None = Field(default=None, validation_alias=AliasChoices("UNLEASH_URL"))
	unleash_api_token: str | None = Field(default=None, validation_alias=AliasChoices("UNLEASH_API_TOKEN"))
	unleash_app_name: str = Field(default="agrinexus-backend", validation_alias=AliasChoices("UNLEASH_APP_NAME"))
	unleash_environment: str = Field(
		default="development",
		validation_alias=AliasChoices("UNLEASH_ENVIRONMENT"),
	)

	# Static env feature toggles (override when Unleash disabled)
	feature_tutor_chat: bool = Field(default=True, validation_alias=AliasChoices("FEATURE_TUTOR_CHAT"))
	feature_tutor_deep_debate: bool = Field(
		default=True,
		validation_alias=AliasChoices("FEATURE_TUTOR_DEEP_DEBATE"),
	)
	feature_academy_courses_api: bool = Field(
		default=True,
		validation_alias=AliasChoices("FEATURE_ACADEMY_COURSES_API"),
	)
	feature_tutor_langgraph: bool = Field(
		default=True,
		validation_alias=AliasChoices("FEATURE_TUTOR_LANGGRAPH"),
	)
	feature_tutor_react_tools: bool = Field(
		default=True,
		validation_alias=AliasChoices("FEATURE_TUTOR_REACT_TOOLS"),
	)
	feature_tutor_adaptive: bool = Field(
		default=False,
		validation_alias=AliasChoices("FEATURE_TUTOR_ADAPTIVE"),
	)
	# A/B: при tutor_mode=auto и FEATURE_TUTOR_AB_TEST=true — assign_ab_variant(user_id, TUTOR_AB_ADAPTIVE_WEIGHT)
	feature_tutor_ab_test: bool = Field(
		default=False,
		validation_alias=AliasChoices("FEATURE_TUTOR_AB_TEST"),
	)
	tutor_ab_adaptive_weight: int = Field(
		default=50,
		ge=0,
		le=100,
		validation_alias=AliasChoices("TUTOR_AB_ADAPTIVE_WEIGHT"),
	)


@lru_cache
def get_settings() -> Settings:
	return Settings()
