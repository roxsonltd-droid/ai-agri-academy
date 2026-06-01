"""
LangChain tool: семантично търсене във вътрешната база знания (RAG).
Sync обвивка — графът се изпълнява в worker thread без активен asyncio loop.
"""

from __future__ import annotations

import asyncio
import logging

from langchain_core.tools import tool

logger = logging.getLogger(__name__)


def _run_retrieve_sync(query: str) -> str:
    from core.rag_facade import retrieve_for_prompt

    q = (query or "").strip()
    if not q:
        return "Празна заявка за търсене."

    async def _go() -> str:
        return await retrieve_for_prompt(q) or ""

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(_go())

    import concurrent.futures

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
        return ex.submit(lambda: asyncio.run(_go())).result(timeout=120)


@tool
def academy_knowledge_search(query: str) -> str:
    """
    Търси във вътрешната база знания на академията (RAG).
    Подай кратка ключова заявка на български или английски.
    Връща текстови извадки за опора в отговора; извиквай при нужда от факти от учебни материали.
    """
    try:
        return _run_retrieve_sync(query)
    except Exception:
        logger.exception("academy_knowledge_search failed")
        return "Грешка при търсене в базата знания."
