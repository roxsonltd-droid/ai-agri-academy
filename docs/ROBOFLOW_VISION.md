# IMAGE AI — Roboflow

**Roboflow** е платформа за **компютърно зрение**: обучение и deploy на модели за **детекция**, класификация, сегментация и **Workflows**. Подходяща е за агро сценарии — болести по листа, плодове, плевели, обекти от дрон и др.

Официална документация: [docs.roboflow.com](https://docs.roboflow.com/) · REST: [Run a model on an image](https://docs.roboflow.com/developer/rest-api/run-a-model-on-an-image)

## Какво има в този репо

| Компонент | Статус |
|-------------|--------|
| **Документация + env** | `ROBOFLOW_*` в `core/config.py`, пример в `.env.example` |
| **`GET /api/v1/platform/status`** | `roboflow_configured` (API ключ + workspace + project + version) |
| **`POST /api/v1/vision/roboflow/infer`** | Прокси към **Serverless v2** — multipart снимка → JSON predictions |
| **Next.js UI** | `ai-agro-academy/src/app/labs/vision/page.tsx` — качване, JSON, агент с `image_base64` |
| **LangGraph tools** | `agents/tools_roboflow.py` — **`roboflow_detect`** (явен Base64), **`roboflow_detect_uploaded()`** (прикачена снимка); ReAct в `agents/graph.py` — Mistral сам избира дали да вика Roboflow |

**Забележка:** Legacy host-ове `detect.roboflow.com` / `classify.roboflow.com` са **deprecated** — новият код ползва **`serverless.roboflow.com`**.

## Променливи (`backend/.env`)

| Променлива | Задължителна за infer | Описание |
|------------|------------------------|----------|
| `ROBOFLOW_API_KEY` | Да | Private API key от [Roboflow → Settings → API](https://app.roboflow.com/) |
| `ROBOFLOW_WORKSPACE` | Да | Slug на workspace (от URL на проекта) |
| `ROBOFLOW_PROJECT` | Да | Slug на проекта |
| `ROBOFLOW_VERSION` | Да | Номер на версия на модела (напр. `1`, `3`) — сегмент в пътя `/infer/.../.../{version}` |
| `ROBOFLOW_CONFIDENCE` | Не | Праг 0–1 (по подразбиране `0.4`) — query към API |
| `ROBOFLOW_IMAGE_MAX_BYTES` | Не | Макс. размер на upload (по подразбиране 5 MB) |
| `ROBOFLOW_SERVERLESS_BASE` | Не | По подразбиране `https://serverless.roboflow.com` |
| `ROBOFLOW_INFER_SECRET` | Не | Ако е зададен, позволява **`X-Roboflow-Infer-Secret`** без JWT (сървърни job-ове) |

## Авторизация на `POST /api/v1/vision/roboflow/infer`

1. **JWT** (локален login или Clerk с `email` в токена) — всеки **логнат** потребител от `users`, **или**  
2. **`X-Roboflow-Infer-Secret`**, ако `ROBOFLOW_INFER_SECRET` е конфигуриран.

Така **API ключът на Roboflow не излиза към браузъра** — само към вашия FastAPI.

**Агент с изображение:** `POST /api/v1/agents/run` с JSON `{ "message": "...", "image_base64": "<data URL или raw base64>" }` — снимката се подава към инструмента **`roboflow_detect_uploaded`** (request context); **ReAct** граф (`create_react_agent`) нека Mistral сам реши дали да го извика (`agents/graph.py`).

## Заявка / отговор

**Заявка:** `multipart/form-data` с поле **`file`** — JPEG, PNG или WebP.

**Отговор:** JSON от Roboflow (структурата зависи от типа задача: detection, classification и т.н.).

**Пример (curl):**

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/vision/roboflow/infer" \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@leaf.jpg"
```

## Workflows и self-hosted

- **Workflows** (няколко стъпки в един pipeline) често се викат през отделен JSON endpoint — виж [Serverless API v2](https://docs.roboflow.com/deploy/serverless-hosted-api-v2/use-with-the-rest-api). Текущият endpoint е за **класическия** път `infer/{workspace}/{project}/{version}` с файл.  
- **Self-hosted Inference** — зададете `ROBOFLOW_SERVERLESS_BASE` към вашия inference gateway (напр. `http://localhost:9001`), ако ползвате отворения inference сървър на Roboflow.

## Съхранение и RAG

- Оригиналът на снимката: **R2** + metadata в Postgres — виж [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md).  
- Резултатът от inference (JSON) може да се записва до същия обект/ред за последващо търсене или обобщение с LLM.

## Разходи и лимити

- Плановете и квотите са в Roboflow dashboard — следете **inference** usage.  
- Ограничавайте размер и брой заявки (rate limit в production).

## Свързани документи

- [AI_MULTIMODAL.md](./AI_MULTIMODAL.md) — vision в общия multimodal план  
- [ELEVENLABS_VOICE.md](./ELEVENLABS_VOICE.md) — друг външен AI доставчик (TTS)  
- [PLATFORM.md](./PLATFORM.md) — платформен стек  
