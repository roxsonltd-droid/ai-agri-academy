from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    order = Column("order", Integer, quote=True)
    course_id = Column(String, ForeignKey("courses.id"))
    
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    duration = Column(String)
    content = Column(Text, nullable=True)  # Markdown lesson body for reading view
    video_id = Column(String)  # Stream uid or external id; see docs/VIDEO_LEARNING_SYSTEM.md
    completed = Column(Boolean, default=False) # In real app, this should be tracked per-user, but we'll mock it here for simplicity
    order = Column("order", Integer, quote=True)
    module_id = Column(String, ForeignKey("modules.id"))
    
    module = relationship("Module", back_populates="lessons")
