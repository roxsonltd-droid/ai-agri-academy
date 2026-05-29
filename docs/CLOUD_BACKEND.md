# Модерен облачен бекенд — auth, storage, realtime, free tier

Този документ обобщава **как да подредите бекенда в облака** (FastAPI + данни + файлове + live актуализации) и кои услуги имат **разумен безплатен слой** за старт/POC. За текущия монорепо вижте също [PLATFORM.md](./PLATFORM.md), [POSTGRES.md](./POSTGRES.md), [CLERK.md](./CLERK.md), [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md).

## Целеви модел

| Слой | Отговорност | Типична услуга (пример) |
|------|----------------|-------------------------|
| **API** | REST, валидация, AI, webhooks | Render / Fly.io / Railway / Google Cloud Run |
| **Auth** | Идентичност, сесии, социални входове, JWT към API | **Clerk** (вече в проекта) |
| **Релационна БД** | Потребители, курсове, транзакции | **PostgreSQL** — Render Postgres, **Neon**, **Supabase** DB |
| **Файлово хранилище** | PDF/MD за RAG, thumbnails, експорти | **Cloudflare R2** — [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md), AWS S3, Supabase Storage |
| **Векторно / AI** | Embeddings, retrieval | **Pinecone** serverless, или pgvector в Postgres |
| **Видео** | Уроци, signed playback | **Cloudflare Stream** — [VIDEO_LEARNING_SYSTEM.md](./VIDEO_LEARNING_SYSTEM.md) |
| **Realtime** | Чат typing, нотификации, live прогрес | SSE от FastAPI, **Ably** / **Pusher**, Supabase Realtime, WebSocket зад proxy |

Принцип: **API не държи файловете в диска на контейнера** — качвате в object storage и пазите само URL/metadata в Postgres.

## Authentication

### Текущ избор: **Clerk**

- **Free tier:** подходящ за разработка и малък трафик (лимити се обновяват — вижте [clerk.com/pricing](https://clerk.com/pricing)).
- **Интеграция:** Next.js (`@clerk/nextjs`); бекендът може да валидира **JWT** срещу `CLERK_JWKS_URL` / `CLERK_ISSUER` (`backend/core/config.py`).
- **Плюсове:** готов UI за sign-in, organizations по-късно, webhooks за sync на потребители.

### Алтернативи (ако някой ден смените слой auth)

| Услуга | Free tier ориентир | Забележка |
|--------|---------------------|-----------|
| **Supabase Auth** | Проект с безплатен Postgres + Auth + Storage | „Всичко в едно“; различен модел от Clerk |
| **Auth0 / Okta** | Безплатен developer tier | По-тегав за мобилен + custom UI |
| **Firebase Auth** | Generous free tier | Google екосистема |

За този репо препоръката остава **Clerk + JWT към FastAPI**, докато не имате силна причина за миграция.

## Storage (файлове и медии)

### Object storage (препоръчително за RAG uploads, assets)

| Услуга | Free tier / ценово предимство | Забележка |
|--------|----------------------------------|-----------|
| **Cloudflare R2** | Без такса за **egress**; обемът е платен под праг | S3-съвместим API — [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) |
| **AWS S3** | 5 GB / 12 месеца (програма „free tier“ за нови акаунти) | Egress може да поскъпне |
| **Supabase Storage** | В рамките на безплатния проект | Удобно ако вече ползвате Supabase DB |

Днес качванията към RAG в бекенда могат да се разширят така: **upload → R2/S3 → запис на metadata в Postgres → индексиране** (вместо само локален диск в контейнера).

### Видео

- **Cloudflare Stream** — отделен продукт; вижте [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md).

## Realtime (live актуализации)

FastAPI + Uvicorn поддържат **WebSocket**, но на **безплатни PaaS** често има **timeouts** и един инстанс — за production realtime обикновено се ползва отделен канал.

| Подход | Сложност | Free tier / бележка |
|--------|------------|---------------------|
| **SSE (Server-Sent Events)** | Ниска — един HTTP stream от FastAPI | Добре за „сървър → клиент“ (прогрес на генериране на курс). Ограничения при дълги връзки на някои проксита — тествайте на Render. |
| **WebSocket** през същия host | Средна | Работи за dev; на Render проверете idle timeout. |
| **Ably** / **Pusher** | Ниска (SDK) | Ясни безплатни квоти за съобщения/connections — подходящи за чат „typing“, нотификации. |
| **Supabase Realtime** | Средна | Ако базата е в Supabase — subscribe към промени по таблица. |
| **Polling** | Най-ниска | Прости, но по-скъп по заявки; ОК за рядко обновяване. |

Практическа стъпка за **AI Agro Academy**: започнете с **SSE** за дълги AI операции (генериране на курс); за **мултиплейър чат** или presence — **Ably** или **Pusher** free tier.

## Free tier — ориентир (проверявайте актуалните лимити)

Услугите често сменят квотите; преди production проверете pricing страницата.

| Компонент | Пример безплатен / нисък праг | За проекта |
|-----------|-------------------------------|------------|
| **API host** | Render **Free** web service | Вече в `render.yaml`; cold start при неактивност |
| **PostgreSQL** | Render free Postgres (ако още се предлага), **Neon** free, **Supabase** free tier | `DATABASE_URL` |
| **Auth** | **Clerk** free | Публикуем + секретни ключове |
| **Object storage** | **R2** с малък безплатен обем | RAG и статични файлове |
| **Вектор** | **Pinecone** serverless (проверете текущия free tier) | `PLATFORM_RAG_BACKEND=llamaindex` |
| **LLM** | **Mistral** / други — промо кредити | `MISTRAL_API_KEY` |
| **CDN / edge** | **Cloudflare** free | DNS, R2, Stream по отделни продукти |

**Ограничение:** „Всичко безплатно“ + тежък AI трафик не се съчетава дългосрочно — планирайте **минимален платен слой** за DB и API, щом имате потребители.

## Препоръчана конфигурация за старт (този репо)

1. **Render** — backend (FastAPI) + env `DATABASE_URL`, `MISTRAL_API_KEY`, …  
2. **PostgreSQL** — същият Render add-on или **Neon** connection string.  
3. **Clerk** — frontend ключове + backend JWKS.  
4. **По желание:** **R2** за uploads; **SSE** или **Ably** за realtime; **Stream** за видео.

## Сигурност (кратко)

- Секрети само в **environment** на платформата, не в git.  
- За storage: **presigned URLs** с кратък TTL за качване/четене.  
- За realtime: **token** с кратък живот, издаден от бекенда след проверка на Clerk JWT.

---

Обобщение на стека: [PLATFORM.md](./PLATFORM.md) · Postgres: [POSTGRES.md](./POSTGRES.md) · Multi AI Teachers: [MULTI_AI_TEACHERS.md](./MULTI_AI_TEACHERS.md) · LangChain + векторни БД: [LANGCHAIN_VECTOR_DB.md](./LANGCHAIN_VECTOR_DB.md) · R2 файлово хранилище: [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · Глас (TTS): [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md) · Vision (Roboflow): [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md) · Бекенд команди: [../backend/README.md](../backend/README.md)
