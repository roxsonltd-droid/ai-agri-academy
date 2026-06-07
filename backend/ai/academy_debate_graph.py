"""
LangGraph: Academy Tutor vs Critic — multi-round debate, then final answer.

RAG context is supplied by the caller (e.g. ``combined_academy_context``) so the graph
stays free of DB/session coupling.
"""

from __future__ import annotations

import logging
import operator
import re
from typing import Annotated, Any, Literal, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_mistralai import ChatMistralAI
from langgraph.graph import END, StateGraph

from core.config import settings

logger = logging.getLogger(__name__)

_VERDICT_RE = re.compile(r"VERDICT:\s*(APPROVED|REVISE)\s*$", re.IGNORECASE | re.MULTILINE)

TUTOR_SYSTEM = """Ти си Academy Tutor на AI Agro Academy — преподавател по агротехнологии и дигитално земеделие.
Правила:
- Отговаряй на български, експертно и ясно. Без емоджита.
- Ако има контекст от база знания/уроци, приоритизирай фактите от него; при противоречие с общи знания — предпочитай контекста.
- Ако получиш забележки от критик, преработи отговора така, че да ги адресираш, без да губиш полезност за студента.
"""

CRITIC_SYSTEM = """Ти си строг рецензент (Critic) на AI Agro Academy.
Оцени черновата на преподавателя спрямо: съответствие на контекста от знанията, пълнота, яснота, безопасност (без опасни или недоказани препоръки).
Винаги завърши с точно един ред в един от следните формати (латиница, главни букви):
VERDICT: APPROVED
или
VERDICT: REVISE

Ако избереш REVISE, преди този ред дай кратки конкретни забележки (български). Без емоджита.
"""


class AcademyDebateState(TypedDict, total=False):
    user_query: str
    rag_context: str
    max_debate_rounds: int
    critic_pass: int
    tutor_draft: str
    critic_verdict: Literal["APPROVED", "REVISE"]
    critic_full_text: str
    debate_log: Annotated[list[str], operator.add]
    final_answer: str


def _parse_verdict(critic_text: str) -> tuple[Literal["APPROVED", "REVISE"], str]:
    m = _VERDICT_RE.search(critic_text.strip())
    if m:
        v = m.group(1).upper()
        if v == "APPROVED":
            return "APPROVED", critic_text.strip()
        return "REVISE", critic_text.strip()
    # Fallback: if critic mentions major issues, treat as REVISE once
    if "REVISE" in critic_text.upper():
        return "REVISE", critic_text.strip()
    return "APPROVED", critic_text.strip()


def _llm() -> ChatMistralAI | None:
    if not settings.MISTRAL_API_KEY:
        return None
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=0.4,
        api_key=settings.MISTRAL_API_KEY,
    )


async def _tutor_node(state: AcademyDebateState) -> dict[str, Any]:
    llm = _llm()
    if llm is None:
        return {
            "tutor_draft": "Липсва MISTRAL_API_KEY — не мога да генерирам отговор.",
            "debate_log": ["[tutor] Пропуск — няма API ключ."],
        }
    q = state["user_query"]
    rag = (state.get("rag_context") or "").strip()
    prev_fb = (state.get("critic_full_text") or "").strip()
    verdict = state.get("critic_verdict")

    if verdict == "REVISE" and prev_fb:
        human = (
            f"Въпрос на студента:\n{q}\n\n"
            f"Контекст (RAG):\n{rag if rag else '(няма)'}\n\n"
            f"Предишна чернова:\n{state.get('tutor_draft', '')}\n\n"
            f"Забележки от критик:\n{prev_fb}\n\n"
            "Напиши подобрена версия на отговора за студента."
        )
    else:
        human = (
            f"Въпрос на студента:\n{q}\n\n"
            f"Контекст (RAG):\n{rag if rag else '(няма — отговори с общи знания, ясно маркирай несигурност)'}\n\n"
            "Напиши пълен учебен отговор."
        )

    resp = await llm.ainvoke(
        [SystemMessage(content=TUTOR_SYSTEM), HumanMessage(content=human)]
    )
    text = (resp.content or "").strip() if isinstance(resp.content, str) else str(resp.content)
    log = f"[tutor] Чернова (кръг {state.get('critic_pass', 0) + 1}):\n{text[:2000]}{'…' if len(text) > 2000 else ''}"
    return {"tutor_draft": text, "debate_log": [log]}


async def _critic_node(state: AcademyDebateState) -> dict[str, Any]:
    llm = _llm()
    if llm is None:
        return {
            "critic_verdict": "APPROVED",
            "critic_full_text": "Няма критик — липсва API ключ.",
            "critic_pass": state.get("critic_pass", 0) + 1,
            "debate_log": ["[critic] Пропуск."],
        }
    q = state["user_query"]
    rag = (state.get("rag_context") or "").strip()
    draft = state.get("tutor_draft", "")

    human = (
        f"Въпрос на студента:\n{q}\n\n"
        f"Релевантен контекст (RAG):\n{rag if rag else '(няма)'}\n\n"
        f"Чернова на преподавателя:\n{draft}\n\n"
        "Оцени и завърши с VERDICT: APPROVED или VERDICT: REVISE."
    )
    resp = await llm.ainvoke(
        [SystemMessage(content=CRITIC_SYSTEM), HumanMessage(content=human)]
    )
    raw = (resp.content or "").strip() if isinstance(resp.content, str) else str(resp.content)
    verdict, full = _parse_verdict(raw)
    new_pass = state.get("critic_pass", 0) + 1
    log = f"[critic] Кръг {new_pass} — {verdict}\n{full[:1500]}{'…' if len(full) > 1500 else ''}"
    return {
        "critic_verdict": verdict,
        "critic_full_text": full,
        "critic_pass": new_pass,
        "debate_log": [log],
    }


async def _finalize_node(state: AcademyDebateState) -> dict[str, Any]:
    llm = _llm()
    draft = state.get("tutor_draft", "").strip()
    if llm is None:
        return {"final_answer": draft or "Няма генериран отговор."}
    if state.get("critic_verdict") == "APPROVED":
        return {"final_answer": draft}

    human = (
        f"Въпрос на студента:\n{state['user_query']}\n\n"
        f"Последна чернова на преподавателя:\n{draft}\n\n"
        f"Последна оценка на критик:\n{state.get('critic_full_text', '')}\n\n"
        "Обедини в един финален отговор за студента: коригирай само ако е нужно, запази полезното съдържание. "
        "Български, без емоджита."
    )
    resp = await llm.ainvoke(
        [
            SystemMessage(
                content="Ти си редактор на учебни материали на AI Agro Academy. Синтезирай финален отговор."
            ),
            HumanMessage(content=human),
        ]
    )
    text = (resp.content or "").strip() if isinstance(resp.content, str) else str(resp.content)
    return {"final_answer": text or draft}


def _route_after_critic(state: AcademyDebateState) -> str:
    if state.get("critic_verdict") == "APPROVED":
        return "finalize"
    max_r = int(state.get("max_debate_rounds") or settings.ACADEMY_DEBATE_MAX_ROUNDS)
    if state.get("critic_pass", 0) >= max_r:
        return "finalize"
    return "tutor"


_COMPILED: Any | None = None


def _compile_graph() -> Any:
    global _COMPILED
    if _COMPILED is not None:
        return _COMPILED
    try:
        g = StateGraph(AcademyDebateState)
        g.add_node("tutor", _tutor_node)
        g.add_node("critic", _critic_node)
        g.add_node("finalize", _finalize_node)
        g.set_entry_point("tutor")
        g.add_edge("tutor", "critic")
        g.add_conditional_edges(
            "critic",
            _route_after_critic,
            {"tutor": "tutor", "finalize": "finalize"},
        )
        g.add_edge("finalize", END)
        _COMPILED = g.compile()
        return _COMPILED
    except Exception:
        logger.exception("Academy debate graph compile failed")
        _COMPILED = False
        return None


async def run_academy_debate(
    *,
    user_query: str,
    rag_context: str,
    max_debate_rounds: int | None = None,
) -> dict[str, Any]:
    """
    Run Tutor ↔ Critic debate. Returns state keys: ``final_answer``, ``debate_log``, etc.
    """
    compiled = _compile_graph()
    if compiled is None or compiled is False:
        raise RuntimeError(
            "LangGraph не е наличен или графът не се компилира. "
            "Инсталирайте: pip install langgraph"
        )
    mq = (user_query or "").strip()
    if not mq:
        raise ValueError("user_query е празен")

    initial: AcademyDebateState = {
        "user_query": mq,
        "rag_context": rag_context or "",
        "max_debate_rounds": max_debate_rounds or settings.ACADEMY_DEBATE_MAX_ROUNDS,
        "critic_pass": 0,
        "tutor_draft": "",
        "critic_verdict": "REVISE",
        "critic_full_text": "",
        "debate_log": [],
        "final_answer": "",
    }
    out = await compiled.ainvoke(initial, {"recursion_limit": 50})
    return dict(out)
