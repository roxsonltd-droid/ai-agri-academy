"""Конструиране на metadata филтри за Supabase ``@>`` containment (LangChain filter)."""

from __future__ import annotations

from typing import Any


def build_agri_vector_metadata_filter(
    *,
    culture: str | None = None,
    region: str | None = None,
    module: str | None = None,
    difficulty: str | None = None,
    source_type: str | None = None,
) -> dict[str, Any]:
    """
    Връща dict за ``similarity_search(..., filter=…)`` — всички ключове трябва да присъстват
    в ``Document.metadata`` при ingest (частично съвпадение: Postgres ``metadata @> filter``).
    """
    flt: dict[str, Any] = {}
    if culture and (v := culture.strip().lower()):
        flt["course"] = v
    if region and (v := region.strip().lower()):
        flt["region"] = v
    if module and (v := module.strip().lower()):
        flt["module"] = v
    if difficulty and (v := difficulty.strip().lower()):
        flt["difficulty"] = v
    if source_type and (v := source_type.strip().lower()):
        flt["source_type"] = v
    return flt


__all__ = ["build_agri_vector_metadata_filter"]
