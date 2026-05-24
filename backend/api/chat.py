from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.ai_agent import ask_agromind

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/", response_model=ChatResponse)
async def chat_with_agromind(request: ChatRequest):
    try:
        reply = await ask_agromind(request.message)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
