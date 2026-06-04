from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from db.database import Base

class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id = Column(String, ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
