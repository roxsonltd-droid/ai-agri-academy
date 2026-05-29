"""Зареждане на Academy материали като LangChain ``Document`` (Markdown + PDF)."""

from __future__ import annotations

import datetime
import logging
import os
from pathlib import Path

from langchain_core.documents import Document

from ai.settings import _REPO_ROOT

logger = logging.getLogger(__name__)


def academy_rag_root() -> Path:
    """Корен за RAG: по подразбиране ``content/academy`` (включва ``courses/``)."""
    raw = os.environ.get("ACADEMY_RAG_ROOT", str(_REPO_ROOT / "content" / "academy"))
    return Path(raw).resolve()


def _module_slug_from_path(root: Path, file_path: Path) -> str:
    """Подпапка след курса при ``…/courses/<course>/<module>/…``; иначе ``general``."""
    try:
        root_r = root.resolve()
        fp = file_path.resolve()
        rel = fp.relative_to(root_r)
        parts = rel.parts
        if "courses" in parts:
            i = parts.index("courses")
            sub = parts[i + 1 :]
            if len(sub) >= 3:
                return str(sub[1]).lower()
            return "general"
        if len(parts) >= 2:
            return str(parts[-2]).lower()
    except Exception:
        pass
    return "general"


def _course_slug_from_path(root: Path, file_path: Path) -> str:
    try:
        rel = file_path.relative_to(root)
        parts = rel.parts
        if "courses" in parts:
            i = parts.index("courses")
            if i + 1 < len(parts):
                return parts[i + 1]
        if len(parts) >= 2:
            return parts[0]
    except Exception:
        pass
    return "general"


def _load_markdown_files(content_dir: Path) -> list[Document]:
    docs: list[Document] = []
    if not content_dir.is_dir():
        return docs

    try:
        from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader

        md_loader = DirectoryLoader(
            str(content_dir),
            glob="**/*.md",
            loader_cls=UnstructuredMarkdownLoader,
            loader_kwargs={"mode": "elements"},
        )
        docs.extend(md_loader.load())
    except Exception as exc:
        logger.warning("DirectoryLoader/UnstructuredMarkdown неуспешен (%s) — fallback към TextLoader.", exc)
        for path in sorted(content_dir.rglob("*.md")):
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            rel = str(path.relative_to(content_dir)).replace("\\", "/")
            docs.append(
                Document(
                    page_content=text,
                    metadata={"source": rel, "source_type": "academy", "language": "bg"},
                )
            )
    return docs


def _load_pdf_files(content_dir: Path) -> list[Document]:
    docs: list[Document] = []
    if not content_dir.is_dir():
        return docs
    try:
        from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader

        pdf_loader = DirectoryLoader(str(content_dir), glob="**/*.pdf", loader_cls=PyPDFLoader)
        docs.extend(pdf_loader.load())
    except Exception as exc:
        logger.debug("PDF loader пропуснат: %s", exc)
    return docs


def enrich_metadata(docs: list[Document], content_dir: Path) -> list[Document]:
    default_region = (os.getenv("ACADEMY_DEFAULT_REGION") or "bulgaria").strip().lower()
    default_difficulty = (os.getenv("ACADEMY_CONTENT_DIFFICULTY") or "intermediate").strip().lower()

    for doc in docs:
        src = doc.metadata.get("source", "")
        p = Path(str(src))
        if not p.is_absolute() and src:
            p = content_dir / src
        path_for_meta = p if p.exists() else content_dir
        course_slug = _course_slug_from_path(content_dir, path_for_meta)
        module_slug = _module_slug_from_path(content_dir, path_for_meta)
        doc.metadata.setdefault("course", course_slug)
        doc.metadata.setdefault("course_slug", course_slug)
        doc.metadata.setdefault("module", module_slug)
        doc.metadata.setdefault("region", default_region)
        doc.metadata.setdefault("difficulty", default_difficulty)
        doc.metadata.setdefault("language", "bg")
        suffix = path_for_meta.suffix.lower() if path_for_meta.suffix else ""
        if suffix == ".pdf":
            doc.metadata["source_type"] = "academy_pdf"
        else:
            doc.metadata["source_type"] = "academy_markdown"
        doc.metadata.setdefault("source", doc.metadata["source_type"])
        doc.metadata.setdefault("chunk_type", "text")
        if "topic" not in doc.metadata:
            doc.metadata["topic"] = (
                path_for_meta.stem.replace("-", " ").replace("_", " ").title() if path_for_meta.name else "Topic"
            )
        try:
            if path_for_meta.is_file():
                ts = datetime.datetime.fromtimestamp(
                    path_for_meta.stat().st_mtime,
                    tz=datetime.timezone.utc,
                )
                doc.metadata.setdefault("last_updated", ts.strftime("%Y-%m-%d"))
        except OSError:
            pass
    return docs


def load_academy_content(content_dir: str | Path | None = None) -> list[Document]:
    """Зарежда учебни материали от Academy дървото."""
    root = Path(content_dir).resolve() if content_dir else academy_rag_root()
    documents: list[Document] = []
    documents.extend(_load_markdown_files(root))
    documents.extend(_load_pdf_files(root))
    documents = enrich_metadata(documents, root)
    logger.info("Заредени %s документа от %s", len(documents), root)
    return documents
