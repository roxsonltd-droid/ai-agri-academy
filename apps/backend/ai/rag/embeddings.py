"""Embeddings за LangChain RAG слой (HF за BG/EN; fallback OpenAI при липса на HF)."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_DEFAULT_HF = "intfloat/multilingual-e5-large"


def _cache_dir() -> str:
    base = Path(__file__).resolve().parents[2] / ".cache" / "embeddings"
    base.mkdir(parents=True, exist_ok=True)
    return str(base)


def get_embeddings() -> Any:
    """HF embeddings оптимизирани за български + английски; иначе OpenAI embeddings."""
    try:
        from langchain_huggingface import HuggingFaceEmbeddings

        return HuggingFaceEmbeddings(
            model_name=os.getenv("RAG_HF_EMBED_MODEL", _DEFAULT_HF),
            model_kwargs={"device": os.getenv("RAG_HF_DEVICE", "cpu")},
            encode_kwargs={"normalize_embeddings": True},
            cache_folder=os.getenv("RAG_EMBED_CACHE", _cache_dir()),
        )
    except ImportError as e:
        logger.warning("langchain_huggingface/sentence-transformers липсват (%s). Ползвам OpenAIEmbeddings.", e)
        from langchain_openai import OpenAIEmbeddings

        return OpenAIEmbeddings(
            model=os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small"),
            api_key=os.getenv("OPENAI_API_KEY"),
        )
