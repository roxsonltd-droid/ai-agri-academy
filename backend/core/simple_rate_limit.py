"""Лек in-memory rate limit по IP за евтини deploy-и (един процес)."""

from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from core.config import settings

_window: dict[str, deque[float]] = defaultdict(deque)


def enforce_chat_rate_limit(request: Request) -> None:
    limit = int(settings.CHAT_RATE_LIMIT_PER_MINUTE or 0)
    if limit <= 0:
        return
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    dq = _window[ip]
    while dq and dq[0] < now - 60.0:
        dq.popleft()
    if len(dq) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Прекалено много заявки към чата. Опитайте отново след около минута.",
        )
    dq.append(now)
