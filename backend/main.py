from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api import users, chat, auth, courses, admin_courses, lab, knowledge, platform, agents_route, storage, voice, vision, stream
from db.database import engine, Base

# Dev SQLite: auto-create tables. PostgreSQL: use `alembic upgrade head`.
if settings.DATABASE_URL.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
async def startup_event():
    from core.search import init_typesense_collections
    init_typesense_collections()

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
app.include_router(stream.router, prefix=f"{settings.API_V1_STR}/stream", tags=["stream"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AI Agro Academy Backend is running!"}
