"""
PostgreSQL Store API (LangGraph Memory).
Manages connection pooling and the Long-Term Memory store.
"""
import logging
from psycopg_pool import AsyncConnectionPool
from langgraph.store.postgres.aio import AsyncPostgresStore
from core.config import settings

logger = logging.getLogger(__name__)

_pool = None
_store = None

async def init_memory_store():
    """Initialize Postgres pool and store for LangGraph LTM."""
    global _pool, _store
    if not settings.POSTGRES_STORE_URL or "sqlite" in settings.POSTGRES_STORE_URL:
        logger.warning("POSTGRES_STORE_URL not set or is sqlite. LTM requires Postgres.")
        return None
        
    if _pool is None:
        try:
            # Create a psycopg connection pool
            _pool = AsyncConnectionPool(
                conninfo=settings.POSTGRES_STORE_URL,
                max_size=10,
                kwargs={"autocommit": True, "prepare_threshold": 0},
            )
            # Create the LangGraph store wrapping the pool
            _store = AsyncPostgresStore(_pool)
            # Ensure the table schema exists
            await _store.setup()
            logger.info("LangGraph AsyncPostgresStore (LTM) initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize LTM PostgresStore: {e}")
            _pool = None
            _store = None
    return _store

async def close_memory_store():
    global _pool, _store
    if _pool:
        await _pool.close()
        _pool = None
        _store = None

def get_memory_store():
    """Return the active PostgresStore instance."""
    return _store
