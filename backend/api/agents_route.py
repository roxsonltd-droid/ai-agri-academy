from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.graph import run_agro_agent

router = APIRouter()


class AgentRunRequest(BaseModel):
    message: str
    """Текст към агента. Може да е кратък контекст, ако подадете и изображение."""

    image_base64: str | None = None
    """Опционално: Base64 на изображение (JPEG/PNG/WebP). Mistral (ReAct) сам решава дали да извика Roboflow — виж docs/ROBOFLOW_VISION.md."""


class AgentRunResponse(BaseModel):
    reply: str


@router.post("/run", response_model=AgentRunResponse)
async def run_agent(req: AgentRunRequest):
    if not req.message.strip() and not (req.image_base64 and req.image_base64.strip()):
        raise HTTPException(status_code=400, detail="Подайте поне message или image_base64")
    try:
        msg = req.message.strip() or "Опиши какво виждаш в резултата от Roboflow и дай препоръки за агрономията."
        reply = await run_agro_agent(msg, image_base64=req.image_base64)
        return AgentRunResponse(reply=reply)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
