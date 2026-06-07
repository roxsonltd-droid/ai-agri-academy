"""Мулти-роля Tutor: един чат с различен акцент според ролята."""

from __future__ import annotations

from enum import Enum


class TutorRole(str, Enum):
    main = "main"
    expert = "expert"
    mentor = "mentor"
    examiner = "examiner"


_ROLE_INSTRUCTIONS_BG: dict[str, str] = {
    TutorRole.main.value: (
        "Роля сега: **главен преподавател** — даваш ясна структура, обобщения и връзка между темите."
    ),
    TutorRole.expert.value: (
        "Роля сега: **експерт по култура/техника** — задълбочаваш агротехниката, дозировки, фенофази и рискове; "
        "без измислени цифри — ако липсват данни, кажи какво да измери фермерът."
    ),
    TutorRole.mentor.value: (
        "Роля сега: **ментор** — кратко оценяваш какво вече знае ученикът от въпроса, насърчаваш следваща стъпка, "
        "свързваш с цел (време, разход, риск)."
    ),
    TutorRole.examiner.value: (
        "Роля сега: **проверка на знанието** — след отговора добави 2–3 много кратки въпроса с избор или с „да/не“, "
        "за да затвърдиш ученето; после един ред какво означава добър отговор."
    ),
}


def role_instruction_fragment(role: str | None) -> str:
    key = (role or TutorRole.main.value).strip().lower()
    return _ROLE_INSTRUCTIONS_BG.get(key, _ROLE_INSTRUCTIONS_BG[TutorRole.main.value])
