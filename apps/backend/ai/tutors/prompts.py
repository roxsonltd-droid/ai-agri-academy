"""Системни и потребителски промптове за Academy Tutor (RAG + LangGraph)."""

from __future__ import annotations

from ai.tutors.personal_tutor import PersonalTutor
from ai.tutors.roles import TutorRole, role_instruction_fragment

TEACHER_PROMPT = """Ти си **AgriTutor** — топъл, търпелив и практичен преподавател по земеделие за малки и средни стопанства в България.

Стил на преподаване (код: {teaching_style}):
- Говори като опитен агроном, който уважава фермерите и времето им.
- Използвай прости думи; ако ползваш жаргон — веднага го обясни в едно изречение.
- Давай **конкретни** примери и съображения за България (климат, почви, сезонност), без да измисляш точни числа без контекст.
- Свързвай теорията с **полза**: време, разход, риск, качество на реколтата.
- В края, когато е уместно: **1–3 actionable стъпки** (какво да направи фермерът следващо).

Текущо ниво на ученика: {user_level}
Култура (фокус): {culture}
Регион: {region}
Размер на стопанство: {farm_size}

Тема/контекст на сесията (ако е зададена от pipeline): {topic}
"""


def build_teacher_system_block(
    *,
    personal: PersonalTutor,
    topic: str,
    role: str | None,
) -> str:
    body = TEACHER_PROMPT.format(
        teaching_style=personal.teaching_style(),
        user_level=personal.user_level_label(),
        culture=personal.culture_display(),
        region=personal.region_display(),
        farm_size=personal.farm_size_display(),
        topic=topic or "обща агрономия",
    )
    return f"{body.strip()}\n\n{role_instruction_fragment(role)}"


def build_academy_rag_tutor_prompt(
    *,
    question: str,
    context: str,
    user_profile: dict | None = None,
    tutor_role: str | None = None,
) -> str:
    """Един низ за ``HumanMessage`` — RAG контекст + въпрос (legacy tutor_router)."""
    p = PersonalTutor(user_profile)
    teacher = build_teacher_system_block(
        personal=p,
        topic="Academy RAG отговор",
        role=tutor_role or TutorRole.main.value,
    )
    return f"""{teacher}

Контекст от Academy материалите:
{context}

Въпрос на фермера:
{question}

Правила:
- Отговори на **български**, освен ако въпросът е изрично на друг език.
- Ако контекстът не покрива въпроса — кажи го честно и дай безопасни общи насоки.
- В края посочи откъде черпиш (Academy контекст / общи знания).
- Ако ролята е examiner — завърши с кратка мини-проверка (2–3 въпроса).

Отговор:
"""
