"""Генериране и оценяване на Academy квизове."""

from ai.quiz.generator import build_fallback_generated_quiz, grade_answer
from ai.quiz.service import QuizService, get_quiz_service
from ai.quiz.structured_generator import StructuredQuizGenerator

__all__ = [
	"StructuredQuizGenerator",
	"build_fallback_generated_quiz",
	"grade_answer",
	"QuizService",
	"get_quiz_service",
]
