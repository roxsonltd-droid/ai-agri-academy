"""Модели за ``user_knowledge_state`` (adaptive learning)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserKnowledgeState(BaseModel):
    """Ред от ``user_knowledge_state``."""

    model_config = ConfigDict(extra="ignore")

    id: str | None = None
    user_id: str
    topic: str
    mastery_level: float = Field(default=0.0, ge=0.0, le=1.0)
    attempts: int = Field(default=0, ge=0)
    correct_answers: int = Field(default=0, ge=0)
    last_assessed: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> UserKnowledgeState:
        """Нормализира ред от Supabase/in-memory (ISO низове → datetime)."""
        data = dict(row)
        for key in ("last_assessed", "created_at", "updated_at"):
            v = data.get(key)
            if isinstance(v, str):
                try:
                    data[key] = datetime.fromisoformat(v.replace("Z", "+00:00"))
                except ValueError:
                    data[key] = None
        return cls.model_validate(data)


class KnowledgeUpdate(BaseModel):
    """Частичен PATCH по ``id`` на запис."""

    model_config = ConfigDict(extra="forbid")

    mastery_level: float | None = None
    attempts: int | None = None
    correct_answers: int | None = None
    last_assessed: datetime | None = None

    @field_validator("mastery_level")
    @classmethod
    def _mastery_bounds(cls, v: float | None) -> float | None:
        if v is None:
            return v
        if not 0.0 <= v <= 1.0:
            raise ValueError("mastery_level must be between 0 and 1")
        return v

    @field_validator("attempts", "correct_answers")
    @classmethod
    def _non_negative(cls, v: int | None) -> int | None:
        if v is None:
            return v
        if v < 0:
            raise ValueError("must be >= 0")
        return v
