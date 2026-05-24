import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from core.config import settings

router = APIRouter()

# Initialize LLM for the Lab
llm = ChatMistralAI(model="mistral-large-latest", temperature=0.1, api_key=settings.MISTRAL_API_KEY)

class LabAnalyzeRequest(BaseModel):
    ph: float
    nitrogen: str # low, medium, high
    phosphorus: str # low, medium, high
    potassium: str # low, medium, high
    target_crop: str
    weather: str # drought, normal, heavy_rain
    season: str # spring, summer, autumn, winter
    budget: float # in EUR/decare

class LabAnalyzeResponse(BaseModel):
    status: str # "success", "warning", "danger"
    analysis: str
    recommendation: str
    expected_yield: str # low, medium, high
    financial_outlook: str

LAB_SYSTEM_PROMPT = """Ти си Професор АгроМайнд - главен агроном и финансов експерт в земеделието.
Задачата ти е да анализираш агрономическите и икономическите параметри за даденото поле и култура (target_crop).

Правила за анализ:
1. Оцени киселинността (pH) и нивата на Азот (N), Фосфор (P) и Калий (K).
2. Оцени влиянието на времето (weather) и сезона на засаждане (season) върху културата.
3. Оцени дали инвестиционният бюджет в Евро/декар е достатъчен за коригиране на евентуални проблеми (например липса на торове или нужда от напояване при суша).
4. Върни отговора СТРОГО в JSON формат със следните ключове:
   - "status": една от трите стойности: "success" (всичко е идеално), "warning" (има рискове), "danger" (сигурен провал).
   - "analysis": кратък текст (до 2-3 изречения) на български език, обясняващ агрономическата ситуация. Без емоджита.
   - "recommendation": кратък съвет за действие. Без емоджита.
   - "expected_yield": очакван добив, една от следните думи: "Слаб", "Среден", "Висок".
   - "financial_outlook": 1-2 изречения за очакваната възвръщаемост спрямо бюджета (в Евро).

ПРИМЕРЕН ОТГОВОР:
{
  "status": "warning",
  "analysis": "Почвата има добри показатели, но пролетната суша ще стресира пшеницата.",
  "recommendation": "Осигурете допълнително напояване.",
  "expected_yield": "Среден",
  "financial_outlook": "Бюджетът от 50 EUR/декар ще покрие поливането, но печалбата ще е минимална."
}
Върни САМО чист JSON, без Markdown форматиране.
"""

@router.post("/analyze", response_model=LabAnalyzeResponse)
async def analyze_soil(request: LabAnalyzeRequest):
    human_msg = f"""
    Анализирай следните данни:
    - Желана култура: {request.target_crop}
    - Сезон на засаждане: {request.season}
    - Време/Валежи: {request.weather}
    - Бюджет (EUR/декар): {request.budget}
    - pH на почвата: {request.ph}
    - Азот (N): {request.nitrogen}
    - Фосфор (P): {request.phosphorus}
    - Калий (K): {request.potassium}
    """
    
    messages = [
        SystemMessage(content=LAB_SYSTEM_PROMPT),
        HumanMessage(content=human_msg)
    ]
    
    try:
        response = await llm.ainvoke(messages)
        # Parse the JSON response
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        
        return LabAnalyzeResponse(
            status=data.get("status", "warning"),
            analysis=data.get("analysis", "Грешка при анализа на данните."),
            recommendation=data.get("recommendation", "Свържете се със специалист."),
            expected_yield=data.get("expected_yield", "Неизвестен"),
            financial_outlook=data.get("financial_outlook", "Невъзможна калкулация.")
        )
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        # Fallback if parsing fails or API fails
        return LabAnalyzeResponse(
            status="warning",
            analysis="AI системата е временно недостъпна.",
            recommendation="Моля, опитайте отново по-късно.",
            expected_yield="Неизвестен",
            financial_outlook="Грешка."
        )
