"""Дебат агенти: market, risk, crop, critic."""

from ai.debate.agents.base import BaseAgent
from ai.debate.agents.critic import CriticAgent
from ai.debate.agents.crop import CropAgent
from ai.debate.agents.market import MarketAgent
from ai.debate.agents.risk import RiskAgent

__all__ = [
    "BaseAgent",
    "MarketAgent",
    "RiskAgent",
    "CropAgent",
    "CriticAgent",
]
