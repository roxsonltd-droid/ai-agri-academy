"""PGVector + hybrid search retriever (optional heavy LangChain / torch stack)."""

from __future__ import annotations

import os
from typing import Dict, List

import psycopg2
from dotenv import load_dotenv
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_community.vectorstores import PGVector
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()


class AcademyRetriever:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="intfloat/multilingual-e5-large",
            model_kwargs={"device": "cpu"},
        )

        self.vectorstore = PGVector(
            collection_name="academy_tutor_v1",
            connection_string=os.getenv("POSTGRES_CONNECTION_STRING"),
            embedding_function=self.embeddings,
            use_jsonb=True,
        )

        self.reranker_model = HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
        self.reranker = CrossEncoderReranker(model=self.reranker_model, top_n=6)

    def hybrid_search(self, query: str, top_k: int = 8, filters: dict | None = None) -> List[Document]:
        vector_results = self.vectorstore.similarity_search(query, k=top_k * 2, filter=filters)
        keyword_results = self._keyword_search(query, top_k * 2)
        all_docs = self._merge_results(vector_results, keyword_results)
        reranked_docs = self.reranker.compress_documents(all_docs, query)
        return reranked_docs[:top_k]

    def _keyword_search(self, query: str, limit: int) -> List[Document]:
        conn = psycopg2.connect(os.getenv("POSTGRES_CONNECTION_STRING"))
        cur = conn.cursor()

        cur.execute(
            """
            SELECT content, metadata,
                   similarity(content, %s) as score
            FROM academy_documents
            WHERE content %% %s
            ORDER BY score DESC
            LIMIT %s
            """,
            (query, query, limit),
        )

        results = cur.fetchall()
        cur.close()
        conn.close()

        return [Document(page_content=row[0], metadata=row[1] | {"score": row[2]}) for row in results]

    def _merge_results(self, vector_docs, keyword_docs):
        seen = set()
        merged = []
        for doc in vector_docs + keyword_docs:
            doc_id = doc.metadata.get("id") or hash(doc.page_content)
            if doc_id not in seen:
                seen.add(doc_id)
                merged.append(doc)
        return merged

    def get_context(self, query: str, filters: dict | None = None, top_k: int = 7) -> Dict:
        docs = self.hybrid_search(query, top_k=top_k, filters=filters)
        context = "\n\n---\n\n".join(doc.page_content for doc in docs)
        sources = [
            {
                "source": doc.metadata.get("source", "academy"),
                "topic": doc.metadata.get("topic", ""),
                "course": doc.metadata.get("course", ""),
                "lecture_id": doc.metadata.get("lecture_id", ""),
                "chunk_index": doc.metadata.get("chunk_index"),
            }
            for doc in docs
        ]
        course_filter = None
        if filters:
            course_filter = filters.get("course") or filters.get("course_slug")
        return {
            "context": context,
            "documents": docs,
            "sources": sources,
            "retrieval": {
                "backend": "pg",
                "top_k": top_k,
                "document_count": len(docs),
                "course_filter": course_filter,
            },
        }
