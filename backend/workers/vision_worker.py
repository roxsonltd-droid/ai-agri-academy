import logging
from faststream.rabbit import RabbitRouter
from pydantic import BaseModel
import asyncio

logger = logging.getLogger(__name__)

# Router for vision-related events
vision_router = RabbitRouter()

class ImageUploadedEvent(BaseModel):
    user_id: int
    image_url: str
    timestamp: float

@vision_router.subscriber("plant.image.uploaded")
async def handle_plant_image_uploaded(event: ImageUploadedEvent):
    """
    Consumer that listens for new images and triggers background AI analysis.
    This runs entirely decoupled from the main FastAPI request thread!
    """
    logger.info(f"EDA [Vision Worker]: Received ImageUploadedEvent for user {event.user_id}")
    logger.info(f"EDA [Vision Worker]: Starting background AI analysis on {event.image_url}...")
    
    # Mock AI Processing time to simulate heavy workload
    await asyncio.sleep(2)
    
    logger.info(f"EDA [Vision Worker]: Analysis complete! Disease detected: None (Healthy)")
    # In a real scenario, this worker would now publish a 'plant.disease.detected' 
    # event for the Notification Service to pick up.
