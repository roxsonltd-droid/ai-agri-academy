"""Unit tests за персонализиран Tutor persona."""

from __future__ import annotations

from ai.tutors.personal_tutor import PersonalTutor


def test_teaching_style_beginner() -> None:
    p = PersonalTutor({"experience": "beginner"})
    assert p.teaching_style() == "patient_explanatory"


def test_teaching_style_large_farm() -> None:
    p = PersonalTutor({"farm_size_ha": 600})
    assert p.teaching_style() == "professional_practical"


def test_teaching_style_balanced() -> None:
    p = PersonalTutor({"experience": "intermediate", "farm_size_ha": 50})
    assert p.teaching_style() == "balanced_practical"
