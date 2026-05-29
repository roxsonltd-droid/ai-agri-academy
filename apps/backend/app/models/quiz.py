"""Модели за генериране и изпращане на Academy квизове (structured output)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

QuestionType = Literal["multiple_choice", "true_false", "open_ended"]
QuestionDifficulty = Literal["beginner", "intermediate", "advanced"]


class QuizOption(BaseModel):
	model_config = ConfigDict(extra="ignore")

	text: str = Field(..., min_length=1)
	is_correct: bool = False


class QuizQuestion(BaseModel):
	model_config = ConfigDict(extra="ignore")

	id: int = Field(..., ge=0, description="Уникален индекс на въпроса в квиза (обикновено 1..N)")
	question_text: str = Field(..., min_length=1, description="Текст на въпроса")
	question_type: QuestionType = "multiple_choice"
	options: list[QuizOption] | None = None
	correct_answer: str = Field(default="", description="Еталон (задължителен за true_false/open_ended; за MCQ може да се изведе от options)")
	explanation: str = Field(
		...,
		min_length=1,
		description="Ясно обяснение защо отговорът е верен",
	)
	difficulty: QuestionDifficulty = "intermediate"
	topic: str = Field(default="", description="Под-тема или основната тема")

	@field_validator("explanation", mode="before")
	@classmethod
	def _explanation_non_empty(cls, v: object) -> str:
		s = str(v or "").strip()
		return s if s else "Кратко обяснение на верния отговор в контекста на българското стопанство."

	@field_validator("difficulty", mode="before")
	@classmethod
	def _coerce_question_difficulty(cls, v: object) -> str:
		s = str(v or "intermediate").strip().lower()
		if s == "expert":
			return "advanced"
		if s in ("beginner", "intermediate", "advanced"):
			return s
		return "intermediate"

	def resolved_correct_answer(self) -> str:
		if self.options:
			for o in self.options:
				if o.is_correct:
					return o.text.strip()
		return (self.correct_answer or "").strip()

	@model_validator(mode="after")
	def _ensure_correct_answer_for_mcq(self) -> QuizQuestion:
		if self.question_type == "multiple_choice" and self.options and not (self.correct_answer or "").strip():
			for o in self.options:
				if o.is_correct:
					object.__setattr__(self, "correct_answer", o.text.strip())
					break
		return self


class GeneratedQuiz(BaseModel):
	model_config = ConfigDict(
		extra="ignore",
		json_schema_extra={
			"example": {
				"topic": "Торене на пшеница",
				"difficulty": "intermediate",
				"total_questions": 5,
				"estimated_time_minutes": 12,
				"learning_objectives": ["Да се разберат нормите N", "Да се планира дозировка"],
				"questions": [],
			}
		},
	)

	topic: str = Field(..., min_length=1)
	difficulty: str = Field(default="intermediate")
	total_questions: int = Field(default=0, ge=0)
	questions: list[QuizQuestion] = Field(default_factory=list)
	estimated_time_minutes: int = Field(default=12, description="Реалистична оценка в минути (5–25)")
	learning_objectives: list[str] = Field(
		default_factory=lambda: ["Основи по темата"],
		min_length=1,
		description="Поне една учебна цел",
	)
	generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

	@field_validator("estimated_time_minutes", mode="before")
	@classmethod
	def _clamp_estimated_time(cls, v: object) -> int:
		try:
			n = int(v) if v is not None else 12
		except (TypeError, ValueError):
			n = 12
		return max(5, min(25, n))

	def model_post_init(self, __context: Any) -> None:
		if not self.total_questions and self.questions:
			object.__setattr__(self, "total_questions", len(self.questions))


class QuizAnswerItem(BaseModel):
	model_config = ConfigDict(extra="ignore")

	question_index: int = Field(..., ge=0)
	answer: str = Field(..., description="Избран отговор (текст на опцията, true/false, или свободен текст)")


class QuizSubmitBody(BaseModel):
	user_id: str = Field(..., min_length=1)
	topic: str = Field(..., min_length=1)
	questions: list[QuizQuestion]
	answers: list[QuizAnswerItem]


class QuizSubmission(BaseModel):
	model_config = ConfigDict(extra="allow")

	user_id: str
	topic: str
	answers: list[dict[str, Any]]
