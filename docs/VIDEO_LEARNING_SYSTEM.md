# VIDEO LEARNING SYSTEM — видео обучение в AI Agro Academy

Този документ описва **целевата система за видео уроци** (структура, playback, прогрес, интеграция с Cloudflare Stream) и как се съчетава с **текущия код**.

## Текущо състояние в базата и модела

- **Йерархия:** `Course` → `Module` → `Lesson` (`backend/models/course.py`).
- **`Lesson.video_id`:** низ за идентификатор на видео. В кода е коментирано като YouTube ID; за **Cloudflare Stream** същият стълб може да съдържа **Stream `uid`**, ако унифицирате източника (или добавите отделно поле `video_provider` — вижте по-долу).
- **`Lesson.completed`:** булева стойност на урока — **не е per-user**; за реална платформа прогресът трябва да е в отделна таблица (препоръка по-долу).

## Целева функционалност

| Област | Описание |
|--------|----------|
| **Каталог** | Курс → модули → уроци с подредба (`order` с `quote=True` в Postgres). |
| **Playback** | Вграден player: Stream iframe / signed URL или YouTube embed — единна абстракция във frontend. |
| **Качване** | Direct upload към **Cloudflare Stream** през бекенд-генериран URL — виж [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md). |
| **Прогрес** | Последна позиция (секунди), % гледане, завършен — **по потребител**. |
| **Достъп** | Връзка с enrollment / роля (Clerk + бекенд JWT). |
| **Субтитри / транскрипт** | За достъпност и за **RAG** върху съдържанието на урока (генериран VTT → индекс). |

## Препоръчана еволюция на схемата (без да чупите веднага MVP)

1. **`lesson_progress`** (или `user_lesson_progress`):  
   `user_id`, `lesson_id`, `position_seconds`, `percent_watched`, `completed_at`, `updated_at`.  
   Тогава `Lesson.completed` може да се игнорира или да се синхронизира като агрегат само за admin.

2. **`video_provider` + `video_ref`:**  
   - `video_provider`: `stream` | `youtube` | `external`  
   - `video_ref`: uid или YouTube id  
   По-чисто от претоварване на един `video_id` без контекст.

3. **`lesson_assets`:**  
   Транскрипт път (R2/S3), thumbnail URL, продължителност в секунди (число), за да не се парсира само от `duration` string. За качване и ключове вижте [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md).

Имплементацията минава през **Alembic** — виж [ALEMBIC.md](./ALEMBIC.md); новите модели трябва да се **импортират** в `alembic/env.py`.

## Frontend (Next.js)

- **Страница на урок:** `/courses/[courseId]/.../lesson/[lessonId]` (или еквивалент) — player + списък с уроци отляво/долу.
- **Resume:** при зареждане чете `position_seconds` от API и подава на player.
- **Събития:** периодично (напр. на пауза / всеки N секунди) PATCH към бекенда за прогрес — не на всяка секунда, за да пестите заявки.

## Backend (FastAPI)

| Endpoint (пример) | Роля |
|-------------------|------|
| `GET /api/v1/courses/{id}/lessons/{lid}` | Метаданни + `video_ref` + signed playback hint |
| `PATCH /api/v1/progress/lessons/{lid}` | Запис на позиция / завършване |
| `POST /api/v1/stream/upload-url` | Direct upload (виж Cloudflare Stream doc) |

Авторизация: JWT (локален login) или Clerk session JWT с `email` claim → виж [CLERK.md](../docs/CLERK.md); само записан студент обновява своя прогрес.

## Cloudflare Stream

- Пълен поток качване → `uid` → запис в `Lesson` / `lesson_assets`: [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md).
- **Статус:** `GET /api/v1/platform/status` → `cloudflare_stream_configured`.

## AI и видео

- **Транскрипт** на урока може да се включи в **RAG** (чанкове по параграфи с `lesson_id` в metadata) — по-добри отговори на „какво казва лекторът в модул 3“.
- **Multi-teacher** контекст: урокът може да е обвързан с `teacher_id` за препоръчани follow-up въпроси — [MULTI_AI_TEACHERS.md](./MULTI_AI_TEACHERS.md).

## Достъпност и качество

- Субтитри (VTT), keyboard controls, контраст на контролите на player-а.
- Мобилен: адаптивен player; за Expo — същият `video_ref` + native player където е възможно.

## Какво да направите първо (приоритет)

1. Имплементирайте **`POST /api/v1/stream/upload-url`** и запис на **`uid`** в `Lesson.video_id` (или нова схема с `video_provider`).  
2. Добавете **минимален progress API** + таблица `lesson_progress`.  
3. Урокова страница в Next.js със Stream embed и resume.

---

Свързано: [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md) · [PLATFORM.md](./PLATFORM.md) · [CLOUD_BACKEND.md](./CLOUD_BACKEND.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · `backend/models/course.py`
