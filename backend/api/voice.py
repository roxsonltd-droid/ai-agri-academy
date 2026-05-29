"""
ElevenLabs TTS proxy — see docs/ELEVENLABS_VOICE.md
"""

from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.bearer_user import resolve_user_from_bearer
from core.config import settings
from db.database import get_db
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)

ELEVEN_BASE = "https://api.elevenlabs.io/v1"


class TtsRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10_000)


async def _ensure_voice_access(
    x_voice_tts_secret: str | None,
    creds: HTTPAuthorizationCredentials | None,
    db: Session,
) -> User | None:
    if settings.VOICE_TTS_SECRET and x_voice_tts_secret == settings.VOICE_TTS_SECRET:
        return None
    user = await resolve_user_from_bearer(creds, db)
    if user is None:
        raise HTTPException(
            status_code=403,
            detail="Нужен е валиден JWT или X-Voice-TTS-Secret (ако е конфигуриран).",
        )
    return user


def _eleven_ready() -> bool:
    return bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_VOICE_ID)


@router.post("/tts")
async def text_to_speech(
    body: TtsRequest,
    db: Session = Depends(get_db),
    x_voice_tts_secret: str | None = Header(default=None, alias="X-Voice-TTS-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """
    Stream MP3 audio from ElevenLabs for the given text.
    """
    await _ensure_voice_access(x_voice_tts_secret, creds, db)
    if not _eleven_ready():
        raise HTTPException(
            status_code=503,
            detail="ElevenLabs не е конфигуриран (ELEVENLABS_API_KEY и ELEVENLABS_VOICE_ID).",
        )

    max_chars = max(200, min(settings.VOICE_TTS_MAX_CHARS, 10_000))
    text = body.text.strip()[:max_chars]
    if not text:
        raise HTTPException(status_code=400, detail="Празен текст")

    url = f"{ELEVEN_BASE}/text-to-speech/{settings.ELEVENLABS_VOICE_ID}/stream"
    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY or "",
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": settings.ELEVENLABS_MODEL_ID,
    }

    async def audio_stream():
        timeout = httpx.Timeout(120.0, connect=15.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                async with client.stream("POST", url, headers=headers, json=payload) as resp:
                    if resp.status_code >= 400:
                        err = (await resp.aread()).decode("utf-8", errors="replace")[:800]
                        logger.warning("ElevenLabs TTS HTTP %s: %s", resp.status_code, err)
                        raise HTTPException(
                            status_code=502,
                            detail="ElevenLabs отказа заявката.",
                        )
                    async for chunk in resp.aiter_bytes():
                        yield chunk
            except httpx.RequestError as e:
                logger.warning("ElevenLabs TTS connection error: %s", e)
                raise HTTPException(
                    status_code=502,
                    detail="Неуспешна връзка към ElevenLabs",
                ) from e

    return StreamingResponse(
        audio_stream(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex",
        },
    )
