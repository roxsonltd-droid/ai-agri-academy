"""A/B assign: стабилност по user_id."""

from __future__ import annotations

from app.tutor.ab_assign import assign_ab_variant


def test_assign_ab_variant_deterministic() -> None:
	assert assign_ab_variant("user-a", 50) == assign_ab_variant("user-a", 50)


def test_assign_ab_variant_extremes() -> None:
	assert assign_ab_variant("any", 0) == "static"
	assert assign_ab_variant("any", 100) == "adaptive"
