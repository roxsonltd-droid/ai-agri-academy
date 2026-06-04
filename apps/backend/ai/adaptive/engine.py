"""Ядро за адаптивно обучение: ниво, трудност, препоръчан път."""

from __future__ import annotations

from typing import Any


class AdaptiveLearningEngine:
    def calculate_user_level(self, profile: dict[str, Any] | None, knowledge_state: list[dict[str, Any]] | None) -> int:
        """Текущо ниво 1–5 от средно mastery или от профил при липса на данни."""
        if not knowledge_state:
            lvl = (profile or {}).get("overall_level")
            try:
                return max(1, min(5, int(lvl))) if lvl is not None else 1
            except (TypeError, ValueError):
                return 1

        avg_mastery = sum(float(item.get("mastery_level", 0.0)) for item in knowledge_state) / len(knowledge_state)
        if avg_mastery < 0.4:
            return 1
        if avg_mastery < 0.55:
            return 2
        if avg_mastery < 0.7:
            return 3
        if avg_mastery < 0.85:
            return 4
        return 5

    def get_next_difficulty(self, topic: str, current_mastery: float) -> str:  # noqa: ARG002
        """Трудност на следващия материал (съвместима с metadata difficulty в RAG)."""
        m = float(current_mastery)
        if m < 0.35:
            return "beginner"
        if m < 0.65:
            return "intermediate"
        if m < 0.85:
            return "advanced"
        return "expert"

    def generate_personalized_path(
        self,
        user_profile: dict[str, Any] | None,
        current_topic: str,
        knowledge_states: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """Препоръчан път: теми, трудност, фокус."""
        profile = user_profile or {}
        level = self.calculate_user_level(profile, knowledge_states)
        cultures = profile.get("cultures") or []
        if isinstance(cultures, str):
            cultures = [cultures]
        cultures_lower = [str(c).lower() for c in cultures]

        m_for_topic = 0.5
        if knowledge_states and current_topic:
            for row in knowledge_states:
                if str(row.get("topic", "")).lower() == str(current_topic).lower():
                    m_for_topic = float(row.get("mastery_level", 0.5))
                    break

        difficulty = self.get_next_difficulty(current_topic, m_for_topic)
        path: dict[str, Any] = {
            "recommended_topics": [],
            "difficulty": difficulty,
            "focus_areas": [],
            "overall_level": level,
        }

        if "пшеница" in cultures_lower or "wheat" in cultures_lower:
            path["recommended_topics"].extend(["торене_пшеница", "защита_от_болести"])
        if "домати" in cultures_lower or "tomato" in cultures_lower or "tomatoes" in cultures_lower:
            path["recommended_topics"].extend(["сеитба_домати", "поливане_домати"])

        if current_topic and current_topic not in path["recommended_topics"]:
            path["recommended_topics"].insert(0, current_topic)

        return path
