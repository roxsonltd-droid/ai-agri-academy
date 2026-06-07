# RAG: Evaluation & Observability

Кратък наръчник за **оценка (evaluation)** и **наблюдаемост (observability)** в AI Agro Academy / AgriNexus backend.

## Observability (какво има днес)

| Механизъм | Къде | Какво дава |
|-----------|------|------------|
| **Структуриран RAG hit log** | `core/rag.py` | При `RAG_LOG_RETRIEVAL=true` в `.env` се логва `source` + `score` за всеки top-k hit (ниво INFO). |
| **Източници в API** | `retrieve_for_prompt_bundle` → `POST /api/v1/chat` | Поле `rag_sources[]` (`source`, `score`, `preview`) за UI/алерти без да парсвате prompt текста. |
| **Платформен статус** | `GET /api/v1/platform/status` | `rag_retrieval_logging`, `chat_rate_limit_per_minute`, `llm_max_output_tokens`, `rag_backend`, `mistral_configured`, … |
| **Feedback от потребители** | `POST /api/v1/feedback/tutor` | Сигнал „полезно / не“ + коментар за подобряване на prompts (таблица `tutor_feedback`). |
| **FastAPI / Uvicorn** | стандартно | Access logs, stack traces при 500. |

### LangSmith (LangChain / Mistral chains)

Не се комитират ключове. В **deployment** env:

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=...your_langsmith_key...
# опционално: LANGCHAIN_PROJECT=agro-academy-backend
```

След това извикванията през **LangChain** (`ChatMistralAI`, embeddings, LangGraph при наличен пакет) могат да се виждат в LangSmith (трасове, latency, prompts). Проверете версиите на `langchain-mistralai` / `langgraph` спрямо [LangSmith docs](https://docs.smith.langchain.com/).

**Helicone + Grafana** (LLM gateway / cost + платформени метрики и логове): **[OBSERVABILITY_HELICONE_GRAFANA.md](./OBSERVABILITY_HELICONE_GRAFANA.md)**.

### OpenTelemetry (бъдещо)

За **единен** trace през FastAPI → RAG → HTTP клиенти: добавете `opentelemetry-instrumentation-fastapi` + exporter (OTLP към Grafana Tempo, Jaeger, Datadog). В момента **няма** вграден OTel в `requirements.txt` — виж checklist в [AI_ENHANCEMENTS_ROADMAP.md](./AI_ENHANCEMENTS_ROADMAP.md).

### Production checklist

- Централизирани логове (Render/CloudWatch/Datadog) + **alert** при ръст на 429/5xx на `/api/v1/chat`.
- **Rate limit** извън процеса при ≥2 реплики: Redis или edge (Cloudflare) — in-memory лимитът в `core/simple_rate_limit.py` не е споделен между инстанции.

---

## Evaluation (оценка)

### 1) Retrieval-only (без LLM) — препоръчителен първи стъпки

Цел: дали **правилният файл/източник** попада в top-k при типични заявки.

- Скрипт: **`backend/scripts/rag_retrieval_eval.py`** (виж по-долу).
- Формат на golden set: JSON масив от обекти:

```json
[
  {
    "query": "какво е точно земеделие",
    "any_source_contains": ["agro", "README"],
    "min_sources": 1
  }
]
```

Метрика: **hit** ако поне един от `sources[].source` съдържа някоя от поднизовете в `any_source_contains` (case-insensitive). Отчита се `hits / total`.

Изпълнение (от папка `backend/`, с активиран venv и `MISTRAL_API_KEY` за embeddings):

```bash
python scripts/rag_retrieval_eval.py rag_eval_golden.example.json
python scripts/rag_retrieval_eval.py path/to/my_golden.json
```

### 2) LangSmith + RAGAS (end-to-end quality)

**LangSmith** и **RAGAS** решават различни задачи, но се комбинират добре:

| Инструмент | Роля |
|------------|------|
| **LangSmith** | Трасове, latency, prompts и (по избор) **datasets / human feedback** за продукционни или staging извиквания на LangChain (`ChatMistralAI`, embeddings, LangGraph). |
| **RAGAS** | **Офлайн метрики** върху таблица от примери: faithfulness, answer_relevancy, context_precision, context_recall и др. — често с отделен „judge“ LLM. |

#### LangSmith (наблюдение по време на разработка / staging)

В `.env` на **`backend/`** (не комитирайте ключове):

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_...   # от LangSmith → Settings → API Keys
LANGCHAIN_PROJECT=agro-academy-backend
```

Стартирайте `uvicorn main:app` — извикванията през **LangChain** в този процес се изпращат към LangSmith, ако версиите на пакетите поддържат tracing (вижте [LangSmith tracing](https://docs.smith.langchain.com/)).

#### RAGAS (батч оценка)

1. **Изолирана среда** (препоръчително): RAGAS често дърпа по-нов `langchain-core` от този в основния `requirements.txt`.  
   - Вариант A: отделен venv + `pip install -r requirements.txt -r requirements-eval.txt` и при конфликт ползвайте само `requirements-eval.txt` + минимален набор за вашия eval скрипт.  
   - Вариант B: експериментите под **`apps/backend/rag/`** с техен `requirements` (ако поддържате този път).

2. **Ключове за judge LLM**: RAGAS метриките често изискват **`OPENAI_API_KEY`** или конфигуриран Mistral/OpenAI през LangChain — вижте текущата [RAGAS документация](https://docs.ragas.io/) за `evaluate()` и `RunConfig`.

3. **Свързване с реалния RAG** вместо фиктивен контекст: в `evaluate_dataset` подайте:
   - `contexts` = списък от низове от `retrieve_for_prompt_bundle(q).prompt_block` или от `sources[].preview`;
   - `answer` = отговор от `ask_agromind(q).reply` (или запис от staging);
   - `ground_truth` = очакван факт от golden JSON.

4. **LangSmith + RAGAS заедно**: пуснете RAGAS скрипта със същите `LANGCHAIN_*` променливи — много judge извиквания минават през LangChain и ще се появят в LangSmith като дъщерни runs (удобно за дебъг на ниски context_recall стойности).

#### Примерна команда (след адаптиране на `apps/backend/rag/run_evaluation.py`)

От папката **`apps/backend/`** (виж `requirements.txt` там за `ragas` / `datasets`):

```bash
# Windows PowerShell:
$env:LANGCHAIN_TRACING_V2="true"
$env:LANGCHAIN_API_KEY="lsv2_pt_..."
python rag/run_evaluation.py
```

Резултатите от примера в репото се записват в **`ragas_evaluation_results.csv`** (в текущата работна директория).

### 4) Human eval

- Бутони в UI към **`POST /api/v1/feedback/tutor`**.
- Периодичен преглед на ниски `helpful=false` + коментари.

### 5) CI

- Закачете `python scripts/rag_retrieval_eval.py` в GitHub Actions **само** ако job-ът има `MISTRAL_API_KEY` secret (иначе пропуснете или mock-нете).

---

## Връзки

- Архитектура RAG ingestion/retrieval: имплицитно в **`core/rag.py`**, **`core/rag_facade.py`**, **`api/knowledge.py`**.  
- Пълен backlog: **[AI_ENHANCEMENTS_ROADMAP.md](./AI_ENHANCEMENTS_ROADMAP.md)**.  
- Опционални eval пакети: **`backend/requirements-eval.txt`** (LangSmith + RAGAS — отделен venv препоръчително).  
- Академия RAG дизайн (хибрид, филтри): **[ACADEMY_RAG_ARCHITECTURE.md](./ACADEMY_RAG_ARCHITECTURE.md)**.
