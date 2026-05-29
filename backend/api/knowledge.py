import io
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Header, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from pypdf import PdfReader
from sqlalchemy.orm import Session

from core.config import settings
from core.bearer_user import resolve_user_from_bearer
from core.r2 import RAG_OBJECT_KEY_RE, delete_object, get_object_bytes, r2_enabled
from core.rag_paths import knowledge_uploads_dir
from db.database import get_db

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


async def _invalidate_rag_index() -> None:
    """Defer import of core.rag (numpy/embeddings) until a document actually changes."""
    from core.rag import invalidate_rag_index

    await invalidate_rag_index()

_ALLOWED_SUFFIX = {".md", ".txt", ".pdf"}
# uploaded files: 8 hex + __ + safe stem + .md|.txt
_STORED_NAME_RE = re.compile(r"^[a-f0-9]{8}__[A-Za-z0-9._\-]+\.(?:md|txt)$")


def _safe_stem(name: str) -> str:
    base = Path(name).stem
    base = re.sub(r"[^\w\-\.]", "_", base)
    base = base.strip("._")[:80]
    return base or "document"


def _stored_name(original: str, suffix: str) -> str:
    return f"{uuid.uuid4().hex[:8]}__{_safe_stem(original)}{suffix}"


async def ensure_can_upload(
    x_secret: str | None,
    creds: HTTPAuthorizationCredentials | None,
    db: Session,
) -> None:
    user = await resolve_user_from_bearer(creds, db)
    if user and (user.is_superuser or user.role in ("admin", "instructor")):
        return
    if settings.RAG_UPLOAD_SECRET and x_secret == settings.RAG_UPLOAD_SECRET:
        return
    raise HTTPException(
        status_code=403,
        detail="Нямате права за качване. Нужен е admin/instructor/superuser или валиден X-RAG-Upload-Secret.",
    )


def _ingest_bytes_to_uploads(*, original_filename: str, suf: str, data: bytes) -> dict:
    """Write validated bytes to knowledge/uploads and return {stored_as, size_bytes}."""
    if len(data) > settings.RAG_MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Файлът е твърде голям")

    uploads = knowledge_uploads_dir()
    if suf == ".pdf":
        try:
            reader = PdfReader(io.BytesIO(data))
            parts: list[str] = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    parts.append(t)
            text = "\n\n".join(parts)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Неуспешно четене на PDF: {e}") from e
        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="PDF няма извличим текст (напр. само скан) — качете .txt/.md или OCR-нат PDF.",
            )
        out_name = _stored_name(original_filename, ".txt")
        out_path = uploads / out_name
        out_path.write_text(text, encoding="utf-8")
    else:
        out_name = _stored_name(original_filename, suf)
        out_path = uploads / out_name
        raw = data.decode("utf-8", errors="replace")
        out_path.write_text(raw, encoding="utf-8")

    return {"stored_as": out_name, "size_bytes": out_path.stat().st_size}


@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_rag_upload_secret: str | None = Header(default=None, alias="X-RAG-Upload-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Качва PDF, Markdown или plain text в RAG хранилището (директория knowledge/uploads)."""
    await ensure_can_upload(x_rag_upload_secret, creds, db)
    if not file.filename:
        raise HTTPException(status_code=400, detail="Липсва име на файл")
    suf = Path(file.filename).suffix.lower()
    if suf not in _ALLOWED_SUFFIX:
        raise HTTPException(
            status_code=400,
            detail=f"Разрешени са само: {', '.join(sorted(_ALLOWED_SUFFIX))}",
        )
    data = await file.read()
    result = _ingest_bytes_to_uploads(original_filename=file.filename, suf=suf, data=data)
    await _invalidate_rag_index()
    return result


class FromR2Body(BaseModel):
    object_key: str


@router.post("/documents/from-r2")
async def ingest_document_from_r2(
    body: FromR2Body,
    db: Session = Depends(get_db),
    x_rag_upload_secret: str | None = Header(default=None, alias="X-RAG-Upload-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """
    След успешен PUT към R2 (presign от `/api/v1/storage/presign`), изтегля обекта от R2,
    обработва го като локално качване и записва в `knowledge/uploads`.
    """
    await ensure_can_upload(x_rag_upload_secret, creds, db)
    if not r2_enabled():
        raise HTTPException(
            status_code=503,
            detail="R2 не е конфигуриран.",
        )
    key = body.object_key.strip()
    if not RAG_OBJECT_KEY_RE.fullmatch(key):
        raise HTTPException(status_code=400, detail="Невалиден object_key")

    suf = Path(key).suffix.lower()
    original_filename = Path(key).name  # includes random prefix; stem still usable for naming

    try:
        data = get_object_bytes(key, max_bytes=settings.RAG_MAX_UPLOAD_BYTES)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Обектът не е намерен в R2") from None
    except ValueError as e:
        raise HTTPException(status_code=413, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"R2 read неуспешен: {e}") from e

    result = _ingest_bytes_to_uploads(original_filename=original_filename, suf=suf, data=data)
    await _invalidate_rag_index()

    if settings.R2_DELETE_AFTER_INGEST:
        delete_object(key)

    return {**result, "r2_object_key": key, "deleted_from_r2": settings.R2_DELETE_AFTER_INGEST}


class DocumentInfo(BaseModel):
    name: str
    size_bytes: int


@router.get("/documents", response_model=list[DocumentInfo])
async def list_documents(
    db: Session = Depends(get_db),
    x_rag_upload_secret: str | None = Header(default=None, alias="X-RAG-Upload-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    await ensure_can_upload(x_rag_upload_secret, creds, db)
    uploads = knowledge_uploads_dir()
    out: list[DocumentInfo] = []
    for p in sorted(uploads.iterdir()):
        if p.is_file() and p.suffix.lower() in (".md", ".txt"):
            out.append(DocumentInfo(name=p.name, size_bytes=p.stat().st_size))
    return out


@router.delete("/documents/{filename}")
async def delete_document(
    filename: str,
    db: Session = Depends(get_db),
    x_rag_upload_secret: str | None = Header(default=None, alias="X-RAG-Upload-Secret"),
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    await ensure_can_upload(x_rag_upload_secret, creds, db)
    if not _STORED_NAME_RE.fullmatch(filename):
        raise HTTPException(status_code=400, detail="Невалидно име на файл")
    uploads = knowledge_uploads_dir().resolve()
    path = (uploads / filename).resolve()
    if path.parent != uploads:
        raise HTTPException(status_code=400, detail="Невалиден път")
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Файлът не съществува")
    path.unlink()
    await _invalidate_rag_index()
    return {"deleted": filename}
