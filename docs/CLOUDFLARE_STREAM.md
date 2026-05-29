# Cloudflare Stream — видео за уроци

**Cloudflare Stream** е услуга за **качване, кодиране и доставка** на видео през глобалната мрежа на Cloudflare. За AI Agro Academy се използва за **урочни записи** и playback в браузъра, **отделно** от **R2** (object storage за файлове/PDF) и от **CDN** за статични активи.

Официална документация: [developers.cloudflare.com/stream](https://developers.cloudflare.com/stream/)

## Какво вече има в проекта

- **Конфигурация (бекенд):** `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN` в `backend/core/config.py` (зареждат се от `.env`).
- **Статус:** `GET /api/v1/platform/status` връща `cloudflare_stream_configured: true/false` без излагане на секрети (`backend/api/platform.py`).
- **HTTP маршрути за upload/webhook** — още не са имплементирани; планът е по-долу.

## Необходими данни от Cloudflare

1. Влезте в [Cloudflare Dashboard](https://dash.cloudflare.com/) → изберете акаунта → **Stream**.
2. **Account ID** — в страничната лента на акаунта или в URL на Stream API заявки.
3. **API Token** — *My Profile* → *API Tokens* → създайте токен с права за **Stream: Read** и **Stream: Edit** (или еквивалентен шаблон за Stream).
4. **Customer code** (за стандартен embed player) — в Stream UI често се вижда като част от embed URL; за Next.js се използва като `NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE` (само публичен идентификатор, не секрет).

## Променливи

### Backend (`backend/.env`)

| Променлива | Описание |
|------------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `CLOUDFLARE_STREAM_API_TOKEN` | API token с права за Stream REST |

### Frontend (`ai-agro-academy/.env.local`)

| Променлива | Описание |
|------------|----------|
| `NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE` | Customer subdomain / код за iframe player (ако ползвате вградения Stream player) |

## Препоръчан поток (direct upload)

Така **големите файлове** не минават през сървъра на Render/FastAPI — само метаданните.

1. **Клиент** иска качване → вика вашия **`POST /api/v1/stream/upload-url`** (бъдеща имплементация).
2. **FastAPI** с токена вика Cloudflare:  
   `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/direct_upload`  
   и връща на клиента **`uploadURL`** (+ по избор **`uid`**).
3. **Клиент** прави `PUT`/`POST` на видеото директно към `uploadURL`.
4. След обработка Stream връща статус **`ready`** — по избор **webhook** към вашия бекенд.
5. Записвате **`uid`** (video id) в **PostgreSQL** към урока/модула.
6. **Playback:** бекенд генерира **signed URL** с кратък TTL или embed с ограничен достъп — **никога** не слагайте Stream API token в браузъра.

## Сигурност

- Токенът за API остава **само** на бекенда.
- За публичен плейър ползвайте **signed tokens** или контролиран embed, за да не се споделя постоянен публичен линк без контрол.
- Ако добавите **webhook**, валидирайте подписа на Cloudflare (документацията описва header-и за верификация).

## Планирани FastAPI маршрути

| Метод | Път | Роля |
|-------|-----|------|
| `POST` | `/api/v1/stream/upload-url` | Създава direct upload; връща `{ uploadURL, uid }` |
| `POST` | `/api/v1/stream/webhook` | Приема събития от Stream (напр. `ready`) — защитен с подпис |

Регистрирайте router в `main.py` след имплементация.

## Ценообразуване / free tier

Квотите и безплатните минути се променят — проверете **Stream → Billing** в текущия план на Cloudflare. За POC планирайте **кратки тестови клипове** и наблюдение на минути съхранение + delivered minutes.

## Свързано в репото

- [PLATFORM.md](./PLATFORM.md) — стъпка за Stream в локална среда  
- [CLOUD_BACKEND.md](./CLOUD_BACKEND.md) — storage (R2) отделно от Stream  
- [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) — object storage, presigned uploads  
- [backend/README.md](../backend/README.md) — env таблица  
- `GET /api/v1/platform/status` — дали Stream env е зададен  

Система за видео обучение (курсове, прогрес, схема): [VIDEO_LEARNING_SYSTEM.md](./VIDEO_LEARNING_SYSTEM.md)