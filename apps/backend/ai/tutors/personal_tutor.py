"""Профил-базирана преподавателска persona (стил, ниво, контекст на стопанството)."""

from __future__ import annotations

from typing import Any


class PersonalTutor:
    """Определя стил на обяснение според опит, размер на стопанство и др."""

    def __init__(self, user_profile: dict[str, Any] | None = None) -> None:
        self.profile: dict[str, Any] = dict(user_profile or {})

    def teaching_style(self) -> str:
        return self._determine_teaching_style()

    def _determine_teaching_style(self) -> str:
        exp = (self.profile.get("experience") or self.profile.get("skill_level") or "").strip().lower()
        if exp in ("beginner", "новак", "начинаещ", "entry"):
            return "patient_explanatory"
        try:
            ha = float(self.profile.get("farm_size_ha") or 0)
        except (TypeError, ValueError):
            ha = 0.0
        if ha > 500:
            return "professional_practical"
        return "balanced_practical"

    def user_level_label(self) -> str:
        exp = (self.profile.get("experience") or self.profile.get("skill_level") or "").strip().lower()
        if exp in ("beginner", "новак", "начинаещ", "entry"):
            return "начинаещ"
        if exp in ("intermediate", "среден", "mid"):
            return "среден"
        if exp in ("advanced", "напреднал", "expert"):
            return "напреднал"
        return "среден (неуточнено)"

    def culture_display(self) -> str:
        return str(
            self.profile.get("culture")
            or self.profile.get("main_culture")
            or self.profile.get("course")
            or "неуточнена култура"
        )

    def region_display(self) -> str:
        return str(self.profile.get("region") or "неуточнен регион")

    def farm_size_display(self) -> str:
        try:
            ha = float(self.profile.get("farm_size_ha") or 0)
        except (TypeError, ValueError):
            return "неуточнен размер"
        if ha <= 0:
            return "неуточнен размер"
        return f"{ha:g} ha"
