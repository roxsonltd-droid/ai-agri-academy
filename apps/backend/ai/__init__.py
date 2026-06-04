"""AgriNexus AI layer — RAG over Academy Markdown + Supabase/PGVector."""

from ai.debate import run_academy_debate
from ai.pipeline import AiCourseRAG, get_ai_rag_retriever

__all__ = ["AiCourseRAG", "get_ai_rag_retriever", "run_academy_debate"]
