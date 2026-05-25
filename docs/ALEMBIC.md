# PostgreSQL + Alembic

Локален Postgres с Docker и URL формати: [POSTGRES.md](./POSTGRES.md).

## Защо

- **PostgreSQL** — продукционна база (concurrency, backup, managed DB).
- **Alembic** — версионирани промени по схемата (колони, таблици, индекси), еднакви на dev/staging/prod.

## Локално (Docker Postgres)

От корена на монорепото:

```bash
docker compose up -d
```

В `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://agro:agro_dev_change_me@localhost:5432/agro_academy
```

## Команди (от папка `backend/`)

```bash
pip install -r requirements.txt
python -m alembic upgrade head          # приложи всички миграции
python -m alembic current               # текуща ревизия
python -m alembic history               # списък ревизии
```

След ревизия **`20250525_0002`** таблица **`lessons`** има колона **`content`** (Markdown текст на урока). За демо съдържание: празна база + `POST /api/v1/courses/seed` (текстовете са в `api/seed_lesson_content.py`).

## Промени по моделите: `revision --autogenerate`

Alembic **сравнява** SQLAlchemy `Base.metadata` с **реалната база** и генерира `upgrade()` / `downgrade()`. Това не е „магия“ — винаги прегледайте файла преди merge.

### 1. Подготовка

- Базата трябва да е на **последната приложена ревизия**: `python -m alembic upgrade head`.
- По възможност ползвайте **същия диалект** като продукцията (PostgreSQL), за да е diff-ът реалистичен.
- Ако нямате Postgres локално, SQLite също работи за autogenerate, но има разлики в типове/defaults — прегледът е още по-важен.

### 2. Генериране

```bash
cd backend
python -m alembic revision -m "кратко описание на промяната" --autogenerate
```

Ще се появи нов файл под `alembic/versions/` (напр. `abcd1234_кратко_описание.py`).

### 3. Задължителен преглед на diff (преди commit / merge)

Отворете **новия** migration файл и/или:

```bash
git diff
```

Проверете поне следното:

| Риск | Какво да търсите |
|------|------------------|
| **Преименуване на колона** | Autogenerate често прави `drop_column` + `add_column` → **загуба на данни**. Ръчно заменете с `op.alter_column(... rename)` или `batch_alter_table` по документацията на Alembic. |
| **Празна миграция** | `upgrade()` е само `pass` — моделът и БД-то може да не съвпадат (грешен `DATABASE_URL`, неимпортиран модел в `env.py`). |
| **Излишни `drop_*`** | Таблица/индекс, която не искате да махате. |
| **`downgrade()`** | Дали логически връща схемата; при сложни промени понякога се дописва ръчно. |
| **Defaults / timezone** | `server_default`, `Boolean`, `DateTime(timezone=True)` — сравнете с очакваното за Postgres. |
| **Резервирани думи** | Например колона `order` — в моделите използвайте `quote=True` и проверете генерирания SQL. |

### 4. Тест локално

```bash
python -m alembic upgrade head
# стартирайте API и smoke тест
python -m alembic downgrade -1   # по избор: една стъпка назад, ако downgrade е коректен
python -m alembic upgrade head
```

### 5. Без autogenerate

За миграции, които autogenerate не улавя добре (данни, partial index, raw SQL):

```bash
python -m alembic revision -m "ръчна миграция"
```

После редактирайте `upgrade()` / `downgrade()` на ръка.

## FastAPI и таблици

- При **`sqlite:///...`** приложението още извиква `create_all` за бърз локален старт.
- При **PostgreSQL** таблиците идват от **Alembic** — пуснете `python -m alembic upgrade head` преди `uvicorn`.

## Резервна дума `order`

Колоните `modules.order` и `lessons.order` са с `quote=True` в SQLAlchemy, за да са валидни в PostgreSQL.

## Импорт на модели в Alembic

Нови таблици/модели трябва да са **импортирани** в `alembic/env.py` (както `User`, `Course`, …), иначе autogenerate няма да ги види в `target_metadata`.
