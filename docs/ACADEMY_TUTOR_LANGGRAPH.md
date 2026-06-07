# Academy Tutor (LangGraph + RAG + дебат)

## Какво е

- **RAG:** комбинира съществуващото файлово знание (`backend/knowledge/*.md`, `knowledge/uploads` — вкл. PDF→текст) чрез `retrieve_for_prompt`, плюс **Markdown на уроците** от базата (`Course` / `Module` / `Lesson`).
- **LangGraph:** граф **Tutor → Critic** с условни ръбове: при `VERDICT: REVISE` преподавателят получава забележките и чернова отново; при `APPROVED` или след максимален брой кръгове → **finalize** (синтез на финален отговор, ако последният кръг не е APPROVED).

## API

`POST /api/v1/academy/tutor/debate`

Тяло (JSON):

```json
{
  "message": "Обясни NDVI в контекста на курса",
  "max_debate_rounds": 3
}
```

Отговор: `reply`, `debate_log` (текстови стъпки), `rag_used`.

## Конфигурация (`.env`)

| Променлива | Описание |
|------------|----------|
| `MISTRAL_API_KEY` | Задължително за LLM и embeddings |
| `ACADEMY_LESSON_RAG_TOP_K` | Не — по подразбиране `4` |
| `ACADEMY_DEBATE_MAX_ROUNDS` | Не — макс. оценки от критик преди финал (по подразбиране `3`) |

## Код

- `backend/ai/academy_rag.py` — уроци в БД + обединение с файлов RAG
- `backend/ai/academy_debate_graph.py` — LangGraph `StateGraph`
- `backend/api/academy_tutor.py` — FastAPI router

След **seed** или **генериране на курс** индексът на уроците се нулира (`invalidate_lesson_rag_index`).

## Зависимости

В `requirements.txt` са добавени `langgraph` и `langchain-core` (съвместимост с `langchain-mistralai`). За LlamaIndex/Pinecone допълнително: `pip install -r requirements-ai.txt`.
