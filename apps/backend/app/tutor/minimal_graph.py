"""Small LangGraph: classify topic → draft answer (Mistral if key, else stub)."""

from __future__ import annotations

import os
from typing import TypedDict

import httpx
from langgraph.graph import END, START, StateGraph


class TutorGraphState(TypedDict, total=False):
    question: str
    topic: str
    answer: str
    trace: list[str]
    profile: dict | None
    role: str | None


def _classify_topic(state: TutorGraphState) -> dict:
    q = (state.get("question") or "").lower()
    if any(w in q for w in ("дъжд", "rain", "времето", "weather", "температур", "суша", "вятър")):
        topic = "weather"
    elif any(w in q for w in ("пазар", "цена", "market", "борс", "сток", "изкупна")):
        topic = "market"
    else:
        topic = "general"
    return {"topic": topic, "trace": [f"classify:{topic}"]}


def _draft_answer(state: TutorGraphState) -> dict:
    q = (state.get("question") or "").strip()
    topic = state.get("topic") or "general"
    profile = state.get("profile") or {}
    role = (state.get("role") or "main").strip().lower()
    key = (os.getenv("MISTRAL_API_KEY") or "").strip()
    trace = list(state.get("trace") or [])
    trace.append("draft:start")

    if not q:
        return {"answer": "Моля, задайте въпрос.", "trace": trace + ["draft:empty"]}

    try:
        from ai.tutors.personal_tutor import PersonalTutor
        from ai.tutors.prompts import build_teacher_system_block
        from ai.tutors.teaching import adaptive_followup_hint

        pt = PersonalTutor(profile)
        system = build_teacher_system_block(personal=pt, topic=topic, role=role)
        if role != "examiner":
            system = f"{system}\n\n{adaptive_followup_hint()}"
    except ImportError:
        system = (
            f"Ти си AgriNexus Tutor (LangGraph pipeline). Тема: {topic}. "
            "Отговори накратко и практично на същия език като въпроса. "
            "Не давай финансов съвет; при пазарни теми — общи насоки."
        )

    if key:
        try:
            with httpx.Client(timeout=60.0) as client:
                r = client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    json={
                        "model": os.getenv("MISTRAL_TUTOR_MODEL", "mistral-small-latest"),
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": q},
                        ],
                        "temperature": 0.3,
                        "max_tokens": 1024,
                    },
                )
                r.raise_for_status()
                data = r.json()
                text = data["choices"][0]["message"]["content"]
                return {"answer": text, "trace": trace + ["draft:mistral"]}
        except Exception as e:  # noqa: BLE001
            return {
                "answer": (
                    f"[tutor] LLM недостъпен ({e!s}). Стъб за тема «{topic}»: "
                    "проверете локални източници, почва и календар преди действие."
                ),
                "trace": trace + ["draft:error"],
            }

    stub = (
        f"[AgriNexus Tutor · LangGraph · тема: {topic} · роля: {role}]\n\n"
        "За пълен отговор задайте **MISTRAL_API_KEY** в средата на backend.\n\n"
        f"Въпрос (отрязан до 500 символа):\n{q[:500]}"
    )
    return {"answer": stub, "trace": trace + ["draft:stub"]}


def build_minimal_tutor_graph():
    workflow = StateGraph(TutorGraphState)
    workflow.add_node("classify", _classify_topic)
    workflow.add_node("draft", _draft_answer)
    workflow.add_edge(START, "classify")
    workflow.add_edge("classify", "draft")
    workflow.add_edge("draft", END)
    return workflow.compile()


_compiled = None


def get_minimal_tutor_graph():
    global _compiled
    if _compiled is None:
        _compiled = build_minimal_tutor_graph()
    return _compiled
