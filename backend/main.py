from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api import users, chat, auth, courses, admin_courses, lab, knowledge, platform, agents_route, storage, voice, vision, stream, feedback, tutor_compat, academy_tutor
from backend.api.graphql import router as graphql_router
from db.database import engine, Base
from models.progress import UserLessonProgress

# Регистриране на ORM модели за create_all (SQLite dev)
import models.feedback  # noqa: F401

# Dev SQLite: auto-create tables. PostgreSQL: use `alembic upgrade head` or auto-create.
if settings.DATABASE_URL.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)
elif settings.DATABASE_URL.startswith("postgresql"):
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
    except Exception:
        pass
    # For now, let's also auto-create tables in Postgres for dev convenience
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from core.observability import setup_observability
setup_observability(app)

from core.audit_middleware import AuditMiddleware
app.add_middleware(AuditMiddleware)

@app.on_event("startup")
async def startup_event():
    from core.search import init_typesense_collections
    init_typesense_collections()
    
    # Init Redis & Rate Limiting
    from core.redis_client import init_redis
    from fastapi_limiter import FastAPILimiter
    redis_client = await init_redis()
    if redis_client:
        await FastAPILimiter.init(redis_client)
        
    # Init FastStream Event Broker (RabbitMQ)
    from core.events import broker
    from workers.vision_worker import vision_router
    from workers.prediction_worker import prediction_router
    from workers.collective_intelligence_worker import collective_router
    broker.include_router(prediction_router)
    broker.include_router(collective_router)
    # Attempt to connect (will fail gracefully if RabbitMQ is not running locally)
    try:
        await broker.connect()
        import logging
        logging.getLogger(__name__).info("EDA: Connected to RabbitMQ Event Bus")
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"EDA: RabbitMQ connection failed: {e}. Event Bus disabled.")

@app.on_event("shutdown")
async def shutdown_event():
    from core.redis_client import close_redis
    await close_redis()
    
    from core.events import broker
    try:
        await broker.disconnect()
    except Exception:
        pass


# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["ai-chat"])
app.include_router(courses.router, prefix=f"{settings.API_V1_STR}/courses", tags=["courses"])
app.include_router(admin_courses.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(lab.router, prefix=f"{settings.API_V1_STR}/lab", tags=["lab"])
app.include_router(knowledge.router, prefix=f"{settings.API_V1_STR}/knowledge", tags=["knowledge-rag"])
app.include_router(storage.router, prefix=f"{settings.API_V1_STR}/storage", tags=["storage"])
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["voice-elevenlabs"])
app.include_router(vision.router, prefix=f"{settings.API_V1_STR}/vision", tags=["vision-roboflow"])
app.include_router(platform.router, prefix=f"{settings.API_V1_STR}/platform", tags=["platform"])
app.include_router(agents_route.router, prefix=f"{settings.API_V1_STR}/agents", tags=["agents"])
app.include_router(academy_tutor.router, prefix=f"{settings.API_V1_STR}/academy/tutor", tags=["academy-tutor"])
app.include_router(stream.router, prefix=f"{settings.API_V1_STR}/stream", tags=["stream"])
app.include_router(feedback.router, prefix=f"{settings.API_V1_STR}/feedback", tags=["feedback"])
app.include_router(graphql_router, prefix=f"{settings.API_V1_STR}/graphql", tags=["prediction"])

from api import sync
app.include_router(sync.router, prefix=f"{settings.API_V1_STR}/sync", tags=["sync"])

# Next.js прокси: POST /api/tutor/chat (prefix вече е /api в router-а)
app.include_router(tutor_compat.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AI Agro Academy Backend is running!"}
