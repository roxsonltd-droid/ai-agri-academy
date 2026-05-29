"""OpenAI embeddings (Supabase PGVector storage expects compatible vectors)."""

from __future__ import annotations

import os
from typing import Sequence

import httpx

from ai.settings import OPENAI_EMBED_MODEL, openai_api_key


def embed_texts(texts: Sequence[str], model: str | None = None) -> list[list[float]]:
    """Sync embedding call; raises if ``OPENAI_API_KEY`` is missing."""
    key = openai_api_key()
    if not key:
        raise RuntimeError("OPENAI_API_KEY is required for PGVector ingest/search in ai/")

    m = model or OPENAI_EMBED_MODEL
    url = (os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")).rstrip("/") + "/embeddings"
    with httpx.Client(timeout=120.0) as client:
        r = client.post(
            url,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": m, "input": list(texts)},
        )
        r.raise_for_status()
        data = r.json()
    out: list[list[float]] = []
    for item in sorted(data["data"], key=lambda x: x["index"]):
        out.append(item["embedding"])
    return out


def embed_query(text: str, model: str | None = None) -> list[float]:
    return embed_texts([text], model=model)[0]
