import os
import sys
import pytest
from unittest import mock

# Add the rag directory to PYTHONPATH so retriever can import its peers
rag_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../apps/backend/rag'))
sys.path.insert(0, rag_dir)

import retriever
from file_retriever import FileAcademyRetriever

def test_pg_retriever_fallback_to_file():
    """
    Test that when ACADEMY_RAG_BACKEND="pg" but PGVector fails to initialize,
    it falls back to the FileAcademyRetriever without crashing.
    """
    # Force the backend to 'pg'
    with mock.patch.dict(os.environ, {"ACADEMY_RAG_BACKEND": "pg"}):
        # Reset globals to ensure clean state
        retriever._pg_retriever = None
        retriever._file_retriever = None
        
        # Mock pg_retriever to simulate an import error (e.g. missing dependencies)
        with mock.patch.dict("sys.modules", {"pg_retriever": None}):
            r = retriever.get_retriever()
            
            # Assert that the fallback logic worked and we got a FileAcademyRetriever
            assert isinstance(r, FileAcademyRetriever)
