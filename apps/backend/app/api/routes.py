"""Aggregate ``/api`` routes."""

from __future__ import annotations

from fastapi import APIRouter

from app.api import academy, auth_routes, debate, quiz_routes, react_agent, tutor, tutor_knowledge_state, webhooks

api_router = APIRouter()
api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
api_router.include_router(tutor.router, prefix="/tutor", tags=["tutor"])
api_router.include_router(tutor_knowledge_state.router, prefix="/tutor", tags=["tutor-knowledge"])
api_router.include_router(quiz_routes.router, prefix="/quiz", tags=["quiz"])
api_router.include_router(debate.router, prefix="/debate", tags=["debate"])
api_router.include_router(react_agent.router, prefix="/react", tags=["react"])
api_router.include_router(academy.router, prefix="/academy", tags=["academy"])
api_router.include_router(webhooks.router, tags=["webhooks"])
