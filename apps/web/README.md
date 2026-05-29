# AgriNexus — Next.js app (`apps/web`)

- **Dev:** `npm install` then `npm run dev` (port **3000**).
- **E2E:** `npm run build && npx playwright install` then `PLAYWRIGHT_NO_WEBSERVER=1 npm run start` in one terminal and `npm run test:e2e` in another; or rely on the dev server + `npm run test:e2e` (Playwright starts `npm run dev` by default).
- **Auth (Supabase):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SITE_URL`. Login UI: `/login` and `/bg/login` (`SupabaseLoginForm` — Google + magic link). Session refresh runs in `src/middleware.ts` next to `next-intl`. Callback: `/auth/callback?next=/academy`.
- **Tutor / RAG:** `POST /api/tutor/chat` and `POST /api/tutor/deep-debate` are server proxies to FastAPI (`API_URL`). Course pages embed **Academy RAG + Deep debate** (`AcademyRagDebatePanel`). `/tutor` uses the same routes (same-origin).
- **Routes:** `/login`, `/academy` (6 курса, 5+1), `/academy/course/[slug]`, `/academy/course/[slug]/test` (финален тест), `/academy/lecturer`, `/academy/lab`.
- **API:** set `NEXT_PUBLIC_API_URL` (see `.env.example`) to the FastAPI origin, default `http://127.0.0.1:8000`. По желание ElevenLabs за `/academy/lecturer`: `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` → `GET/POST /api/elevenlabs-tts`.
- **Stack:** Next.js App Router + Tailwind + TypeScript.

Full stack (Postgres + FastAPI + this app): **`docs/LOCAL-DEV.md`**. First-run & farm profile: **`docs/ONBOARDING.md`**. Deploy API to Render/Railway: **`docs/DEPLOY-RENDER-RAILWAY.md`**.

**Vercel:** production трябва да ползва **Root Directory = `apps/web`**. Кореновият `vercel.json` в repo-то билдва само статичен сайт — виж секцията *„Vercel — защо на production…“* в **`docs/LOCAL-DEV.md`**.
