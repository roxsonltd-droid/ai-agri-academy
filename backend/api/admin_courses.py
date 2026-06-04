from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.course import Course, Module, Lesson
from models.user import User
from core.bearer_user import ensure_admin
from pydantic import BaseModel
import uuid

router = APIRouter()

class CreateCourseSchema(BaseModel):
    title: str
    description: str

class CreateModuleSchema(BaseModel):
    title: str
    order: int

class CreateLessonSchema(BaseModel):
    title: str
    duration: str
    video_id: str = ""
    content: str = ""
    order: int

@router.post("/courses", response_model=dict)
async def create_course(
    data: CreateCourseSchema,
    db: Session = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    course_id = str(uuid.uuid4())[:8]
    course = Course(
        id=course_id,
        title=data.title,
        description=data.description
    )
    db.add(course)
    db.commit()
    return {"message": "Course created", "id": course_id}

@router.post("/courses/{course_id}/modules", response_model=dict)
async def create_module(
    course_id: str,
    data: CreateModuleSchema,
    db: Session = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    module_id = str(uuid.uuid4())[:8]
    module = Module(
        id=module_id,
        title=data.title,
        order=data.order,
        course_id=course_id
    )
    db.add(module)
    db.commit()
    return {"message": "Module created", "id": module_id}

@router.post("/modules/{module_id}/lessons", response_model=dict)
async def create_lesson(
    module_id: str,
    data: CreateLessonSchema,
    db: Session = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    lesson_id = str(uuid.uuid4())[:8]
    lesson = Lesson(
        id=lesson_id,
        title=data.title,
        duration=data.duration,
        video_id=data.video_id,
        content=data.content,
        order=data.order,
        module_id=module_id
    )
    db.add(lesson)
    db.commit()
    
    # Index in Typesense
    from core.search import index_lesson
    lesson_type = "video" if data.video_id else "text"
    index_lesson(
        lesson_id=lesson_id,
        title=data.title,
        content=data.content,
        course_id=module.course_id,
        lesson_type=lesson_type
    )
    
    return {"message": "Lesson created", "id": lesson_id}
