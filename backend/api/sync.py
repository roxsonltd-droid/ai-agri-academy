from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Any
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

class SyncAction(BaseModel):
    id: str
    endpoint: str
    method: str
    payload: str
    timestamp: int

class SyncBatchRequest(BaseModel):
    actions: list[SyncAction]

class SyncBatchResponse(BaseModel):
    status: str
    processed: int
    errors: int

@router.post("/batch", response_model=SyncBatchResponse)
async def sync_offline_batch(request: SyncBatchRequest, background_tasks: BackgroundTasks):
    """
    Receives a batch of offline actions from the mobile app (Sync Engine) 
    and replays them on the backend.
    """
    processed = 0
    errors = 0
    
    # In a real production system, you would parse the 'payload' JSON 
    # and route it to the respective internal services (e.g., create_parcel, update_progress).
    for action in sorted(request.actions, key=lambda x: x.timestamp):
        try:
            logger.info(f"Processing offline sync action: {action.method} {action.endpoint}")
            # parsed_payload = json.loads(action.payload)
            # Mock processing: route based on action.endpoint
            processed += 1
        except Exception as e:
            logger.error(f"Failed to sync action {action.id}: {e}")
            errors += 1
            
    return SyncBatchResponse(status="success", processed=processed, errors=errors)
