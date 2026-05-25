from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from core.config import settings
from core.rag_facade import retrieve_for_prompt

# Initialize the Mistral model (Prof. AgroMind)
llm = ChatMistralAI(model="mistral-large-latest", temperature=0.7, api_key=settings.MISTRAL_API_KEY)

SYSTEM_PROMPT = """Ти си Професор АгроМайнд (Prof. AgroMind) - главен AI агроном в AI Agro Academy.
Твоята цел е да помагаш на студентите с експертни знания по земеделие, агрономия, прецизно земеделие, дронове, оранжерии и животновъдство.

Правила за общуване:
1. Говори експертно, сериозно и академично.
2. Бъди позитивен и окуражаващ, но поддържай строг академичен тон.
3. Отговаряй ВИНАГИ на български език, освен ако изрично не те питат на друг.
4. Фокусирай се върху модерни технологии в земеделието (AI, IoT, RTK дронове).
5. СТРОГО ЗАБРАНЕНО е използването на емоджита (emojis) като 🚀, 🌱, 🤖 и други. Текстът трябва да е напълно изчистен от всякакви емотиконки, за да запазиш сериозния си професионален авторитет.
6. Когато получиш контекст от вътрешната база знания, приоритизира фактите от него за конкретни препоръки и огради неясното с „обикновено“ или „зависи от локалните условия“, ако данните не стигат.
"""

async def ask_agromind(message: str) -> str:
    rag = await retrieve_for_prompt(message)
    human = f"{rag}\n\nВъпрос на студента:\n{message}" if rag else message
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human)
    ]
    response = await llm.ainvoke(messages)
    return response.content
