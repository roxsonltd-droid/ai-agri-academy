"""
Фаза 1 на сигурност при upload: размер, магически байтове, отхвърляне на очевидни бинарни „изпълними“ заглавки.
Пълен антивирусен скан — виж docs/AI_ENHANCEMENTS_ROADMAP.md (ClamAV / cloud AV).
"""

from __future__ import annotations

from fastapi import HTTPException


def assert_upload_bytes_safe(data: bytes, suffix: str) -> None:
    if not data:
        raise HTTPException(status_code=400, detail="Празен файл")
    # Изпълними / подозрителни PE/ELF заглавки
    if data[:2] == b"MZ" or data[:4] == b"\x7fELF":
        raise HTTPException(status_code=400, detail="Неразрешен тип файл (изпълним формат).")
    suf = suffix.lower()
    if suf == ".pdf":
        if not data.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="Файлът не изглежда като валиден PDF.")
    elif suf in (".md", ".txt"):
        # Твърде много NUL байтове → вероятно бинарен файл с грешно разширение
        if data.count(b"\x00") > max(8, len(data) // 5000):
            raise HTTPException(status_code=400, detail="Файлът изглежда бинарен — качете текст или Markdown.")
