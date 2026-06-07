"""Оценяване на отговори + локален fallback квиз (structured schema)."""

from __future__ import annotations

import logging
import re
from typing import Any

from app.models.quiz import GeneratedQuiz, QuizOption, QuizQuestion

logger = logging.getLogger(__name__)


def _normalize_answer(s: str) -> str:
	return re.sub(r"\s+", " ", (s or "").strip().lower())


def grade_answer(question: QuizQuestion, user_answer: str) -> bool:
	"""Сравнява потребителски отговор с еталона (MCQ: `QuizOption.is_correct` или `correct_answer`)."""
	u = _normalize_answer(user_answer)
	c = _normalize_answer(question.resolved_correct_answer())
	if question.question_type == "true_false":
		u2 = u in ("true", "t", "да", "yes", "1", "вярно")
		u3 = u in ("false", "f", "не", "no", "0", "невярно")
		c2 = c in ("true", "t", "1", "yes", "да", "вярно")
		c3 = c in ("false", "f", "0", "no", "не", "невярно")
		if c2:
			return u2 and not u3
		if c3:
			return u3 and not u2
		return u == c
	if question.question_type == "multiple_choice":
		return u == c or (c and u.endswith(c)) or (c and c.endswith(u))
	if question.question_type == "open_ended":
		if len(u) < 12:
			return False
		c_tokens = set(re.findall(r"[а-яa-z0-9]{4,}", c))
		u_tokens = set(re.findall(r"[а-яa-z0-9]{4,}", u))
		if not c_tokens:
			return len(u) > 20
		overlap = len(c_tokens & u_tokens) / max(1, len(c_tokens))
		return overlap >= 0.25
	return u == c


def build_fallback_generated_quiz(topic: str, difficulty: str, num_questions: int) -> GeneratedQuiz:
	"""Детерминистичен квиз при грешка на LLM / парсер (същата Pydantic схема)."""
	n = max(1, min(8, int(num_questions)))
	main_topic = (topic or "").strip() or "агрономия"
	questions: list[QuizQuestion] = [
		QuizQuestion(
			id=1,
			question_text=f"Вярно ли е: темата «{main_topic}» изисква контекст на конкретното стопанство?",
			question_type="true_false",
			options=None,
			correct_answer="true",
			explanation="Практиката зависи от почва, култура, климат и ресурси.",
			difficulty=difficulty,
			topic=main_topic,
		),
		QuizQuestion(
			id=2,
			question_text=f"Кое е най-важното при планиране на действия по «{main_topic}»?",
			question_type="multiple_choice",
			options=[
				QuizOption(text="Само календар без наблюдения на полето", is_correct=False),
				QuizOption(text="Комбинация от наблюдения и препоръки за културата", is_correct=True),
				QuizOption(text="Игнориране на метео прогнозата", is_correct=False),
				QuizOption(text="Работа без запис на дозировки и срокове", is_correct=False),
			],
			correct_answer="Комбинация от наблюдения и препоръки за културата",
			explanation="Интегрираният подход намалява риска от грешки.",
			difficulty=difficulty,
			topic=main_topic,
		),
	]
	if n >= 3:
		questions.append(
			QuizQuestion(
				id=3,
				question_text=f"Опиши накратко (2–3 изречения) как прилагаш «{main_topic}» в твое стопанство.",
				question_type="open_ended",
				options=None,
				correct_answer="Планиране според културата, наблюдение и корекция при нужда.",
				explanation="Отвореният отговор проверява практическо мислене.",
				difficulty=difficulty,
				topic=main_topic,
			)
		)
	questions = questions[:n]
	est = max(5, min(25, len(questions) * 3))
	objectives = [
		f"Да се затвърдят основни понятия по «{main_topic}»",
		"Да се свърже теория с полеви практики в България",
	]
	return GeneratedQuiz(
		topic=main_topic,
		difficulty=difficulty,
		total_questions=len(questions),
		questions=questions,
		estimated_time_minutes=est,
		learning_objectives=objectives,
	)
