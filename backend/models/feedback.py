"""Анонимен/опционален feedback за отговори на tutor (за подобряване на prompts)."""

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from db.database import Base


class TutorFeedback(Base):
    __tablename__ = "tutor_feedback"

    id = Column(Integer, primary_key=True, index=True)
    helpful = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)
    route = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
