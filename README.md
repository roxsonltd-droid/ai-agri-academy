# AI Agro Academy

**Образование + AI асистент + практически инструменти** за модерно земеделие — в един монорепо: уеб (Next.js), API (FastAPI), мобилно (Expo) и документация.

| Документ | Съдържание |
|----------|------------|
| **[VISION.md](./VISION.md)** | Какво е продуктът, за кого е, стратегия и успех. |
| **[ROADMAP.md](./ROADMAP.md)** | Квартали (вкл. Q3/Q4 2025 и напред), приоритети, извън обхват. |

Репозиторий: [github.com/roxsonltd-droid/ai-agri-academy](https://github.com/roxsonltd-droid/ai-agri-academy)

---

## Какво представлява платформата?

1. **Образование** — курсове, структурирани материали и маршрути за учене.  
2. **AI асистент** — чат с **RAG** върху платформени и качени знания (Mistral и др., виж `backend/README.md`).  
3. **Практически инструменти** — **лаборатории**, компютърно **зрение**, **глас** (при конфигурирани ключове), **storage** — за експеримент и приложение на теорията.

Цел: потребителят да мине от „чета“ към „разбирам и пробвам“ с подкрепа на AI, който цитира контекст, а не халюцинира в празно.

---

## Целева аудитория

- **Начинаещи фермери и малки стопанства** — ясни обяснения, бързи отговори, ориентация в теми без да търсят из десет източника.  
- **Студенти и курсисти** — курсове, лаборатории, връзка теория ↔ инструменти.  
- **Професионалисти** — RAG върху документи, API, по-напреднали lab сценарии.

Подробности: [VISION.md](./VISION.md).

---

## MVP (основни функции)

Минималният продукт, върху който стъпваме:

| Област | Функция |
|--------|---------|
| **Потребители** | Регистрация / вход (Clerk във frontend; JWT/JWKS към backend). |
| **Курсове** | Списък и страница по курс (`/courses`, `/courses/[courseId]`). |
| **AI чат** | API `/api/v1/chat` — разговор с контекст. |
| **Knowledge / RAG** | Качване и търсене в знания (`/api/v1/knowledge`), конфигурация през env. |
| **Табло** | `/dashboard` — входна точка след login. |
| **Лаборатории** | `/labs`, включително vision (`/labs/vision`). |
| **Faculty / AgroMind** | `/faculty/agromind` — AI-фокусирана зона. |
| **Backend** | Auth, users, courses, chat, lab, knowledge, storage, voice, vision, platform, agents — виж `backend/main.py`. |

Мобилното приложение е в **`mobile/`** (Expo) — целта е паритет с основните потоци в по-късен етап ([ROADMAP.md](./ROADMAP.md)).

---

## Структура на репото

```
ai-agri-academy/
├── backend/           # FastAPI, Alembic, SQLite/Postgres, RAG
├── ai-agro-academy/   # Next.js 16, React 19, Tailwind 4
├── mobile/            # Expo
├── docs/              # Postgres, vector DB, др.
├── docker-compose.yml
├── render.yaml
├── Agro-Academy.code-workspace
└── Open-Academy-Terminal.cmd
```

---

## Терминал в Cursor / VS Code

### Ако **не можеш да промениш cwd** или настройките не се прилагат

1. **Workspace файл (най-надеждно):** в Explorer двоен клик на **`Agro-Academy.code-workspace`**, или в Cursor: **File → Open Workspace from File…** и избери този файл. Терминалът трябва да е в корена на репото.
2. **Без Cursor:** двоен клик на **`Open-Academy-Terminal.cmd`** в корена — отваря се PowerShell вече в папката на проекта.
3. **От произволен терминал:**  
   `& "C:\Users\expre\Academy\scripts\academy.ps1"`  
   (коригирай пътя, ако репото не е на това място.)

### Нормален поток (ако `.vscode` работи)

1. **Отвори тази папка като workspace:** `File` → `Open Folder` → папката на репото.
2. Новият интегриран терминал стартира в **корена** (`.vscode/settings.json`).
3. За подпапки: `cd backend` или `cd ai-agro-academy`.

---

## Tasks (Terminal → Run Task…)

| Task | Действие |
|------|----------|
| **Backend: alembic upgrade head** | Миграции от папка `backend/` |
| **Backend: uvicorn (reload)** | API на `http://127.0.0.1:8000` |
| **Frontend: npm install** | Зависимости на Next.js |
| **Frontend: dev** | `next dev` |

---

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

---

## Свързани README

- [ai-agro-academy/README.md](./ai-agro-academy/README.md) — Next.js, дизайн docs.  
- [backend/README.md](./backend/README.md) — API, RAG, env променливи.
