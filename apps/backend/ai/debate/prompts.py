"""Промпти за дебат агенти — опционално делегира към ``rag.prompts.generate_prompt``."""

from __future__ import annotations

from typing import Any


def _opinions_block(opinions: dict[str, str] | None) -> str:
    if not opinions:
        return "(няма други мнения в този рунд)"
    return "\n\n".join(f"**{k}**:\n{v}" for k, v in opinions.items())


def _critic_block(feedback: str | None) -> str:
    if not feedback or not str(feedback).strip():
        return "(няма критика от предишен рунд)"
    return str(feedback).strip()


def get_prompt(
    *,
    agent_type: str,
    question: str,
    culture: str | None,
    region: str | None,
    previous_opinions: dict[str, str] | None,
    critic_feedback: str | None,
    rag_context: str,
) -> str:
    """
    Връща текст за LLM invoke.

    Ако ``rag.prompts`` е наличен, ползва същите шаблони като legacy debate (market_intelligence, …).
    Иначе — компактен inline промпт на български.
    """
    ctx = (rag_context or "").strip() or (
        "(Няма извлечен Academy контекст — отговори консервативно и посочи липсата на локален материал.)"
    )
    culture = culture or ""
    region = region or ""
    others = _opinions_block(previous_opinions)
    critic = _critic_block(critic_feedback)

    try:
        from rag.prompts import generate_prompt

        if agent_type == "market":
            base = generate_prompt(
                "market_intelligence",
                question=question,
                culture=culture,
                context=ctx,
            )
        elif agent_type == "risk":
            base = generate_prompt(
                "risk_weather",
                question=question,
                culture=culture,
                region=region,
                context=ctx,
            )
        elif agent_type == "crop":
            base = generate_prompt(
                "crop_expert",
                question=question,
                culture=culture,
                region=region,
                context=ctx,
            )
        else:
            base = ""
        if base:
            return (
                f"{base}\n\n---\nМнения на другите агенти в този рунд:\n{others}\n\n"
                f"Критика от предишен рунд (ако има — интегрирай корекции):\n{critic}"
            )
    except Exception:
        pass

    common = f"""
Въпрос на фермера: {question}
Култура: {culture or '—'}
Регион: {region or '—'}

Контекст (Academy / RAG):
{ctx}

Мнения на другите агенти в този рунд:
{others}

Критика от предишен рунд:
{critic}
""".strip()

    if agent_type == "market":
        role = "Market Intelligence — цени, пласмент, пазарен прозорец (без персонализиран финансов съвет)."
    elif agent_type == "risk":
        role = "Risk & Weather — климатични и оперативни рискове, консервативни препоръки."
    elif agent_type == "crop":
        role = "Crop Expert — агротехника, фенология, добиви за България."
    else:
        role = "Съветник"

    return f"""Ти си {role} в AI Agri Academy.
Отговори на български, структурирано и практично за малък/среден фермер.

{common}
""".strip()
