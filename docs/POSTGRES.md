# PostgreSQL — AI Agro Academy

**PostgreSQL** е целевата продукционна база за потребители, курсове, модули и уроци. **SQLite** остава удобен за бърз локален старт без Docker (`sqlite:///./agro_academy.db`).

## Защо Postgres

- Транзакции, concurrent writes, по-богат SQL от SQLite.
- Еднакъв диалект с **staging/production** — Alembic `autogenerate` дава по-смислен diff.
- Управлявани услуги (Render, Neon, Supabase, RDS) с backup и SSL.

## Локален Postgres (Docker)

От **корена на репото** (`Academy/`, където е `docker-compose.yml`):

```bash
docker compose up -d
docker compose ps
```

Сервизът е **`postgres:16-alpine`**, порт **5432**, volume `agro_pg_data` за данни.

| Променлива (в контейнера) | Стойност |
|---------------------------|----------|
| `POSTGRES_USER` | `agro` |
| `POSTGRES_PASSWORD` | `agro_dev_change_me` |
| `POSTGRES_DB` | `agro_academy` |

В **`backend/.env`**:

```env
DATABASE_URL=postgresql+psycopg2://agro:agro_dev_change_me@localhost:5432/agro_academy
```

- Драйверът **`psycopg2`** съответства на пакета **`psycopg2-binary`** в `requirements.txt`.
- Схемата на URL е: `postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DATABASE`

След като контейнерът е healthy:

```bash
cd backend
pip install -r requirements.txt
python -m alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

При **`postgresql://...`** приложението **не** вика `Base.metadata.create_all` в `main.py` — таблиците идват от **Alembic**. Подробности: [ALEMBIC.md](./ALEMBIC.md).

## Управлявана база (SSL)

Повечето облачни Postgres инстанции изискват SSL. Добавете параметри към URL (пример):

```env
DATABASE_URL=postgresql+psycopg2://user:pass@host.region.provider.com:5432/dbname?sslmode=require
```

Конкретният hostname и дали да ползвате `sslmode=require` или `verify-full` зависи от доставчика — вижте тяхната документация.

## Render / други PaaS

- Задайте **`DATABASE_URL`** като secret в панела на услугата (както в `render.yaml` с `sync: false`).
- **Internal URL** (ако frontend и backend са в същата мрежа) често е без SSL или на друг порт; **external** обикновено изисква `sslmode=require`.
- Стартов скриптът в `render.yaml` първо изпълнява **`alembic upgrade head`**, после **`uvicorn`**.

## Миграции и схема

- Импорт на модели в **`backend/alembic/env.py`** — без тях autogenerate няма да вижда нови таблици.
- Резервирани имена (напр. колона **`order`**) в PostgreSQL изискват кавички в SQL — в моделите се ползва `quote=True`; виж [ALEMBIC.md](./ALEMBIC.md).

## Често срещани проблеми

| Симптом | Проверка |
|---------|----------|
| `connection refused` | Docker ли е пуснат (`docker compose ps`), порт 5432 ли е свободен |
| `password authentication failed` | Съвпадат ли user/password с `docker-compose.yml` и `.env` |
| `database "agro_academy" does not exist` | `POSTGRES_DB` в compose или създайте базата ръчно |
| Празна миграция при `--autogenerate` | Правилен ли е `DATABASE_URL` за Alembic, импортирани ли са моделите в `env.py` |
| Разлики SQLite ↔ Postgres | За сериозен autogenerate ползвайте **същия диалект** като в prod |

## Свързани файлове

- `docker-compose.yml` — локален Postgres
- `backend/core/config.py` — `DATABASE_URL`, CORS
- `backend/db/database.py` — engine + `SessionLocal`
- `backend/main.py` — `create_all` само при SQLite
- [ALEMBIC.md](./ALEMBIC.md) — команди и преглед на миграции
- [backend/README.md](../backend/README.md) — старт на API и env таблица
