import json
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from core.config import settings
from core.rag_facade import retrieve_for_prompt
from agents.teachers_registry import TEACHERS, get_teacher

# Initialize the Mistral model
llm = ChatMistralAI(model="mistral-large-latest", temperature=0.7, api_key=settings.MISTRAL_API_KEY)

GLOBAL_SYSTEM_PROMPT = """Ти си част от екипа експерти на AI Agro Academy.
Правила за общуване:
1. Говори експертно, сериозно и академично.
2. Бъди позитивен и окуражаващ, но поддържай строг професионален тон.
3. Отговаряй ВИНАГИ на български език, освен ако изрично не те питат на друг.
4. Фокусирай се върху модерни технологии в земеделието (AI, IoT, RTK дронове).
5. СТРОГО ЗАБРАНЕНО е използването на емоджита (emojis) в същинския текст. Текстът трябва да е изчистен.
6. Когато получиш контекст от вътрешната база знания, приоритизирай фактите от него.
"""

ROUTER_PROMPT = """Ти си интелигентен рутер на съобщения. Твоята задача е да избереш най-подходящия експерт за въпроса на потребителя.
Експерти:
{experts_list}

Върни САМО teacher_id на избрания експерт като чист текст (без маркдаун, без обяснения). Ако въпросът е общ, върни "agromind".
"""

async def route_to_expert(message: str) -> str:
    experts_info = []
    for t_id, t in TEACHERS.items():
        experts_info.append(f"- {t_id}: {t.short_bio_bg}")
    experts_list_str = "\n".join(experts_info)
    
    router_sys = ROUTER_PROMPT.format(experts_list=experts_list_str)
    try:
        response = await llm.ainvoke([SystemMessage(content=router_sys), HumanMessage(content=message)])
        chosen_id = response.content.strip().replace("`", "").strip()
        # Fallback if Mistral hallucinates
        for valid_id in TEACHERS.keys():
            if valid_id in chosen_id:
                return valid_id
        return "agromind"
    except Exception as e:
        return "agromind"

async def ask_agromind(message: str) -> str:
    teacher_id = await route_to_expert(message)
    teacher = get_teacher(teacher_id) or get_teacher("agromind")
    
    rag = await retrieve_for_prompt(message)
    human = f"{rag}\n\nВъпрос на студента:\n{message}" if rag else message
    
    full_system_prompt = f"{GLOBAL_SYSTEM_PROMPT}\n\nТвоята роля: {teacher.system_prompt_extension_bg}"
    
    messages = [
        SystemMessage(content=full_system_prompt),
        HumanMessage(content=human)
    ]
    response = await llm.ainvoke(messages)
    
    # Premium text header
    header = f"### Одобрено от: {teacher.display_name}\n\n"
    return header + response.content
