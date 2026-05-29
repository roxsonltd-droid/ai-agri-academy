"""Adaptive learning: ниво, трудност, персонализиран път, оценка."""

from ai.adaptive.engine import AdaptiveLearningEngine
from ai.adaptive.knowledge_service import KnowledgeService, get_knowledge_service
from ai.adaptive.quiz import bump_mastery, calculate_score, feedback_message_for_mastery

__all__ = [
    "AdaptiveLearningEngine",
    "KnowledgeService",
    "bump_mastery",
    "calculate_score",
    "feedback_message_for_mastery",
    "get_knowledge_service",
]
