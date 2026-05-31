import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from core.config import settings

router = APIRouter()

class UploadUrlRequest(BaseModel):
    title: str = "Agro Video"
    creator: str = "instructor"

class UploadUrlResponse(BaseModel):
    uploadURL: str
    uid: str

@router.post("/upload-url", response_model=UploadUrlResponse)
async def create_direct_upload(req: UploadUrlRequest):
    if not settings.CLOUDFLARE_ACCOUNT_ID or not settings.CLOUDFLARE_STREAM_API_TOKEN:
        raise HTTPException(status_code=500, detail="Cloudflare Stream is not configured on the server")

    url = f"https://api.cloudflare.com/client/v4/accounts/{settings.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload"
    
    headers = {
        "Authorization": f"Bearer {settings.CLOUDFLARE_STREAM_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # We ask Cloudflare for a URL where the frontend can upload a max 5GB video
    payload = {
        "maxDurationSeconds": 14400, # 4 hours max
        "creator": req.creator,
        "meta": {
            "name": req.title
        }
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Cloudflare error: {resp.text}")
        
        data = resp.json()
        if not data.get("success"):
            raise HTTPException(status_code=400, detail="Cloudflare failed to generate upload URL")
            
        result = data["result"]
        return UploadUrlResponse(
            uploadURL=result["uploadURL"],
            uid=result["uid"]
        )

@router.post("/webhook")
async def stream_webhook(request: Request):
    """
    Receives webhook events from Cloudflare Stream when a video is ready.
    In the future, we will update the PostgreSQL database here to mark the video as 'ready'.
    """
    body = await request.body()
    # TODO: Verify Cloudflare Signature using Webhook Secret
    return {"status": "ok", "message": "Webhook received"}
