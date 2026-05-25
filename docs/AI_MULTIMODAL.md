# LLM · Voice · Vision · Agents · Multimodal

Този документ описва **как се вписват** в AI Agro Academy и **какво липсва още** в кода. Текущо бекендът е ориентиран към **текстов LLM** (Mistral) + **RAG**; **глас** и **специализирано vision (LLM)** са разширения; **Roboflow inference** е достъпен през API.

## Какво има в репото днес

| Възможност | Реализация | Файлове / маршрути |
|------------|------------|---------------------|
| **LLM (текст)** | Mistral `mistral-large-latest` | `core/ai_agent.py` — Проф. АгроМайнд + RAG контекст от `rag_facade` |
| **Чат API** | POST тяло `{ "message": "..." }` → текстов отговор | `api/chat.py` → `/api/v1/chat/` |
| **Agents (LangGraph)** | ReAct (`create_react_agent`) + опционално изображение → tool `roboflow_detect_uploaded` (моделът избира дали да вика Roboflow) + Mistral | `agents/graph.py`, `agents/tools_roboflow.py` → `/api/v1/agents/run` |
| **RAG / embeddings** | Файлове + retrieval; опционално Pinecone/LlamaIndex | `requirements-ai.txt`, `rag/`, `PLATFORM_RAG_BACKEND` |
| **Vision (CV deploy)** | **Roboflow** Serverless v2 през **`POST /api/v1/vision/roboflow/infer`** | [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md) |
| **Vision (LLM multimodal)** | Не е свързан в API | Mistral Pixtral / GPT-4o / Gemini — бъдещ чат с image parts |
| **Voice (TTS)** | ElevenLabs през **`POST /api/v1/voice/tts`** (stream MP3) | [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md) |
| **Voice (STT)** | Не е свързан в API | Web Speech API или бъдещ Scribe — [AI_MULTIMODAL.md](./AI_MULTIMODAL.md) |

Опционални пакети: `pip install -r requirements.txt -r requirements-ai.txt` и **`MISTRAL_API_KEY`**.

---

## LLM (езиков модел)

- **Роля:** отговори, обобщения, генериране на курсове, лабораторни обяснения.
- **Съвет:** дръжте **един основен доставчик** за старт (Mistral), за да опростите ключове и billing; втори модел добавяйте само при нужда (напр. по-евтин „router“ или специализиран vision).
- **LangGraph:** разширете `agents/graph.py` с **tools** (retriever към RAG, HTTP към външни API, калкулатор за торене) и **conditional edges** за многостъпкови сценарии.

---

## Voice (глас)

Два потока: **STT** (реч → текст) и **TTS** (текст → реч).

| Слой | Варианти | Бележка |
|------|----------|---------|
| **Клиент** | Web Speech API (безплатно в браузъра, качество променливо) | Подходящо за прототип: микрофон → текст → същият `/api/v1/chat/` |
| **Сървър / облак** | OpenAI Whisper API, Google Speech-to-Text, Deepgram, Azure Speech | По-добро качество; качете аудио към FastAPI (`multipart/form-data`) и препратете към доставчик |
| **TTS** | **ElevenLabs** (бекенд прокси: `/api/v1/voice/tts`) — виж [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md); Azure Neural, Google, браузърен `speechSynthesis` | Кеш в **R2** за фиксирани урокови блокове |

**Архитектура:** предпочитайте **кратки аудио клипове** към API, не дълги отворени WebSocket към LLM доставчика от браузъра (секрети остават на бекенда).

---

## Vision (изображения)

Релевантни сценарии за академията: **листни болести**, почва, дронови кадри, схеми от лаборатории.

| Подход | Описание |
|--------|----------|
| **Multimodal chat** | Клиентът качва снимка → бекендът извиква **vision модел** (напр. Mistral Pixtral, GPT-4o, Gemini) с `image_url` или base64 част в съобщението. |
| **Предобработка** | Класически CV (OpenCV) за crop/normalize преди модела — по-евтино и по-бързо при големи изображения. |
| **Съхранение** | Оригинал в **R2/S3**; в Postgres — URL, MIME, checksum; към модела изпращайте downscaled вариант. |

**API в репото:** `POST /api/v1/vision/roboflow/infer` — multipart `file` → JSON predictions от Roboflow — [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md). За **LLM vision** (описание на снимка в чат) остава отделен бъдещ endpoint (напр. `POST /api/v1/vision/analyze` с `file` + `prompt`).

---

## Agents (агенти)

- **Дефиниция:** LLM + **цикъл** (мисли → извиква инструмент → чете резултат → отговаря).
- **В проекта:** LangGraph е готов за разширение — вижте `StateGraph`, `agent_node`, после добавете `tool_node` и ръбове.
- **Примери за tools:** `retrieve_for_prompt`, weather API, вътрешна база с курсове, календар на полските задачи.

---

## Multimodal (мултимодалност)

**Multimodal** = един модел или един pipeline приема **няколко модалности** (текст + изображение + понякога аудио транскрипт).

Практически модел за Agro Academy:

1. **Вход:** текст от потребителя + 0..N снимки + опционално **транскрипт** от STT.  
2. **Подготовка:** нормализиране на изображения; RAG само от текстови документи или отделен „image caption“ стъпка.  
3. **Изход:** Markdown отговор + опционално структуриран JSON за UI (таблици, стъпки).

В LangChain/LangGraph съобщенията могат да съдържат **multimodal content parts** (според версията на драйвера към Mistral/OpenAI) — при имплементация проверете актуалния формат за `HumanMessage` с image URL.

---

## Препоръчителен ред на внедряване

1. **Vision** върху съществуващия чат или отделен endpoint — най-висока стойност за агрономия.  
2. **STT** от кратки клипове към FastAPI — по-лесно от пълен гласов диалог.  
3. **LangGraph tools** (RAG + един външен API) — по-надеждни „агенти“ от дълъг free-form текст.  
4. **TTS** за фиксирани урокови блокове — след стабилизиран текст.

---

## Сигурност и разходи

- **Vision/аудио:** валидирайте MIME, размер и брой заявки (rate limit).  
- **Не пращайте** сурови потребителски файлове директно към модела без сканиране/квоти.  
- Логирайте **token usage** по endpoint, за да видите кога безплатните квоти свършват.

Мулти-агент „факултет“ и оркестрация: [MULTI_AI_TEACHERS.md](./MULTI_AI_TEACHERS.md).

---

Свързани документи: [PLATFORM.md](./PLATFORM.md) · [LANGCHAIN_VECTOR_DB.md](./LANGCHAIN_VECTOR_DB.md) · [CLOUD_BACKEND.md](./CLOUD_BACKEND.md) · [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md) (видео, не vision LLM) · [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md) · [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md)
