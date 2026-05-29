"""LangChain @tool инструменти за агро ReAct агент (Open-Meteo, опционално yfinance, RAG)."""

from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any

import httpx
from langchain_core.tools import tool

logger = logging.getLogger(__name__)

_USER_AGENT = "AgriNexus-Academy/1.0 (educational; contact: academy@localhost)"

# Приблизителни координати за региони в България (fallback ако Nominatim не отговори)
_REGION_COORDS: dict[str, tuple[float, float]] = {
    "добруджа": (43.57, 27.83),
    "добрич": (43.57, 27.83),
    "варна": (43.21, 27.91),
    "пловдив": (42.15, 24.75),
    "софия": (42.70, 23.32),
    "русе": (43.85, 25.95),
    "старозагорски": (42.43, 25.64),
    "плевен": (43.42, 24.61),
    "монтана": (43.41, 23.23),
    "хасково": (41.93, 25.56),
}


def _normalize_region_key(region: str) -> str:
    return region.strip().lower().replace("ё", "е")


def _geocode_region_sync(region: str) -> tuple[float, float] | None:
    q = f"{region}, Bulgaria"
    try:
        with httpx.Client(timeout=12.0) as client:
            r = client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": q, "format": "json", "limit": 1},
                headers={"User-Agent": _USER_AGENT},
            )
            r.raise_for_status()
            data = r.json()
            if isinstance(data, list) and data:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                return lat, lon
    except Exception:
        logger.debug("Nominatim geocode failed for %s", region, exc_info=True)
    nk = _normalize_region_key(region)
    for key, coords in _REGION_COORDS.items():
        if key in nk or nk in key:
            return coords
    return 42.70, 25.30  # централна BG


@tool
def get_weather(region: str) -> str:
    """Кратка дневна прогноза (макс/мин температура, вероятност за валеж) за посочен регион в България."""
    region = (region or "").strip() or "София"
    lat, lon = _geocode_region_sync(region)
    try:
        with httpx.Client(timeout=15.0) as client:
            r = client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                    "timezone": "Europe/Sofia",
                    "forecast_days": 3,
                },
            )
            r.raise_for_status()
            data = r.json()
            daily = data.get("daily") or {}
            tmax = (daily.get("temperature_2m_max") or [None])[0]
            tmin = (daily.get("temperature_2m_min") or [None])[0]
            pr = (daily.get("precipitation_probability_max") or [None])[0]
            day = (daily.get("time") or [""])[0]
            return (
                f"Прогноза за «{region}» ({day or datetime.now().strftime('%Y-%m-%d')}): "
                f"макс {tmax}°C, мин {tmin}°C, вероятност за валеж до {pr}% (Open-Meteo модел)."
            )
    except Exception as e:
        return f"Не успях да взема метео данни за «{region}»: {e!s}"


@tool
def get_market_price(crop: str) -> str:
    """
    Референтна цена от фючърсен пазар (CME) за основни зърнени култури — ориентир, не спот пазар България.
    Поддържани ключови думи: пшеница, wheat, царевица, corn, соя, soybeans, овес, oats.
    """
    crop_l = (crop or "").strip().lower()
    tickers: dict[str, str] = {
        "пшеница": "ZW=F",
        "wheat": "ZW=F",
        "царевица": "ZC=F",
        "corn": "ZC=F",
        "maize": "ZC=F",
        "соя": "ZS=F",
        "soybeans": "ZS=F",
        "soy": "ZS=F",
        "овес": "ZO=F",
        "oats": "ZO=F",
    }
    ticker = None
    for k, v in tickers.items():
        if k in crop_l:
            ticker = v
            break
    if not ticker:
        return (
            f"Няма конфигуриран фючърс за «{crop}». "
            "За слънчоглед и др. няма стандартен CME тикер в този инструмент — ползвай Academy или локални източници."
        )
    try:
        import yfinance as yf  # type: ignore[import-not-found]
    except ImportError:
        return "Пазарният инструмент изисква `pip install yfinance` на сървъра."

    try:
        hist = yf.Ticker(ticker).history(period="5d")
        if hist is None or hist.empty:
            return f"Няма исторически данни за {ticker}."
        current = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current
        diff = current - prev
        sign = "+" if diff >= 0 else ""
        return (
            f"{crop.strip()} ({ticker}): последна затворена ~{current:.2f} USD; "
            f"промяна спрямо предишен ден {sign}{diff:.2f}. Това е фючърсна референция, не изкупна цена BG."
        )
    except Exception as e:
        return f"Грешка при цена за «{crop}»: {e!s}"


from ai.tools.compressed_rag_tool import search_academy_knowledge_compressed
from ai.tools.rag_tool import search_academy_knowledge


def build_agri_react_tools() -> list[Any]:
    tools: list[Any] = [get_weather, get_market_price, search_academy_knowledge]
    if (os.getenv("FEATURE_REACT_RAG_COMPRESSED") or "").strip().lower() in ("1", "true", "yes"):
        tools.append(search_academy_knowledge_compressed)
    return tools
