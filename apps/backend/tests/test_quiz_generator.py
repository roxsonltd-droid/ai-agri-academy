"""Тестове за оценяване и fallback квиз."""

from __future__ import annotations

from ai.quiz.generator import build_fallback_generated_quiz, grade_answer
from app.models.quiz import QuizOption, QuizQuestion


def test_grade_true_false() -> None:
    q = QuizQuestion(
        id=1,
        question_text="Тест?",
        question_type="true_false",
        options=None,
        correct_answer="true",
        explanation="Кратко обяснение.",
        difficulty="beginner",
    )
    assert grade_answer(q, "да") is True
    assert grade_answer(q, "false") is False


def test_grade_multiple_choice() -> None:
    q = QuizQuestion(
        id=1,
        question_text="Избери",
        question_type="multiple_choice",
        options=[
            QuizOption(text="A", is_correct=False),
            QuizOption(text="B", is_correct=True),
            QuizOption(text="C", is_correct=False),
            QuizOption(text="D", is_correct=False),
        ],
        correct_answer="",
        explanation="B е верен поради контекста.",
        difficulty="intermediate",
    )
    assert grade_answer(q, "B") is True
    assert grade_answer(q, "b") is True


def test_fallback_quiz() -> None:
    quiz = build_fallback_generated_quiz("торене_пшеница", "beginner", 3)
    assert quiz.topic == "торене_пшеница"
    assert len(quiz.questions) == 3
    assert {q.question_type for q in quiz.questions} >= {"true_false", "multiple_choice"}
    assert 5 <= quiz.estimated_time_minutes <= 25
