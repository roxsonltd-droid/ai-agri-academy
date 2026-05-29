"""
LangChain tools: Roboflow CV inference (base64 image).

- ``roboflow_detect(image_base64)`` — явен Base64 (data URL или raw).
- ``roboflow_detect_uploaded()`` — без аргументи; ползва снимката за текущата HTTP заявка
  (задава се с ``set_request_image_b64`` от ``run_agro_agent``) за ReAct.

See docs/ROBOFLOW_VISION.md.
"""

from __future__ import annotations

import base64
import binascii
import contextvars
import json

from langchain_core.tools import tool

from core.roboflow_client import roboflow_configured, roboflow_infer_sync

# Request-scoped image for ReAct tool (no huge base64 in LLM tool args).
_request_image_b64: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "roboflow_request_image_b64", default=None
)


def set_request_image_b64(value: str | None) -> contextvars.Token[str | None]:
    """Bind uploaded image for this async task / request. Reset with ``reset_request_image_b64``."""
    return _request_image_b64.set(value)


def reset_request_image_b64(token: contextvars.Token[str | None]) -> None:
    _request_image_b64.reset(token)


def infer_from_base64_string(image_base64: str) -> str:
    """
    Run Roboflow on a base64 image; return JSON string (predictions or ``{"error": ...}``).
    Shared by both tools and tests.
    """
    if not roboflow_configured():
        return json.dumps({"error": "Roboflow не е конфигуриран."}, ensure_ascii=False)

    raw_b64 = (image_base64 or "").strip()
    if "," in raw_b64 and raw_b64.lower().startswith("data:"):
        raw_b64 = raw_b64.split(",", 1)[-1]

    try:
        raw = base64.b64decode(raw_b64, validate=False)
    except (binascii.Error, ValueError):
        return json.dumps({"error": "Невалиден Base64."}, ensure_ascii=False)

    if len(raw) < 32:
        return json.dumps({"error": "Твърде малко изображение."}, ensure_ascii=False)

    if raw[:3] == b"\xff\xd8\xff":
        ct, name = "image/jpeg", "upload.jpg"
    elif raw[:8] == b"\x89PNG\r\n\x1a\n":
        ct, name = "image/png", "upload.png"
    elif len(raw) > 12 and raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        ct, name = "image/webp", "upload.webp"
    else:
        ct, name = "image/jpeg", "upload.jpg"

    try:
        result = roboflow_infer_sync(raw, ct, name)
    except ValueError as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)
    except RuntimeError as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)

    return json.dumps(result, ensure_ascii=False)


@tool
def roboflow_detect(image_base64: str) -> str:
    """
    Стартира Roboflow Serverless inference върху изображение като Base64 (опционално с data-URL префикс).
    Връща JSON низ с predictions (структурата зависи от типа модел: detection, classification и т.н.).
    """
    return infer_from_base64_string(image_base64)


@tool
def roboflow_detect_uploaded() -> str:
    """
    Roboflow inference върху прикачената от потребителя снимка за тази заявка (ако има такава).
    Извиквай само когато въпросът изисква компютърно зрение (детекция, класификация, преброяване, визуална диагностика).
    Не извиквай за чисто текстови въпроси без нужда от анализ на снимката.
    """
    b64 = _request_image_b64.get()
    if not (b64 and b64.strip()):
        return json.dumps(
            {"error": "Няма прикачено изображение в тази заявка."},
            ensure_ascii=False,
        )
    return infer_from_base64_string(b64.strip())
