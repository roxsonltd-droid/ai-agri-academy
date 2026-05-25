# AI Agro Academy — монорепо

Тук са **backend** (FastAPI), **ai-agro-academy** (Next.js), **mobile** (Expo), **docs** и инфраструктура.

## Терминал в Cursor / VS Code

### Ако **не можеш да промениш cwd** или настройките не се прилагат

1. **Workspace файл (най-надеждно):** в Explorer двоен клик на **`Agro-Academy.code-workspace`**, или в Cursor: **File → Open Workspace from File…** и избери този файл. Терминалът трябва да е в корена на репото.
2. **Без Cursor:** двоен клик на **`Open-Academy-Terminal.cmd`** в корена — отваря се PowerShell вече в папката на проекта.
3. **От произволен терминал:**  
   `& "C:\Users\expre\Academy\scripts\academy.ps1"`  
   (коригирай пътя, ако репото не е на това място.)

### Нормален поток (ако `.vscode` работи)

1. **Отвори тази папка като workspace:** `File` → `Open Folder` → **`Academy`**.
2. Новият интегриран терминал стартира в **корена** (`.vscode/settings.json`).
3. За подпапки: `cd backend` или `cd ai-agro-academy`.

## Tasks (Terminal → Run Task…)

| Task | Действие |
|------|----------|
| **Backend: alembic upgrade head** | Миграции от папка `backend/` |
| **Backend: uvicorn (reload)** | API на `http://127.0.0.1:8000` |
| **Frontend: npm install** | Зависимости на Next.js |
| **Frontend: dev** | `next dev` |

## Бързи команди (ръчно)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

```powershell
cd ai-agro-academy
npm install
npm run dev
```

## Свързани README

- [ai-agro-academy/README.md](./ai-agro-academy/README.md)
- [backend/README.md](./backend/README.md)
