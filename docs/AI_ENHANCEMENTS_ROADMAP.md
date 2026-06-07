# AI / RAG / LLM — пълен списък подобрения и статус

Този документ обобщава предложенията за платформата и какво е **вече в кода** срещу **следващи стъпки**.

## Вече имплементирано (backend)

| Област | Какво |
|--------|--------|
| **RAG източници** | `retrieve_context_bundle` + `retrieve_for_prompt_bundle` — връща `prompt_block` + `sources[]` (файл, score, preview). `POST /api/v1/chat` връща `rag_sources`. |
| **RAG logging** | `RAG_LOG_RETRIEVAL=true` в env — логва source + score при hit. Виж и [RAG_EVAL_AND_OBSERVABILITY.md](./RAG_EVAL_AND_OBSERVABILITY.md). |
| **LLM guardrails** | По-строг system prompt (агро/образование); `LLM_MAX_OUTPUT_TOKENS` (по подразбиране 2048) за Mistral в `ai_agent`, `courses`, `lab`, LangGraph агент. |
| **LangGraph** | Tool `academy_knowledge_search` (RAG); опит за `MemorySaver` + `thread_id` в `/api/v1/agents/run`. |
| **Rate limit** | `CHAT_RATE_LIMIT_PER_MINUTE` (0 = изкл.) — in-memory по IP за `POST /api/v1/chat`. |
| **Feedback** | `POST /api/v1/feedback/tutor` — запис в таблица `tutor_feedback` (SQLite dev: `create_all`). |
| **Upload safety** | `assert_upload_bytes_safe` — PDF magic, PE/ELF блок, NUL heuristic за .md/.txt. |

## Следващи стъпки (по приоритет)

### RAG и знания

- [ ] **Един източник на истина** за константи между UI (лаборатория) и симулация — частично за Academy lab; разширете към други форми.
- [ ] **pgvector в Postgres** — миграция Alembic, замяна/допълване на in-memory индекса за прод.
- [x] **Retriever eval (минимален)** — offline скрипт `backend/scripts/rag_retrieval_eval.py` + формат golden set; виж [RAG_EVAL_AND_OBSERVABILITY.md](./RAG_EVAL_AND_OBSERVABILITY.md). RAGAS/LLM-judge — отделно.
- [ ] **Кеш на embeddings** за непроменени файлове — намаляване на cold start (вж. `apps/backend/ai/rag/` за идеи).

### LLM и агенти

- [ ] **PostgresSaver / SqliteSaver** за прод LangGraph вместо само `MemorySaver` в RAM.
- [ ] **Structured output** — Pydantic schema за уроци/оценки отделен endpoint.
- [ ] **Допълнителни tools** — метео (Open-Meteo), NPK калкулатор, HTTP към вътрешни курсове по `course_id`.

### Продукт и UX

- [ ] **SSE/WebSocket стрийминг** за tutor отговори — Next.js + FastAPI `StreamingResponse`.
- [ ] **UI за `rag_sources`** във фронта на чата (цитати под отговора).
- [ ] **UI за feedback** — бутони „полезно / не“ към `POST /api/v1/feedback/tutor`.

### Наблюдение и надеждност

- [ ] **LangSmith** — `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_API_KEY` в prod env (без ключове в репото).
- [ ] **OpenTelemetry** — трасове за latency RAG + LLM (или Grafana Tempo — виж [OBSERVABILITY_HELICONE_GRAFANA.md](./OBSERVABILITY_HELICONE_GRAFANA.md)).
- [ ] **Helicone** — LLM gateway / cost dashboard; корелация с `request_id` в логове.
- [ ] **Grafana** (Prometheus + Loki +/или Tempo) — SLO за FastAPI и инфраструктура.
- [ ] **Rate limit в prod** — Redis или gateway (Cloudflare) — in-memory не е достатъчен при много инстанции.

### Инфра и сигурност

- [ ] **Ротация на тайни** — `RAG_UPLOAD_SECRET`, отделни dev/prod ключове; без commit на `.env`.
- [ ] **Антивирус** — ClamAV sidecar или cloud AV след upload, преди `knowledge/uploads`.

## Бързи env променливи

Пълен наръчник: **[RAG_EVAL_AND_OBSERVABILITY.md](./RAG_EVAL_AND_OBSERVABILITY.md)** (LangSmith, OTel, retrieval eval, RAGAS).

| Променлива | Описание |
|------------|----------|
| `LLM_MAX_OUTPUT_TOKENS` | Макс. токени за отговор (Mistral). |
| `RAG_LOG_RETRIEVAL` | `true` — лог на RAG hits. |
| `CHAT_RATE_LIMIT_PER_MINUTE` | Напр. `30` — лимит на IP за 60 s за `/api/v1/chat`; `0` = изкл. |
| `LANGCHAIN_TRACING_V2` | `true` + `LANGCHAIN_API_KEY` за LangSmith (LangChain). |

## API

- `POST /api/v1/chat` — тяло `{ "message": "..." }`, отговор `{ "reply": "...", "rag_sources": [{ "source", "score", "preview" }] }`.
- `POST /api/v1/feedback/tutor` — `{ "helpful": true/false, "comment": "...", "route": "chat" }`.
- `POST /api/v1/agents/run` — опционално `{ "thread_id": "user-123-session" }` за сесийна нишка (с MemorySaver).
