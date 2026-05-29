from fastapi import APIRouter

from core.config import settings

router = APIRouter()


@router.get("/status")
def platform_status():
    """Which platform modules are configured (no secrets exposed)."""
    return {
        "database_driver": "postgresql" if "postgresql" in settings.DATABASE_URL else "sqlite",
        "rag_backend": settings.PLATFORM_RAG_BACKEND,
        "rag_file_enabled": settings.RAG_ENABLED,
        "llamaindex_pinecone_ready": bool(
            settings.PINECONE_API_KEY
            and settings.PINECONE_INDEX_NAME
            and settings.OPENAI_API_KEY
            and settings.PLATFORM_RAG_BACKEND == "llamaindex"
        ),
        "mistral_configured": bool(settings.MISTRAL_API_KEY),
        "clerk_verify_configured": bool(settings.CLERK_JWKS_URL and settings.CLERK_ISSUER),
        "cloudflare_stream_configured": bool(
            settings.CLOUDFLARE_ACCOUNT_ID and settings.CLOUDFLARE_STREAM_API_TOKEN
        ),
        "r2_configured": bool(
            settings.R2_ACCOUNT_ID
            and settings.R2_ACCESS_KEY_ID
            and settings.R2_SECRET_ACCESS_KEY
            and settings.R2_BUCKET_NAME
        ),
        "elevenlabs_configured": bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_VOICE_ID),
        "roboflow_configured": bool(
            settings.ROBOFLOW_API_KEY
            and settings.ROBOFLOW_WORKSPACE
            and settings.ROBOFLOW_PROJECT
            and settings.ROBOFLOW_VERSION
        ),
    }
