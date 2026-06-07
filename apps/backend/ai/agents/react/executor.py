"""LangGraph ReAct граф и извличане на отговор / междинни стъпки."""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langgraph.prebuilt import create_react_agent

from ai.agents.react.prompt import get_react_system_prompt
from ai.agents.react.tools import build_agri_react_tools

logger = logging.getLogger(__name__)


def build_react_graph(llm: Any) -> Any:
    """Tool-calling агент (LangGraph `create_react_agent`)."""
    tools = build_agri_react_tools()
    return create_react_agent(llm, tools, prompt=get_react_system_prompt())


def messages_to_thought_process(messages: list[BaseMessage]) -> list[dict[str, Any]]:
    """Удобен за API списък: tool_call + observation (съдържанието е съкратено)."""
    steps: list[dict[str, Any]] = []
    for m in messages:
        if isinstance(m, AIMessage) and m.tool_calls:
            for tc in m.tool_calls:
                if isinstance(tc, dict):
                    name = tc.get("name")
                    args = tc.get("args") if tc.get("args") is not None else tc.get("arguments")
                else:
                    name = getattr(tc, "name", None)
                    args = getattr(tc, "args", None)
                    if args is None and hasattr(tc, "get"):
                        args = tc.get("args")  # type: ignore[union-attr]
                steps.append({"type": "tool_call", "name": name, "args": args})
        if isinstance(m, ToolMessage):
            content = str(m.content or "")
            steps.append(
                {
                    "type": "observation",
                    "name": m.name,
                    "content": content[:4000] + ("…" if len(content) > 4000 else ""),
                }
            )
    return steps


def last_assistant_text(messages: list[BaseMessage]) -> str:
    for m in reversed(messages):
        if not isinstance(m, AIMessage):
            continue
        if m.tool_calls:
            continue
        c = m.content
        if isinstance(c, str) and c.strip():
            return c.strip()
        if isinstance(c, list):
            parts: list[str] = []
            for block in c:
                if isinstance(block, dict) and block.get("type") == "text":
                    parts.append(str(block.get("text", "")))
            t = "\n".join(parts).strip()
            if t:
                return t
    return ""


async def run_react_graph(
    graph: Any,
    *,
    question: str,
    farm_profile: dict[str, Any] | None,
    recursion_limit: int = 40,
) -> dict[str, Any]:
    text = (question or "").strip()
    if not text:
        return {"answer": "", "thought_process": [], "messages": []}
    if farm_profile:
        text += f"\n\n[Профил на стопанството: {farm_profile}]"

    try:
        result = await graph.ainvoke(
            {"messages": [HumanMessage(content=text)]},
            config={"recursion_limit": recursion_limit},
        )
    except Exception:
        logger.exception("run_react_graph failed")
        raise

    msgs = list(result.get("messages") or [])
    return {
        "answer": last_assistant_text(msgs),
        "thought_process": messages_to_thought_process(msgs),
        "messages": msgs,
    }
