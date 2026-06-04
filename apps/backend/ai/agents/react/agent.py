"""ReAct (tool-calling) агент за AI Agri Academy."""

from __future__ import annotations

from typing import Any

from ai.agents.react.executor import build_react_graph, run_react_graph


def _used_rag_from_thought_process(steps: list[dict[str, Any]]) -> bool:
    rag_names = frozenset({"search_academy_knowledge", "search_academy_knowledge_compressed"})
    for step in steps:
        if step.get("type") == "tool_call" and step.get("name") in rag_names:
            return True
        if step.get("type") == "observation" and step.get("name") in rag_names:
            return True
    return False


class ReActAgriAgent:
    """
    LangGraph **structured tool-calling** цикъл (еквивалент на ReAct: мислене → действие → наблюдение),
    с инструменти: време, пазарни референции (опционално yfinance), Academy RAG.
    """

    def __init__(self, llm: Any | None = None, *, recursion_limit: int = 40) -> None:
        if llm is None:
            from rag.core.llm import get_llm

            llm = get_llm()
        self.llm = llm
        self._recursion_limit = recursion_limit
        self._graph: Any | None = None
        if hasattr(llm, "bind_tools"):
            self._graph = build_react_graph(llm)

    async def run(
        self,
        question: str,
        farm_profile: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        text = (question or "").strip()
        if farm_profile:
            text += f"\n\n[Профил на стопанството: {farm_profile}]"

        if self._graph is None:
            from langchain_core.messages import HumanMessage

            msg = (
                f"{text}\n\n(Без достъпни инструменти: задай валиден LLM с bind_tools, напр. OPENAI_API_KEY.)"
            )
            r = self.llm.invoke([HumanMessage(content=msg)])
            out = getattr(r, "content", str(r))
            return {
                "answer": out,
                "thought_process": [
                    {
                        "type": "skipped",
                        "reason": "llm_missing_bind_tools",
                        "hint": "Задайте OPENAI_API_KEY или друг поддържан chat model за ReAct + tools.",
                    }
                ],
                "used_rag": False,
            }

        out = await run_react_graph(
            self._graph,
            question=question,
            farm_profile=farm_profile,
            recursion_limit=self._recursion_limit,
        )
        steps = list(out.get("thought_process") or [])
        return {
            "answer": out.get("answer") or "",
            "thought_process": steps,
            "used_rag": _used_rag_from_thought_process(steps),
        }
