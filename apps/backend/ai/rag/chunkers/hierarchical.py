"""Йерархично чънкване: parent (секции) + child (за embedding / търсене)."""

from __future__ import annotations

import logging
import os
import uuid
from typing import Any

from langchain_core.documents import Document

from ai.rag.chunkers.fallback_splitter import build_recursive_splitter

logger = logging.getLogger(__name__)


class HierarchicalChunker:
    """
    Document → parent chunks (по-големи секции) → child chunks (малки, прецизни).

    Metadata:

    - ``hierarchical_group_id`` — един UUID за целия изходен документ.
    - ``parent_id`` — UUID на parent чънка; при parent редът е собственият му id.
    - ``chunk_type`` — ``parent`` | ``child``.

    И двата вида се индексират в vector store; retrieverът търси по child и разширява към parent.
    """

    def __init__(self) -> None:
        self.parent_splitter = build_recursive_splitter(
            chunk_size=int(os.getenv("ACADEMY_HIER_PARENT_CHUNK_SIZE", "2000")),
            chunk_overlap=int(os.getenv("ACADEMY_HIER_PARENT_OVERLAP", "400")),
            separators=["\n\n## ", "\n\n### ", "\n\n", "\n"],
            add_start_index=True,
        )
        self.child_splitter = build_recursive_splitter(
            chunk_size=int(os.getenv("ACADEMY_HIER_CHILD_CHUNK_SIZE", "600")),
            chunk_overlap=int(os.getenv("ACADEMY_HIER_CHILD_OVERLAP", "100")),
            separators=["\n\n", "\n", ". ", " "],
            add_start_index=True,
        )

    def split_documents(self, docs: list[Document]) -> list[Document]:
        return self.create_hierarchical_chunks(docs)

    def create_hierarchical_chunks(self, docs: list[Document]) -> list[Document]:
        all_chunks: list[Document] = []
        for doc in docs:
            base_meta = dict(getattr(doc, "metadata", None) or {})
            group_id = str(uuid.uuid4())
            parent_chunks = self.parent_splitter.split_documents([doc])
            for parent in parent_chunks:
                parent_id = str(uuid.uuid4())
                pm = {**base_meta, **(dict(getattr(parent, "metadata", None) or {}))}
                pm["hierarchical_group_id"] = group_id
                pm["parent_id"] = parent_id
                pm["chunk_type"] = "parent"
                parent.metadata = pm

                child_chunks = self.child_splitter.split_documents([parent])
                for child in child_chunks:
                    cm = {**base_meta, **(dict(getattr(child, "metadata", None) or {}))}
                    cm["hierarchical_group_id"] = group_id
                    cm["parent_id"] = parent_id
                    cm["chunk_type"] = "child"
                    for key in ("course", "module", "region", "language", "source_type", "source", "difficulty"):
                        if key in base_meta:
                            cm.setdefault(key, base_meta[key])
                    child.metadata = cm
                    all_chunks.append(child)
                all_chunks.append(parent)
        logger.debug("HierarchicalChunker: %s изходни → %s чънка", len(docs), len(all_chunks))
        return all_chunks
