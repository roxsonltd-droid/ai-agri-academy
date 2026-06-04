"""Оркестрация: mastery → трудност → RAG → structured quiz; submit → оценка → knowledge state."""

from __future__ import annotations

import os
from typing import Any

from ai.adaptive.engine import AdaptiveLearningEngine
from ai.adaptive.knowledge_service import KnowledgeService, get_knowledge_service
from ai.adaptive.quiz import bump_mastery, feedback_message_for_mastery
from ai.quiz.generator import grade_answer
from ai.quiz.structured_generator import StructuredQuizGenerator
from ai.rag.engine import RAGEngine
from ai.vector_store.filters import build_agri_vector_metadata_filter
from app.models.quiz import GeneratedQuiz, QuizSubmitBody


class QuizService:
	def __init__(
		self,
		llm: Any | None = None,
		knowledge_service: KnowledgeService | None = None,
		rag: RAGEngine | None = None,
		engine: AdaptiveLearningEngine | None = None,
	) -> None:
		self.structured = StructuredQuizGenerator(llm)
		self.knowledge = knowledge_service or get_knowledge_service()
		self.rag = rag or RAGEngine()
		self.engine = engine or AdaptiveLearningEngine()

	async def create_quiz(
		self,
		user_id: str,
		topic: str,
		difficulty: str | None = None,
		num_questions: int = 6,
		*,
		culture: str | None = None,
		region: str | None = None,
	) -> GeneratedQuiz:
		topic = (topic or "").strip()
		if not topic:
			raise ValueError("topic_required")
		await self.knowledge.ensure_profile(user_id)
		state = await self.knowledge.get_by_topic(user_id, topic)
		mastery = float(state.mastery_level) if state else 0.0
		diff = (difficulty or "").strip().lower() if difficulty else ""
		if diff not in ("beginner", "intermediate", "advanced", "expert"):
			diff = self.engine.get_next_difficulty(topic, mastery if state else 0.3)

		flt = build_agri_vector_metadata_filter(culture=culture, region=region, difficulty=diff)
		use_comp = (os.getenv("ACADEMY_QUIZ_USE_RAG_COMPRESSION") or "").strip().lower() in ("1", "true", "yes")
		rag_k = 10 if use_comp else 7
		try:
			ctx_pack = await self.rag.aretrieve(
				topic,
				k=rag_k,
				filter=flt if flt else None,
				use_compression=use_comp,
			)
			context = (ctx_pack.get("context") or "").strip()
		except Exception:
			context = ""

		return await self.structured.generate(topic, diff, num_questions, context)

	async def submit_quiz(self, body: QuizSubmitBody) -> dict[str, Any]:
		questions = body.questions
		if not questions:
			raise ValueError("questions_required")
		by_idx = {a.question_index: a.answer for a in body.answers}
		correct_count = 0
		details: list[dict[str, Any]] = []
		for i, q in enumerate(questions):
			raw = by_idx.get(i, "")
			ok = grade_answer(q, str(raw))
			if ok:
				correct_count += 1
			details.append({"question_index": i, "correct": ok, "question_type": q.question_type})

		total = len(questions)
		score = correct_count / total if total else 0.0

		st = await self.knowledge.get_by_topic(body.user_id, body.topic)
		old_m = float(st.mastery_level) if st else 0.3
		prev_att = int(st.attempts) if st else 0
		prev_corr = int(st.correct_answers) if st else 0
		new_mastery = bump_mastery(old_m, score)

		await self.knowledge.create_or_update(
			body.user_id.strip(),
			body.topic.strip(),
			new_mastery,
			attempts=prev_att + 1,
			correct_answers=prev_corr + correct_count,
		)

		feedback = self._generate_feedback(score, body.topic)
		return {
			"score_percent": round(score * 100, 1),
			"correct_answers": correct_count,
			"total": total,
			"new_mastery": round(new_mastery, 3),
			"feedback": feedback,
			"feedback_mastery": feedback_message_for_mastery(new_mastery),
			"details": details,
		}

	def _generate_feedback(self, score: float, topic: str) -> str:
		if score >= 0.85:
			return f"Отличен резултат по «{topic}»! Много добре разбираш темата."
		if score >= 0.65:
			return f"Добър резултат по «{topic}». Имаш солидна основа."
		return f"Препоръчвам да преговорим основите на «{topic}»."


_quiz_service: QuizService | None = None


def get_quiz_service() -> QuizService:
	global _quiz_service
	if _quiz_service is None:
		_quiz_service = QuizService()
	return _quiz_service
