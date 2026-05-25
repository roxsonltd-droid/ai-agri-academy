# VOICE AI — ElevenLabs

**ElevenLabs** е платформа за **синтез на реч (TTS)** с естествено звучене, **многоезични** модели и опции за **клониране на глас**. Подходяща е за „Проф. АгроМайнд“, урокови плейбеки и достъпност (слушане на отговори).

Официална документация: [elevenlabs.io/docs](https://elevenlabs.io/docs)

## Какво има в този репо

| Компонент | Статус |
|-------------|--------|
| **Документация + env** | `ELEVENLABS_*` в `core/config.py`, пример в `.env.example` |
| **`GET /api/v1/platform/status`** | `elevenlabs_configured` (API ключ + `voice_id`) |
| **`POST /api/v1/voice/tts`** | Прокси към ElevenLabs TTS; връща `audio/mpeg` (поток) |

**STT (реч → текст):** ElevenLabs предлага и **Scribe** / speech-to-text — в кода още няма endpoint; вижте [AI_MULTIMODAL.md](./AI_MULTIMODAL.md).

## Променливи (`backend/.env`)

| Променлива | Задължителна за TTS | Описание |
|------------|---------------------|----------|
| `ELEVENLABS_API_KEY` | Да | API ключ от [ElevenLabs → Profile + API key](https://elevenlabs.io/app/settings/api-keys) |
| `ELEVENLABS_VOICE_ID` | Да | ID на глас (напр. от **Voices** в dashboard) |
| `ELEVENLABS_MODEL_ID` | Не | По подразбиране `eleven_multilingual_v2` |
| `VOICE_TTS_MAX_CHARS` | Не | Лимит на символи за една заявка (по подразбиране 4000) |
| `VOICE_TTS_SECRET` | Не | Ако е зададен, позволява и header **`X-Voice-TTS-Secret`** (сървърни job-ове) без JWT |

## Авторизация на `POST /api/v1/voice/tts`

1. **JWT** (локален login или Clerk с `email` в токена) — всеки **логнат** потребител от `users` таблицата, **или**  
2. **`X-Voice-TTS-Secret`** — ако `VOICE_TTS_SECRET` е конфигуриран и съвпада (за вътрешни скриптове / cron).

Това ограничава злоупотреба с вашия ElevenLabs акаунт.

## Заявка / отговор

**Заявка:** `POST /api/v1/voice/tts`  
`Content-Type: application/json`

```json
{ "text": "Кратък абзац за озвучаване." }
```

**Отговор:** двоичен поток, `Content-Type: audio/mpeg`.

**Пример (curl):**

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/voice/tts" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Здравей, колега.\"}" \
  --output reply.mp3
```

## Архитектура (препоръки)

- **Ключът остава на бекенда** — не извиквайте ElevenLabs директно от браузъра с API key.  
- **Кеш:** за еднакъв текст (напр. фиксиран урок) запишете MP3 в **R2** и пазете URL в Postgres — по-евтино от повторни TTS.  
- **Streaming:** текущият endpoint стриймва отговора от ElevenLabs към клиента (по-малко памет при дълъг текст).  
- **Rate limits:** добавете по-строг лимит или queue в production (тук само лимит на дължина на текста).

## Модели и гласове

- **`eleven_multilingual_v2`** — добър баланс за български и други езици (проверете актуалния списък модели в dashboard).  
- За **по-нисък latency** прегледайте по-новите „flash“ / turbo модели в документацията на ElevenLabs.

## Разходи и квоти

- Плановете и лимитите се променят — вижте [elevenlabs.io/pricing](https://elevenlabs.io/pricing).  
- Следете **character usage** в dashboard; дългите отговори от LLM + TTS на всяко съобщение нарастват бързо разхода.

## Свързани документи

- [AI_MULTIMODAL.md](./AI_MULTIMODAL.md) — STT/TTS в общия multimodal план  
- [ROBOFLOW_VISION.md](./ROBOFLOW_VISION.md) — vision / CV inference (Roboflow)  
- [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) — съхранение на генерирани аудио файлове  
- [PLATFORM.md](./PLATFORM.md) — платформен стек  
