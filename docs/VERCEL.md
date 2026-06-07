# Vercel — deploy на монорепото

Ако „**не иска да качва**“ или production **няма Next академията**, почти винаги причината е една от следните.

## 1. Root Directory (най-често)

В корена на репото има **`vercel.json`** с:

- `"buildCommand": "echo static"`
- `"outputDirectory": "."`

Това казва на Vercel да **не** пуска `next build`, а да публикува **само статичните** HTML + `api/` функции. Маршрутите `/academy` отиват към **`academy.html`**, не към **`apps/web`**.

**Решение за Next (лектор, тестове, i18n):**

1. Vercel → **Project** → **Settings** → **General** → **Root Directory** = **`apps/web`**  
2. Framework: **Next.js** (автоматично).  
3. Build: **`npm run build`** (както в `apps/web/vercel.json`).  
4. **Save** и **Redeploy** (или нов commit).

За **само маркетинговия статичен сайт** остави отделен проект с root **`.`** (корен) — така имаш два deploy-а: „сайт“ + „app“, или един домейн с поддомейни.

## 2. GitHub не подава нови commit-и

- Проектът във Vercel е вързан към **друг fork/repo** или **друг branch**.  
- **Push към GitHub** не минава (403, грешен акаунт) → Vercel **няма какво** да вземе.  
- В **Settings → Git** провери repo и production branch.

## 3. Build пада в Vercel

Локално от корена:

```bash
cd apps/web
npm ci
npm run build
```

Ако тук гърми, Vercel също ще гърми. Често липсват env за build (напр. `NEXT_PUBLIC_SUPABASE_*` — в кода има fallback, но провери логовете).

## 4. Deployment Protection / 401

Ако CI или външен fetch получава **401**, включи **Protection Bypass for Automation** (виж `agridirect/README.md`).

## 5. CLI (`vercel deploy`)

От **`apps/web`** след логин:

```bash
cd apps/web
npx vercel
```

Ако пита за scope/linking, избери правилния team и проект с root `apps/web`.

## Свързано

- По-кратко обяснение: **`docs/LOCAL-DEV.md`** → секция *„Vercel — защо на production…“*.  
- Next app: **`apps/web/README.md`**.
