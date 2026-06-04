# Production AI stack — AgriNexus

Препоръчителна конфигурация за **production**: силни LLM, качествени embeddings за български, Supabase като векторно + релационно хранилище, LangGraph за оркестрация, **Postgres + Redis** за памет и кеш.

---

## 1. Компоненти (резюме)

| Слой | Избор | Защо |
|------|--------|------|
| **LLM** | **Grok** (xAI) / **Claude 3.5 Sonnet** / **GPT-4o** | Качество на рассъждение, многоезичност, контрол на разходи чрез избор на модел. |
| **Embeddings** | **`intfloat/multilingual-e5-large`** | Силен за **български + английски**; ползва се в `ai/rag/embeddings.py` и в `rag/build_academy_rag.py`. |
| **Vector DB** | **Supabase (Postgres + pgvector)** | Един доставчик за auth, DB и vector extension; pooler URL за сървърни приложения. |
| **Orchestration** | **LangGraph** | Stateful графове: tutor (`app/tutor/minimal_graph.py`), дебат (`rag/debate_graph.py`), legacy `rag/main_tutor_graph.py`. |
| **Memory** | **Postgres** (дълготрайни профили, история, audit) + **Redis** (сесии, rate cache, LangGraph checkpoint опционално) | Postgres вече е в стека; Redis — следваща стъпка за TTL и бързи ключове. |

Принципът **Academy-First** остава: RAG и източници преди „свободни“ съвети — виж [`AI-ARCHITECTURE.md`](./AI-ARCHITECTURE.md).

---

## 2. LLM: Grok / Claude / GPT-4o

### 2.1 Конфигурация в проекта

`rag/core/llm.py` избира доставчик чрез **`LLM_PROVIDER`**:

| `LLM_PROVIDER` | Ключ / променливи | Бележки |
|-----------------|-------------------|---------|
| `openai` (по подразбиране) | `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL` (напр. `gpt-4o`) | Съвместим с всички LangChain възли. |
| `xai` или `grok` | `XAI_API_KEY` или `GROK_API_KEY`, опционално `XAI_API_BASE`, `XAI_CHAT_MODEL` | OpenAI-съвместим API на xAI (`https://api.x.ai/v1`). |
| `anthropic` | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Нужен пакет `langchain-anthropic`; при липса — fallback към OpenAI. |

За **production** задай изрично модел (пример): `OPENAI_CHAT_MODEL=gpt-4o`, `ANTHROPIC_MODEL=claude-3-5-sonnet-20241022`, `XAI_CHAT_MODEL=grok-2-latest` (имената да съвпадат с актуалната документация на доставчика).

### 2.2 Разходи и fallback

- За dev може да остане по-малък модел (`gpt-4o-mini`).  
- При липсващ ключ `get_llm()` връща placeholder обект (както досега), за да не пада импортът на графовете.

---

## 3. Embeddings: multilingual-e5-large

- LangChain слой: `apps/backend/ai/rag/embeddings.py` — HF модел по подразбиране `intfloat/multilingual-e5-large`.  
- Нужни пакети: `langchain-huggingface`, `sentence-transformers` (виж коментари в `requirements.txt`).  
- Лекият ingest в `ai/` може да ползва OpenAI embeddings; **не смесвай** различни embedding модели в една и съща PGVector колекция без преиндексиране.

Променливи: `RAG_HF_EMBED_MODEL`, `RAG_HF_DEVICE`, `RAG_EMBED_CACHE`.

---

## 4. Vector DB: Supabase (pgvector)

- **Connection string:** pooler на Supabase (IPv4) или директен Postgres — същият DSN за приложението и за LangChain `PGVector`.  
- Разширение: `create extension vector` (SQL в Supabase или миграция `migrations/002_ai_course_chunks.sql` за `ai_course_chunks`).  
- LangChain колекции: `RAG_LC_COLLECTION` / legacy `academy_tutor_v1` в `build_academy_rag.py` — дръж една колекция на embedding модел.

---

## 5. Orchestration: LangGraph

| Граф | Файл | Назначение |
|------|------|------------|
| Минимален tutor | `app/tutor/minimal_graph.py` | `POST /api/tutor/graph` |
| Deep Debate | `rag/debate_graph.py` | Market → Risk → Crop → Critic → Orchestrator |
| Разширен (legacy) | `rag/main_tutor_graph.py` | По-голям pipeline при нужда |

LangGraph е **stateful** — `thread_id` в конфиг (виж `ask_with_debate` в `debate_graph.py`).

---

## 6. Memory: Postgres + Redis

### 6.1 Postgres (вече налично)

- Профили, курсове, webhook логика, опционално **conversation rows** (таблица `tutor_messages` или аналог — по избор).  
- LangGraph **Postgres checkpointer** може да персистира state (отделна интеграция).

### 6.2 Redis (препоръчително за production)

| Употреба | Пример |
|----------|--------|
| Сесия / кратък контекст на чат | `session:{user_id}` с TTL 24h |
| Кеш на RAG retrieval | ключ по hash на (query + filters) |
| Rate limit / distributed lock | заедно със SlowAPI или заместване на in-memory |

Променлива: **`REDIS_URL`**. Клиентът **`redis`** е в `apps/backend/requirements.txt`. При зададен URL и **`ACADEMY_RAG_CACHE_ENABLED`** (по подразбиране true) **`RAGEngine.retrieve` / `aretrieve`** кешират JSON пакети (виж `app/core/cache.py`, `ai/rag/rag_cache_serde.py`). Инвалидиране: **`RAGCacheManager`** или смени **`ACADEMY_RAG_CACHE_BUMP`**.

---

## 7. Минимален checklist пред prod

- [ ] `DATABASE_URL` към Supabase + pgvector активиран.  
- [ ] `LLM_PROVIDER` + съответният API ключ; тест на един реален tutor/debate заявка.  
- [ ] Embeddings: или HF e5 за LangChain колекция, или OpenAI за `ai_course_chunks` — един източник на истина на колекция.  
- [ ] `REDIS_URL` и политика за TTL на сесии (когато имплементираш).  
- [ ] Лимити и auth: `AUTH_REQUIRED_FOR_TUTOR`, rate limits, secrets извън git.

---

## 8. Връзка с други документи

- [`AI_MODULE.md`](./AI_MODULE.md) — RAG ingest, `ai.pipeline`, `ai/rag` LangChain слой.  
- [`AI-ARCHITECTURE.md`](./AI-ARCHITECTURE.md) — модулна карта и Mermaid.
