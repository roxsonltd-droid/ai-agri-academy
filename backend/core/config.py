import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Agro Academy API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    # Using SQLite for local development, will be replaced with Supabase URL later
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agro_academy.db")
    
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "https://agro-academy-frontend-dzjv.onrender.com",
        "https://agro-academy-frontend.onrender.com",
        "https://academyagri.com",
        "https://www.academyagri.com"
    ]
    
    # AI
    MISTRAL_API_KEY: str | None = None
    # Max tokens за отговор на Mistral (LangChain ChatMistralAI)
    LLM_MAX_OUTPUT_TOKENS: int = 2048
    # LangSmith / LangChain: export LANGCHAIN_TRACING_V2=true и LANGCHAIN_API_KEY в .env (виж docs/AI_ENHANCEMENTS_ROADMAP.md)

    # Helicone AI Gateway (OpenAI-съвместим) — алтернатива на директен Mistral за чат LLM; виж core/llm_factory.py
    HELICONE_API_KEY: str | None = None
    HELICONE_GATEWAY_BASE_URL: str = "https://ai-gateway.helicone.ai/v1"
    HELICONE_GATEWAY_MODEL: str = "mistral/mistral-large-latest"

    # Platform Admins
    ADMIN_EMAILS: list[str] = ["lukezester@gmail.com"]
    # RAG over backend/knowledge/*.md (Mistral embeddings + in-memory retrieval)
    RAG_ENABLED: bool = True
    RAG_TOP_K: int = 4
    # Upload API: optional shared secret (header X-RAG-Upload-Secret), or JWT user with admin/instructor/superuser
    RAG_UPLOAD_SECRET: str | None = None
    RAG_MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MB
    # Логване на всеки RAG hit (source + score) — за отладка / observability
    RAG_LOG_RETRIEVAL: bool = False

    # Academy Tutor (LangGraph debate) + lesson RAG
    ACADEMY_LESSON_RAG_TOP_K: int = 4
    ACADEMY_DEBATE_MAX_ROUNDS: int = 3

    # Platform: RAG backend — "files" (bundled MD + uploads + Mistral embed) or "llamaindex" (Pinecone)
    PLATFORM_RAG_BACKEND: str = "files"

    # Qdrant + OpenAI embeddings (LlamaIndex path)
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str | None = None
    OPENAI_API_KEY: str | None = None

    # Clerk JWT verification (FastAPI)
    CLERK_JWKS_URL: str | None = None
    CLERK_ISSUER: str | None = None
    # Optional: verify JWT "aud" (Clerk dashboard / API keys — JWT audience)
    CLERK_JWT_AUDIENCE: str | None = None

    # Cloudflare Stream (upload / signed playback — wire in API later)
    CLOUDFLARE_ACCOUNT_ID: str | None = None
    CLOUDFLARE_STREAM_API_TOKEN: str | None = None

    # Cloudflare R2 (S3-compatible object storage — see docs/CLOUDFLARE_R2.md)
    R2_ACCOUNT_ID: str | None = None
    R2_ACCESS_KEY_ID: str | None = None
    R2_SECRET_ACCESS_KEY: str | None = None
    R2_BUCKET_NAME: str | None = None
    R2_PUBLIC_BASE_URL: str | None = None
    # Presigned PUT TTL (seconds); clamped in code to [60, 3600]
    R2_PRESIGN_EXPIRES_SECONDS: int = 900
    # After successful ingest into knowledge/uploads, remove object from R2
    R2_DELETE_AFTER_INGEST: bool = True

    # Typesense Search
    TYPESENSE_HOST: str | None = None
    TYPESENSE_ADMIN_API_KEY: str | None = None

    # ElevenLabs TTS — see docs/ELEVENLABS_VOICE.md
    ELEVENLABS_API_KEY: str | None = None
    ELEVENLABS_VOICE_ID: str | None = None
    ELEVENLABS_MODEL_ID: str = "eleven_multilingual_v2"
    VOICE_TTS_MAX_CHARS: int = 4000
    # Optional: allow server jobs via X-Voice-TTS-Secret without JWT
    VOICE_TTS_SECRET: str | None = None

    # Roboflow vision (Serverless v2) — see docs/ROBOFLOW_VISION.md
    ROBOFLOW_API_KEY: str | None = None
    ROBOFLOW_WORKSPACE: str | None = None
    ROBOFLOW_PROJECT: str | None = None
    ROBOFLOW_VERSION: str | None = None
    ROBOFLOW_CONFIDENCE: float = 0.4
    ROBOFLOW_IMAGE_MAX_BYTES: int = 5 * 1024 * 1024
    ROBOFLOW_SERVERLESS_BASE: str = "https://serverless.roboflow.com"
    ROBOFLOW_INFER_SECRET: str | None = None

    # POST /api/v1/chat: max заявки на IP за 60 s (0 = без лимит)
    CHAT_RATE_LIMIT_PER_MINUTE: int = 0
    
    # Redis configuration for cache, rate limiting, and background jobs
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"

settings = Settings()
