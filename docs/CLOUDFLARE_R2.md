# FILE STORAGE — Cloudflare R2

**Cloudflare R2** е **S3-съвместим** object storage: качвате файлове (PDF, MD, изображения, транскрипти, TTS аудио) без да ги държите на диска на контейнера. За разлика от **Cloudflare Stream** (видео encoding + player), R2 е за **произволни файлове** и **статично съдържание**.

Официална документация: [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2/)

## Защо R2 за AI Agro Academy

| Предимство | Описание |
|------------|----------|
| **Egress** | Няма такса за изходящ трафик към интернет (в типичния модел на Cloudflare — проверете актуалните условия). |
| **S3 API** | Ползвате **boto3** / **aioboto3** с endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. |
| **Presigned URLs** | Клиентът качва директно в R2 без да минава файлът през Render/FastAPI. |
| **Връзка с RAG** | След upload: запис на `object_key` + MIME в Postgres → индексиране в `knowledge/` pipeline или векторна БД. |

## Променливи (бекенд)

Задават се в **`backend/.env`** и са добавени в `core/config.py` (вижте кода). Имената са ориентировъчни — адаптирайте към вашия Cloudflare dashboard.

| Променлива | Описание |
|------------|----------|
| `R2_ACCOUNT_ID` | Cloudflare Account ID (същият акаунт като Stream/DNS често) |
| `R2_ACCESS_KEY_ID` | S3 API Access Key ID (създава се в R2 → *Manage R2 API Tokens*) |
| `R2_SECRET_ACCESS_KEY` | Secret за S3 API |
| `R2_BUCKET_NAME` | Име на bucket |
| `R2_PUBLIC_BASE_URL` | По избор: публичен **Custom Domain** или **r2.dev** subdomain за директни GET без presign (само ако bucket-ът е публичен по дизайн) |
| `R2_PRESIGN_EXPIRES_SECONDS` | По избор (по подразбиране 900): TTL на presigned PUT в секунди |
| `R2_DELETE_AFTER_INGEST` | По избор (по подразбиране `true`): изтриване на обекта в R2 след успешен `from-r2` ingest |

**Статус в API:** `GET /api/v1/platform/status` връща `r2_configured: true/false` когато четирите задължителни полета (account, key id, secret, bucket) са зададени.

## Поток: presigned upload (имплементирано)

1. Клиент → `POST /api/v1/storage/presign` с JSON: `filename`, `content_type`, `purpose: "rag"` (същата auth като knowledge upload: JWT admin/instructor/superuser или header `X-RAG-Upload-Secret`).
2. Отговор: `url`, `method: "PUT"`, `headers` (задължително изпратете същия `Content-Type` при PUT), `object_key`, `expires_in`.
3. Клиент → `PUT` към `url` с тялото на файла и headers от стъпка 2.
4. Клиент → `POST /api/v1/knowledge/documents/from-r2` с JSON `{ "object_key": "<object_key>" }` — бекендът изтегля от R2, обработва като локално качване (PDF → текст), записва в `knowledge/uploads`, инвалидира RAG индекса. По подразбиране обектът се **изтрива от R2** след успех (`R2_DELETE_AFTER_INGEST=true`).

## CORS (директен upload от браузър)

В R2 bucket → **CORS policy**: разрешете `PUT`/`GET` от origin-ите на Next.js (`http://localhost:3000`, production URL). Без това браузърът ще блокира заявката към R2 endpoint.

## Сигурност

- **Никога** не връщайте `R2_SECRET_ACCESS_KEY` към клиента.
- Presigned URL с **кратък TTL** (напр. 5–15 минути).
- Ограничавайте `content_type` и **максимален размер** съгласно `RAG_MAX_UPLOAD_BYTES` / отделен лимит за assets.
- За публични bucket-ове внимавайте с **листинг** и съдържание — по-безопасно е private bucket + presigned GET.

## Python зависимости

`boto3` е в **`backend/requirements.txt`**. За async алтернатива вижте **aioboto3** (не е задължителна за текущите endpoints).

Endpoint URL за boto3:

```text
https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com
```

Регионът за boto3 обикновено е **`auto`** при R2.

## Какво още няма в кода

- Няма запис на `object_key` в Postgres (само локални файлове в `knowledge/uploads/` след ingest).
- Текущият **multipart** upload към **`backend/knowledge/uploads/`** остава валиден за dev и малки файлове; R2 потокът е за production и големи файлове без да минават през Render.

## Свързани документи

- [CLOUD_BACKEND.md](./CLOUD_BACKEND.md) — storage в общия облачен модел  
- [CLOUDFLARE_STREAM.md](./CLOUDFLARE_STREAM.md) — видео, не R2  
- [VIDEO_LEARNING_SYSTEM.md](./VIDEO_LEARNING_SYSTEM.md) — транскрипти/thumbnails в object storage  
- [LANGCHAIN_VECTOR_DB.md](./LANGCHAIN_VECTOR_DB.md) — индексиране след upload  
