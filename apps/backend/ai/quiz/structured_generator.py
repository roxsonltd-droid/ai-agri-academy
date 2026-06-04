"""Structured quiz generation: LangChain ``with_structured_output(GeneratedQuiz)``."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate

from ai.quiz.generator import build_fallback_generated_quiz
from app.models.quiz import GeneratedQuiz, QuizQuestion

logger = logging.getLogger(__name__)

# Few-shot: escaped ``{{``/``}}`` → единични скоби в крайния промпт (LangChain template).
_FEW_SHOT_SHAPE = r"""
Мини-пример за **един** въпрос (структурата е задължителна; съдържанието е илюстративно):
{{
  "id": 1,
  "question_text": "При пролетна пшеница кога е по-безопасно първото азотно подхранване?",
  "question_type": "multiple_choice",
  "options": [
    {{"text": "Веднага след зимата без оглед на влагата", "is_correct": false}},
    {{"text": "След начало на вегетация при достатъчна влага в почвата", "is_correct": true}},
    {{"text": "Само при поливане, независимо от фазата", "is_correct": false}},
    {{"text": "След цъфтеж за повече протеин", "is_correct": false}}
  ],
  "correct_answer": "След начало на вегетация при достатъчна влага в почвата",
  "explanation": "Ранният азот при суха почва изгаря корените и не се усвоява; при достатъчна влага растението ползва N ефективно.",
  "difficulty": "intermediate",
  "topic": "торене"
}}
"""


def _invoke_retries() -> int:
	try:
		return max(1, min(5, int(os.getenv("QUIZ_STRUCTURED_INVOKE_RETRIES", "2"))))
	except ValueError:
		return 2


def _strip_json_fence(text: str) -> str:
	t = text.strip()
	if t.startswith("```"):
		parts = t.split("```")
		if len(parts) >= 2:
			inner = parts[1].strip()
			if inner.lower().startswith("json"):
				inner = inner[4:].lstrip()
			return inner.strip()
	return t


def _normalize_parsed_quiz(quiz: GeneratedQuiz) -> GeneratedQuiz:
	"""Подравнява id и topic на въпросите; total_questions от реалния брой; време 5–25 мин."""
	topic = quiz.topic.strip()
	qs_in: list[QuizQuestion] = list(quiz.questions)
	qs: list[QuizQuestion] = []
	for i, q in enumerate(qs_in, start=1):
		sub = (q.topic or "").strip() or topic
		qs.append(q.model_copy(update={"id": i, "topic": sub}))
	est = quiz.estimated_time_minutes or max(5, min(25, len(qs) * 2))
	objectives = list(quiz.learning_objectives or [])[:12]
	if not objectives:
		objectives = [f"Основи по «{topic}»"]
	return GeneratedQuiz(
		topic=topic,
		difficulty=quiz.difficulty or "intermediate",
		total_questions=len(qs),
		questions=qs,
		estimated_time_minutes=est,
		learning_objectives=objectives,
		generated_at=quiz.generated_at,
	)


def _raw_message_content(raw: Any) -> str | None:
	if raw is None:
		return None
	if isinstance(raw, BaseMessage):
		c = getattr(raw, "content", None)
		return str(c).strip() if c is not None else None
	if isinstance(raw, dict) and "content" in raw:
		return str(raw["content"]).strip()
	return None


def _coerce_structured_invoke_result(result: Any) -> GeneratedQuiz | None:
	"""Обработва изхода при ``include_raw=True`` (dict) или директен ``GeneratedQuiz``."""
	if result is None:
		return None
	if isinstance(result, GeneratedQuiz):
		return result
	if isinstance(result, dict):
		parsed = result.get("parsed")
		if isinstance(parsed, GeneratedQuiz):
			return parsed
		if isinstance(parsed, dict):
			try:
				return GeneratedQuiz.model_validate(parsed)
			except Exception:
				pass
		if parsed is None:
			raw = result.get("raw")
			text = _raw_message_content(raw)
			if text:
				try:
					clean = _strip_json_fence(text)
					data = json.loads(clean)
					if isinstance(data, dict):
						return GeneratedQuiz.model_validate(data)
				except Exception as e:
					logger.debug("Coerce from raw JSON failed: %s", e)
		try:
			return GeneratedQuiz.model_validate(result)
		except Exception:
			return None
	return None


def _bind_structured_llm(llm: Any, *, method: str | None) -> Any | None:
	if not hasattr(llm, "with_structured_output"):
		return None
	kwargs: dict[str, Any] = {"include_raw": True}
	if method:
		kwargs["method"] = method
	try:
		return llm.with_structured_output(GeneratedQuiz, **kwargs)
	except TypeError:
		try:
			return llm.with_structured_output(GeneratedQuiz, include_raw=True)
		except Exception as e:
			logger.warning("with_structured_output (fallback kwargs) failed: %s", e)
			return None
	except Exception as e:
		logger.warning("with_structured_output failed: %s", e)
		return None


class StructuredQuizGenerator:
	"""Генерация чрез ``llm.with_structured_output(GeneratedQuiz)`` (json_mode или tool calling)."""

	def __init__(self, llm: Any | None = None) -> None:
		self._llm = llm
		self.prompt = ChatPromptTemplate.from_template(
			"""Ти си AgriTutor — професионален агроном и преподавател.

Създай **качествен образователен тест** по следната тема:

**Тема:** {topic}
**Ниво:** {difficulty}
**Брой въпроси:** {num_questions}

Контекст от Academy материалите:
{context}

{few_shot}

Инструкции:
- Въпросите да са практически за реални български стопанства.
- ``multiple_choice``: точно 4 ``QuizOption``; точно един ``is_correct: true``.
- ``true_false``: ``options`` = null; ``correct_answer`` = "true" или "false" (малки букви).
- ``open_ended``: ``options`` = null; кратък еталон в ``correct_answer``.
- Всеки въпрос: ``id`` (1..N), ``question_text``, ``explanation`` (подробно), ``difficulty`` (beginner/intermediate/advanced), ``topic``.
- Попълни ``learning_objectives`` (3–6 кратки цели) и ``estimated_time_minutes`` между 5 и 25.
- Върни структуриран изход стриктно по схемата ``GeneratedQuiz`` (JSON).
"""
		)
		self._short_prompt = ChatPromptTemplate.from_template(
			"""Минимален тест по «{topic}», ниво {difficulty}, {num_questions} въпроса.
Контекст: {context}
Спази схемата GeneratedQuiz: MCQ с 4 опции, true/false, обяснения, learning_objectives, estimated_time_minutes 5–25.

{few_shot}"""
		)

	async def _get_llm(self) -> Any:
		if self._llm is None:
			from rag.core.llm import get_llm

			self._llm = get_llm()
		return self._llm

	async def generate(
		self,
		topic: str,
		difficulty: str = "intermediate",
		num_questions: int = 6,
		context: str = "",
	) -> GeneratedQuiz:
		topic = (topic or "").strip()
		if not topic:
			raise ValueError("topic_required")
		n = max(1, min(15, int(num_questions)))
		ctx = (context or "")[:2000]

		llm = await self._get_llm()
		payload = {
			"topic": topic,
			"difficulty": difficulty,
			"num_questions": n,
			"context": ctx or "(няма контекст)",
			"few_shot": _FEW_SHOT_SHAPE.strip(),
		}

		# OpenAI-совместими модели: json_mode; иначе default (tool / native structured).
		methods_chain: list[str | None] = ["json_mode", None]
		prompts: list[ChatPromptTemplate] = [self.prompt, self._short_prompt]
		retries = _invoke_retries()

		for prompt in prompts:
			for method in methods_chain:
				structured = _bind_structured_llm(llm, method=method)
				if structured is None:
					continue
				chain = prompt | structured
				for attempt in range(retries):
					try:
						result = await chain.ainvoke(payload)
						quiz = _coerce_structured_invoke_result(result)
						if quiz is not None and quiz.questions:
							return _normalize_parsed_quiz(quiz)
						if quiz is not None and not quiz.questions:
							logger.warning(
								"Structured quiz empty questions (prompt=%s, method=%s, attempt=%s/%s)",
								"short" if prompt is self._short_prompt else "main",
								method,
								attempt + 1,
								retries,
							)
					except Exception as e:
						logger.warning(
							"StructuredQuizGenerator: invoke failed (prompt=%s, method=%s, attempt=%s/%s): %s",
							"short" if prompt is self._short_prompt else "main",
							method,
							attempt + 1,
							retries,
							e,
						)
					if attempt + 1 < retries:
						await asyncio.sleep(0.35 * (2**attempt))

		logger.warning("StructuredQuizGenerator: all structured attempts failed, using local fallback")
		return build_fallback_generated_quiz(topic, difficulty, n)
