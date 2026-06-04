"""
LangGraph ReAct agent (Mistral + tools).

Multi-teacher система (оркестрация, личности, памет): docs/MULTI_AI_TEACHERS.md
Регистър: teachers_registry.py | Състояние: state.py

CV: моделът сам решава дали да извика ``roboflow_detect_uploaded`` (снимката е в request context).
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage

logger = logging.getLogger(__name__)

_COMPILED: Any | None = None

SYS_REACT = (
    "Ти си AI агент на AI Agro Academy. Отговаряй кратко и експертно на български. Без емоджита.\n\n"
    "Отказвай ясно заявки извън земеделие, образование и устойчивост (без политика, без медицински съвети, без търговски "
    "препоръки за конкретни финансови инструменти).\n\n"
    "Имаш инструмент academy_knowledge_search: семантично търсене във вътрешната база знания. Извиквай го, когато "
    "потребителят пита за факти от учебни материали или вътрешни политики на академията.\n\n"
    "Имаш инструмент roboflow_detect_uploaded: стартира Roboflow върху прикачената от потребителя снимка "
    "(само ако заявката включва такава). Извиквай го само когато е нужно компютърно зрение — например "
    "идентификация на болести/вредители по листа, броене или локализиране на обекти, визуална класификация. "
    "За общи агрономски въпроси без нужда от анализ на снимката отговори директно, без инструмента, "
    "дори ако има прикачена снимка."
)


async def _try_build_graph_async():
    try:
        from langgraph.prebuilt import create_react_agent
        from core.config import settings
        from core.llm_factory import get_chat_llm

        if not settings.MISTRAL_API_KEY and not settings.HELICONE_API_KEY:
            return None

        from agents.tools_roboflow import roboflow_detect_uploaded
        from agents.tools_rag import academy_knowledge_search
        from agents.mcp_client import get_mcp_tools

        llm = get_chat_llm(temperature=0.5)
        
        # Load standard tools
        tools_list = [academy_knowledge_search, roboflow_detect_uploaded]
        
        # Load MCP tools dynamically (AI Layer 2.0)
        mcp_tools = await get_mcp_tools()
        tools_list.extend(mcp_tools)
        
        try:
            from langgraph.checkpoint.redis.aio import AsyncRedisSaver
            from core.redis_client import get_redis
            
            redis_client = get_redis()
            if redis_client:
                # Use Redis for persistent AI memory
                return create_react_agent(llm, tools_list, prompt=SYS_REACT, checkpointer=AsyncRedisSaver(redis_client))
            else:
                from langgraph.checkpoint.memory import MemorySaver
                return create_react_agent(llm, tools_list, prompt=SYS_REACT, checkpointer=MemorySaver())
        except (TypeError, ImportError):
            logger.warning("RedisSaver not available, falling back to stateless/MemorySaver agent.")
            return create_react_agent(llm, tools_list, prompt=SYS_REACT)
    except ImportError:
        logger.info("LangGraph not installed — optional. See requirements-ai.txt")
        return None
    except Exception:
        logger.exception("LangGraph ReAct agent could not be initialised")
        return None


async def _get_graph_async():
    global _COMPILED
    if _COMPILED is None:
        _COMPILED = await _try_build_graph_async()
    return _COMPILED


def _final_answer_text(messages: list[BaseMessage]) -> str:
    """Last assistant message without pending tool calls."""
    for m in reversed(messages):
        if not isinstance(m, AIMessage):
            continue
        if m.tool_calls:
            continue
        content = m.content
        if isinstance(content, str):
            return content.strip()
        if isinstance(content, list):
            parts: list[str] = []
            for block in content:
                if isinstance(block, dict) and block.get("type") == "text":
                    parts.append(str(block.get("text", "")))
                elif isinstance(block, str):
                    parts.append(block)
            return "\n".join(parts).strip()
        return str(content or "").strip()
    return ""


async def run_agro_agent(
    question: str,
    image_base64: str | None = None,
    thread_id: str = "default",
) -> str:
    """
    Run the ReAct LangGraph agent. Optional ``image_base64`` is exposed only to
    ``roboflow_detect_uploaded`` — Mistral decides whether to call the tool.
    ``thread_id`` — кратка сесийна нишка за MemorySaver (LangGraph), ако е наличен checkpointer.
    """
    from langchain_core.messages import HumanMessage

    from agents.tools_roboflow import reset_request_image_b64, set_request_image_b64

    compiled = await _get_graph_async()
    if not compiled:
        raise RuntimeError(
            "LangGraph agent unavailable. Install requirements-ai.txt and set MISTRAL_API_KEY."
        )

    q = (question or "").strip()
    if not q:
        q = "Опиши какво виждаш и дай препоръки за агрономията."

    b64 = (image_base64.strip() if image_base64 else "") or ""

    tid = (thread_id or "default").strip() or "default"

    def _invoke():
        # ContextVar must be set on the same thread that runs the graph (tool node).
        token = None
        try:
            if b64:
                token = set_request_image_b64(b64)
            return compiled.invoke(
                {"messages": [HumanMessage(content=q)]},
                {
                    "recursion_limit": 25,
                    "configurable": {"thread_id": tid},
                },
            )
        finally:
            if token is not None:
                reset_request_image_b64(token)

    result = await asyncio.to_thread(_invoke)

    messages = result.get("messages") or []
    return _final_answer_text(messages)
