# AgriNexus mobile (Expo)

This app uses [Expo Router](https://docs.expo.dev/router/introduction/) (routes under `app/`) and TypeScript. It lives next to `apps/web` (Next.js).

## First launch & onboarding

1. **`/`** (`app/index.tsx`) — cold start router: if welcome not seen → **`/welcome`**; if signed in and farm profile not saved → **`/onboarding`**; else **`/(tabs)`** (Home tab).
2. **`/welcome`** — hero + bullets; **Continue** marks welcome as seen; **Sign in** also marks welcome (avoids a post-login loop).
3. **`/onboarding`** (signed-in only) — crops + region + hectares → saved locally (`@agrinexus/mobile_farm_profile_v1`). New **sign-in** clears the previous profile key so a fresh setup runs.

Details: **`docs/ONBOARDING.md`**.

## Main tabs (`/(tabs)`)

| Tab / route | Description |
|-------------|-------------|
| `/(tabs)` → Home | Dashboard — greeting, shortcuts to Tutor & Academy, “continue learning”, login / sign out |
| `/(tabs)/tutor` | **AI Tutor** — `POST` to Next `/api/tutor/chat` → FastAPI `/api/tutor/chat` |
| `/(tabs)/academy` | **My Academy** — course catalog from `GET /api/mobile/courses` (+ optional Bearer); pull-to-refresh; local lecture progress (AsyncStorage) |
| `/academy/[slug]` | Course detail — tap lectures to mark studied; progress syncs with the Academy tab |
| `/login` | Email → FastAPI `POST /auth/token`, JWT stored on device; after sign-in → **`/`** (gate sends you to onboarding or tabs) |

Tab bar + stack headers include **EN / БГ** (language toggle).

## Environment (copy `.env.example` → `.env`)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_WEB_ORIGIN` | Next origin **without** `/en` prefix, e.g. `http://127.0.0.1:3000`. Used for **courses** and **tutor** API routes. Android emulator → host machine: `http://10.0.2.2:3000`. |
| `EXPO_PUBLIC_BACKEND_URL` | FastAPI, e.g. `http://127.0.0.1:8000`. |

Run **Next** (`apps/web`) and **FastAPI** (`apps/backend`) while testing tutor + live catalog:

```bash
# terminal A — from repo root or apps/web
npm run dev:web

# terminal B
cd apps/backend && pip install -r requirements.txt && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Optional: set the same `JWT_SECRET` in `apps/backend/.env` for production-like signing (defaults to a dev string if unset).

## Auth flow (dev stub)

1. User enters email on `/login` → mobile calls `POST {EXPO_PUBLIC_BACKEND_URL}/auth/token` → receives JWT.
2. Token + email stored on device; `GET {EXPO_PUBLIC_BACKEND_URL}/auth/me` confirms subject.
3. Academy requests call Next `GET /api/mobile/courses` with `Authorization: Bearer <token>` when logged in. Next verifies the token by calling backend `GET /auth/me`. Catalog remains **public** without a token; invalid Bearer returns **401**.

## Run

From the monorepo root:

```bash
npm run dev:mobile
```

Or from this folder:

```bash
npm install
# Ако npm върне ERESOLVE (React 19.x peer), опитай:
npm install --legacy-peer-deps
npm run typecheck
npm run start
```

Then press `a` (Android emulator), `w` (web), or scan the QR code with **Expo Go** on a physical device.

- **iOS simulator** requires macOS (`npm run ios`).
- **Android** needs Android Studio / emulator or a device with USB debugging (`npm run android`).

## Connect to the web API

Point `fetch` at your Next dev server, e.g. `http://<your-LAN-IP>:3000`, and ensure CORS allows the mobile origin if you call browser-based web builds. For native apps, CORS does not apply to `fetch` from the device.

## Docs

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/docs/getting-started)
