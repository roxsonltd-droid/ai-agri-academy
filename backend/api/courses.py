from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.course import Course, Module, Lesson
from pydantic import BaseModel
from typing import List
import json
import uuid
import asyncio
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from core.config import settings
from youtubesearchpython import VideosSearch

# Initialize LLM for Course Generation
llm = ChatMistralAI(model="mistral-large-latest", temperature=0.7, api_key=settings.MISTRAL_API_KEY)

router = APIRouter()

# Pydantic Schemas for response
class LessonSchema(BaseModel):
    id: str
    title: str
    duration: str
    video_id: str
    completed: bool
    
    class Config:
        from_attributes = True

class ModuleSchema(BaseModel):
    id: str
    title: str
    lessons: List[LessonSchema]
    
    class Config:
        from_attributes = True

class CourseSchema(BaseModel):
    id: str
    title: str
    description: str
    modules: List[ModuleSchema] = []
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CourseSchema])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Sort modules and lessons
    course.modules.sort(key=lambda m: m.order)
    for m in course.modules:
        m.lessons.sort(key=lambda l: l.order)
        
    return course

@router.post("/seed")
def seed_courses(db: Session = Depends(get_db)):
    # Check if already seeded
    if db.query(Course).first():
        return {"message": "Database already seeded"}
        
    # Seed the precision agriculture course
    course = Course(
        id="precision-agriculture",
        title="Основи на прецизното земеделие",
        description="Пълен курс за дигитално фермерство и технологии."
    )
    db.add(course)
    
    # Module 1
    m1 = Module(id="m1", title="Модул 1: Въведение в дигиталното фермерство", order=1, course_id=course.id)
    db.add(m1)
    
    l1 = Lesson(id="l1", title="Какво е прецизно земеделие?", duration="12:45", video_id="LXb3EKWsInQ", completed=True, order=1, module_id=m1.id)
    l2 = Lesson(id="l2", title="Основни технологии и сензори", duration="18:20", video_id="aqz-KE-bpKQ", completed=True, order=2, module_id=m1.id)
    l3 = Lesson(id="l3", title="Предимства и възвръщаемост", duration="15:10", video_id="jNQXAC9IVRw", completed=False, order=3, module_id=m1.id)
    db.add_all([l1, l2, l3])
    
    # Module 2
    m2 = Module(id="m2", title="Модул 2: Дронове и сателитно заснемане", order=2, course_id=course.id)
    db.add(m2)
    
    l4 = Lesson(id="l4", title="Видове дронове в земеделието", duration="22:15", video_id="LXb3EKWsInQ", completed=False, order=1, module_id=m2.id)
    l5 = Lesson(id="l5", title="NDVI индекс и анализ на снимки", duration="25:30", video_id="aqz-KE-bpKQ", completed=False, order=2, module_id=m2.id)
    db.add_all([l4, l5])
    
    db.commit()
    
    return {"message": "Database seeded successfully"}

class GenerateCourseRequest(BaseModel):
    topic: str

COURSE_GENERATOR_PROMPT = """Ти си Професор АгроМайнд - главен агроном и създател на образователни програми.
Задачата ти е да създадеш структура на видео курс по зададената тема (topic).

Правила:
1. Курсът трябва да има 2 модула, всеки с по 2 урока.
2. Върни отговора СТРОГО в JSON формат.
3. Използвай следния JSON формат точно:
{
  "title": "Заглавие на курса",
  "description": "Кратко описание на курса.",
  "modules": [
    {
      "title": "Заглавие на модула",
      "lessons": [
        {
          "title": "Заглавие на урока",
          "duration": "12:30" 
        }
      ]
    }
  ]
}
4. ЗАБРАНЕНИ СА всякакви обяснения, емоджита или форматиране извън чистия JSON.
"""

@router.post("/generate", response_model=CourseSchema)
async def generate_course(request: GenerateCourseRequest, db: Session = Depends(get_db)):
    human_msg = f"Генерирай курс на тема: {request.topic}"
    messages = [
        SystemMessage(content=COURSE_GENERATOR_PROMPT),
        HumanMessage(content=human_msg)
    ]
    
    try:
        response = await llm.ainvoke(messages)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        
        # Create course in DB
        course_id = str(uuid.uuid4())[:8]
        course = Course(
            id=course_id,
            title=data.get("title", f"Курс: {request.topic}"),
            description=data.get("description", "Автоматично генериран курс.")
        )
        db.add(course)
        
        module_order = 1
        for mod_data in data.get("modules", []):
            mod_id = str(uuid.uuid4())[:8]
            module = Module(
                id=mod_id,
                title=mod_data.get("title", f"Модул {module_order}"),
                order=module_order,
                course_id=course_id
            )
            db.add(module)
            
            lesson_order = 1
            for les_data in mod_data.get("lessons", []):
                les_id = str(uuid.uuid4())[:8]
                les_title = les_data.get("title", f"Урок {lesson_order}")
                
                # Automatically fetch real YouTube video ID
                video_id = "aqz-KE-bpKQ" # Default fallback
                try:
                    search_query = f"{les_title} agriculture"
                    videos_search = VideosSearch(search_query, limit=1)
                    results = videos_search.result()
                    if results and results.get('result') and len(results['result']) > 0:
                        video_id = results['result'][0]['id']
                except Exception as ex:
                    print(f"Failed to fetch video for {les_title}: {ex}")

                lesson = Lesson(
                    id=les_id,
                    title=les_title,
                    duration=les_data.get("duration", "10:00"),
                    video_id=video_id,
                    completed=False,
                    order=lesson_order,
                    module_id=mod_id
                )
                db.add(lesson)
                lesson_order += 1
                
            module_order += 1
            
        db.commit()
        db.refresh(course)
        
        return get_course(course_id, db)
        
    except Exception as e:
        print(f"Error generating course: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate course")
