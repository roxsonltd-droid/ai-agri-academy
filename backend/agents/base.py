from abc import ABC, abstractmethod
from typing import Any
from sqlalchemy.orm import Session
from core.graph import Neo4jDriver

class BaseAgent(ABC):
    """Base class for all AI agents.
    Provides common utilities:
    - DB session (SQLAlchemy) for persistent memory.
    - Neo4j driver for knowledge‑graph operations.
    - Placeholder for tool registry (list of callables the agent can use).
    """

    def __init__(self, db: Session, user_id: int | None = None):
        self.db = db
        self.user_id = user_id
        self.graph = Neo4jDriver()
        self.tools = []  # Populate in concrete agents with callables

    @abstractmethod
    async def handle_event(self, event: Any) -> None:
        """Process an incoming event.
        Concrete agents must implement their own logic.
        """
        raise NotImplementedError
