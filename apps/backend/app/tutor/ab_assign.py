"""Стабилно A/B разпределение adaptive vs static tutor по user_id."""

from __future__ import annotations

import hashlib
from typing import Literal


def assign_ab_variant(user_id: str, adaptive_weight_pct: int) -> Literal["adaptive", "static"]:
    """
    Връща вариант за даден потребител. ``adaptive_weight_pct`` ∈ [0,100] —
    вероятност за adaptive (остатъкът е static).
    """
    key = f"agrinexus-tutor-ab|{user_id or 'anonymous'}"
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    bucket = int(digest[:8], 16) % 100
    w = max(0, min(100, int(adaptive_weight_pct)))
    return "adaptive" if bucket < w else "static"
