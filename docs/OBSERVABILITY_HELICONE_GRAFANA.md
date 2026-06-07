# Observability: Helicone + Grafana

Как **Helicone** и **Grafana** се допълват в типичен AgriNexus / FastAPI + LLM setup, без да заменят напълно LangSmith (ако го ползвате за LangChain traces).

## Роли

| Слой | Инструмент | Какво покрива |
|------|--------------|----------------|
| **LLM / gateway** | [Helicone](https://docs.helicone.ai/) | Заявки към LLM: латентност, токени, разход, кеш, rate limits, **custom properties** (user_id, route, environment). AI Gateway маршрутизира към много доставчици през един OpenAI-съвместим интерфейс. |
| **Платформа** | [Grafana](https://grafana.com/) stack | HTTP/API метрики, логове, (по избор) distributed traces — вашият FastAPI, DB, reverse proxy, не само LLM. |

Helicone е **най-силен** около outbound LLM повикванията. Grafana е **централното табло** за „целия“ сервиз (SLO, алерти, корелация).

---

## Helicone

### Вариант 1: AI Gateway (OpenAI-съвместим клиент)

Подходящ, ако сте готови да маршрутизирате през gateway с **`langchain_openai.ChatOpenAI`** (отделен dependency от текущия `langchain_mistralai.ChatMistralAI` в `backend/`).

Официално ръководство: [LangChain + Helicone AI Gateway](https://docs.helicone.ai/gateway/integrations/langchain).

Пример (Python, концептуално):

```python
from langchain_openai import ChatOpenAI
import os

llm = ChatOpenAI(
    model="mistral/mistral-large-latest",
    api_key=os.environ["HELICONE_API_KEY"],
    base_url="https://ai-gateway.helicone.ai/v1",
    default_headers={
        "Helicone-Session-Id": "<session>",
        "Helicone-User-Id": "<user>",
        "Helicone-Property-Route": "/api/v1/chat",
    },
)
```

- **`HELICONE_API_KEY`** — от Helicone dashboard (не се комитира).
- **Provider keys** (Mistral/OpenAI) се управляват в Helicone (gateway), не във всеки pod — по-малко разпръскване на секрети.

Проверете актуалния **base URL**, **header имена** и **имена на модели** в [Helicone docs](https://docs.helicone.ai/).

### Вариант 2: Оставате на `ChatMistralAI` (директно към Mistral)

Текущият `backend` използва **`langchain_mistralai.ChatMistralAI`** + `MISTRAL_API_KEY`. Helicone **директен** Mistral proxy може да изисква отделна интеграция (async SDK / custom HTTP) — проследете дали Mistral endpoint-ът ви се поддържа като **Helicone-Target-** стил proxy; иначе ползвайте **Вариант 1** за унифициран observability.

### Корелация с Grafana

Подавайте стойности, които после търсите в логовете:

- `Helicone-User-Id`, `Helicone-Session-Id`
- `Helicone-Property-Request-Id: <uuid>` — същият `request_id`, който логвате във FastAPI (structured JSON log).

Така в **Loki** филтрирате по `request_id` и в **Helicone** по същото property.

---

## Grafana stack (препоръчителна комбинация)

| Компонент | Назначение |
|-----------|------------|
| **Prometheus** | Метрики: RPS, latency histogram, 5xx rate, `process_resident_memory_bytes`, custom `rag_retrieval_seconds`. |
| **Loki** | Логове: JSON от Uvicorn/Gunicorn + `request_id`, `route`, `user_id` (без PII излишък). |
| **Promtail** / **Grafana Agent** | Събира логове от VM/Kubernetes към Loki. |
| **Tempo** (по избор) | Traces: OTLP от OpenTelemetry-instrumented FastAPI + outbound HTTP. |
| **Grafana** | Dashboards + алерти (Alertmanager / Grafana unified alerting). |

### FastAPI

- **Метрики:** [`prometheus-fastapi-instrumentator`](https://github.com/trallnag/prometheus-fastapi-instrumentator) или ръчни counters за `/api/v1/chat`.
- **Логове:** структуриран JSON (`python-json-logger`), един `request_id` middleware.
- **Traces:** OpenTelemetry SDK + OTLP exporter към Tempo (вж. секция OTel в [RAG_EVAL_AND_OBSERVABILITY.md](./RAG_EVAL_AND_OBSERVABILITY.md)).

### Корелация Helicone ↔ Grafana

1. Генерирайте **`request_id`** в middleware (UUID).
2. Подайте го като **`Helicone-Property-Request-Id`** (или друго property по конвенция) при LLM извикване.
3. Логнете същия `request_id` във FastAPI access/error лог → **Loki**.
4. В Grafana: панел по `request_id` + линк към Helicone filter (ручно или с documented URL pattern).

---

## Сравнение с LangSmith

| | LangSmith | Helicone | Grafana |
|---|-----------|----------|---------|
| LangChain native traces | Отлично | Частично (gateway / headers) | Само ако експортирате OTel → Tempo |
| Разход / токен / LLM dashboard | Да | Да | С custom metrics или от Helicone export |
| Целия HTTP API + DB | Ограничено | Не | Да |

Практично: **LangSmith** за dev/debug на вериги; **Helicone** за cost/latency на LLM в prod; **Grafana** за SLO на услугата и инциденти.

---

## Env checklist (без стойности в git)

```env
# Helicone (ако ползвате gateway)
HELICONE_API_KEY=

# Grafana / OTel (пример)
OTEL_EXPORTER_OTLP_ENDPOINT=https://tempo.example.com:4317
OTEL_SERVICE_NAME=agro-academy-api
```

---

## Връзки в репото

- Общ eval / observability: [RAG_EVAL_AND_OBSERVABILITY.md](./RAG_EVAL_AND_OBSERVABILITY.md)  
- Backlog: [AI_ENHANCEMENTS_ROADMAP.md](./AI_ENHANCEMENTS_ROADMAP.md)

Кодовата база на **`backend/`** още **не** включва автоматичен Helicone или Grafana agent — този файл е **архитектурен наръчник** за интеграция. Ако искате конкретен PR (`HELICONE_*` + optional `ChatOpenAI` path), кажете.
