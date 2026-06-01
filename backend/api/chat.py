from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from core.ai_agent import TutorChatResult, ask_agromind
from core.rag_types import RagSourceItem
from core.simple_rate_limit import enforce_chat_rate_limit

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    rag_sources: list[RagSourceItem] = []


@router.post("/", response_model=ChatResponse)
async def chat_with_agromind(request: Request, body: ChatRequest):
    enforce_chat_rate_limit(request)
    try:
        out: TutorChatResult = await ask_agromind(body.message)
        return ChatResponse(reply=out.reply, rag_sources=out.rag_sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
