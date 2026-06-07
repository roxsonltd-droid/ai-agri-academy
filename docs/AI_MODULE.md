# AI module (`apps/backend/ai`)

Пълната архитектурна визия (Tutor, агенти, дебат, Mermaid): **[`AI-ARCHITECTURE.md`](./AI-ARCHITECTURE.md)**.  
Production stack (LLM, embeddings, Supabase, LangGraph, Postgres+Redis): **[`AI-PRODUCTION-STACK.md`](./AI-PRODUCTION-STACK.md)**.

Lightweight RAG over Academy Markdown: chunk files under `content/academy/courses`, embed with OpenAI, store vectors in Postgres via **pgvector** (Supabase-compatible), retrieve with cosine distance.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` or `POSTGRES_CONNECTION_STRING` | Postgres (enable **vector** extension in Supabase). |
| `OPENAI_API_KEY` | Embeddings + query vectors. |
| `OPENAI_API_BASE` | Optional API base (default OpenAI). |
| `OPENAI_EMBED_MODEL` | Default `text-embedding-3-small`. |
| `AI_EMBEDDING_DIMENSIONS` | Must match model (default `1536`). |
| `AI_CHUNKS_TABLE` | Table name, default `ai_course_chunks`. |
| `ACADEMY_CONTENT_ROOT` | Override path to Markdown courses. |
| `ACADEMY_RAG_BACKEND` | `auto` \| `ai` \| `file` \| `pg` — see `rag/retriever.py`. |

## Schema

Run `migrations/002_ai_course_chunks.sql` in the Supabase SQL editor, or let ingest call `ensure_schema` on first run.

## Ingest

From `apps/backend` (so `import ai` resolves):

```bash
python -m ai --truncate --verbose
```

`--truncate` clears the table before a full refresh. Tune `--batch-size` (default 32) for OpenAI rate limits.

## Runtime

`AiCourseRAG` (`ai.pipeline`) uses vector search when the table has rows and keys are set; otherwise it falls back to an in-memory TF–IDF index over the same Markdown files.

## Tutor & Deep Debate

- **`POST /api/tutor/chat`** — RAG context + един LLM отговор (`rag/tutor_router.py` + `get_retriever()`). Тяло: опционално `experience`, `farm_size_ha`, `tutor_role` (`main` \| `expert` \| `mentor` \| `examiner`) — промптът минава през `ai/tutors/prompts.py` (**AgriTutor** persona).
- **`POST /api/tutor/graph`** — LangGraph (`app/tutor/minimal_graph.py`): приема `profile` (dict) и `tutor_role`; Mistral system prompt използва `PersonalTutor` + същите роли.
- **`POST /api/tutor/deep-debate`** — единичен проход (без рундов цикъл): `rag/debate_graph.py` + същият retriever; отговорът включва **`sources`**.
- **`POST /api/debate/run`** — **много-рундов** LangGraph дебат (`ai/debate/`): Market → Risk → Crop → Critic → при нужда нов рунд → Orchestrator. Същият feature flag **`tutor.deep_debate`**, `max_rounds` 1–8 (default 3).
- **`POST /api/react/run`** — ReAct **tool-calling** агент (`ai/agents/react/`): Open-Meteo време, опционално `yfinance` за CME референции, **`search_academy_knowledge`** → `ai/tools/rag_tool.py` (`RAGEngine` / legacy retriever, `REACT_RAG_MODE`). Опционално **`search_academy_knowledge_compressed`** (`FEATURE_REACT_RAG_COMPRESSED`, `ai/rag/compression.py` — LLM contextual compression след retrieval). Feature flag **`tutor.react_tools`** (`FEATURE_TUTOR_REACT_TOOLS`).

Next.js прокси: `apps/web/src/app/api/tutor/chat` и `apps/web/src/app/api/tutor/deep-debate` → `API_URL` / бекенд. Patterns за агенти: [`MULTI-AGENT-COLLABORATION.md`](./MULTI-AGENT-COLLABORATION.md).

## LangChain слой: `apps/backend/ai/rag/`

Опционален **LangChain + PGVector** pipeline (отделен от лекия `ai.pipeline`):

| Файл | Роля |
|------|------|
| `ai/rag/embeddings.py` | HF `multilingual-e5-large` при инсталиран `langchain-huggingface`; иначе OpenAI embeddings. |
| `ai/rag/loaders.py` | Markdown (+ PDF) от `ACADEMY_RAG_ROOT` (по подразбиране `content/academy`). Без `unstructured` — fallback към четене на `.md`. |
| `ai/rag/chunker.py` | ``get_chunker()`` — ``ACADEMY_CHUNK_STRATEGY``: ``recursive`` \| ``semantic`` \| ``smart`` \| ``hierarchical`` (виж ``ai/rag/chunkers/``). |
| `ai/rag/chunkers/` | ``AgriSemanticChunker``, ``AgriSmartChunker``, ``HierarchicalChunker`` (parent+child), ``LLMSemanticChunker``. |
| `ai/rag/retrievers/parent_child.py` | ``ParentChildRetriever`` — търсене по ``chunk_type=child``, контекст от съответните parent редове. Включва се с ``ACADEMY_RETRIEVAL_MODE=parent_child`` в ``RAGEngine.retrieve``. |
| `ai/rag/engine.py` | `RAGEngine`: `RAG_VECTOR_BACKEND=pgvector` (default) към PGVector колекция; `supabase` към `SupabaseVectorStore` + RPC `match_documents` или `match_academy_documents` (таблица `academy_documents`). `retrieve(..., filter=…)` за metadata `@>`. |
| `ai/vector_store/filters.py` | `build_agri_vector_metadata_filter` — ключове за LangChain `similarity_search(..., filter=)`. |
| `ai/rag/supabase_vector.py` | `SupabaseVectorConfig` (ниско ниво); за приложен код предпочитай `ai/vector_store/`. |
| `ai/vector_store/` | `VectorStoreConfig`, `VectorStoreService` — Supabase ingest, similarity, ingest скрипт `scripts/ingest_academy.py`. |
| `ai/rag/retriever.py` | Similarity / MMR retriever; `HybridRetriever` — място за бъдещ BM25 hybrid. |
| `ai/rag/compression.py` | `AgriContextualCompressor` — широк `similarity_search` + LLM извличане на релевантни откъси; ReAct при `FEATURE_REACT_RAG_COMPRESSED`. |
| `ai/tutors/` | `PersonalTutor`, `TutorRole`, `TEACHER_PROMPT`, `build_academy_rag_tutor_prompt` — persona + мулти-роля за `/api/tutor/chat` и `/api/tutor/graph`. |

Пример:

```python
from ai.rag import RAGEngine, get_similarity_retriever

engine = RAGEngine()
engine.initialize()

retriever = get_similarity_retriever(engine, k=7)
docs = retriever.invoke("Въпрос към Academy")
```

## Chunking стратегии (Academy)

- **Recursive** (default): бързо и предвидимо; риск от разрязване на смислови блокове между чънкове.
- **Semantic** (`ACADEMY_CHUNK_STRATEGY=semantic`): embedding-базирани граници чрез `langchain_experimental.text_splitter.SemanticChunker`; при липса на пакет или грешка се ползва същият recursive fallback като в `AgriSemanticChunker`.
- **Smart** (`ACADEMY_CHUNK_STRATEGY=smart`): като semantic + metadata `importance` (`high` при ключови думи: торене, пръскане, сеитба, болест и др.).
- **Hierarchical** (`ACADEMY_CHUNK_STRATEGY=hierarchical`): parent секции + child чънкове; metadata `parent_id`, `hierarchical_group_id`, `chunk_type`. Ingest: `python scripts/ingest_academy.py --hierarchical` или `scripts/ingest_hierarchical.py`.
- **Parent–child retrieval** (`ACADEMY_RETRIEVAL_MODE=parent_child`): similarity върху child редове, контекст за LLM от съответните parent текстове; при липса на child попадения — flat fallback. Изисква ingest с hierarchical чънкове.
- **LLM** (отделно): `LLMSemanticChunker.chunk_document` — по-високо качество и цена; не е включен в `get_chunker()` по подразбиране.

По желание: `MarkdownHeaderTextSplitter` като предварителен слой преди semantic/hierarchical за много дълги курсове.

Env: `RAG_VECTOR_BACKEND` (`pgvector` \| `supabase`), `RAG_LC_COLLECTION` (default `ai_agri_academy`), `ACADEMY_RAG_ROOT`, `DATABASE_URL` / `POSTGRES_CONNECTION_STRING`. За Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, SQL миграция `apps/backend/migrations/003_supabase_vector_documents.sql` (dim 1024 за e5-large); опционално `004_academy_documents_vector.sql` за отделна таблица `academy_documents`. `VECTOR_STORE_TABLE` / `VECTOR_STORE_MATCH_FN` override на таблица и RPC. За HF embeddings: `pip install langchain-huggingface sentence-transformers`.

## Metadata филтри (Supabase)

- При ingest `ai/rag/loaders.py` попълва `course`, `module`, `region`, `difficulty`, `language`, `source` / `source_type`, `last_updated` (mtime), за да работи containment филтърът.
- ReAct инструментът `search_academy_knowledge` приема опционално `culture` (мапва се към `course`), `region`, `module`, `difficulty` → `RAGEngine.retrieve(..., filter=…)`.
- В Postgres RPC филтърът е `metadata @> filter` — всички подадени ключ–стойности трябва да присъстват в JSON на реда.
