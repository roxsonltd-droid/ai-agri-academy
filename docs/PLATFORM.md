# AI Agro Academy — платформен стек

Цел: **AI-first** образователна платформа с ясни граници между слоевете и възможност за поетапен deploy.

## Слоеве

| Част | Технология | Роля |
|------|------------|------|
| Frontend | **Next.js** (App Router) | Уеб клиент, SSR/ISR където има смисъл |
| UI | **Tailwind CSS 4** + **ShadCN UI** (Radix + `cva`) | [Дизайн система](../ai-agro-academy/docs/DESIGN_SYSTEM.md) — `@theme` в `globals.css` |
| Backend | **FastAPI** | REST API, AI оркестрация, webhooks |
| Database | **PostgreSQL** | Потребители, курсове, метаданни (продукция) — виж [POSTGRES.md](./POSTGRES.md) |
| Auth | **Clerk** | Сесии, социални входове, JWT за бекенд — [CLERK.md](./CLERK.md) |
| AI Agents | **LangGraph** | Multi-agent, оркестрация, отделни учители — [MULTI_AI_TEACHERS.md](./MULTI_AI_TEACHERS.md) |
| RAG | **LlamaIndex** | Pinecone / бъдещ Weaviate, LangChain embeddings — [LANGCHAIN_VECTOR_DB.md](./LANGCHAIN_VECTOR_DB.md), мултимодалност: [AI_MULTIMODAL.md](./AI_MULTIMODAL.md) |
| Vector DB | **Pinecone** (Weaviate опция) | Embeddings + similarity — [LANGCHAIN_VECTOR_DB.md](./LANGCHAIN_VECTOR_DB.md) |
| Mobile | **React Native** (Expo) | iOS/Android към същия API |
| Video | **Cloudflare Stream** | Качване/playback на уроци — [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md), система за обучение: [VIDEO_LEARNING_SYSTEM.md](./VIDEO_LEARNING_SYSTEM.md) |
| Файлово хранилище | **Cloudflare R2** | PDF, assets, транскрипти, TTS кеш — [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) |
| Voice (TTS) | **ElevenLabs** | Синтез на реч през бекенд — [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md) |
| Vision (CV) | **Roboflow** | Детекция / класификация през Serverless v2 — [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md) |

Преглед на **облак, auth, storage, realtime и free tier**: [CLOUD_BACKEND.md](./CLOUD_BACKEND.md).

## Локална среда

1. **PostgreSQL** — `docker compose up -d` от корена на репото (`Academy/`). Настройка и URL: [POSTGRES.md](./POSTGRES.md). Миграции: [ALEMBIC.md](./ALEMBIC.md).
2. **Backend** — `DATABASE_URL=postgresql+psycopg2://...` в `backend/.env`.
3. **Clerk** — създайте приложение на [clerk.com](https://clerk.com), копирайте ключовете в `ai-agro-academy/.env.local`.
4. **Pinecone + LlamaIndex** — `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, за embeddings по подразбиране `OPENAI_API_KEY` (вижте `backend/rag/llamaindex_pinecone.py`; може да се смени към Mistral embeddings).
5. **Cloudflare Stream** — акаунт Stream, API token — вижте [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md); видео йерархия и прогрес: [VIDEO_LEARNING_SYSTEM.md](./VIDEO_LEARNING_SYSTEM.md).

## Поетапна миграция

1. PostgreSQL заменя SQLite (`DATABASE_URL`).
2. Clerk: `NEXT_PUBLIC_CLERK_ENFORCE=true` след като бекендът валидира Clerk JWT (`CLERK_JWKS_URL`).
3. RAG: `PLATFORM_RAG_BACKEND=llamaindex` при налични Pinecone + embeddings.
4. LangGraph: разширете `backend/agents/graph.py` с инструменти и **multi-teacher** граф — [MULTI_AI_TEACHERS.md](./MULTI_AI_TEACHERS.md).
5. **Multimodal (voice + vision):** вижте [AI_MULTIMODAL.md](./AI_MULTIMODAL.md); **TTS:** [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md); **CV inference (Roboflow):** [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md).
6. Mobile: `cd mobile && npm install && npx expo start`.

## Сигурност

- Не комитирайте `.env`.
- Cloudflare Stream: подписани URL-и с кратък TTL.
