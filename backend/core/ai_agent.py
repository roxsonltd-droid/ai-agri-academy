from __future__ import annotations

from typing import TYPE_CHECKING

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.teachers_registry import TEACHERS, get_teacher
from core.llm_factory import get_chat_llm
from core.rag_facade import retrieve_for_prompt_bundle
from core.rag_types import RagSourceItem

if TYPE_CHECKING:
    from langchain_core.language_models import BaseChatModel

GLOBAL_SYSTEM_PROMPT = """Ти си част от екипа експерти на AI Agro Academy.
Правила за общуване:
1. Говори експертно, сериозно и академично.
2. Бъди позитивен и окуражаващ, но поддържай строг професионален тон.
3. Отговаряй ВИНАГИ на български език, освен ако изрично не те питат на друг.
4. Фокусирай се върху модерни технологии в земеделието (AI, IoT, RTK дронове).
5. СТРОГО ЗАБРАНЕНО е използването на емоджита (emojis) в същинския текст. Текстът трябва да е изчистен.
6. Когато получиш контекст от вътрешната база знания, приоритизирай фактите от него.
7. Отказвай ясно теми извън земеделие, агро-образование и устойчивост (без политика, без медицински съвети, без конкретни финансови препоръки за инвестиции).
"""

ROUTER_PROMPT = """Ти си интелигентен рутер на съобщения. Твоята задача е да избереш най-подходящия експерт за въпроса на потребителя.
Експерти:
{experts_list}

Върни САМО teacher_id на избрания експерт като чист текст (без маркдаун, без обяснения). Ако въпросът е общ, върни "agromind".
"""


class TutorChatResult(BaseModel):
    """Отговор за POST /api/v1/chat — текст + източници от RAG (ако има)."""

    reply: str
    rag_sources: list[RagSourceItem] = Field(default_factory=list)


def _text_content(response: object) -> str:
    c = getattr(response, "content", "")
    if isinstance(c, str):
        return c
    return str(c or "")


async def route_to_expert(message: str, llm: "BaseChatModel") -> str:
    experts_info = []
    for t_id, t in TEACHERS.items():
        experts_info.append(f"- {t_id}: {t.short_bio_bg}")
    experts_list_str = "\n".join(experts_info)

    router_sys = ROUTER_PROMPT.format(experts_list=experts_list_str)
    try:
        response = await llm.ainvoke([SystemMessage(content=router_sys), HumanMessage(content=message)])
        chosen_id = _text_content(response).strip().replace("`", "").strip()
        for valid_id in TEACHERS.keys():
            if valid_id in chosen_id:
                return valid_id
        return "agromind"
    except Exception:
        return "agromind"


async def ask_agromind(message: str, llm_extra_headers: dict[str, str] | None = None) -> TutorChatResult:
    llm = get_chat_llm(temperature=0.7, extra_headers=llm_extra_headers)
    teacher_id = await route_to_expert(message, llm)
    teacher = get_teacher(teacher_id) or get_teacher("agromind")

    bundle = await retrieve_for_prompt_bundle(message)
    human = f"{bundle.prompt_block}\n\nВъпрос на студента:\n{message}" if bundle.prompt_block else message

    full_system_prompt = f"{GLOBAL_SYSTEM_PROMPT}\n\nТвоята роля: {teacher.system_prompt_extension_bg}"

    messages = [
        SystemMessage(content=full_system_prompt),
        HumanMessage(content=human),
    ]
    response = await llm.ainvoke(messages)

    header = f"### Одобрено от: {teacher.display_name}\n\n"
    return TutorChatResult(reply=header + _text_content(response), rag_sources=bundle.sources)
