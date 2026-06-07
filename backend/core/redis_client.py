"""
Redis Client for AgriOS Backend.
Handles connection pooling for rate limiting, caching, and AI session memory.
"""
import logging
import redis.asyncio as redis
from core.config import settings

logger = logging.getLogger(__name__)

# Global redis connection pool
_redis_client = None

async def init_redis() -> redis.Redis:
    """Initialize and return the Redis client."""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            # Ping to check connection
            await _redis_client.ping()
            logger.info(f"Successfully connected to Redis at {settings.REDIS_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            _redis_client = None
    return _redis_client

async def close_redis():
    """Close the Redis connection pool."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None

def get_redis() -> redis.Redis | None:
    """Get the initialized Redis client, or None if not initialized."""
    return _redis_client
