"""
Единна фабрика за чат LLM: директно Mistral или през Helicone AI Gateway (OpenAI-съвместим).

Helicone: https://docs.helicone.ai/gateway/integrations/langchain
"""

from __future__ import annotations

from typing import Any

from core.config import settings


def get_chat_llm(
    *,
    temperature: float = 0.7,
    max_tokens: int | None = None,
    extra_headers: dict[str, str] | None = None,
) -> Any:
    """
    Връща LangChain BaseChatModel.
    При зададен HELICONE_API_KEY заявките минават през gateway (наблюдение в Helicone).
    RAG embeddings остават с MISTRAL_API_KEY в ``core/rag.py`` (отделен път).
    """
    mt = max_tokens if max_tokens is not None else settings.LLM_MAX_OUTPUT_TOKENS

    if settings.HELICONE_API_KEY:
        try:
            from langchain_openai import ChatOpenAI
        except ImportError as e:
            raise RuntimeError(
                "HELICONE_API_KEY е зададен, но липсва пакетът langchain-openai. "
                "Инсталирайте: pip install langchain-openai"
            ) from e

        base = settings.HELICONE_GATEWAY_BASE_URL.rstrip("/")
        model = settings.HELICONE_GATEWAY_MODEL.strip() or "mistral/mistral-large-latest"
        headers = {k: v for k, v in (extra_headers or {}).items() if v}
        return ChatOpenAI(
            model=model,
            api_key=settings.HELICONE_API_KEY,
            base_url=base,
            temperature=temperature,
            max_tokens=mt,
            default_headers=headers or None,
        )

    from langchain_mistralai import ChatMistralAI

    if not settings.MISTRAL_API_KEY:
        raise RuntimeError("Липсва MISTRAL_API_KEY (или HELICONE_API_KEY за gateway).")
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=temperature,
        api_key=settings.MISTRAL_API_KEY,
        max_tokens=mt,
    )
