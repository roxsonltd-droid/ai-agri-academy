# LangChain + векторни бази: Pinecone и Weaviate

Този документ обяснява къде участва **LangChain** в AI Agro Academy, как работи **векторното търсене** днес и как **Pinecone** и **Weaviate** се вписват като избор за продукция.

## LangChain в този проект

| Компонент | Употреба | Файл / пакет |
|-----------|----------|--------------|
| **Chat / embeddings** | `ChatMistralAI`, `MistralAIEmbeddings` | `langchain-mistralai` (`requirements.txt`) |
| **Съобщения** | `SystemMessage`, `HumanMessage` | `langchain_core` (транзитивно + в `requirements-ai.txt`) |
| **RAG (файлов режим)** | Embeddings + cosine similarity в паметта | `core/rag.py` — **без** отделна векторна БД |
| **LangGraph** | Агентски граф | `agents/graph.py` — опционално `requirements-ai.txt` |

Тоест **LangChain** вече обвива **Mistral** за текст и embeddings; **ретривълът** в режим `files` е custom NumPy, не `VectorStore` на LangChain.

## Защо векторна база (vector DB)

- **Мащаб:** десетки хиляди+ чанкове — държането им в RAM на един контейнер (както в `core/rag.py`) става тежко и бавно при cold start.
- **Филтри:** metadata (`course_id`, `topic`, `teacher_specialization`) — Pinecone и Weaviate поддържат **филтрирано** търсене.
- **Устойчивост:** индексът живее извън процеса на API; множество инстанси на FastAPI четат същия индекс.

## Pinecone (текущ интегриран път)

- **Как е свързано:** `PLATFORM_RAG_BACKEND=llamaindex` → `rag_facade` вика `rag/llamaindex_pinecone.py`.
- **Стек:** **LlamaIndex** `PineconeVectorStore` + **OpenAI** `text-embedding-3-small` (вижте кода — ключ `OPENAI_API_KEY`).
- **Пакети:** `llama-index-vector-stores-pinecone`, `pinecone[grpc]` в `requirements-ai.txt`.
- **Плюсове:** управляван SaaS, малко ops, добър за бърз старт и serverless индекси.
- **LangChain директно:** алтернатива е `langchain_pinecone.PineconeVectorStore` + `langchain_core.vectorstores` — полезно, ако искате **един** абстрактен слой само с LangChain (напр. за tools в LangGraph без LlamaIndex).

## Weaviate

- **Какво е:** векторна база с **GraphQL/REST API**, силна поддръжка на **hybrid** търсене (BM25 + вектор), обекти със схема (classes/properties).
- **Варианти:** **Weaviate Cloud**, **self-hosted** (Docker/K8s).
- **LangChain:** интеграция чрез пакета **`langchain-weaviate`** (или общностни вектор store обвивки — проверете версията спрямо LangChain 0.3.x).
- **Кога Weaviate пред Pinecone:** нужда от **hybrid search** извън кутията, ясна **схема** на обекти в един клъстър, on-prem / EU data residency с self-host.

### Примерна конфигурация (бъдеща имплементация)

В `.env` (не са окачени в `config.py` днес):

```env
# Пример за бъдещ Weaviate path
# PLATFORM_RAG_BACKEND=weaviate
# WEAVIATE_URL=https://your-cluster.weaviate.network
# WEAVIATE_API_KEY=...
```

Имплементационна стъпка: нов модул `rag/langchain_weaviate.py` (или `rag/weaviate_retriever.py`) и клон в `rag_facade.retrieve_for_prompt` редом с `llamaindex` / `files`.

## Сравнение накратко

| Критерий | In-memory (`files`) | Pinecone (чрез LlamaIndex) | Weaviate |
|----------|---------------------|----------------------------|----------|
| Ops | Нулеви | Нисък (managed) | Среден (cloud) до висок (self-host) |
| Cold start | Преизгражда индекс | Бърз query към облака | Зависи от deployment |
| Metadata filter | Възможно в код | Да | Да |
| Hybrid (ключови думи + вектор) | Ръчно/BM25 отделно | Опции по план/API | Силна native поддръжка |
| Текущ код | Да | Да (`llamaindex`) | Не |

## Препоръчителна стратегия за този репо

1. Запазете **`files`** за dev и безплатни квоти без Pinecone.  
2. Използвайте **`llamaindex` + Pinecone** за продукционен векторен RAG (вече окачен).  
3. Добавете **Weaviate** само ако имате конкретен изискван hybrid / схема / residency — като **трети** backend в `rag_facade`, не като заместител на LangChain.

## LangGraph + retriever tool

За multi-teacher агентите (`docs/MULTI_AI_TEACHERS.md`) удобен модел е **един** retriever интерфейс (напр. LangChain `Runnable` или LlamaIndex query engine), който зад кулисите вика Pinecone **или** Weaviate според `PLATFORM_RAG_BACKEND`.

---

Свързано: [PLATFORM.md](./PLATFORM.md) · [POSTGRES.md](./POSTGRES.md) (pgvector като алтернатива в Postgres) · [MULTI_AI_TEACHERS.md](./MULTI_AI_TEACHERS.md) · `backend/core/rag_facade.py` · `backend/rag/llamaindex_pinecone.py`
