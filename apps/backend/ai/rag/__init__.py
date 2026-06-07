"""LangChain RAG слой под ``ai.rag`` (PGVector + Academy loaders + chunker)."""

from ai.rag.cache_manager import RAGCacheManager, get_rag_cache_manager
from ai.rag.chunker import get_chunker
from ai.rag.chunkers import AgriSemanticChunker, AgriSmartChunker, HierarchicalChunker, LLMSemanticChunker
from ai.rag.compression import AgriContextualCompressor
from ai.rag.embeddings import get_embeddings
from ai.rag.engine import RAGEngine
from ai.rag.loaders import academy_rag_root, enrich_metadata, load_academy_content
from ai.rag.retrievers import ParentChildRetriever
from ai.rag.retriever import HybridRetriever, get_mmr_retriever, get_similarity_retriever
from ai.rag.supabase_vector import SupabaseVectorConfig

__all__ = [
    "RAGCacheManager",
    "RAGEngine",
    "SupabaseVectorConfig",
    "get_embeddings",
    "get_chunker",
    "AgriSemanticChunker",
    "AgriSmartChunker",
    "HierarchicalChunker",
    "LLMSemanticChunker",
    "AgriContextualCompressor",
    "ParentChildRetriever",
    "load_academy_content",
    "academy_rag_root",
    "enrich_metadata",
    "get_similarity_retriever",
    "get_mmr_retriever",
    "HybridRetriever",
    "get_rag_cache_manager",
]
