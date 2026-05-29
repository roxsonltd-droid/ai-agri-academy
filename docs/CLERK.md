# AUTH SYSTEM — Clerk

**Clerk** е външен доставчик на идентичност: регистрация, вход, социални провайдъри, сесии и **JWT**, които бекендът (FastAPI) може да валидира чрез **JWKS**, без да съхранява пароли на Clerk потребители в собствената ви база.

Официална документация: [clerk.com/docs](https://clerk.com/docs)

## Какво е свързано в този монорепо

| Слой | Местоположение | Роля |
|------|----------------|------|
| Next.js (App Router) | `ai-agro-academy/` | `ClerkProvider`, sign-in/sign-up маршрути, `clerkMiddleware` |
| Режим на включване | `ai-agro-academy/src/lib/auth-mode.ts` | Публикуем ключ; `NEXT_PUBLIC_CLERK_ENFORCE` за защита на маршрути |
| FastAPI | `backend/core/clerk_auth.py` | Верификация на **Bearer** токен срещу `CLERK_JWKS_URL` + `CLERK_ISSUER` |
| Резолюция към `User` | `backend/core/bearer_user.py` | Първо локален JWT (`/auth/login`), после Clerk JWT с **email** в claims → търсене по `users.email` |
| Статус | `GET /api/v1/platform/status` | `clerk_verify_configured` |

**Важно:** Вграденият email/password login на бекенда използва **HS256** JWT с `sub` = имейл. Clerk издава **RS256** JWT с `sub` = Clerk user id (`user_...`). За да съвпадне потребителят с ред в таблица `users`, в **Session token** (или template) трябва да присъства **`email`** claim, съвпадащ с `users.email`, *или* да синхронизирате потребители с **webhook** и отделна колона (бъдеща стъпка).

## Променливи — frontend (`ai-agro-academy/.env.local`)

| Променлива | Описание |
|------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Публикуем ключ от Clerk Dashboard |
| `CLERK_SECRET_KEY` | Секрет за Clerk server-side (ако ползвате server actions / API routes с Clerk) |
| `NEXT_PUBLIC_CLERK_ENFORCE` | `true` за активиране на `clerkMiddleware` + `auth.protect()` на избрани маршрути (виж `src/middleware.ts`) |

Без публикуем ключ: приложението работи без `ClerkProvider`; линкът „Clerk“ в navbar се крие.

## Променливи — backend (`backend/.env`)

| Променлива | Описание |
|------------|----------|
| `CLERK_JWKS_URL` | Напр. `https://<your-subdomain>.clerk.accounts.dev/.well-known/jwks.json` |
| `CLERK_ISSUER` | Напр. `https://<your-subdomain>.clerk.accounts.dev` (трябва да съвпада с `iss` в токена) |
| `CLERK_JWT_AUDIENCE` | По избор: ако зададен, подписът се проверява и срещу `aud` |

JWKS URL и issuer: **Clerk Dashboard → API Keys → Show JWT public key / JWKS endpoint** (имената в UI се обновяват — използвайте стойностите от вашия проект).

## Session JWT — добавяне на `email` (препоръчително за FastAPI)

1. Clerk Dashboard → **Sessions** (или **JWT Templates** според версията на UI).
2. В шаблона за **session token** добавете claim за имейл, напр. `email` от primary email на потребителя (синтаксисът в Clerk UI е документиран при тях — търсете „customize session token“ / „JWT template“).

След това бекендът може да намери `User` по `users.email` при извиквания с `Authorization: Bearer <clerk_session_jwt>`.

## Middleware (Next.js)

`ai-agro-academy/src/middleware.ts`:

- При зададени `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` и `NEXT_PUBLIC_CLERK_ENFORCE=true` се включва `clerkMiddleware`.
- Защитени маршрути (пример): `/dashboard`, `/knowledge` — `auth.protect()`.

Разширете `isProtected` според нуждите.

## Страници за вход

- `src/app/sign-in/[[...sign-in]]/page.tsx` — `<SignIn />`
- `src/app/sign-up/[[...sign-up]]/page.tsx` — `<SignUp />`

## Бекенд — верификация

- `verify_clerk_bearer_token(token)` използва **PyJWT** + **PyJWKClient** към `CLERK_JWKS_URL`, проверява подпис и **`iss`**, по избор **`aud`**.
- `resolve_user_from_bearer(creds, db)` (виж `core/bearer_user.py`) се използва от endpoints, които трябва да разпознаят потребител и по Clerk, и по локален JWT.

## Двойна система (Clerk + локален login)

Това е нормално за преходен период:

- **Студенти/админи с акаунт само във вашата БД** — продължават да ползват `/auth/login` и HS256 токен.
- **Clerk потребители** — след като JWT съдържа `email`, същите API маршрути могат да ги разпознаят като `User`.

Дългосрочно: един източник на истина (само Clerk или само собствен auth) намалява объркването.

## Сигурност

- Не комитирайте `CLERK_SECRET_KEY` / ключове за R2 / DB.
- В production въртете секретите и ползвайте кратки TTL за чувствителни операции.
- За API към бекенда от браузъра: предавайте **session JWT** само към вашия origin; за мобилен — същият модел със secure storage.

## Следващи стъпки (не са задължителни в кода)

- **Clerk Webhooks** (`user.created` / `user.updated`) → upsert в `users` и колона `clerk_user_id` за стабилно съпоставяне без зависимост от email в JWT.
- **Frontend:** `auth().getToken()` към FastAPI вместо `localStorage` token, когато сте изцяло на Clerk.

## Свързани документи

- [PLATFORM.md](./PLATFORM.md) — стек и локална настройка  
- [CLOUD_BACKEND.md](./CLOUD_BACKEND.md) — auth в облачен контекст  
- `backend/README.md` — env таблица  
