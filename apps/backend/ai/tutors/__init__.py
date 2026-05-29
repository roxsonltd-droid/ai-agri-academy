"""Персонализиран Academy Tutor: persona, роли, промптове, учебни стъпки."""

from __future__ import annotations

from ai.tutors.personal_tutor import PersonalTutor
from ai.tutors.prompts import TEACHER_PROMPT, build_academy_rag_tutor_prompt
from ai.tutors.roles import TutorRole, role_instruction_fragment
from ai.tutors.teaching import DEFAULT_TEACHING_STEPS, adaptive_followup_hint

__all__ = [
    "PersonalTutor",
    "TEACHER_PROMPT",
    "build_academy_rag_tutor_prompt",
    "TutorRole",
    "role_instruction_fragment",
    "DEFAULT_TEACHING_STEPS",
    "adaptive_followup_hint",
]
