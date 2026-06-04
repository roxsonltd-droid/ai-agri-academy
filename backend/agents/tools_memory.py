"""
Tools for interacting with Long-Term Memory (Store).
"""
import uuid
import logging
from typing import Annotated
from langchain_core.tools import tool
from langchain_core.tools import InjectedToolArg
from langgraph.store.base import BaseStore

logger = logging.getLogger(__name__)

@tool
async def save_user_fact(
    fact: str,
    user_id: str,
    store: Annotated[BaseStore, InjectedToolArg]
) -> str:
    """
    Save an important fact, preference, or detail about the user into their Long-Term Memory.
    Call this when the user reveals personal information, farm details (e.g. crop type, size), or preferences.
    """
    try:
        if not store:
            return "Memory Store not available."
            
        memory_id = str(uuid.uuid4())
        namespace = ("user_facts", user_id)
        
        await store.aput(
            namespace,
            memory_id,
            {"fact": fact}
        )
        return f"Successfully saved fact for user {user_id}."
    except Exception as e:
        logger.error(f"Error saving user fact: {e}")
        return "Failed to save memory."
