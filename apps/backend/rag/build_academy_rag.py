import os
from pathlib import Path

from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader, PyPDFLoader
from langchain_community.vectorstores import PGVector
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

# ================== CONFIG ==================
CONNECTION_STRING = os.getenv("POSTGRES_CONNECTION_STRING")
COLLECTION_NAME = "academy_tutor_v1"
EMBEDDING_MODEL = "intfloat/multilingual-e5-large"  # много добър за български

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[2]
DEFAULT_CONTENT = REPO_ROOT / "content" / "academy" / "courses"
CONTENT_DIR = Path(os.getenv("ACADEMY_CONTENT_ROOT", str(DEFAULT_CONTENT))).resolve()

# ===========================================


def load_documents(directory: Path):
    """Load Markdown and PDF files from Academy content tree."""
    docs = []
    d = str(directory)
    if not directory.is_dir():
        print(f"Няма папка със съдържание: {directory}")
        return docs

    md_loader = DirectoryLoader(
        d,
        glob="**/*.md",
        loader_cls=UnstructuredMarkdownLoader,
        loader_kwargs={"mode": "elements"},
    )
    docs.extend(md_loader.load())

    pdf_loader = DirectoryLoader(d, glob="**/*.pdf", loader_cls=PyPDFLoader)
    docs.extend(pdf_loader.load())

    print(f"Заредени {len(docs)} документа от {directory}")
    return docs


def enrich_metadata(docs):
    """Добавяне на полезни метаданни (course slug от пътя)."""
    for doc in docs:
        source = doc.metadata.get("source", "")
        p = Path(source)
        course_slug = "general"
        try:
            parts = p.parts
            if "courses" in parts:
                i = parts.index("courses")
                if i + 1 < len(parts):
                    course_slug = parts[i + 1]
            elif len(p.parts) >= 2:
                course_slug = p.parts[-2]
        except Exception:
            course_slug = "general"
        doc.metadata["course"] = course_slug
        doc.metadata["course_slug"] = course_slug
        doc.metadata["language"] = "bg"
        doc.metadata["chunk_type"] = "text"
        if "topic" not in doc.metadata:
            filename = p.name
            doc.metadata["topic"] = filename.replace(".md", "").replace("_", " ").title()
    return docs


def main():
    print("🚀 Стартиране на Ingestion Pipeline...")
    print(f"📂 Източник: {CONTENT_DIR}")

    raw_docs = load_documents(CONTENT_DIR)
    if not raw_docs:
        raise SystemExit("Няма документи за индексиране.")

    docs = enrich_metadata(raw_docs)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=850,
        chunk_overlap=120,
        separators=["\n\n## ", "\n\n### ", "\n\n#### ", "\n\n", "\n", " "],
        length_function=len,
    )

    chunks = text_splitter.split_documents(docs)
    print(f"Създадени {len(chunks)} чънка")

    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

    vectorstore = PGVector.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        connection_string=CONNECTION_STRING,
        use_jsonb=True,
    )

    print(f"✅ Успешно заредено в колекция: {COLLECTION_NAME}")


if __name__ == "__main__":
    main()
