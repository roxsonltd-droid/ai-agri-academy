import os
from typing import Any

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()


def _xai_base_url() -> str:
    raw = (os.getenv("XAI_API_BASE") or "https://api.x.ai").rstrip("/")
    return raw if raw.endswith("/v1") else f"{raw}/v1"


def get_llm() -> Any:
    """
    Production-ready LLM factory.

    - LLM_PROVIDER=openai (default): ChatOpenAI, model OPENAI_CHAT_MODEL (default gpt-4o-mini).
    - LLM_PROVIDER=xai|grok: OpenAI-compatible xAI API (Grok).
    - LLM_PROVIDER=anthropic: ChatAnthropic when langchain-anthropic is installed.
    """
    provider = (os.getenv("LLM_PROVIDER") or "openai").strip().lower()

    if provider in ("xai", "grok"):
        key = (os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY") or "").strip()
        if key and key != "your_xai_api_key":
            return ChatOpenAI(
                model=os.getenv("XAI_CHAT_MODEL", "grok-2-latest"),
                api_key=key,
                base_url=_xai_base_url(),
                temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
                max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1500")),
            )
        print("WARNING: LLM_PROVIDER=xai|grok but XAI_API_KEY/GROK_API_KEY missing. Falling back.")

    if provider == "anthropic":
        key = (os.getenv("ANTHROPIC_API_KEY") or "").strip()
        if key:
            try:
                from langchain_anthropic import ChatAnthropic

                return ChatAnthropic(
                    model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
                    api_key=key,
                    temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
                    max_tokens=int(os.getenv("LLM_MAX_TOKENS", "4096")),
                )
            except ImportError:
                print("WARNING: LLM_PROVIDER=anthropic but langchain-anthropic not installed. Falling back to OpenAI.")

    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key or api_key == "your_openai_api_key":
        print("WARNING: OPENAI_API_KEY is missing or invalid. Using placeholder.")

        class DummyLLM:
            def invoke(self, messages_or_prompt: object) -> Any:
                return type("Obj", (object,), {"content": "Плейсхолдър: задайте LLM_PROVIDER + ключ или OPENAI_API_KEY в .env."})()

        return DummyLLM()

    return ChatOpenAI(
        model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
        temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
        api_key=api_key,
        max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1500")),
    )


llm = get_llm()
